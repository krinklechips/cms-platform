import assert from 'node:assert/strict'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { buildConfig, getPayload, type Access, type Field, type PayloadRequest } from 'payload'
import { withDrafts } from '../src/lib/with-drafts'

// Do not import the application config or load .env: this is a disposable fixture only.
if (process.env.DATABASE_URI !== 'file:./locale-restore-demo.db') {
  throw new Error('Requires the isolated DATABASE_URI=file:./locale-restore-demo.db')
}

type Doc = Record<string, any>
const locales = ['en', 'kh', 'cn'] as const
const tenantAccess: Access = ({ req }) => req.user
  ? { tenant: { equals: (req.user as unknown as Doc).tenant } }
  : false
const fields: Field[] = [
  { name: 'tenant', type: 'text', required: true },
  { name: 'title', type: 'text', localized: true },
  { name: 'price', type: 'number' },
  { name: 'sections', type: 'blocks', localized: true, blocks: [{
    slug: 'text', fields: [{ name: 'text', type: 'text' }],
  }] },
  { name: 'rows', type: 'array', fields: [
    { name: 'label', type: 'text', localized: true },
    { name: 'price', type: 'number' },
    { name: 'children', type: 'array', fields: [
      { name: 'label', type: 'text', localized: true },
      { name: 'price', type: 'number' },
    ] },
  ] },
]
const payload = await getPayload({ config: buildConfig({
  secret: 'isolated-locale-restore-fixture-only',
  typescript: { autoGenerate: false },
  db: sqliteAdapter({ client: { url: process.env.DATABASE_URI } }),
  localization: { locales: [...locales], defaultLocale: 'en', fallback: false },
  collections: [
    { slug: 'users', auth: true, fields: [
      { name: 'tenant', type: 'text' }, { name: 'canRestore', type: 'checkbox' },
    ] },
    withDrafts({ slug: 'pages', fields, access: {
      create: ({ req }) => Boolean(req.user),
      read: tenantAccess,
      update: (args) => (args.req.user as unknown as Doc | null)?.canRestore ? tenantAccess(args) : false,
      readVersions: ({ req }) => req.user
        ? { 'version.tenant': { equals: (req.user as unknown as Doc).tenant } }
        : false,
    } }),
  ],
}) })

