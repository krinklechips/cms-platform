import assert from 'node:assert/strict'
import test from 'node:test'
import type { Field, PayloadRequest } from 'payload'
import { canonicalEditorialID, lockEditorialDocument } from '../src/lib/editorial-lock'
import { copyLocalizedFields, requireRestoreLocale } from '../src/lib/locale-restore'
import { withDrafts } from '../src/lib/with-drafts'

const fields: Field[] = [
  { name: 'title', type: 'text', localized: true },
  { name: 'price', type: 'number' },
  { name: 'sections', type: 'blocks', localized: true, blocks: [
    { slug: 'text', fields: [{ name: 'text', type: 'text' }] },
  ] },
  { name: 'rows', type: 'array', fields: [
    { name: 'label', type: 'text', localized: true },
    { name: 'price', type: 'number' },
    { name: 'children', type: 'array', fields: [
      { name: 'label', type: 'text', localized: true },
      { name: 'price', type: 'number' },
    ] },
  ] },
]
const labels = (s: string) => ({ en: `${s}-en`, kh: `${s}-kh`, cn: `${s}-cn` })
const row = (id: string, s: string) => ({ id, price: 100, label: labels(s), children: [
  { id: `${id}-new`, price: 200, label: labels(`${s}-new`) },
  { id: `${id}-child`, price: 300, label: labels(`${s}-child`) },
] })

test('copies only the chosen localized values, including whole localized blocks', () => {
  const current = { id: 42, tenant: 7, price: 100, _status: 'draft', title: labels('pending'),
    sections: { en: [{ id: 'en-draft', blockType: 'text', text: 'en-pending' }],
      kh: [], cn: [{ id: 'cn-draft', blockType: 'text', text: 'cn-pending' }] } }
  const selected = { id: 1, tenant: 9, price: 1, _status: 'published', title: labels('old'),
    sections: { cn: [{ id: 'old-cn', blockType: 'text', text: 'old' }] } }
  const before = structuredClone({ current, selected })
  const result = copyLocalizedFields({ fields, current, selected, locale: 'cn' })
  assert.deepEqual(result, { ...current, title: { ...current.title, cn: 'old-cn' },
    sections: { ...current.sections, cn: selected.sections.cn } })
  assert.deepEqual({ current, selected }, before, 'Inputs must not be mutated')
  assert.notEqual(result.sections, current.sections)
})

test('shared arrays preserve current membership, IDs, order and prices; nested labels use IDs', () => {
  const current = { rows: [row('b', 'pending-b'), row('new', 'new'), row('a', 'pending-a')] }
  const selected = { rows: [row('deleted', 'old-deleted'), row('a', 'old-a'), row('b', 'old-b')]
    .map((r) => ({ ...r, price: 1, children: [
      { id: `${r.id}-deleted`, price: 1, label: labels('deleted') },
      { id: `${r.id}-child`, price: 1, label: labels(`old-${r.id}-child`) },
    ] })) }
  const expected = structuredClone(current)
  for (const r of expected.rows.filter((r) => r.id !== 'new')) {
    r.label.cn = `old-${r.id}-cn`
    r.children[1].label.cn = `old-${r.id}-child-cn`
  }
  assert.deepEqual(copyLocalizedFields({ fields, current, selected, locale: 'cn' }), expected)
})

test('does not guess matches from positions or missing/ambiguous IDs', () => {
  const current = { rows: [row('a', 'pending'), { label: labels('no-id') }] }
  const selected = { rows: [row('a', 'old'), row('a', 'ambiguous'), { label: labels('old-no-id') }] }
  assert.deepEqual(copyLocalizedFields({ fields, current, selected, locale: 'kh' }), current)
})

test('missing historical locale clears only that locale, never falls back to English', () => {
  const current = { title: labels('pending') }
  for (const selected of [{ title: { en: 'old-English' } }, {}]) {
    assert.deepEqual(copyLocalizedFields({ fields, current, selected, locale: 'cn' }),
      { title: { ...current.title, cn: null } })
  }
  assert.deepEqual(copyLocalizedFields({ fields, current, selected: { title: { cn: '' } }, locale: 'cn' }),
    { title: { ...current.title, cn: '' } })
})

test('recurses through layout fields, named groups/tabs and whole localized containers', () => {
  const localized: Field[] = [{ name: 'label', type: 'text', localized: true }]
  const layoutFields: Field[] = [
    { type: 'row', fields: localized },
    { type: 'collapsible', label: 'More', fields: [{ name: 'group', type: 'group', fields: localized }] },
    { type: 'tabs', tabs: [
      { label: 'Plain', fields: [{ name: 'plain', type: 'text', localized: true }] },
      { name: 'named', fields: localized },
      { name: 'whole', localized: true, fields: [{ name: 'sharedInside', type: 'number' }] },
    ] },
  ]
  const current = { label: labels('now'), plain: labels('now'), group: { label: labels('now') },
    named: { label: labels('now') }, whole: { en: { sharedInside: 100 }, cn: { sharedInside: 99 } } }
  const selected = { label: labels('old'), plain: labels('old'), group: { label: labels('old') },
    named: { label: labels('old') }, whole: { en: { sharedInside: 1 }, cn: { sharedInside: 2 } } }
  const merged = { ...labels('now'), cn: 'old-cn' }
  assert.deepEqual(copyLocalizedFields({ fields: layoutFields, current, selected, locale: 'cn' }),
    { label: merged, plain: merged, group: { label: merged }, named: { label: merged },
      whole: { en: { sharedInside: 100 }, cn: { sharedInside: 2 } } })
})

