import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import pg from 'pg'
import { postgresAdapter, type PostgresAdapter } from '@payloadcms/db-postgres'
import { PgDialect } from '@payloadcms/db-postgres/drizzle/pg-core'
import { buildConfig, getPayload, type Payload, type PayloadRequest } from 'payload'
import { createRefreshRuntime } from '../scripts/refresh-live-translations'
import { APPROVED_IDENTITIES, applyRefresh, hashJSON, planRefresh, type RecordState, type Row } from '../src/lib/live-content-refresh'
import { withDrafts } from '../src/lib/with-drafts'
import { protectEditorialWrite, withEditorialConcurrency } from '../src/lib/with-editorial-concurrency'

const identity = { collection: 'faq-items' as const, id: '1', tenantId: '1', sourceId: 'e1afc59c-6012-4c04-b0d5-aeaddfe46889' }
const bytes = Buffer.from(JSON.stringify({ tables: {
  faq_items: [{ id: identity.sourceId }], career_positions: [], content_translations: [
    { entity_type: 'faq', entity_id: identity.sourceId, locale: 'km', field: 'question', value: 'KH refreshed' },
    { entity_type: 'faq', entity_id: identity.sourceId, locale: 'zh', field: 'answer', value: 'CN refreshed' },
  ],
} }))
const status = (expected: number) => (error: any) => error.status === expected

