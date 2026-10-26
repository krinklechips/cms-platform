import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import pg from 'pg'
import { postgresAdapter, type PostgresAdapter } from '@payloadcms/db-postgres'
import { drizzle } from '@payloadcms/db-postgres/drizzle/node-postgres'
import { createLocalReq, getPayload, type Payload } from 'payload'
import { loadPayloadConfig } from './helpers/load-payload-config'
import { migrations } from '../src/migrations'

const binaries = '/opt/homebrew/opt/postgresql@18/bin'
const name = '20261026_032357'
test('detail URL migration, rollback, concurrent reservations and locale restore preserve existing PostgreSQL rows', {
  timeout: 120000, skip: existsSync(`${binaries}/initdb`) ? false : 'Local PostgreSQL unavailable',
}, async t => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cms-detail-pg-'))
  const cluster = path.join(dir, 'cluster')
  const socket = net.createServer()
  await new Promise<void>(resolve => socket.listen(0, '127.0.0.1', resolve))
  const port = (socket.address() as net.AddressInfo).port
  await new Promise<void>(resolve => socket.close(() => resolve()))
  const command = (name: string, args: string[]) => execFileSync(`${binaries}/${name}`, args, {
    encoding: 'utf8', env: { PATH: process.env.PATH, HOME: dir, LC_ALL: 'C', NODE_ENV: 'test' },
  })
  let running = false
  let client: pg.Client | undefined
  let cms: Payload | undefined
  let pool: pg.Pool | undefined
  try {
    command('initdb', ['-D', cluster, '-U', 'detail_fixture', '-A', 'trust', '--no-locale'])
    command('pg_ctl', ['-D', cluster, '-l', path.join(dir, 'postgres.log'), '-o', `-h 127.0.0.1 -p ${port} -k ${dir}`, '-w', 'start'])
    running = true
    const uri = `postgres://detail_fixture@127.0.0.1:${port}/postgres`
    client = new pg.Client({ connectionString: uri }); await client.connect()
    const args = { db: drizzle(client) } as never
    for (const migration of migrations.filter(m => m.name < name)) await migration.up(args)
    const migration = migrations.find(m => m.name === name)!
    assert.ok(migration)
    const tenant = (await client.query("INSERT INTO tenants(name,slug) VALUES ('Fixture','fixture') RETURNING id")).rows[0].id
    const other = (await client.query("INSERT INTO tenants(name,slug) VALUES ('Other','other') RETURNING id")).rows[0].id
    for (const collection of ['services', 'technology']) {
      const id = (await client.query(`INSERT INTO ${collection}(tenant_id,slug,_status) VALUES ($1,'borin-preserved','published') RETURNING id`, [tenant])).rows[0].id
      const version = (await client.query(`INSERT INTO _${collection}_v(parent_id,version_tenant_id,version_slug,version__status,latest) VALUES ($1,$2,'borin-preserved','draft',true) RETURNING id`, [id, tenant])).rows[0].id
      for (const locale of ['en', 'kh', 'cn']) {
        await client.query(`INSERT INTO ${collection}_locales(_parent_id,_locale,name) VALUES ($1,$2,$3)`, [id, locale, `${locale} published`])
        await client.query(`INSERT INTO _${collection}_v_locales(_parent_id,_locale,version_name) VALUES ($1,$2,$3)`, [version, locale, `${locale} Borin private draft`])
      }
    }
    const snapshot = async () => {
      const result: Record<string, unknown> = {}
      for (const { tablename } of (await client!.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename")).rows) {
        result[tablename] = (await client!.query(`SELECT to_jsonb(t) AS row FROM "${tablename.replaceAll('"', '""')}" t ORDER BY id`)).rows
      }
      return result
    }
    const apply = async (direction: 'up' | 'down') => {
      await client!.query('BEGIN')
      try { await migration[direction](args); await client!.query('COMMIT') }
      catch (error) { await client!.query('ROLLBACK'); throw error }
    }
    for (const collection of ['services', 'technology']) {
      const duplicate = (await client.query(`INSERT INTO ${collection}(tenant_id,slug,_status) VALUES ($1,'borin-preserved','draft') RETURNING id`, [tenant])).rows[0].id
      const before = await snapshot()
      await assert.rejects(() => apply('up'), /duplicate.*tenant\+slug/i)
      assert.deepEqual(await snapshot(), before)
      await client.query(`DELETE FROM ${collection} WHERE id=$1`, [duplicate])
      const parent = (await client.query(`INSERT INTO ${collection}(tenant_id,slug,_status) VALUES ($1,'different-address','published') RETURNING id`, [tenant])).rows[0].id
      const draft = (await client.query(`INSERT INTO _${collection}_v(parent_id,version_tenant_id,version_slug,latest) VALUES ($1,$2,'borin-preserved',true) RETURNING id`, [parent, tenant])).rows[0].id
      const beforeDraft = await snapshot()
      await assert.rejects(() => apply('up'), /duplicate.*tenant\+slug/i)
      assert.deepEqual(await snapshot(), beforeDraft)
      await client.query(`DELETE FROM _${collection}_v WHERE id=$1`, [draft])
      await client.query(`DELETE FROM ${collection} WHERE id=$1`, [parent])
    }
    const retained = await snapshot()
    await apply('up'); assert.deepEqual(await snapshot(), retained)
    await apply('down'); assert.deepEqual(await snapshot(), retained)
    await apply('up'); assert.deepEqual(await snapshot(), retained)
    const previous = JSON.parse(readFileSync(new URL('../src/migrations/20261023_040000_homepage_captions.json', import.meta.url), 'utf8'))
    const current = JSON.parse(readFileSync(new URL(`../src/migrations/${name}.json`, import.meta.url), 'utf8'))
    assert.equal(current.prevId, previous.id)
    for (const [table, index] of [['services', 'tenant_slug_1_idx'], ['_services_v', 'version_tenant_version_slug_1_idx'],
      ['technology', 'tenant_slug_2_idx'], ['_technology_v', 'version_tenant_version_slug_2_idx']]) {
      assert.ok(current.tables[`public.${table}`].indexes[index]); delete current.tables[`public.${table}`].indexes[index]
    }
    assert.deepEqual({ ...current, id: previous.id, prevId: previous.prevId }, previous)
    const config = await loadPayloadConfig()
    cms = await getPayload({ key: randomUUID(), config: { ...config, secret: 'isolated-detail-postgres-only', telemetry: false,
      db: postgresAdapter({ pool: {}, push: false }) as typeof config.db, typescript: { ...config.typescript, autoGenerate: false } },
      disableDBConnect: true, disableOnInit: true, cron: false })
    pool = new pg.Pool({ connectionString: uri, max: 10 })
    const db = cms.db as unknown as PostgresAdapter
    db.pool = pool; db.drizzle = drizzle({ client: pool, schema: db.schema }); db.resolveInitializing?.()
    const payload = cms
    const user = { ...await payload.create({ collection: 'users', data: { email: 'detail-pg@example.invalid',
      password: 'isolated-detail-pg-password-1234', roles: ['super-admin'] } as never }), collection: 'users' as const }
    for (const collection of ['services', 'technology'] as const) await t.test(`${collection} concurrent create, draft reservation and restore`, async () => {
      const create = (slug: string, draft = false, owner = tenant) => payload.create({ collection, user, draft,
        data: { tenant: owner, slug, name: 'EN published', _status: draft ? 'draft' : 'published' } as never })
      const raced = await Promise.allSettled([create('raced-address'), create('raced-address', true)])
      assert.equal(raced.filter(result => result.status === 'fulfilled').length, 1)
      await create('raced-address', false, other)
      await assert.rejects(() => payload.create({ collection, disableTransaction: true, user,
        data: { tenant, slug: 'no-transaction', name: 'No transaction' } as never }), /active PostgreSQL transaction/)
      const record = await create('historical-address')
      const history = await payload.findVersions({ collection, where: { parent: { equals: record.id } }, limit: 1 })
      const write = async (locale: 'en' | 'kh' | 'cn', data: Record<string, unknown>, draft = true) => {
        const opened = await payload.findByID({ collection, id: record.id, locale, draft: true, user })
        await payload.update({ collection, id: record.id, user, locale, draft, publishSpecificLocale: locale,
          data: { ...data, _status: draft ? 'draft' : 'published', _editorialRevision: (opened as unknown as { _editorialRevision: string })._editorialRevision } as never })
      }
      for (const locale of ['kh', 'cn'] as const) await write(locale, { name: `${locale} published` }, false)
      for (const locale of ['en', 'kh', 'cn'] as const) await write(locale, { name: `${locale} Borin private draft` })
      await write('en', { slug: 'current-private-address' })
      await assert.rejects(() => create('current-private-address'), /slug/i)
      const req = await createLocalReq({ locale: 'kh', user }, payload)
      req.query = { ...req.query, locale: 'kh' }
      const opened = await payload.findByID({ collection, id: record.id, locale: 'kh', draft: true, user })
      req.headers.set('if-match', (opened as unknown as { _editorialRevision: string })._editorialRevision)
      await payload.restoreVersion({ collection, id: history.docs[0].id, req, locale: 'kh', user })
      assert.equal((await payload.findByID({ collection, id: record.id, draft: true })).slug, 'current-private-address')
      for (const locale of ['en', 'cn'] as const) assert.equal((await payload.findByID({ collection, id: record.id, locale, draft: true })).name, `${locale} Borin private draft`)
      for (const locale of ['en', 'kh', 'cn'] as const) assert.equal((await payload.findByID({ collection, id: record.id, locale })).name, locale === 'en' ? 'EN published' : `${locale} published`)
      await assert.rejects(() => payload.db.create({ collection, data: { tenant, slug: 'raced-address' } }))
    })
    const after = await snapshot()
    for (const table of Object.keys(retained)) {
      const rows = retained[table] as { row: { id: number } }[]
      const ids = new Set(rows.map(entry => entry.row.id))
      assert.deepEqual((after[table] as { row: { id: number } }[]).filter(entry => ids.has(entry.row.id)), rows, `Existing ${table} rows changed`)
    }
    t.diagnostic(`Index up/down/up and native races/restores preserved all ${Object.keys(retained).length} predecessor tables`)
  } finally {
    if (cms) await cms.destroy()
    if (pool) await pool.end()
    if (client) await client.end()
    if (running) command('pg_ctl', ['-D', cluster, '-m', 'immediate', '-w', 'stop'])
    await rm(dir, { recursive: true, force: true })
  }
})