test('shared blocks match both stable ID and block type, including registered references', () => {
  const blocks = [{ slug: 'text', fields: [{ name: 'label', type: 'text', localized: true } as Field] }]
  const blockFields: Field[] = [{ name: 'layout', type: 'blocks', blocks: [], blockReferences: ['text' as never] }]
  const current = { layout: [{ id: 'b', blockType: 'text', price: 100, label: labels('pending') }] }
  const selected = { layout: [{ id: 'b', blockType: 'text', price: 1, label: labels('old') }] }
  assert.deepEqual(copyLocalizedFields({ fields: blockFields, blocks, current, selected, locale: 'cn' }),
    { layout: [{ ...current.layout[0], label: { ...labels('pending'), cn: 'old-cn' } }] })
  selected.layout[0].blockType = 'other'
  assert.deepEqual(copyLocalizedFields({ fields: blockFields, blocks, current, selected, locale: 'cn' }), current)
})

test('requires explicit supported single-locale intent, not a defaulted request locale', () => {
  for (const locale of [undefined, null, '', 'all', '*', 'xx', ['cn'], { code: 'cn' }]) {
    assert.throws(() => requireRestoreLocale(locale, ['en', 'kh', 'cn']), /explicit|locale/i)
  }
  assert.equal(requireRestoreLocale('cn', ['en', 'kh', 'cn']), 'cn')
})

test('withDrafts opts in and preserves existing collection hooks', () => {
  const existing = () => undefined
  const config = withDrafts({ slug: 'pages', fields: [], custom: { other: true },
    hooks: { beforeOperation: [existing], beforeChange: [existing] } })
  assert.equal(config.custom?.localeScopedRestore, true)
  assert.equal(config.custom?.other, true)
  assert.ok(config.hooks?.beforeOperation?.includes(existing))
  assert.deepEqual(config.hooks?.beforeChange, [existing])
})

test('non-PostgreSQL adapters do not require transaction sessions', async () => {
  const req = { payload: { db: { name: 'sqlite' } } } as unknown as PayloadRequest
  await lockEditorialDocument(req, 'pages', 42)
})

test('PostgreSQL locking fails closed without a transaction or its live session', async () => {
  for (const [transactionID, sessions] of [
    [undefined, {}], ['missing', {}], ['bad', { bad: { db: {} } }],
  ] as const) {
    const req = { transactionID, payload: { db: { name: 'postgres', sessions } } } as unknown as PayloadRequest
    await assert.rejects(lockEditorialDocument(req, 'pages', 42), /active PostgreSQL transaction session/)
  }
})

test('PostgreSQL locking awaits the transaction ID and executes on its session, never the pool', async () => {
  let executions = 0
  const req = { transactionID: Promise.resolve('writer'), payload: { db: {
    name: 'postgres',
    sessions: { writer: { db: { execute: async () => { executions++ } } } },
    execute: () => assert.fail('Lock must not use an adapter/pool connection'),
  } } } as unknown as PayloadRequest
  await lockEditorialDocument(req, 'pages', 42)
  assert.equal(executions, 1)
})

test('equivalent numeric IDs share a lock identity while custom text IDs remain distinct', () => {
  const req = { payload: { collections: { pages: { config: {} } },
    db: { defaultIDType: 'number', idType: 'serial' } } } as unknown as PayloadRequest
  for (const id of [1, '1', '01', '1e0', ' 1 ']) assert.equal(canonicalEditorialID(req, 'pages', id), '1')
  for (const id of ['', 'NaN', 1.5, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => canonicalEditorialID(req, 'pages', id), /Invalid numeric/)
  }
  req.payload.collections.pages!.customIDType = 'text'
  assert.equal(canonicalEditorialID(req, 'pages', '01'), '01')
  assert.equal(canonicalEditorialID(req, 'pages', '1'), '1')
})

test('UUID case is canonical for UUID storage, not custom text identifiers', () => {
  const req = { payload: { collections: { pages: { config: {} } },
    db: { defaultIDType: 'text', idType: 'uuid' } } } as unknown as PayloadRequest
  const upper = 'FBC48BFA-9807-402F-AA7F-E0CF45D15272'
  assert.equal(canonicalEditorialID(req, 'pages', upper), upper.toLowerCase())
  req.payload.collections.pages!.customIDType = 'text'
  assert.equal(canonicalEditorialID(req, 'pages', upper), upper)
})