// Only persistence/SQL transport is synthetic; runtime transactions, locks, reads,
// manifest/preservation checks and the authenticated CAS hook execute unchanged.
async function fixture() {
  const policy = { localizedFields: ['question', 'answer'], maxVersions: 100, canPublish: true }
  const config = await buildConfig({ secret: 'offline-refresh-revision-test-only', telemetry: false,
    db: { defaultIDType: 'number', init: () => { throw new Error('Offline fixture must never initialize a database') } },
    typescript: { autoGenerate: false }, localization: { locales: ['en', 'kh', 'cn'], defaultLocale: 'en', fallback: true },
    collections: [withEditorialConcurrency({ slug: 'faq-items', versions: { drafts: true },
      fields: [{ name: 'question', type: 'text', localized: true }, { name: 'answer', type: 'text', localized: true }] })],
  })
  const collection = config.collections.find(c => c.slug === 'faq-items')!
  const actor = { id: 7, collection: 'users' }
  let committed: RecordState = {
    identity, ...policy, columns: ['answer', 'question'], links: [
      { table: '_faq_items_v_locales', parent: '_faq_items_v' }, { table: 'faq_items_locales', parent: 'faq_items' },
    ],
    parent: {
      faq_items: [{ id: 1, tenant_id: 1, source_id: identity.sourceId, order: 7, _status: 'published', updated_at: '2029-01-01T00:00:00Z' }],
      faq_items_locales: [{ id: 1, _parent_id: 1, _locale: 'en', question: 'EN preserved', answer: 'Borin published' }],
    },
    history: {
      _faq_items_v: [
        { id: 9, parent_id: 1, version_tenant_id: 1, version_source_id: identity.sourceId, version_order: 7,
          latest: false, version__status: 'draft', version_updated_at: '2029-01-01T00:00:00Z' },
        { id: 10, parent_id: 1, version_tenant_id: 1, version_source_id: identity.sourceId, version_order: 7,
          latest: true, version__status: 'published', version_updated_at: '2030-01-01T00:00:00.000123+00:00', updated_at: '2031-01-01T00:00:00Z' },
      ],
      _faq_items_v_locales: [
        { id: 9, _parent_id: 9, _locale: 'en', version_question: 'Borin historical draft', version_answer: 'Never overwrite' },
        { id: 10, _parent_id: 10, _locale: 'en', version_question: 'EN preserved', version_answer: 'Borin published' },
      ],
    },
  }
  let working: RecordState | undefined, locked = false, guardActive = false
  let lease = false, failNext = false, guardStamp: string | undefined
  const events: string[] = [], attempts: { locale: string; revision: unknown; savedAt?: string }[] = []
  const sessions: Record<string, any> = {}, dialect = new PgDialect()
  const readSQL = async (text: string): Promise<Row[]> => {
    if (text.startsWith('BEGIN') || text.startsWith('ROLLBACK') || text.startsWith('SET LOCAL')) return []
    if (text.includes('pg_advisory_xact_lock')) { locked = true; events.push('lock'); return [] }
    const state = working ?? committed
    if (working) assert.ok(locked, 'The shared record lock must precede the validated SQL snapshot')
    events.push('sql-read')
    if (text.includes('information_schema.columns')) return Object.entries({ ...state.parent, ...state.history })
      .flatMap(([table_name, rows]) => [...new Set(rows.flatMap(r => Object.keys(r)))].map(column_name => ({ table_name, column_name })))
    if (text.includes('FROM pg_constraint')) return state.links
    if (text.startsWith('SELECT id, source_id, tenant_id')) return [{ id: 1, source_id: identity.sourceId, tenant_id: 1 }]
    const table = text.match(/FROM "public"\."([a-z_]+)" record/)?.[1]
    if (table) return structuredClone((state.parent[table] ?? state.history[table]).map(record => ({ record })))
    throw new Error(`Unexpected offline SQL: ${text}`)
  }
  const appendVersion = (data: Row, locale: string, stamp: string, snapshot = false) => {
    const state = working!, roots = state.history._faq_items_v, old = roots.find(r => r.latest)!
    const id = Number(roots.at(-1)!.id) + 1
    for (const row of roots) row.latest = false
    roots.push({ ...old, id, latest: true, version__status: snapshot ? 'draft' : data._status,
      version_updated_at: stamp, updated_at: stamp, snapshot })
    const locals = state.history._faq_items_v_locales
    locals.push(...locals.filter(r => r._parent_id === old.id).map((r, i) => ({ ...r, id: id * 100 + i, _parent_id: id })))
    let target = locals.find(r => r._parent_id === id && r._locale === locale)
    if (!target) { target = { id: id * 100 + 50, _parent_id: id, _locale: locale }; locals.push(target) }
    for (const field of policy.localizedFields) if (field in data) target['version_' + field] = data[field]
  }
  const payload = {
    config, collections: { 'faq-items': { config: collection }, 'payload-locked-documents': {} },
    db: {
      name: 'postgres', defaultIDType: 'number', sessions,
      beginTransaction: async () => {
        assert.equal(working, undefined)
        working = structuredClone(committed); locked = false; events.push('begin')
        sessions.tx = { db: { execute: async (statement: any) => ({ rows: await readSQL(dialect.sqlToQuery(statement).sql) }) } }
        return 'tx'
      },
      commitTransaction: async () => { committed = working!; working = undefined; delete sessions.tx; events.push('commit') },
      rollbackTransaction: async () => { working = undefined; delete sessions.tx; events.push('rollback') },
      find: async (args: any) => {
        assert.equal(args.req.transactionID, 'tx')
        assert.ok(locked)
        return { docs: lease ? [{ id: 'borin-edit-lease' }] : [] }
      },
    },
    findByID: async (args: any) => {
      assert.ok(guardActive, 'No unseen latest revision may be fetched outside the real CAS guard')
      assert.equal(args.req.transactionID, 'tx'); assert.equal(args.fallbackLocale, false)
      assert.equal(args.draft, true); assert.equal(args.overrideAccess, false)
      events.push('guard-read')
      const latest = working!.history._faq_items_v.find(r => r.latest)!
      return { id: 1, updatedAt: guardStamp ?? new Date(latest.version_updated_at).toISOString() }
    },
    update: async (args: any) => {
      assert.ok(locked); assert.equal(args.req.transactionID, 'tx')
      assert.equal(args.overrideAccess, false); assert.equal(args.overrideLock, false)
      assert.equal(args.autosave, false); assert.equal(args.fallbackLocale, false)
      const attempt = { locale: args.locale, revision: args.data._editorialRevision, savedAt: undefined as string | undefined }
      attempts.push(attempt)
      guardActive = true
      try { await protectEditorialWrite({ args, collection, context: args.req.context, operation: 'update', req: args.req }) }
      finally { guardActive = false }
      assert.equal('_editorialRevision' in args.data, false, 'The real guard must consume the virtual revision before persistence')
      if (failNext) { failNext = false; throw new Error('synthetic persistence failure') }
      let stamp = args.req.context.editorialWriteTimestamp
      appendVersion(args.data, args.locale, stamp)
      if (!args.draft) {
        const state = working!
        state.parent.faq_items[0].updated_at = stamp
        let target = state.parent.faq_items_locales.find(r => r._locale === args.locale)
        const localized = Object.fromEntries(policy.localizedFields.filter(f => f in args.data).map(f => [f, args.data[f]]))
        if (!target && Object.keys(localized).length) {
          target = { id: 100 + state.parent.faq_items_locales.length, _parent_id: 1, _locale: args.locale }
          state.parent.faq_items_locales.push(target)
        }
        if (target) Object.assign(target, localized)
        if (args.publishSpecificLocale) {
          assert.equal(args.publishSpecificLocale, args.locale); assert.equal(args.publishAllLocales, false)
          stamp = new Date(Date.parse(stamp) + 1).toISOString()
          appendVersion(args.data, args.locale, stamp, true)
        } else assert.equal(args.publishAllLocales, true)
      }
      attempt.savedAt = stamp
      events.push('persist')
      return { id: 1, updatedAt: stamp }
    },
  } as unknown as Payload
  const pool = { connect: async () => ({ query: async (text: string) => ({ rows: await readSQL(text) }), release() {} }) }
  const runtime = await createRefreshRuntime({ payload, actor: actor as any, pool: pool as any, policies: {
    'faq-items': policy, 'career-positions': { localizedFields: ['description'], maxVersions: 100, canPublish: true },
  }, tenantId: '1', tenantSlug: 'roomchang', destination: { host: 'offline.invalid', port: 1, database: 'never-connect', schema: 'public' } })
  return { runtime, attempts, events, get: () => structuredClone(committed),
    change: (fn: (state: RecordState) => void) => fn(committed),
    changeWorking: (fn: (state: RecordState) => void) => fn(working!),
    setLease: (value: boolean) => { lease = value }, failNext: () => { failNext = true },
    setGuardStamp: (value: string) => { guardStamp = value },
  }
}

