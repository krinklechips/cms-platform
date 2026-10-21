import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { setTimeout as delay } from 'node:timers/promises'
import { postgresAdapter, type PostgresAdapter } from '@payloadcms/db-postgres'
import pg from 'pg'
import { buildConfig, getPayload, type Payload, type PayloadRequest } from 'payload'
import { EditorialAudit } from '../src/collections/EditorialAudit'
import { withEditorialAudit } from '../src/lib/editorial-audit'
import { withDrafts } from '../src/lib/with-drafts'
import { withEditorialConcurrency } from '../src/lib/with-editorial-concurrency'

const fixtureURL = 'postgres://cms_fixture@127.0.0.1:55439/cms_preservation_fixture'
if (process.env.DATABASE_URI !== fixtureURL || process.env.NODE_ENV === 'production') throw new Error('Dedicated audit-protection fixture database required')
const schema = `audit_protection_${randomUUID().replaceAll('-', '')}`
const observer = new pg.Pool({ connectionString: fixtureURL })
const pools = new Set<pg.Pool>()
const clients = new Set<pg.PoolClient>()
class FixturePool extends pg.Pool {
  constructor(options?: pg.PoolConfig) {
    super(options); pools.add(this)
    this.on('acquire', client => clients.add(client))
    this.on('release', (_error, client) => clients.delete(client))
  }
}
const deferred = () => {
  let resolve!: () => void
  const promise = new Promise<void>(done => { resolve = done })
  return { promise, resolve }
}
const bounded = async <T>(promise: Promise<T>, label: string): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined
  try { return await Promise.race([promise, new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timed out: ${label}`)), 15000)
  })]) } finally { clearTimeout(timer) }
}
type Doc = Record<string, any>
let payload: Payload | undefined
let schemaCreated = false
let gate: { entered: ReturnType<typeof deferred>; release: ReturnType<typeof deferred> } | undefined
try {
  await observer.query(`CREATE SCHEMA "${schema}"`); schemaCreated = true
  payload = await getPayload({ key: schema, config: buildConfig({
    secret: 'isolated-audit-protection-fixture-only', telemetry: false, typescript: { autoGenerate: false },
    db: postgresAdapter({ schemaName: schema, push: true, disableCreateDatabase: true, pg: { ...pg, Pool: FixturePool },
      pool: { connectionString: fixtureURL, application_name: schema, max: 8, options: '-c statement_timeout=20000 -c lock_timeout=15000' } }),
    localization: { locales: ['en', 'kh', 'cn'], defaultLocale: 'en', fallback: false },
    collections: [
      { slug: 'tenants', fields: [{ name: 'name', type: 'text' }] },
      { slug: 'users', auth: true, fields: [{ name: 'name', type: 'text' },
        { name: 'roles', type: 'select', hasMany: true, options: ['super-admin', 'editor'] },
        { name: 'tenants', type: 'array', fields: [{ name: 'tenant', type: 'relationship', relationTo: 'tenants' }] }] },
      withEditorialAudit(withEditorialConcurrency(withDrafts({ slug: 'pages',
        admin: { useAsTitle: 'title' },
        access: { read: ({ req }) => Boolean(req.user), update: ({ req }) => Boolean(req.user) },
        fields: [{ name: 'tenant', type: 'relationship', relationTo: 'tenants', required: true },
          { name: 'title', type: 'text', localized: true }],
        hooks: { beforeChange: [async ({ data, req }) => {
          if (gate && req.context.holdWriter) { gate.entered.resolve(); await gate.release.promise }
          return data
        }] },
      }))),
      { ...EditorialAudit, hooks: { ...EditorialAudit.hooks, beforeChange: [
        ...(EditorialAudit.hooks?.beforeChange ?? []), ({ data, req }) => {
          if (req.context.rejectAudit) throw new Error('Intentional audit-insert failure')
          return data
        },
      ] } },
    ],
  }) })
  const cms = payload
  const tenant = await cms.create({ collection: 'tenants', data: { name: 'Disposable' } as never })
  const makeUser = async (name: string) => ({ ...await cms.create({ collection: 'users', data: {
    name, email: `${name}@fixture.invalid`, password: 'disposable-password-2026', roles: ['editor'], tenants: [{ tenant: tenant.id }],
  } as never }), collection: 'users' }) as NonNullable<PayloadRequest['user']>
  const owner = await makeUser('owner')
  const borin = await makeUser('borin')
  const page = await cms.create({ collection: 'pages', user: owner, overrideAccess: false, locale: 'en',
    data: { tenant: tenant.id, title: 'EN original', _status: 'published' } as never })
  const read = (locale: 'en' | 'kh' | 'cn', user = owner, draft = true) => cms.findByID({
    collection: 'pages', id: page.id, user, overrideAccess: false, draft, locale, fallbackLocale: false, depth: 0 }) as Promise<Doc>
  const write = (doc: Doc, locale: 'en' | 'kh' | 'cn', title: string, user = owner, draft = true, context = {}) => cms.update({
    collection: 'pages', id: doc.id, user, overrideAccess: false, locale, draft, context,
    data: { title, _editorialRevision: doc._editorialRevision, _status: draft ? 'draft' : 'published' } as never })
  const audit = async () => (await cms.find({ collection: 'editorial-audit', depth: 0, pagination: false, sort: 'id' })).docs
  const history = () => cms.findVersions({ collection: 'pages', locale: 'all', where: { parent: { equals: page.id } }, pagination: false })
  for (const locale of ['kh', 'cn'] as const) await write(await read(locale), locale, `${locale} original`, owner, false)
  for (const locale of ['en', 'kh', 'cn'] as const) {
    const initial = await read(locale, owner)
    assert.equal(initial._editorialRevision, (await read(locale, borin))._editorialRevision)
    await write(initial, locale, `${locale} pending`, borin)
    assert.equal((await read(locale, owner)).title, `${locale} pending`)
  }
  const opened = await read('en')
  const auditBefore = await audit()
  const historyBefore = await history()
  gate = { entered: deferred(), release: deferred() }
  const active = gate
  const first = write(opened, 'en', 'First editor wins', owner, true, { holdWriter: true })
  void first.catch(() => undefined)
  await bounded(active.entered.promise, 'first writer holding transaction')
  const second = write(opened, 'en', 'Stale editor must not overwrite', borin)
  void second.catch(() => undefined)
  try {
    await bounded((async () => {
      for (;;) {
        const blocked = await observer.query(`SELECT 1 FROM pg_locks l JOIN pg_stat_activity a ON a.pid=l.pid
          WHERE a.application_name=$1 AND l.locktype='advisory' AND NOT l.granted`, [schema])
        if (blocked.rowCount) break
        await delay(10)
      }
    })(), 'observe real blocked advisory lock')
  } finally { active.release.resolve() }
  const outcomes = await Promise.allSettled([first, second]); gate = undefined
  assert.equal(outcomes[0].status, 'fulfilled')
  assert.equal(outcomes[1].status, 'rejected')
  assert.equal((outcomes[1] as PromiseRejectedResult).reason.status, 409)
  assert.equal((await read('en')).title, 'First editor wins')
  assert.equal((await audit()).length, auditBefore.length + 1)
  assert.equal((await history()).docs.length, historyBefore.docs.length + 1)
  for (const locale of ['kh', 'cn'] as const) assert.equal((await read(locale)).title, `${locale} pending`)
  const beforeFailure = await read('cn')
  const auditsBeforeFailure = await audit()
  const versionsBeforeFailure = await history()
  await assert.rejects(() => write(beforeFailure, 'cn', 'Must roll back content and history', borin, true, { rejectAudit: true }), /Intentional audit-insert failure/)
  assert.deepEqual(await read('cn'), beforeFailure)
  assert.deepEqual(await history(), versionsBeforeFailure)
  assert.deepEqual(await audit(), auditsBeforeFailure)
  await write(await read('cn'), 'cn', 'CN published only', borin, false)
  assert.equal((await read('cn', owner, false)).title, 'CN published only')
  assert.equal((await read('en', owner, false)).title, 'EN original')
  assert.equal((await read('kh', owner, false)).title, 'kh original')
  assert.equal((await read('en')).title, 'First editor wins')
  const entry = (await audit()).at(-1)!
  assert.equal(entry.actorID, String(borin.id)); assert.equal(entry.action, 'publish'); assert.equal(entry.locale, 'cn')
  assert.equal(Object.keys((cms.db as unknown as PostgresAdapter).sessions).length, 0)
  console.log('PASS: two staff / three locales share snapshots; real PG overlap accepts one write and rejects stale writer; audit failure rolls content/history back atomically; CN publication retains EN/KH drafts and published text.')
} finally {
  gate?.release.resolve()
  try { if (payload) await payload.destroy() } finally {
    for (const client of clients) client.release(true)
    await Promise.all([...pools].map(pool => pool.end()))
    try { if (schemaCreated) await observer.query(`DROP SCHEMA "${schema}" CASCADE`) } finally { await observer.end() }
  }
}
