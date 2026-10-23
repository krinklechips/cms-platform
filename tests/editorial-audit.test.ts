import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { buildConfig, createLocalReq, getPayload, type CollectionConfig, type PayloadRequest } from 'payload'
import type { EditorialAuditEntry } from '../src/lib/editorial-audit'

type FixtureRole = 'super-admin' | 'tenant-admin' | 'editor' | 'customer'
type FixtureAuditRow = EditorialAuditEntry & { id: string | number }

test('editorial audit is transactional, append-only, bounded and tenant isolated on native SQLite', { timeout: 120000 }, async t => {
  // No app config, .env, external accounts, or shared database is used here.
  const audit = await import('../src/lib/editorial-audit').catch(() => assert.fail('Editorial audit hooks have not been implemented'))
  const { EditorialAudit } = await import('../src/collections/EditorialAudit')
  const dir = await mkdtemp(fileURLToPath(new URL('.editorial-audit-fixture-', import.meta.url)))
  const pages: CollectionConfig = {
    slug: 'pages', admin: { useAsTitle: 'title' }, versions: { drafts: { validate: true }, maxPerDoc: 100 },
    access: { create: ({ req }) => Boolean(req.user), update: ({ req }) => Boolean(req.user), delete: ({ req }) => Boolean(req.user) },
    hooks: {
      beforeOperation: [audit.captureEditorialAuditBeforeOperation],
      beforeChange: [audit.captureEditorialAuditBeforeChange],
      afterChange: [audit.recordEditorialAuditAfterChange, ({ doc, req }) => {
        if (req.context.rejectAfterAudit) throw new Error('later hook rejected the save')
        return doc
      }],
      beforeDelete: [audit.captureEditorialAuditBeforeDelete],
      afterDelete: [audit.recordEditorialAuditAfterDelete],
    },
    fields: [
      { name: 'tenant', type: 'relationship', relationTo: 'tenants', required: true },
      { name: 'title', type: 'text', localized: true, required: true },
      { name: 'seoTitle', type: 'text', localized: true },
      { name: 'rank', type: 'number' },
      { name: 'settings', type: 'group', fields: [{ name: 'enabled', type: 'checkbox' }] },
      { name: 'rows', type: 'array', fields: [
        { name: 'label', type: 'text', localized: true }, { name: 'price', type: 'number' },
      ] },
      { name: 'details', type: 'json' },
      { name: 'apiKey', type: 'text' },
      { name: 'body', type: 'array', localized: true, fields: [{ name: 'text', type: 'text' }] },
      { name: 'sections', type: 'blocks', localized: true, blocks: [
        { slug: 'copy', fields: [{ name: 'text', type: 'text' }] },
      ] },
      { name: 'summary', type: 'group', localized: true, fields: [{ name: 'text', type: 'text' }] },
      { name: 'related', type: 'relationship', localized: true, relationTo: 'pages' },
      { type: 'tabs', tabs: [{ name: 'tab', localized: true, fields: [{ name: 'text', type: 'text' }] }] },
    ],
  }
  const payload = await getPayload({ key: randomUUID(), config: buildConfig({
    secret: 'editorial-audit-disposable-fixture-only', telemetry: false, typescript: { autoGenerate: false },
    localization: { locales: ['en', 'kh', 'cn'], defaultLocale: 'en', fallback: true },
    db: sqliteAdapter({ client: { url: `file:${path.join(dir, 'fixture.db')}` }, transactionOptions: {} }),
    collections: [
      { slug: 'tenants', fields: [
        { name: 'name', type: 'text' }, { name: 'slug', type: 'text' },
        { name: 'domains', type: 'array', fields: [{ name: 'domain', type: 'text' }] },
      ] },
      { slug: 'users', auth: true, fields: [
        { name: 'name', type: 'text' },
        { name: 'roles', type: 'select', hasMany: true, options: ['super-admin', 'tenant-admin', 'editor', 'customer'] },
        { name: 'tenants', type: 'array', fields: [{ name: 'tenant', type: 'relationship', relationTo: 'tenants' }] },
      ] }, pages,
      { slug: 'media', upload: { disableLocalStorage: true }, hooks: pages.hooks, fields: [
        { name: 'tenant', type: 'relationship', relationTo: 'tenants', required: true },
        { name: 'alt', type: 'text', localized: true },
      ] }, { ...EditorialAudit, hooks: { ...EditorialAudit.hooks, beforeChange: [
        ...(EditorialAudit.hooks?.beforeChange ?? []), ({ data, req }) => {
          if (req.context.rejectAuditInsert || req.context.rejectAuditInsertTenant === data.tenant) throw new Error('audit insertion rejected')
          return data
        },
      ] } },
    ],
  }) })
  try {
    const first = await payload.create({ collection: 'tenants', data: { name: 'First', slug: 'first', domains: [{ domain: 'first.test' }] } })
    const second = await payload.create({ collection: 'tenants', data: { name: 'Second', slug: 'second', domains: [{ domain: 'second.test' }] } })
    const makeUser = async (name: string, roles: FixtureRole[], tenants: number[]) => {
      const user = await payload.create({ collection: 'users', data: {
        name, email: `${name.toLowerCase()}@fixture.invalid`, password: 'disposable-fixture-password', roles,
        tenants: tenants.map(tenant => ({ tenant })),
      } as never }) // This isolated auth fixture intentionally has a customer role absent from app-generated types.
      return { ...user, collection: 'users' } as NonNullable<PayloadRequest['user']>
    }
    const editor = await makeUser('Alice', ['editor'], [Number(first.id)])
    const other = await makeUser('Bob', ['tenant-admin'], [Number(second.id)])
    const both = await makeUser('Both', ['editor'], [Number(first.id), Number(second.id)])
    const admin = await makeUser('Root', ['super-admin'], [])
    const customer = await makeUser('Customer', ['customer'], [Number(first.id)])
    const unassigned = await makeUser('Unassigned', ['editor'], [])
    const request = (user = editor, locale = 'en', host = 'platform.test', context = {}) => createLocalReq({
      user, locale, fallbackLocale: false, req: { headers: new Headers({ host }), context },
    }, payload)
    const rows = async () => (await payload.find({ collection: 'editorial-audit', depth: 0, limit: 100, sort: 'id' })).docs as unknown as FixtureAuditRow[]
    const history = (id: string | number) => payload.findVersions({ collection: 'pages', where: { parent: { equals: id } }, locale: 'all', depth: 0, limit: 100 })
    const page = await payload.create({ collection: 'pages', locale: 'en', req: await request(), data: {
      tenant: first.id, title: 'English original', seoTitle: 'English SEO', rank: 1, settings: { enabled: true },
      rows: [{ id: 'aaaaaaaaaaaaaaaaaaaaaaaa', label: 'English row', price: 10 }],
      details: { visible: 'safe', password: 'never-log-password', nested: { accessToken: 'never-log-token' } },
      apiKey: 'never-log-api-key', _status: 'published',
    } as never }) // rank/settings/rows/details belong to this fixture, not the application's Pages schema.
    await t.test('creates a server-authenticated actor snapshot, never credential fields or caller identities', async () => {
      const [row] = await rows()
      assert.equal(row.action, 'create')
      assert.equal(row.tenant, first.id)
      assert.equal(row.actorLabel, 'Alice')
      assert.equal(row.actorID, String(editor.id))
      assert.equal(row.documentID, String(page.id))
      assert.equal(row.docCollection, 'pages')
      assert.equal(row.docLabel, 'English original')
      assert.equal(row.locale, 'en')
      assert.ok(row.versionID)
      assert.ok(Number.isFinite(Date.parse(String(row.timestamp))))
      assert.doesNotMatch(JSON.stringify(row), /never-log|fixture-password|password|accessToken|apiKey/)
      await payload.update({ collection: 'users', id: editor.id, data: { name: 'Renamed' } })
      assert.equal((await rows())[0].actorLabel, 'Alice', 'Historical actor labels must not track live users')
    })
    await t.test('captures raw selected-locale blanks, nested/shared changes and arrays without English fallback', async () => {
      const req = await request(editor, 'kh')
      req.fallbackLocale = 'en'
      await payload.update({ collection: 'pages', id: page.id, req, locale: 'kh', draft: true, data: {
        title: 'Khmer draft', seoTitle: null, rank: 2, settings: { enabled: false },
        rows: [{ id: 'aaaaaaaaaaaaaaaaaaaaaaaa', label: 'Khmer row', price: 20 }],
        details: { visible: 'changed', nested: { items: ['one', 'two'], refresh_token: 'never-log-refresh' } },
        actorLabel: 'Mallory', actorID: 'forged', action: 'delete',
      } as never })
      const row = (await rows()).at(-1)!
      assert.equal(row.action, 'draft')
      assert.equal(row.actorID, String(editor.id))
      assert.equal(row.locale, 'kh')
      const diffs = row.diffs as { path: string; before: unknown; after: unknown; scope: string }[]
      assert.deepEqual(diffs.find(d => d.path === 'title'), { path: 'title', label: 'Title', scope: 'kh', before: null, after: 'Khmer draft' })
      assert.ok(!diffs.some(d => d.path === 'seoTitle'), 'Fallback-only text is not a real previous value')
      assert.equal(diffs.find(d => d.path === 'rank')?.scope, 'all')
      assert.equal(diffs.find(d => d.path === 'settings.enabled')?.scope, 'all')
      assert.equal(diffs.find(d => d.path === 'rows.0.label')?.scope, 'kh')
      assert.equal(diffs.find(d => d.path === 'rows.0.price')?.scope, 'all')
      assert.deepEqual(diffs.find(d => d.path === 'details.nested.items')?.after, ['one', 'two'])
      assert.doesNotMatch(JSON.stringify(row), /never-log|English SEO|Mallory|forged/)
    })
    await t.test('logs publish without text changes, successful no-op drafts, unpublish and locale restore', async () => {
      const update = async (data: Record<string, unknown>, draft: boolean) => payload.update({
        collection: 'pages', id: page.id, locale: 'kh', req: await request(editor, 'kh'), draft, data: data as never,
      })
      await update({ _status: 'published' }, false)
      assert.equal((await rows()).at(-1)!.action, 'publish')
      assert.ok(((await rows()).at(-1)!.diffs as { path: string; before: unknown; after: unknown }[])
        .some(diff => diff.path === 'title' && diff.before === null && diff.after === 'Khmer draft'),
        'Publication must compare the public page before/after, not the unchanged staged draft')
      await update({}, true)
      assert.equal((await rows()).at(-1)!.action, 'draft')
      assert.deepEqual((await rows()).at(-1)!.diffs, [])
      await update({ _status: 'draft' }, false)
      assert.equal((await rows()).at(-1)!.action, 'unpublish')
      const selected = (await history(page.id)).docs[0]
      await payload.restoreVersion({ collection: 'pages', id: selected.id, locale: 'kh', req: await request(editor, 'kh') })
      const restored = (await rows()).at(-1)!
      assert.equal(restored.action, 'restore')
      assert.equal(restored.restoredFromVersionID, String(selected.id))
      assert.ok(restored.versionID)
    })
    await t.test('shared array membership changes retain structured rows as well as localized child diffs', async () => {
      await payload.update({ collection: 'pages', id: page.id, locale: 'kh', draft: true, req: await request(editor, 'kh'), data: {
        rows: [{ id: 'bbbbbbbbbbbbbbbbbbbbbbbb', label: 'New Khmer row', price: 30 },
          { id: 'aaaaaaaaaaaaaaaaaaaaaaaa', label: 'Khmer row', price: 20 }],
      } as never })
      const row = (await rows()).at(-1)!
      const structure = (row.diffs as { path: string; before: unknown; after: unknown; scope: string }[]).find(d => d.path === 'rows')!
      assert.equal(structure.scope, 'all')
      assert.deepEqual((structure.before as { id: string; price: number }[]).map(value => ({ id: value.id, price: value.price })),
        [{ id: 'aaaaaaaaaaaaaaaaaaaaaaaa', price: 20 }])
      assert.deepEqual((structure.after as { id: string; price: number }[]).map(value => ({ id: value.id, price: value.price })),
        [{ id: 'bbbbbbbbbbbbbbbbbbbbbbbb', price: 30 }, { id: 'aaaaaaaaaaaaaaaaaaaaaaaa', price: 20 }])
      assert.ok(!(row.diffs as { path: string }[]).some(d => d.path.startsWith('rows.1.')), 'Moving a stable row is not a change to its child values')
    })
    await t.test('a later ordinary save on the same request cannot inherit stale localeScopedRestore action', async () => {
      const req = await request(editor, 'kh')
      const selected = (await history(page.id)).docs[0]
      req.context.localeScopedRestore = {
        collection: 'pages', parentID: String(page.id), versionID: String(selected.id), locale: 'kh',
        prepareSnapshot: (current: Record<string, unknown>) => ({ ...current, _status: 'draft' }),
      }
      await payload.restoreVersion({ collection: 'pages', id: selected.id, locale: 'kh', req })
      assert.equal((await rows()).at(-1)!.action, 'restore')
      // The parent's scoped restore clears this native validation flag; leave only stale audit metadata here.
      delete req.context.isRestoringVersion
      await payload.update({ collection: 'pages', id: page.id, locale: 'kh', draft: true, req, data: { rank: 3 } as never })
      const saved = (await rows()).at(-1)!
      assert.equal(saved.action, 'draft')
      assert.equal(saved.restoredFromVersionID ?? null, null)
    })
    await payload.create({ collection: 'pages', locale: 'en', req: await request(other), data: { tenant: second.id, title: 'Second tenant page' } as never })
    await t.test('read access intersects assigned staff membership with host, including direct IDs and super-admins', async () => {
      const find = async (user: typeof editor, host = 'platform.test') => payload.find({
        collection: 'editorial-audit', depth: 0, limit: 100, overrideAccess: false, req: await request(user, 'en', host),
      })
      assert.ok((await find(editor)).docs.every(row => row.tenant === first.id))
      assert.equal((await find(other)).totalDocs, 1)
      assert.equal((await find(both, 'second.test')).totalDocs, 1)
      assert.equal((await find(admin, 'second.test')).totalDocs, 1)
      assert.ok((await find(admin)).totalDocs > 1)
      assert.equal((await find(editor, 'second.test')).totalDocs, 0)
      for (const user of [customer, unassigned]) await assert.rejects(() => find(user))
      await assert.rejects(() => payload.find({ collection: 'editorial-audit', overrideAccess: false }))
      await assert.rejects(async () => payload.findByID({ collection: 'editorial-audit', id: (await rows())[0].id,
        overrideAccess: false, req: await request(admin, 'en', 'second.test') }))
      const populated = { ...editor, tenants: [{ tenant: { id: first.id } }] } as unknown as typeof editor
      assert.ok((await find(populated)).totalDocs > 0)
    })
    await t.test('denies public writes and forged internal creation, even override-access mutation/deletion', async () => {
      const row = (await rows())[0]
      for (const user of [editor, admin]) {
        await assert.rejects(async () => payload.create({ collection: 'editorial-audit', overrideAccess: false, req: await request(user), data: row as never }))
        await assert.rejects(async () => payload.update({ collection: 'editorial-audit', id: row.id, overrideAccess: false, req: await request(user), data: { actorLabel: 'forged' } }))
        await assert.rejects(async () => payload.delete({ collection: 'editorial-audit', id: row.id, overrideAccess: false, req: await request(user) }))
      }
      await assert.rejects(async () => payload.create({ collection: 'editorial-audit', overrideAccess: true, req: await request(admin), data: row as never }))
      await assert.rejects(() => payload.update({ collection: 'editorial-audit', id: row.id, overrideAccess: true, data: { actorLabel: 'forged' } }))
      await assert.rejects(() => payload.delete({ collection: 'editorial-audit', id: row.id, overrideAccess: true }))
      assert.deepEqual((await rows())[0], row)
    })
    await t.test('reads and rejected writes append nothing; later hook failures roll content, versions and audit back together', async () => {
      const before = await rows()
      const versions = await history(page.id)
      const current = await payload.findByID({ collection: 'pages', id: page.id, locale: 'all', draft: true, fallbackLocale: false })
      await payload.findByID({ collection: 'pages', id: page.id, locale: 'kh', draft: true })
      await assert.rejects(async () => payload.update({ collection: 'pages', id: page.id, locale: 'kh', req: await request(), data: { title: null } }))
      await assert.rejects(async () => payload.update({ collection: 'pages', id: page.id, locale: 'kh', draft: true,
        req: await request(editor, 'kh', 'platform.test', { rejectAfterAudit: true }), data: { title: 'must roll back' } }), /later hook/)
      await assert.rejects(async () => payload.update({ collection: 'pages', id: page.id, locale: 'kh', draft: true,
        disableTransaction: true, req: await request(), data: { title: 'no transaction' } }), /transaction/i)
      assert.deepEqual(await rows(), before)
      assert.deepEqual(await history(page.id), versions)
      assert.deepEqual(await payload.findByID({ collection: 'pages', id: page.id, locale: 'all', draft: true, fallbackLocale: false }), current)
    })
    await t.test('audit insert errors roll back the already-written editorial content and version', async () => {
      const before = await rows()
      const versions = await history(page.id)
      const current = await payload.findByID({ collection: 'pages', id: page.id, locale: 'all', draft: true, fallbackLocale: false })
      await assert.rejects(async () => payload.update({ collection: 'pages', id: page.id, locale: 'kh', draft: true,
        req: await request(editor, 'kh', 'platform.test', { rejectAuditInsert: true }), data: { title: 'must not survive failed audit' } }), /audit insertion rejected/)
      assert.deepEqual(await rows(), before)
      assert.deepEqual(await history(page.id), versions)
      assert.deepEqual(await payload.findByID({ collection: 'pages', id: page.id, locale: 'all', draft: true, fallbackLocale: false }), current)
    })
    await t.test('missing audit registration fails closed before an editorial write', async () => {
      const registered = payload.collections['editorial-audit']
      const before = await rows()
      try {
        Reflect.deleteProperty(payload.collections, 'editorial-audit')
        await assert.rejects(async () => payload.update({ collection: 'pages', id: page.id, locale: 'kh', draft: true,
          req: await request(editor, 'kh'), data: { title: 'must not save without audit' } }), /must be registered/)
      } finally { payload.collections['editorial-audit'] = registered }
      assert.deepEqual(await rows(), before)
      assert.equal((await payload.findByID({ collection: 'pages', id: page.id, locale: 'kh', draft: true, fallbackLocale: false })).title, 'Khmer draft')
    })
    await t.test('bounds large structured diffs and explicitly marks omitted detail', async () => {
      await payload.update({ collection: 'pages', id: page.id, locale: 'kh', draft: true, req: await request(editor, 'kh'), data: {
        details: { large: 'x'.repeat(200000), items: Array.from({ length: 5000 }, (_, i) => ({ value: `item ${i}` })),
          nested: { authorization: 'never-log-authorization' } },
      } as never })
      const row = (await rows()).at(-1)!
      assert.equal(row.truncated, true)
      assert.ok(Buffer.byteLength(JSON.stringify(row.diffs), 'utf8') <= 65536)
      assert.ok(JSON.stringify(row.diffs).length < 30000)
      assert.doesNotMatch(JSON.stringify(row), /never-log/)
      assert.ok((row.changedFields as string[]).some(field => field.startsWith('details')))
    })
    await t.test('the size bound includes repeated changed-field paths, not just diff values', async () => {
      let details: Record<string, unknown> = Object.fromEntries(Array.from({ length: 60 }, (_, i) => [`${i}${'k'.repeat(170)}`, 'changed']))
      for (let i = 0; i < 5; i++) details = { ['n'.repeat(180)]: details }
      await payload.update({ collection: 'pages', id: page.id, locale: 'kh', draft: true, req: await request(editor, 'kh'), data: { details } as never })
      const row = (await rows()).at(-1)!
      assert.equal(row.truncated, true)
      assert.ok(Buffer.byteLength(JSON.stringify(row), 'utf8') <= 65536, 'The entire stored entry must stay bounded')
    })
    await t.test('root media captures upload metadata and localized alt, never file bytes or virtual revision data', async () => {
      const image = await payload.create({ collection: 'media', req: await request(), data: { tenant: first.id, alt: 'Original alt' },
        file: { name: 'fixture.txt', mimetype: 'text/plain', size: 6, data: Buffer.from('bytes!') } })
      const created = (await rows()).at(-1)!
      assert.equal(created.docCollection, 'media')
      assert.ok((created.changedFields as string[]).includes('filename'))
      assert.ok((created.changedFields as string[]).includes('mimeType'))
      await payload.update({ collection: 'media', id: image.id, req: await request(), data: {
        alt: 'Revised alt', _editorialRevision: 'never-log-revision',
      } as never })
      const updated = (await rows()).at(-1)!
      assert.equal(updated.action, 'update')
      assert.ok((updated.diffs as { path: string; before: unknown; after: unknown }[]).some(d => d.path === 'alt' && d.before === 'Original alt' && d.after === 'Revised alt'))
      assert.doesNotMatch(JSON.stringify(updated), /bytes!|never-log-revision|_editorialRevision/)
    })
    await t.test('explicit all-language publishing records every changed translation against its public value', async () => {
      const entry = await payload.create({ collection: 'pages', locale: 'en', req: await request(),
        data: { tenant: first.id, title: 'EN publicly visible', _status: 'published' } as never })
      for (const locale of ['kh', 'cn'] as const) await payload.update({ collection: 'pages', id: entry.id, locale,
        req: await request(editor, locale), draft: true, data: { title: `${locale} staged` } })
      await payload.update({ collection: 'pages', id: entry.id, locale: 'en', req: await request(),
        publishAllLocales: true, data: { _status: 'published' } })
      const row = (await rows()).at(-1)!
      assert.equal(row.action, 'publish')
      assert.equal(row.locale, 'all')
      for (const locale of ['kh', 'cn']) assert.ok((row.diffs as { path: string; before: unknown; after: unknown }[])
        .some(diff => diff.path === `title.${locale}` && diff.before === null && diff.after === `${locale} staged`))
    })
    await t.test('an allowed tenant transfer appends isolated ownership snapshots visible at both ends', async () => {
      const entry = await payload.create({ collection: 'pages', locale: 'en', req: await request(),
        data: { tenant: first.id, title: 'Original English', rank: 10, _status: 'published' } as never })
      await payload.update({ collection: 'pages', id: entry.id, locale: 'kh', draft: true,
        req: await request(editor, 'kh'), data: { title: 'Source-only Khmer' } })
      const oldVersion = (await history(entry.id)).docs[0]
      const before = await rows()
      await payload.update({ collection: 'pages', id: entry.id, locale: 'kh', draft: true, overrideAccess: false,
        req: await request(both, 'kh'), data: { tenant: second.id, title: 'Destination-only Khmer', rank: 999,
          details: { visible: 'Destination-only details', password: 'never-log-transfer' } } as never })
      const after = await rows()
      assert.deepEqual(after.slice(0, before.length), before)
      const added = after.slice(before.length)
      assert.equal(added.length, 2)
      const outgoing = added.find(row => row.tenant === first.id)!
      const incoming = added.find(row => row.tenant === second.id)!
      assert.ok(outgoing)
      assert.ok(incoming)
      for (const row of added) {
        assert.equal(row.action, 'draft')
        assert.equal(row.locale, 'all')
        assert.equal(row.documentID, String(entry.id))
        assert.equal(row.actorID, String(both.id))
        assert.equal(row.changedFields[0], 'tenant')
        assert.doesNotMatch(JSON.stringify(row), /never-log/)
      }
      assert.deepEqual(outgoing.diffs[0], { path: 'tenant', label: 'Tenant', scope: 'all', before: first.id, after: null })
      assert.deepEqual(incoming.diffs[0], { path: 'tenant', label: 'Tenant', scope: 'all', before: null, after: second.id })
      assert.equal(outgoing.versionID, String(oldVersion.id))
      assert.notEqual(incoming.versionID, outgoing.versionID)
      assert.deepEqual((await history(entry.id)).docs.find(version => version.id === oldVersion.id)?.version, oldVersion.version)
      assert.ok(outgoing.diffs.some(diff => diff.path === 'title.kh' && diff.before === 'Source-only Khmer' && diff.after === null))
      assert.ok(incoming.diffs.some(diff => diff.path === 'title.kh' && diff.before === null && diff.after === 'Destination-only Khmer'))
      assert.doesNotMatch(JSON.stringify(outgoing), /Destination-only|999/)
      assert.doesNotMatch(JSON.stringify(incoming), /Source-only/)
      const visible = async (user: typeof editor, host = 'platform.test') => (await payload.find({
        collection: 'editorial-audit', depth: 0, overrideAccess: false, req: await request(user, 'en', host),
        where: { id: { in: added.map(row => row.id) } },
      })).docs.map(row => row.id)
      assert.deepEqual(await visible(editor), [outgoing.id])
      assert.deepEqual(await visible(other), [incoming.id])
      assert.deepEqual(await visible(both, 'first.test'), [outgoing.id])
      assert.deepEqual(await visible(admin, 'second.test'), [incoming.id])
      for (const [user, row, host] of [[editor, incoming, 'platform.test'], [other, outgoing, 'platform.test'],
        [admin, outgoing, 'second.test']] as const) {
        await assert.rejects(async () => payload.findByID({ collection: 'editorial-audit', id: row.id,
          overrideAccess: false, req: await request(user, 'en', host) }))
      }
    })
    await t.test('publishing a transferred draft never exposes its destination version to the previous public tenant', async () => {
      const entry = await payload.create({ collection: 'pages', req: await request(),
        data: { tenant: first.id, title: 'Source public title', _status: 'published' } as never })
      await payload.update({ collection: 'pages', id: entry.id, draft: true, req: await request(both),
        data: { tenant: second.id, title: 'Destination private draft' } })
      const draftVersion = (await history(entry.id)).docs[0]
      const before = await rows()
      await payload.update({ collection: 'pages', id: entry.id, req: await request(both), data: { _status: 'published' } })
      const added = (await rows()).slice(before.length)
      assert.equal(added.length, 2)
      const outgoing = added.find(row => row.tenant === first.id)!
      const incoming = added.find(row => row.tenant === second.id)!
      assert.equal(outgoing.versionID ?? null, null, 'The latest draft version belongs to the destination, not the outgoing public snapshot')
      assert.doesNotMatch(JSON.stringify(outgoing), /Destination private draft/)
      assert.equal(incoming.action, 'publish')
      assert.ok(incoming.versionID)
      assert.notEqual(incoming.versionID, String(draftVersion.id))
      assert.ok(incoming.diffs.some(diff => diff.path === 'title.en' && diff.before === null && diff.after === 'Destination private draft'))
    })
    await t.test('a publish transfer back to the public owner still records the departing draft owner', async () => {
      const entry = await payload.create({ collection: 'pages', req: await request(),
        data: { tenant: first.id, title: 'Public A', _status: 'published' } as never })
      await payload.update({ collection: 'pages', id: entry.id, draft: true, req: await request(both),
        data: { tenant: second.id, title: 'Private B' } })
      const before = await rows()
      await payload.update({ collection: 'pages', id: entry.id, req: await request(both),
        data: { tenant: first.id, title: 'Revised public A', _status: 'published' } })
      const added = (await rows()).slice(before.length)
      assert.equal(added.length, 2)
      const outgoing = added.find(row => row.tenant === second.id)!
      const incoming = added.find(row => row.tenant === first.id)!
      assert.deepEqual(outgoing.diffs[0], { path: 'tenant', label: 'Tenant', scope: 'all', before: second.id, after: null })
      assert.ok(outgoing.diffs.some(diff => diff.path === 'title.en' && diff.before === 'Private B' && diff.after === null))
      assert.doesNotMatch(JSON.stringify(outgoing), /Revised public A/)
      assert.ok(incoming.diffs.some(diff => diff.path === 'title.en' && diff.before === null && diff.after === 'Revised public A'))
      assert.doesNotMatch(JSON.stringify(incoming), /Private B/)
      assert.ok(added.every(row => row.action === 'publish' && row.locale === 'all'))
    })
    await t.test('failed transfer audit inserts and later hooks roll back both rows, content and legacy versions', async () => {
      const entry = await payload.create({ collection: 'pages', req: await request(),
        data: { tenant: first.id, title: 'Must survive rollback', _status: 'published' } as never })
      const snapshot = async () => ({ rows: await rows(), versions: await history(entry.id),
        doc: await payload.findByID({ collection: 'pages', id: entry.id, locale: 'all', draft: true, fallbackLocale: false }),
      })
      const before = await snapshot()
      for (const [context, expected] of [
        [{ rejectAuditInsertTenant: first.id }, /audit insertion rejected/],
        [{ rejectAuditInsertTenant: second.id }, /audit insertion rejected/],
        [{ rejectAfterAudit: true }, /later hook/],
      ] as const) {
        const req = await request(both, 'en', 'platform.test', context)
        await assert.rejects(() => payload.update({ collection: 'pages', id: entry.id, draft: true, req,
          data: { tenant: second.id, title: 'Must roll back' } }), expected)
        assert.deepEqual(await snapshot(), before)
        await assert.rejects(() => payload.create({ collection: 'editorial-audit', req,
          data: before.rows[0] as never }), /append-only/)
      }
    })
    await t.test('both transfer snapshots reserve ownership detail and retain existing truncation and redaction', async () => {
      const entry = await payload.create({ collection: 'pages', req: await request(), data: {
        tenant: first.id, title: 'Bounded transfer', details: { large: 's'.repeat(200000), password: 'never-log-source' },
      } as never })
      const before = await rows()
      await payload.update({ collection: 'pages', id: entry.id, draft: true, req: await request(both), data: {
        tenant: second.id, details: { large: 'd'.repeat(200000), apiKey: 'never-log-destination' },
      } as never })
      const added = (await rows()).slice(before.length)
      assert.equal(added.length, 2)
      for (const row of added) {
        assert.equal(row.changedFields[0], 'tenant')
        assert.equal(row.truncated, true)
        assert.ok(row.diffs.length <= 80)
        assert.ok(Buffer.byteLength(JSON.stringify(row), 'utf8') <= 65536)
        assert.match(JSON.stringify(row.diffs), /Audit detail truncated/)
        assert.doesNotMatch(JSON.stringify(row), /never-log|password|apiKey/)
      }
    })
    await t.test('unversioned media ownership transfers use the same isolated all-locale audit snapshots', async () => {
      const image = await payload.create({ collection: 'media', req: await request(), data: { tenant: first.id, alt: 'Source alt' },
        file: { name: 'transfer-fixture.txt', mimetype: 'text/plain', size: 6, data: Buffer.from('bytes!') } })
      const before = await rows()
      await payload.update({ collection: 'media', id: image.id, locale: 'kh', req: await request(both, 'kh'),
        data: { tenant: second.id, alt: 'Destination alt' } })
      const added = (await rows()).slice(before.length)
      assert.equal(added.length, 2)
      const outgoing = added.find(row => row.tenant === first.id)!
      const incoming = added.find(row => row.tenant === second.id)!
      assert.ok(added.every(row => row.action === 'update' && row.locale === 'all' && !row.versionID))
      assert.ok(outgoing.diffs.some(diff => diff.path === 'alt.en' && diff.before === 'Source alt' && diff.after === null))
      assert.ok(incoming.diffs.some(diff => diff.path === 'alt.kh' && diff.before === null && diff.after === 'Destination alt'))
      assert.doesNotMatch(JSON.stringify(outgoing), /Destination alt|bytes!|_editorialRevision/)
    })
    await t.test('all-locale deletion retains localized arrays, blocks, groups, tabs and relationship IDs', async () => {
      const entry = await payload.create({ collection: 'pages', req: await request(), data: {
        tenant: first.id, title: 'Localized structures', body: [{ text: 'EN paragraph' }],
        sections: [{ blockType: 'copy', text: 'EN block' }], summary: { text: 'EN group' },
        tab: { text: 'EN tab' }, related: page.id,
      } as never })
      await payload.update({ collection: 'pages', id: entry.id, locale: 'kh', draft: true,
        req: await request(editor, 'kh'), data: { title: 'KH structures', body: [{ text: 'KH paragraph' }],
          sections: [{ blockType: 'copy', text: 'KH block' }], summary: { text: 'KH group' },
          tab: { text: 'KH tab' }, related: page.id } as never })
      await payload.delete({ collection: 'pages', id: entry.id, locale: 'cn', req: await request(editor, 'cn') })
      const row = (await rows()).at(-1)!
      assert.equal(row.locale, 'all')
      for (const [locale, prefix] of [['en', 'EN'], ['kh', 'KH']]) {
        for (const [field, text] of [['body', 'paragraph'], ['sections', 'block']]) {
          const diff = row.diffs.find(diff => diff.path === `${field}.${locale}`)
          assert.ok(diff, `${field}.${locale}`)
          assert.equal(diff.scope, 'all')
          assert.deepEqual(diff.after, [])
          assert.equal((diff.before as { text: string }[])[0].text, `${prefix} ${text}`)
        }
        for (const [field, text] of [['summary', 'group'], ['tab', 'tab']]) {
          assert.ok(row.diffs.some(diff => diff.path === `${field}.${locale}.text`
            && diff.scope === 'all' && diff.before === `${prefix} ${text}` && diff.after === null), `${field}.${locale}`)
        }
        assert.ok(row.diffs.some(diff => diff.path === `related.${locale}`
          && diff.scope === 'all' && diff.before === page.id && diff.after === null), `related.${locale}`)
      }
    })
    await t.test('deletion records all locales and shared fields with bounded detail, regardless of request locale', async () => {
      await payload.update({ collection: 'pages', id: page.id, locale: 'cn', draft: true,
        req: await request(editor, 'cn'), data: { title: 'Chinese draft' } })
      const version = (await history(page.id)).docs[0]
      const before = await rows()
      await payload.delete({ collection: 'pages', id: page.id, locale: 'kh', req: await request(editor, 'kh') })
      const after = await rows()
      assert.deepEqual(after.slice(0, -1), before)
      const row = after.at(-1)!
      assert.equal(row.action, 'delete')
      assert.equal(row.documentID, String(page.id))
      assert.equal(row.tenant, first.id)
      assert.equal(row.locale, 'all')
      assert.equal(row.versionID, String(version.id))
      for (const [field, value] of Object.entries({
        'title.en': 'English original', 'title.kh': 'Khmer draft', 'title.cn': 'Chinese draft',
        'seoTitle.en': 'English SEO', rank: 3, 'settings.enabled': false,
      })) {
        assert.ok(row.diffs.some(diff => diff.path === field && diff.scope === 'all' && diff.before === value && diff.after === null), field)
      }
      const structure = row.diffs.find(diff => diff.path === 'rows')!
      assert.equal(structure.scope, 'all')
      assert.deepEqual(structure.after, [])
      assert.ok(Array.isArray(structure.before))
      assert.equal(row.truncated, true)
      assert.ok(Buffer.byteLength(JSON.stringify(row), 'utf8') <= 65536)
      assert.doesNotMatch(JSON.stringify(row), /never-log|_editorialRevision/)
    })
  } finally {
    await payload.destroy()
    await rm(dir, { recursive: true, force: true })
  }
})