for (const mode of ['draft', 'publish'] as const) test(`locked ${mode} refresh carries the validated revision across both locales${mode === 'publish' ? ' and finalization' : ''}`, async () => {
  const f = await fixture(), before = f.get()
  const { manifest } = await planRefresh(bytes, f.runtime, mode)
  const report = await applyRefresh(bytes, manifest, f.runtime)
  assert.equal(report.records[0].code, mode === 'publish' ? 'published' : 'staged_not_visible')
  assert.equal(report.appliedCells, 2)
  assert.deepEqual(f.attempts.map(a => a.locale), mode === 'publish' ? ['kh', 'cn', 'en'] : ['kh', 'cn'])
  assert.ok(f.events.indexOf('lock') < f.events.indexOf('guard-read'))
  const after = f.get(), latest = after.history._faq_items_v.find(r => r.latest)!
  assert.equal(latest.version__status, mode === 'publish' ? 'published' : 'draft')
  assert.equal(after.history._faq_items_v_locales.find(r => r._parent_id === latest.id && r._locale === 'kh')!.version_question, 'KH refreshed')
  assert.equal(after.history._faq_items_v_locales.find(r => r._parent_id === latest.id && r._locale === 'cn')!.version_answer, 'CN refreshed')
  for (const old of before.history._faq_items_v) {
    assert.deepEqual(after.history._faq_items_v.find(r => r.id === old.id), { ...old, latest: false })
  }
  for (const old of before.history._faq_items_v_locales) assert.deepEqual(after.history._faq_items_v_locales.find(r => r.id === old.id), old)
  assert.deepEqual(after.parent.faq_items_locales[0], before.parent.faq_items_locales[0])
  if (mode === 'draft') assert.deepEqual(after.parent, before.parent)
  else {
    assert.equal(after.parent.faq_items_locales.find(r => r._locale === 'kh')!.question, 'KH refreshed')
    assert.equal(after.parent.faq_items_locales.find(r => r._locale === 'cn')!.answer, 'CN refreshed')
    assert.equal(after.history._faq_items_v.filter(r => r.snapshot === true && !r.latest && r.version__status === 'draft').length, 2)
  }
})