let fixtureID: number | undefined
let editorID: number | undefined
try {
  const stamp = Date.now()
  const editor = await payload.create({ collection: 'users', data: {
    email: `restore-${stamp}@example.test`, password: 'Fixture-only-password-2026', tenant: 'clinic-a', canRestore: true,
  } as never })
  editorID = editor.id
  const user = { ...editor, collection: 'users' } as PayloadRequest['user']
  const write = (id: number, locale: typeof locales[number], data: Doc, draft = false) =>
    payload.update({ collection: 'pages', id, locale, data: data as never, draft,
      overrideAccess: false, user })
  const ids = { a: 'aaaaaaaaaaaaaaaaaaaaaaaa', b: 'bbbbbbbbbbbbbbbbbbbbbbbb',
    deleted: 'dddddddddddddddddddddddd', added: 'eeeeeeeeeeeeeeeeeeeeeeee',
    child: '111111111111111111111111', oldChild: '222222222222222222222222',
    newChild: '333333333333333333333333' }
  const historicalRows = (locale: string) => [ids.deleted, ids.a, ids.b].map((id, i) => ({
    id, label: `${locale}-old-${id}`, price: i + 1,
    children: [ids.oldChild, ids.child].map((childID) => ({
      id: `${id.slice(0, 12)}${childID.slice(0, 12)}`, label: `${locale}-old-${id}-${childID}`, price: 2,
    })),
  }))
  const blocks = (locale: string, state: string) => [
    { blockType: 'text', text: `${locale}-${state}-section` },
  ]
  const page = await payload.create({ collection: 'pages', locale: 'en', user, overrideAccess: false,
    data: { tenant: 'clinic-a', price: 10, title: 'en-old', sections: blocks('en', 'old'),
      rows: historicalRows('en'), _status: 'published' } as never })
  fixtureID = page.id
  for (const locale of ['kh', 'cn'] as const) {
    await write(page.id, locale, { title: `${locale}-old`, sections: blocks(locale, 'old'),
      rows: historicalRows(locale), _status: 'published' })
  }
  const versions = () => payload.findVersions({ collection: 'pages', locale: 'all',
    where: { parent: { equals: page.id } }, sort: '-updatedAt', pagination: false,
    depth: 0, overrideAccess: false, user })
  const historical = (await versions()).docs[0]
  for (const locale of locales) {
    await write(page.id, locale, { title: `${locale}-live`, sections: blocks(locale, 'live'),
      _status: 'published' })
  }
  const currentRows = (locale: string) => [ids.b, ids.added, ids.a].map((id, i) => ({
    id, label: `${locale}-draft-${id}`, price: 100 + i,
    children: [ids.child, ids.newChild].map((childID) => ({
      id: `${id.slice(0, 12)}${childID.slice(0, 12)}`, label: `${locale}-draft-${id}-${childID}`, price: 200 + i,
    })),
  }))
  for (const locale of locales) {
    await write(page.id, locale, { title: `${locale}-draft`, price: 99,
      sections: blocks(locale, 'draft'), rows: currentRows(locale) }, true)
  }
  const read = async (draft = false): Promise<Doc> => payload.findByID({ collection: 'pages',
    id: page.id, draft, locale: 'all', fallbackLocale: false, depth: 0,
    overrideAccess: false, user })
  const published = await read()
  const pending = await read(true)
  for (const locale of locales) {
    assert.equal(published.title[locale], `${locale}-live`)
    assert.equal(pending.title[locale], `${locale}-draft`)
  }
  const before = await versions()
  await payload.restoreVersion({ collection: 'pages', id: String(historical.id), locale: 'cn',
    // Local API must also explicitly state intent; Payload otherwise defaults missing locales to en.
    req: { query: { locale: 'cn' } }, overrideAccess: false, user })
  const restored = await read(true)
  assert.equal(restored._status, 'draft', 'Locale restore must append a DRAFT, never publish')
  assert.deepEqual(await read(), published, 'Every published locale must remain byte-for-byte unchanged')
  assert.equal(restored.title.cn, 'cn-old')
  assert.deepEqual(restored.sections.cn, (historical.version as unknown as Doc).sections.cn)
  for (const locale of ['en', 'kh'] as const) {
    assert.equal(restored.title[locale], pending.title[locale])
    assert.deepEqual(restored.sections[locale], pending.sections[locale])
  }
  const expectedRows = structuredClone(pending.rows)
  for (const row of expectedRows) {
    if (row.id === ids.added) continue
    row.label.cn = `cn-old-${row.id}`
    row.children[0].label.cn = `cn-old-${row.id}-${ids.child}`
  }
  assert.equal(restored.price, pending.price)
  assert.deepEqual(restored.rows, expectedRows,
    'Keep current shared rows, IDs, order and prices; copy labels by stable ID only')
  const after = await versions()
  assert.equal(after.totalDocs, before.totalDocs + 1, 'Append exactly one version')
  assert.equal(after.docs[0].version._status, 'draft')
  for (const old of before.docs) {
    assert.deepEqual(after.docs.find((version) => version.id === old.id)?.version, old.version,
      'Do not rewrite any existing published or draft version')
  }
  for (const locale of [undefined, 'all', '*', 'xx']) {
    await assert.rejects(payload.restoreVersion({ collection: 'pages', id: String(historical.id),
      req: { query: locale === undefined ? {} : { locale } }, overrideAccess: false, user }),
    /explicit|locale/i)
  }
  await assert.rejects(payload.restoreVersion({ collection: 'pages', id: String(historical.id),
    locale: 'en', req: { query: { locale: 'cn' } }, overrideAccess: false, user }), /locale/i)
  const outsider = { ...user, tenant: 'clinic-b' } as PayloadRequest['user']
  const readOnly = { ...user, canRestore: false } as PayloadRequest['user']
  for (const deniedUser of [null, outsider, readOnly]) {
    await assert.rejects(payload.restoreVersion({ collection: 'pages', id: String(historical.id),
      locale: 'cn', req: { query: { locale: 'cn' } }, overrideAccess: false, user: deniedUser }))
  }
  assert.deepEqual(await read(true), restored, 'Rejected restores must not mutate pending work')
  assert.equal((await versions()).totalDocs, after.totalDocs)

  // An opted-in collection must fail closed if its hook/snapshot is accidentally missing.
  const hooks = payload.collections.pages.config.hooks.beforeOperation
  try {
    payload.collections.pages.config.hooks.beforeOperation = []
    await assert.rejects(payload.restoreVersion({ collection: 'pages', id: String(historical.id),
      locale: 'cn', req: { query: { locale: 'cn' } }, overrideAccess: false, user }), /safe locale restore snapshot/i)
  } finally {
    payload.collections.pages.config.hooks.beforeOperation = hooks
  }

  for (const locale of ['kh', 'en'] as const) {
    const previous = await read(true)
    const count = (await versions()).totalDocs
    await payload.restoreVersion({ collection: 'pages', id: String(historical.id), locale,
      req: { query: { locale } }, overrideAccess: false, user })
    const next = await read(true)
    const expected = structuredClone(previous)
    expected.title[locale] = `${locale}-old`
    expected.sections[locale] = (historical.version as unknown as Doc).sections[locale]
    for (const row of expected.rows) {
      if (row.id === ids.added) continue
      row.label[locale] = `${locale}-old-${row.id}`
      row.children[0].label[locale] = `${locale}-old-${row.id}-${ids.child}`
    }
    // Only the selected locale and the new save timestamp may change.
    expected.updatedAt = next.updatedAt
    assert.deepEqual(next, expected)
    assert.deepEqual(await read(), published)
    assert.equal((await versions()).totalDocs, count + 1)
  }
  console.log('PASS: real Payload restores CN/KH/EN as new drafts, preserving all live content, other drafts, shared rows, IDs, order and prices; invalid/missing locales, missing snapshot, read-only, tenant and anonymous access denied')
} finally {
  if (fixtureID !== undefined) await payload.delete({ collection: 'pages', id: fixtureID })
  if (editorID !== undefined) await payload.delete({ collection: 'users', id: editorID })
  await payload.destroy()
}