test('withEditorialAudit composes hook phases only for drafts and root media, never its own collection', async () => {
  const audit = await import('../src/lib/editorial-audit')
  assert.equal(typeof audit.withEditorialAudit, 'function')
  const existing = () => undefined
  const draft: CollectionConfig = { slug: 'pages', versions: { drafts: true }, fields: [], hooks: {
    beforeOperation: [existing], beforeChange: [existing], afterChange: [existing], beforeDelete: [existing], afterDelete: [existing],
  } }
  const wrapped = audit.withEditorialAudit(draft)
  assert.deepEqual(wrapped.hooks?.beforeOperation, [existing, audit.captureEditorialAuditBeforeOperation])
  assert.deepEqual(wrapped.hooks?.beforeChange, [audit.captureEditorialAuditBeforeChange, existing])
  assert.deepEqual(wrapped.hooks?.afterChange, [existing, audit.recordEditorialAuditAfterChange])
  assert.deepEqual(wrapped.hooks?.beforeDelete, [audit.captureEditorialAuditBeforeDelete, existing])
  assert.deepEqual(wrapped.hooks?.afterDelete, [existing, audit.recordEditorialAuditAfterDelete])
  assert.equal(draft.hooks?.beforeOperation?.length, 1)
  for (const config of [{ slug: 'editorial-audit', fields: [] }, { slug: 'users', fields: [] }, { slug: 'pages', fields: [] }]) {
    assert.equal(audit.withEditorialAudit(config), config)
  }
  assert.ok(audit.withEditorialAudit({ slug: 'media', fields: [] }).hooks?.afterChange?.includes(audit.recordEditorialAuditAfterChange))
})