test('stale manifest and Borin pending draft are refused before any Payload write', async () => {
  for (const draft of [false, true]) {
    const f = await fixture(), { manifest } = await planRefresh(bytes, f.runtime)
    f.change(s => { s.history._faq_items_v.find(r => r.latest)!.version_updated_at = '2030-01-02T00:00:00Z' })
    if (draft) f.change(s => { s.history._faq_items_v.find(r => r.latest)!.version__status = 'draft' })
    const before = f.get(), report = await applyRefresh(bytes, manifest, f.runtime)
    assert.equal(report.records[0].code, 'stale_state'); assert.equal(report.appliedCells, 0)
    assert.equal(f.attempts.length, 0); assert.deepEqual(f.get(), before)
  }
})

test('Borin edit lease blocks the refresh without appending or changing content', async () => {
  const f = await fixture(), { manifest } = await planRefresh(bytes, f.runtime), before = f.get()
  f.setLease(true)
  const report = await applyRefresh(bytes, manifest, f.runtime)
  assert.equal(report.records[0].code, 'editor_lease'); assert.equal(report.appliedCells, 0)
  assert.equal(f.attempts.length, 0); assert.deepEqual(f.get(), before)
})

test('a stale snapshot revision reaches the real 409 guard without persistence or latest-token repair', async () => {
  const f = await fixture(), { manifest } = await planRefresh(bytes, f.runtime), before = f.get()
  f.setGuardStamp('2030-01-02T00:00:00.000Z')
  const report = await applyRefresh(bytes, manifest, f.runtime)
  assert.equal(report.records[0].code, 'transaction_failed'); assert.equal(report.appliedCells, 0)
  assert.equal(f.attempts.length, 1); assert.equal(f.events.includes('persist'), false)
  assert.deepEqual(f.get(), before)
  await assert.rejects(f.runtime.transaction(false, async tx => {
    await f.runtime.lock(tx, identity); await f.runtime.read(tx, identity)
    await f.runtime.update(tx, identity, 'kh', { question: 'Must reject' }, 'draft')
  }), status(409))
})

test('only a successful owned response advances revision state, not a failed save timestamp', async () => {
  const f = await fixture()
  await f.runtime.transaction(false, async tx => {
    await f.runtime.lock(tx, identity); await f.runtime.read(tx, identity)
    f.failNext()
    await assert.rejects(f.runtime.update(tx, identity, 'kh', { question: 'Not saved' }, 'draft'), /synthetic persistence failure/)
    await f.runtime.update(tx, identity, 'kh', { question: 'KH saved' }, 'draft')
    await f.runtime.read(tx, identity)
    await f.runtime.update(tx, identity, 'cn', { answer: 'CN saved' }, 'draft')
  })
  assert.equal(f.attempts[0].revision, f.attempts[1].revision)
  const latest = f.get().history._faq_items_v.find(r => r.latest)!
  assert.equal(f.get().history._faq_items_v_locales.find(r => r._parent_id === latest.id && r._locale === 'cn')!.version_answer, 'CN saved')
})

