import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { setTimeout as delay } from 'node:timers/promises'
import { postgresAdapter, type PostgresAdapter } from '@payloadcms/db-postgres'
import pg from 'pg'
import { buildConfig, getPayload, type Access, type Payload, type PayloadRequest } from 'payload'
import { withDrafts } from '../src/lib/with-drafts'

const fixtureURL = 'postgres://cms_fixture@127.0.0.1:55439/cms_preservation_fixture'
if (process.env.DATABASE_URI !== fixtureURL || process.env.NODE_ENV === 'production') {
  throw new Error(`Requires the dedicated non-production DATABASE_URI=${fixtureURL}`)
}
// No app config, env-file loading, existing schema, migrations or type generation.
const schema = `preservation_${randomUUID().replaceAll('-', '')}`
const observer = new pg.Pool({ connectionString: fixtureURL, max: 2 })
const checkedOut = new Set<pg.PoolClient>()
const fixturePools = new Set<pg.Pool>()
class FixturePool extends pg.Pool {
  constructor(options?: pg.PoolConfig) {
    super(options)
    fixturePools.add(this)
    this.on('acquire', (client) => checkedOut.add(client))
    this.on('release', (_error, client) => checkedOut.delete(client))
  }
}
const deferred = () => {
  let resolve!: () => void
  const promise = new Promise<void>((done) => { resolve = done })
  return { promise, resolve }
}
type Doc = Record<string, any>
type Gate = {
  firstEntered: ReturnType<typeof deferred>
  secondEntered: ReturnType<typeof deferred>
  release: ReturnType<typeof deferred>
  secondOperationEntered: boolean
}
let gate: Gate | undefined
let payload: Payload | undefined
let schemaCreated = false
const tenantAccess: Access = ({ req }) => req.user
  ? { tenant: { equals: (req.user as unknown as Doc).tenant } } : false