test('a later SQL read cannot silently replace the revision carried from an owned write', async () => {
  const f = await fixture(), before = f.get()
  await assert.rejects(f.runtime.transaction(false, async tx => {
    await f.runtime.lock(tx, identity); await f.runtime.read(tx, identity)
    await f.runtime.update(tx, identity, 'kh', { question: 'KH not durable' }, 'draft')
    f.changeWorking(s => { s.history._faq_items_v.find(r => r.latest)!.version_updated_at = '2040-01-01T00:00:00Z' })
    await f.runtime.read(tx, identity)
    await f.runtime.update(tx, identity, 'cn', { answer: 'Must reject' }, 'draft')
  }), status(409))
  assert.deepEqual(f.get(), before)
})

test('finalization checks its validated current hash before any status-only write', async () => {
  const f = await fixture(), before = f.get()
  await assert.rejects(f.runtime.transaction(false, async tx => {
    await f.runtime.lock(tx, identity); await f.runtime.read(tx, identity)
    await f.runtime.update(tx, identity, 'kh', { question: 'KH not durable' }, 'publish')
    const current = await f.runtime.read(tx, identity)
    f.changeWorking(s => { s.parent.faq_items[0].order = 8 })
    await f.runtime.finalizePublish(tx, identity, hashJSON(current))
  }), /stale_state/)
  assert.equal(f.attempts.length, 1); assert.deepEqual(f.get(), before)
})

test('finalization cannot repair a stale carried token from its current-state read', async () => {
  const f = await fixture(), before = f.get()
  await assert.rejects(f.runtime.transaction(false, async tx => {
    await f.runtime.lock(tx, identity); await f.runtime.read(tx, identity)
    await f.runtime.update(tx, identity, 'kh', { question: 'KH not durable' }, 'publish')
    f.changeWorking(s => { s.history._faq_items_v.find(r => r.latest)!.version_updated_at = '2040-01-01T00:00:00Z' })
    const current = await f.runtime.read(tx, identity)
    await f.runtime.finalizePublish(tx, identity, hashJSON(current))
  }), status(409))
  assert.equal(f.attempts.length, 2); assert.deepEqual(f.get(), before)
})

test('successful finalization advances the revision for the next owned write', async () => {
  const f = await fixture()
  await f.runtime.transaction(false, async tx => {
    await f.runtime.lock(tx, identity); await f.runtime.read(tx, identity)
    await f.runtime.update(tx, identity, 'kh', { question: 'KH saved' }, 'publish')
    const current = await f.runtime.read(tx, identity)
    await f.runtime.finalizePublish(tx, identity, hashJSON(current))
    await f.runtime.update(tx, identity, 'cn', { answer: 'CN saved' }, 'draft')
  })
  assert.deepEqual(f.attempts.map(a => a.locale), ['kh', 'en', 'cn'])
  const latest = f.get().history._faq_items_v.find(r => r.latest)!
  assert.equal(f.get().history._faq_items_v_locales.find(r => r._parent_id === latest.id && r._locale === 'cn')!.version_answer, 'CN saved')
})

test('an edit lease appearing after a locale save rolls back all owned writes', async () => {
  const f = await fixture(), before = f.get()
  await assert.rejects(f.runtime.transaction(false, async tx => {
    await f.runtime.lock(tx, identity); await f.runtime.read(tx, identity)
    await f.runtime.update(tx, identity, 'kh', { question: 'KH not durable' }, 'publish')
    const current = await f.runtime.read(tx, identity)
    f.setLease(true)
    await f.runtime.finalizePublish(tx, identity, hashJSON(current))
  }), /editor_lease/)
  assert.equal(f.attempts.length, 1); assert.deepEqual(f.get(), before)
})

test('writes require a snapshot captured inside the same shared record lock', async () => {
  for (const lock of [false, true]) {
    const f = await fixture(), before = f.get()
    await assert.rejects(f.runtime.transaction(false, async tx => {
      if (lock) await f.runtime.lock(tx, identity)
      await f.runtime.update(tx, identity, 'kh', { question: 'Must reject' }, 'draft')
    }), /editorial_revision_unavailable/)
    assert.equal(f.attempts.length, 0); assert.deepEqual(f.get(), before)
  }
})

const postgresBin = '/opt/homebrew/opt/postgresql@18/bin'
test('isolated PG18 refresh uses native guarded writes, locale snapshots and transaction rollback', {
  skip: !existsSync(path.join(postgresBin, 'initdb')) || !existsSync(path.join(postgresBin, 'pg_ctl')) ? 'Local PostgreSQL 18 binaries unavailable' : false,
  timeout: 120000,
}, async t => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'refresh-editorial-pg-')), cluster = path.join(dir, 'cluster')
  const server = net.createServer()
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  const port = (server.address() as net.AddressInfo).port
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
  const command = (name: string, args: string[]) => execFileSync(path.join(postgresBin, name), args, {
    encoding: 'utf8', env: { PATH: process.env.PATH, HOME: dir, LC_ALL: 'C', NODE_ENV: 'test' },
  })
  let running = false, payload: Payload | undefined, pool: pg.Pool | undefined
  try {
    command('initdb', ['-D', cluster, '-U', 'refresh_fixture', '-A', 'trust', '--no-locale'])
    command('pg_ctl', ['-D', cluster, '-l', path.join(dir, 'postgres.log'), '-o', `-h 127.0.0.1 -p ${port} -k ${dir}`, '-w', 'start'])
    running = true
    const connection = { host: '127.0.0.1', port, user: 'refresh_fixture', database: 'postgres', max: 8,
      options: '-c lock_timeout=10000 -c statement_timeout=15000' }
    pool = new pg.Pool(connection)
    assert.match((await pool.query('SHOW server_version')).rows[0].server_version, /^18\./)
    assert.equal((await pool.query("SELECT count(*)::int n FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'")).rows[0].n, 0)
    payload = await getPayload({ key: randomUUID(), disableDBConnect: true, disableOnInit: true, cron: false, config: buildConfig({
      secret: 'isolated-native-refresh-revision-only', telemetry: false,
      typescript: { autoGenerate: false }, admin: { importMap: { autoGenerate: false } },
      db: postgresAdapter({ pool: connection, push: true, disableCreateDatabase: true }),
      localization: { locales: ['en', 'kh', 'cn'], defaultLocale: 'en', fallback: false },
      collections: [
        { slug: 'users', auth: { disableLocalStrategy: true }, fields: [] },
        { slug: 'tenants', fields: [{ name: 'slug', type: 'text' }] },
        withEditorialConcurrency(withDrafts({ slug: 'faq-items', access: {
          read: ({ req }) => Boolean(req.user), update: ({ req }) => Boolean(req.user),
        }, fields: [
          { name: 'tenant', type: 'relationship', relationTo: 'tenants', required: true },
          { name: 'sourceId', type: 'text', required: true }, { name: 'order', type: 'number' },
          { name: 'question', type: 'text', localized: true }, { name: 'answer', type: 'text', localized: true },
        ] })),
      ],
    }) })
    const cms = payload, db = cms.db as unknown as PostgresAdapter
    // Supplying the owned pool avoids the adapter's retained reconnect client.
    db.pool = pool
    await db.connect!()
    const tenant = await cms.create({ collection: 'tenants', data: { slug: 'roomchang' } as never })
    const actor = { ...await cms.create({ collection: 'users', data: { email: 'refresh-fixture@example.invalid' } as never }), collection: 'users' } as PayloadRequest['user']
    const policy = { localizedFields: ['question', 'answer'], maxVersions: 100, canPublish: true }
    const runtime = await createRefreshRuntime({ pool, payload: cms, actor, tenantId: String(tenant.id), tenantSlug: 'roomchang',
      destination: { host: '127.0.0.1', port, database: 'postgres', schema: 'public' },
      policies: { 'faq-items': policy, 'career-positions': { ...policy, localizedFields: ['description'] } } })
    const read = (id: string, locale: 'en' | 'kh' | 'cn' = 'en') => cms.findByID({ collection: 'faq-items', id, locale,
      fallbackLocale: false, draft: true, depth: 0, user: actor, overrideAccess: false }) as Promise<any>
    const seed = async (index: number) => {
      const sourceId = APPROVED_IDENTITIES['faq-items'][index]
      const doc = await cms.create({ collection: 'faq-items', locale: 'en', user: actor,
        data: { sourceId, tenant: tenant.id, order: 7, question: 'EN preserved', answer: 'Borin published', _status: 'published' } as never })
      const id = String(doc.id), current = await read(id)
      const draft = await cms.update({ collection: 'faq-items', id, locale: 'en', draft: true, user: actor, overrideAccess: false,
        data: { answer: 'Borin historical draft', _status: 'draft', _editorialRevision: current._editorialRevision } as never }) as any
      await cms.update({ collection: 'faq-items', id, locale: 'en', user: actor, overrideAccess: false, publishAllLocales: true,
        data: { _status: 'published', _editorialRevision: draft._editorialRevision } as never })
      const record = { ...identity, id, sourceId, tenantId: String(tenant.id) }
      const source = JSON.parse(bytes.toString())
      source.tables.faq_items = [{ id: sourceId }]
      for (const tr of source.tables.content_translations) tr.entity_id = sourceId
      return { record, source }
    }
    const state = (record: typeof identity) => runtime.transaction(true, tx => runtime.read(tx, record))

    await t.test('one-locale publication normalizes SQL JSON stamps and retains the native draft snapshot', async () => {
      const { record, source } = await seed(0)
      source.tables.content_translations = source.tables.content_translations.slice(0, 1)
      const input = Buffer.from(JSON.stringify(source)), before = await state(record)
      const sqlStamp = before.history._faq_items_v.find(r => r.latest)!.version_updated_at
      const apiStamp = (await read(record.id)).updatedAt
      assert.notEqual(sqlStamp, apiStamp, 'Native SQL JSON and Payload expose different timestamp representations')
      assert.equal(new Date(sqlStamp).toISOString(), apiStamp)
      const { manifest } = await planRefresh(input, runtime), report = await applyRefresh(input, manifest, runtime)
      assert.equal(report.records[0].code, 'published', JSON.stringify(report)); assert.equal(report.appliedCells, 1)
      const after = await state(record), roots = after.history._faq_items_v, latest = roots.find(r => r.latest)!
      assert.equal(roots.length, before.history._faq_items_v.length + 3)
      assert.equal(latest.version__status, 'published'); assert.notEqual(latest.snapshot, true)
      assert.equal(roots.filter(r => r.snapshot === true && r.version__status === 'draft' && !r.latest).length, 1)
      assert.equal((await read(record.id, 'kh')).question, 'KH refreshed')
      assert.equal((await read(record.id, 'en')).answer, 'Borin historical draft')
      for (const old of before.history._faq_items_v) assert.deepEqual(roots.find(r => r.id === old.id), { ...old, latest: false })
      for (const old of before.history._faq_items_v_locales) assert.deepEqual(after.history._faq_items_v_locales.find(r => r.id === old.id), old)
    })

    await t.test('two draft locales advance owned revisions while leaving the native parent unchanged', async () => {
      const { record, source } = await seed(1), input = Buffer.from(JSON.stringify(source)), before = await state(record)
      const { manifest } = await planRefresh(input, runtime, 'draft'), report = await applyRefresh(input, manifest, runtime)
      assert.equal(report.records[0].code, 'staged_not_visible', JSON.stringify(report)); assert.equal(report.appliedCells, 2)
      const after = await state(record)
      assert.deepEqual(after.parent, before.parent)
      assert.equal(after.history._faq_items_v.length, before.history._faq_items_v.length + 2)
      assert.equal((await read(record.id, 'kh')).question, 'KH refreshed'); assert.equal((await read(record.id, 'cn')).answer, 'CN refreshed')
    })

    await t.test('two locale publications carry both native snapshot stamps into finalization', async () => {
      const { record, source } = await seed(4), input = Buffer.from(JSON.stringify(source)), before = await state(record)
      const { manifest } = await planRefresh(input, runtime), report = await applyRefresh(input, manifest, runtime)
      assert.equal(report.records[0].code, 'published', JSON.stringify(report)); assert.equal(report.appliedCells, 2)
      const after = await state(record), roots = after.history._faq_items_v, latest = roots.find(r => r.latest)!
      assert.equal(roots.length, before.history._faq_items_v.length + 5)
      assert.equal(latest.version__status, 'published'); assert.notEqual(latest.snapshot, true)
      assert.equal(roots.filter(r => r.snapshot === true && r.version__status === 'draft' && !r.latest).length, 2)
      assert.equal(after.parent.faq_items_locales.find(r => r._locale === 'kh')!.question, 'KH refreshed')
      assert.equal(after.parent.faq_items_locales.find(r => r._locale === 'cn')!.answer, 'CN refreshed')
      const logicalLocale = (row: Row) => Object.fromEntries(Object.entries(row).filter(([key]) => key !== 'id'))
      assert.deepEqual(logicalLocale(after.parent.faq_items_locales.find(r => r._locale === 'en')!),
        logicalLocale(before.parent.faq_items_locales.find(r => r._locale === 'en')!))
    })

    await t.test('a stale manifest rolls back without changing Borin newer native draft', async () => {
      const { record, source } = await seed(2), input = Buffer.from(JSON.stringify(source)), { manifest } = await planRefresh(input, runtime)
      const current = await read(record.id)
      await cms.update({ collection: 'faq-items', id: record.id, locale: 'en', draft: true, user: actor, overrideAccess: false,
        data: { answer: 'Borin newer draft', _status: 'draft', _editorialRevision: current._editorialRevision } as never })
      const before = await state(record), report = await applyRefresh(input, manifest, runtime)
      assert.equal(report.records[0].code, 'stale_state'); assert.equal(report.appliedCells, 0)
      assert.deepEqual(await state(record), before); assert.equal((await read(record.id)).answer, 'Borin newer draft')
    })

    await t.test('a real stale-token 409 after the first native locale write rolls the whole transaction back', async () => {
      const { record, source } = await seed(3), input = Buffer.from(JSON.stringify(source)), { manifest } = await planRefresh(input, runtime)
      const before = await state(record), stale = await read(record.id, 'cn')
      let rejectedStatus: number | undefined
      const report = await applyRefresh(input, manifest, { ...runtime, update: async (...args) => {
        await runtime.update(...args)
        const req = (args[0] as { req: PayloadRequest }).req
        const writeReq = Object.assign(Object.create(req), req, { context: { ...req.context }, locale: 'cn' })
        try {
          await cms.update({ collection: 'faq-items', id: record.id, locale: 'cn', req: writeReq, draft: true,
            user: actor, overrideAccess: false, overrideLock: false,
            data: { answer: 'Stale editor text', _status: 'draft', _editorialRevision: stale._editorialRevision } as never })
        } catch (error: any) { rejectedStatus = error.status; throw error }
      } })
      assert.equal(rejectedStatus, 409); assert.equal(report.appliedCells, 0); assert.equal(report.records[0].code, 'transaction_failed')
      assert.deepEqual(await state(record), before)
    })
  } finally {
    try { if (payload) await payload.destroy() }
    finally {
      try { if (pool && !pool.ended) await pool.end() }
      finally {
        try { if (running) command('pg_ctl', ['-D', cluster, '-m', 'immediate', '-w', 'stop']) }
        finally { await rm(dir, { recursive: true, force: true }) }
      }
    }
  }
})