const bounded = async <T>(promise: Promise<T>, label: string): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([promise, new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Timed out: ${label}`)), 10_000)
    })])
  } finally { clearTimeout(timer) }
}

try {
  // The identifier is generated here, never supplied externally. Only this new schema is pushed/dropped.
  await observer.query(`CREATE SCHEMA "${schema}"`)
  schemaCreated = true
  payload = await getPayload({ key: schema, config: buildConfig({
    secret: 'isolated-editorial-concurrency-fixture-only',
    typescript: { autoGenerate: false },
    db: postgresAdapter({ schemaName: schema, push: true, disableCreateDatabase: true,
      pg: { ...pg, Pool: FixturePool },
      pool: { connectionString: fixtureURL, application_name: schema, max: 8,
        options: '-c statement_timeout=15000 -c lock_timeout=10000' } }),
    localization: { locales: ['en', 'kh', 'cn'], defaultLocale: 'en', fallback: false },
    collections: [
      { slug: 'users', auth: true, fields: [{ name: 'tenant', type: 'text' }] },
      withDrafts({ slug: 'pages', access: {
        create: ({ req }) => Boolean(req.user), read: tenantAccess, update: tenantAccess,
        readVersions: ({ req }) => req.user
          ? { 'version.tenant': { equals: (req.user as unknown as Doc).tenant } } : false,
      }, fields: [
        { name: 'tenant', type: 'text', required: true },
        { name: 'title', type: 'text', localized: true },
        { name: 'price', type: 'number' },
        { name: 'rows', type: 'array', fields: [
          { name: 'label', type: 'text', localized: true }, { name: 'price', type: 'number' },
        ] },
        { name: 'sections', type: 'blocks', localized: true, blocks: [
          { slug: 'text', fields: [{ name: 'text', type: 'text' }] },
        ] },
      ], hooks: {
        beforeOperation: [({ operation, req }) => {
          if (gate && operation === 'update' && req.context.fixtureTag === 'second') {
            gate.secondOperationEntered = true
          }
        }],
        beforeChange: [async ({ req, data }) => {
          if (req.context.fixtureFail) throw new Error('Intentional fixture rollback')
          const active = gate
          if (!active) return data
          if (req.context.fixtureTag === 'first') {
            active.firstEntered.resolve()
            await active.release.promise
          } else if (req.context.fixtureTag === 'second') active.secondEntered.resolve()
          return data
        }],
      } }),
    ],
  }) })
  const cms = payload
  const editor = await cms.create({ collection: 'users', data: {
    email: 'concurrency@example.test', password: 'Fixture-only-password-2026', tenant: 'clinic-a',
  } as never })
  const user = { ...editor, collection: 'users' } as PayloadRequest['user']
  const rowID = 'aaaaaaaaaaaaaaaaaaaaaaaa'
  const content = (locale: string, phase: string) => ({
    title: `${locale}-${phase}`, rows: [{ id: rowID, label: `${locale}-${phase}`, price: 20 }],
    sections: [{ blockType: 'text', text: `${locale}-${phase}` }],
  })
  const page = await cms.create({ collection: 'pages', locale: 'en', overrideAccess: false, user,
    data: { tenant: 'clinic-a', price: 10, ...content('en', 'old'), _status: 'published' } as never })
  const write = (locale: 'en' | 'kh' | 'cn', phase: string, draft: boolean, tag?: string) => cms.update({
    collection: 'pages', id: tag === 'second' ? `0${page.id}` : page.id, locale, draft, overrideAccess: false, user,
    ...(draft ? {} : { publishSpecificLocale: locale }),
    context: tag ? { fixtureTag: tag } : {},
    data: { ...content(locale, phase), ...(draft ? {} : { _status: 'published' }) } as never,
  })
  const read = async (draft = false): Promise<Doc> => cms.findByID({ collection: 'pages', id: page.id,
    draft, locale: 'all', fallbackLocale: false, depth: 0, user, overrideAccess: false })
  for (const locale of ['kh', 'cn'] as const) await write(locale, 'old', false)
  const historical = (await cms.findVersions({ collection: 'pages', locale: 'all', user,
    overrideAccess: false, where: { parent: { equals: page.id } }, sort: '-updatedAt', limit: 1 })).docs[0]
  for (const locale of ['en', 'kh', 'cn'] as const) await write(locale, 'pending', true)

  const overlap = async (first: () => Promise<unknown>, second: () => Promise<unknown>, secondIsUpdate: boolean) => {
    const active: Gate = { firstEntered: deferred(), secondEntered: deferred(), release: deferred(),
      secondOperationEntered: false }
    gate = active
    const writes: Promise<unknown>[] = []
    let observing = true
    try {
      const firstWrite = first()
      writes.push(firstWrite)
      void firstWrite.catch(() => undefined)
      await bounded(active.firstEntered.promise, 'first writer reaches beforeChange')
      const secondWrite = second()
      writes.push(secondWrite)
      void secondWrite.catch(() => undefined)
      // Observe an actual blocked advisory lock, not an elapsed-time guess.
      const waiting = async () => {
        while (observing) {
          const result = await observer.query(`SELECT 1 FROM pg_locks l JOIN pg_stat_activity a
            ON a.pid = l.pid WHERE a.application_name = $1 AND l.locktype = 'advisory' AND NOT l.granted`, [schema])
          if (result.rowCount) return true
          if (await Promise.race([active.secondEntered.promise.then(() => true), delay(10).then(() => false)])) return false
        }
        return false
      }
      const serialized = await bounded(waiting(), 'second writer waits for record lock')
      assert.equal(serialized, true, 'Second writer must block before reading a stale editorial snapshot')
      if (secondIsUpdate) assert.equal(active.secondOperationEntered, false,
        'Serialization must run before existing beforeOperation hooks')
    } finally {
      observing = false
      active.release.resolve()
      const results = await bounded(Promise.allSettled(writes), 'writers complete after lock release')
      gate = undefined
      for (const result of results) if (result.status === 'rejected') throw result.reason
    }
  }

  await overlap(() => write('en', 'published-concurrently', false, 'first'),
    () => write('cn', 'published-concurrently', false, 'second'), true)
  const published = await read()
  assert.equal(published.title.en, 'en-published-concurrently')
  assert.equal(published.title.cn, 'cn-published-concurrently')
  assert.equal(published.title.kh, 'kh-old')
  for (const locale of ['en', 'cn'] as const) {
    assert.equal(published.rows[0].label[locale], `${locale}-published-concurrently`)
    assert.equal(published.sections[locale][0].text, `${locale}-published-concurrently`)
  }
  assert.equal((await read(true)).title.kh, 'kh-pending')

  const restore = (tag: string) => cms.restoreVersion({ collection: 'pages', id: String(historical.id),
    locale: 'cn', user, overrideAccess: false, req: { query: { locale: 'cn' } }, context: { fixtureTag: tag } })
  const beforeRestore = (await cms.findVersions({ collection: 'pages', user, overrideAccess: false,
    where: { parent: { equals: page.id } }, pagination: false })).totalDocs
  await overlap(() => write('kh', 'saved-before-restore', true, 'first'), () => restore('second'), false)
  let pending = await read(true)
  assert.equal(pending.title.kh, 'kh-saved-before-restore', 'Restore must snapshot after the earlier writer commits')
  assert.equal(pending.title.cn, 'cn-old')
  assert.equal(pending.rows[0].label.kh, 'kh-saved-before-restore')
  assert.equal(pending.rows[0].label.cn, 'cn-old')
  assert.equal(pending._status, 'draft')
  assert.deepEqual(await read(), published)
  assert.equal((await cms.findVersions({ collection: 'pages', user, overrideAccess: false,
    where: { parent: { equals: page.id } }, pagination: false })).totalDocs, beforeRestore + 2)

  await overlap(() => restore('first'), () => write('kh', 'saved-after-restore', true, 'second'), true)
  pending = await read(true)
  assert.equal(pending.title.cn, 'cn-old', 'The following writer must preserve the completed restore')
  assert.equal(pending.title.kh, 'kh-saved-after-restore')
  assert.deepEqual(await read(), published)
  assert.equal(pending.price, 10)
  assert.equal(pending.rows[0].id, rowID)
  assert.equal(pending.rows[0].price, 20)

  await assert.rejects(cms.update({ collection: 'pages', id: page.id, user, overrideAccess: false,
    locale: 'kh', draft: true, disableTransaction: true, data: { title: 'unsafe-no-transaction' } }),
  /active PostgreSQL transaction session/)
  await assert.rejects(cms.update({ collection: 'pages', user, overrideAccess: false, locale: 'kh',
    draft: true, where: { id: { equals: page.id } }, data: { title: 'unsafe-bulk' } }), /single document ID/)
  await assert.rejects(cms.update({ collection: 'pages', id: page.id, user, overrideAccess: false,
    locale: 'kh', draft: true, context: { fixtureFail: true }, data: { title: 'must-roll-back' } }),
  /Intentional fixture rollback/)
  assert.deepEqual(await read(true), pending, 'Refused/rolled-back writes cannot change pending work')
  await bounded(cms.update({ collection: 'pages', id: page.id, user, overrideAccess: false,
    locale: 'kh', draft: true, data: { title: pending.title.kh } }), 'record lock is released on rollback')
  const adapter = cms.db as unknown as PostgresAdapter
  assert.equal(Object.keys(adapter.sessions).length, 0, 'No leaked transactions')
  console.log('PASS: real PG concurrent EN/CN publishes preserve both; equivalent numeric IDs serialize; update/restore serialize in both orders; rollback releases locks; missing transactions and bulk writes fail closed')
} finally {
  gate?.release.resolve()
  try {
    if (payload) await payload.destroy()
  } finally {
    // Payload's PG adapter retains a startup checkout and destroy() does not close its pool.
    for (const client of checkedOut) client.release(true)
    await Promise.all([...fixturePools].map((pool) => pool.end()))
    try {
      if (schemaCreated) await observer.query(`DROP SCHEMA "${schema}" CASCADE`)
    } finally {
      await observer.end()
    }
  }
}
