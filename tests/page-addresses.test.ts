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
import { getTableConfig } from '@payloadcms/db-postgres/drizzle/pg-core'
import { sqliteAdapter, type SQLiteAdapter } from '@payloadcms/db-sqlite'
import { buildConfig, createLocalReq, getPayload, type Payload } from 'payload'
import { Pages } from '../src/collections/Pages'
import { withDrafts } from '../src/lib/with-drafts'
import { migrations } from '../src/migrations'

const migrationName = '20261022_070000_page_addresses'
const fixtureConfig = (db: Parameters<typeof buildConfig>[0]['db']) => buildConfig({
  secret: 'page-address-disposable-fixture-only', telemetry: false, db,
  typescript: { autoGenerate: false }, admin: { importMap: { autoGenerate: false } },
  localization: { locales: ['en', 'kh', 'cn'], defaultLocale: 'en' },
  collections: [
    { slug: 'users', auth: true, fields: [] },
    { slug: 'tenants', fields: [{ name: 'name', type: 'text' }, { name: 'slug', type: 'text' }] },
    { slug: 'media', upload: { disableLocalStorage: true }, fields: [] },
    withDrafts({ ...Pages, fields: [...Pages.fields,
      { name: 'tenant', type: 'relationship', relationTo: 'tenants', required: true, index: true },
    ] }),
  ],
})
const createPage = (payload: Payload, tenant: number, data: Record<string, unknown> = {}, draft = false) =>
  payload.create({ collection: 'pages', locale: 'en', draft, data: { tenant, title: 'Patient Information', ...data } as never })

test('native SQLite rejects duplicate API addresses including drafts, but permits another tenant', { timeout: 120000 }, async t => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'page-address-sqlite-'))
  const payload = await getPayload({ key: randomUUID(), config: fixtureConfig(sqliteAdapter({
    client: { url: `file:${path.join(dir, 'fixture.db')}` }, transactionOptions: {},
  })), cron: false, disableOnInit: true })
  try {
    const tenant = (await payload.create({ collection: 'tenants', data: { name: 'Roomchang fixture', slug: 'roomchang' } })).id
    const other = (await payload.create({ collection: 'tenants', data: { name: 'Other fixture', slug: 'other' } })).id
    const first = await createPage(payload, tenant)
    const draft = await createPage(payload, tenant, {}, true)
    assert.equal(first.slug, 'patient-information')
    assert.equal(draft.slug, 'patient-information-2')
    assert.equal((await createPage(payload, other)).slug, 'patient-information')
    const before = await payload.findVersions({ collection: 'pages', pagination: false })
    for (const isDraft of [false, true]) {
      await assert.rejects(() => createPage(payload, tenant, { slug: first.slug }, isDraft))
      await assert.rejects(() => payload.update({ collection: 'pages', id: draft.id, draft: isDraft,
        data: { slug: first.slug } }))
    }
    assert.deepEqual(await payload.findVersions({ collection: 'pages', pagination: false }), before)
    const saved = await payload.update({ collection: 'pages', id: first.id, data: { title: 'A new heading' } })
    assert.equal(saved.slug, 'patient-information')

    await t.test('latest draft-only addresses reserve the address without rewriting the published address', async () => {
      await payload.update({ collection: 'pages', id: first.id, draft: true, data: { slug: 'reserved-draft' } })
      assert.equal((await payload.findByID({ collection: 'pages', id: first.id })).slug, 'patient-information')
      assert.equal((await createPage(payload, tenant, { title: 'Reserved Draft' })).slug, 'reserved-draft-2')
      await assert.rejects(() => createPage(payload, tenant, { slug: 'reserved-draft' }, true))
    })
    await t.test('allocation checks beyond the former fifty-candidate limit', async () => {
      for (let n = 1; n <= 51; n++) await payload.db.create({ collection: 'pages', data: {
        tenant, slug: n === 1 ? 'busy' : `busy-${n}`,
      } })
      assert.equal((await createPage(payload, tenant, { title: 'Busy' })).slug, 'busy-52')
    })
    await t.test('SQLite database constraint rejects native adapter bypasses', async () => {
      const db = payload.db as unknown as SQLiteAdapter
      const indexes = (await db.client.execute("PRAGMA index_list('pages')")).rows
      const unique = indexes.find(index => index.name === 'tenant_slug_idx')
      assert.equal(unique?.unique, 1)
      assert.deepEqual((await db.client.execute("PRAGMA index_info('tenant_slug_idx')")).rows.map(row => row.name), ['tenant_id', 'slug'])
      await assert.rejects(() => payload.db.create({ collection: 'pages', data: { tenant, slug: first.slug } }))
    })
  } finally { await payload.destroy(); await rm(dir, { recursive: true, force: true }) }
})

test('PostgreSQL schema has tenant-scoped uniqueness, not global slug uniqueness', async () => {
  const payload = await getPayload({ key: randomUUID(), config: fixtureConfig(postgresAdapter({ pool: {}, push: false })),
    disableDBConnect: true, disableOnInit: true, cron: false })
  try {
    const db = payload.db as unknown as PostgresAdapter
    const indexes = getTableConfig(db.tables.pages).indexes.map(index => ({ unique: index.config.unique,
      columns: index.config.columns.map(column => 'name' in column ? column.name : undefined) }))
    assert.ok(indexes.some(index => index.unique && JSON.stringify(index.columns) === '["tenant_id","slug"]'))
    assert.equal(indexes.some(index => index.unique && JSON.stringify(index.columns) === '["slug"]'), false)
  } finally { await payload.destroy() }
})

const freePort = async () => {
  const server = net.createServer()
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  const port = (server.address() as net.AddressInfo).port
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
  return port
}

test('isolated native PostgreSQL migration preserves all content and serializes concurrent page allocation', {
  skip: !existsSync('/opt/homebrew/bin/initdb') ? 'Local PostgreSQL binaries unavailable' : false, timeout: 120000,
}, async t => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'page-address-pg-'))
  const cluster = path.join(dir, 'cluster')
  const port = await freePort()
  let running = false
  let payload: Payload | undefined
  let client: pg.Client | undefined
  let pool: pg.Pool | undefined
  const command = (name: string, args: string[]) => execFileSync(`/opt/homebrew/bin/${name}`, args, {
    encoding: 'utf8', env: { PATH: process.env.PATH, HOME: dir, LC_ALL: 'C', NODE_ENV: 'test' },
  })
  try {
    command('initdb', ['-D', cluster, '-U', 'page_fixture', '-A', 'trust', '--no-locale'])
    command('pg_ctl', ['-D', cluster, '-l', path.join(dir, 'postgres.log'), '-o', `-h 127.0.0.1 -p ${port} -k ${dir}`, '-w', 'start'])
    running = true
    const uri = `postgres://page_fixture@127.0.0.1:${port}/postgres`
    client = new pg.Client({ connectionString: uri }); await client.connect()
    const args = { db: drizzle(client) } as never
    for (const migration of migrations.filter(migration => migration.name < migrationName)) await migration.up(args)
    const migration = migrations.find(migration => migration.name === migrationName)
    assert.ok(migration, 'Page address migration must be registered')
    const tenant = (await client.query("INSERT INTO tenants(name,slug) VALUES ('Roomchang fixture','roomchang') RETURNING id")).rows[0].id
    const other = (await client.query("INSERT INTO tenants(name,slug) VALUES ('Other fixture','other') RETURNING id")).rows[0].id
    const page = (await client.query("INSERT INTO pages(tenant_id,slug,_status) VALUES ($1,'borin-preserved','published') RETURNING id", [tenant])).rows[0].id
    const version = (await client.query("INSERT INTO _pages_v(parent_id,version_tenant_id,version_slug,version__status,latest) VALUES ($1,$2,'borin-preserved','draft',true) RETURNING id", [page, tenant])).rows[0].id
    for (const locale of ['en', 'kh', 'cn']) {
      await client.query('INSERT INTO pages_locales(_parent_id,_locale,title) VALUES ($1,$2,$3)', [page, locale, `${locale} published`])
      await client.query('INSERT INTO _pages_v_locales(_parent_id,_locale,version_title) VALUES ($1,$2,$3)', [version, locale, `${locale} Borin saved draft`])
    }
    const snapshot = async () => {
      const tables = (await client!.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename")).rows
      const result: Record<string, unknown> = {}
      for (const { tablename } of tables) result[tablename] = (await client!.query(`SELECT to_jsonb(t) AS row FROM "${tablename.replaceAll('"', '""')}" t ORDER BY id`)).rows
      return result
    }
    const duplicate = (await client.query("INSERT INTO pages(tenant_id,slug,_status) VALUES ($1,'borin-preserved','draft') RETURNING id", [tenant])).rows[0].id
    const duplicated = await snapshot()
    await client.query('BEGIN')
    await assert.rejects(() => migration.up(args), /duplicate.*tenant.*slug/i)
    await client.query('ROLLBACK')
    assert.deepEqual(await snapshot(), duplicated, 'Duplicate preflight must not rename/delete content')
    assert.equal((await client.query("SELECT to_regclass('public.tenant_slug_idx') AS index")).rows[0].index, null)
    // Remove only the synthetic duplicate owned by this test, never by migration code.
    await client.query('DELETE FROM pages WHERE id=$1', [duplicate])
    const draftConflictPage = (await client.query("INSERT INTO pages(tenant_id,slug,_status) VALUES ($1,'different-parent-address','published') RETURNING id", [tenant])).rows[0].id
    const draftConflictVersion = (await client.query("INSERT INTO _pages_v(parent_id,version_tenant_id,version_slug,version__status,latest) VALUES ($1,$2,'borin-preserved','draft',true) RETURNING id", [draftConflictPage, tenant])).rows[0].id
    const draftDuplicated = await snapshot()
    await client.query('BEGIN')
    await assert.rejects(() => migration.up(args), /duplicate.*tenant.*slug/i)
    await client.query('ROLLBACK')
    assert.deepEqual(await snapshot(), draftDuplicated, 'Latest-draft duplicate preflight must preserve content')
    await client.query('DELETE FROM _pages_v WHERE id=$1', [draftConflictVersion])
    await client.query('DELETE FROM pages WHERE id=$1', [draftConflictPage])
    const before = await snapshot()
    await client.query('BEGIN'); await migration.up(args); await client.query('COMMIT')
    assert.deepEqual(await snapshot(), before, 'Migration must preserve every predecessor table row, locale and draft')
    const prior = JSON.parse(readFileSync(new URL('../src/migrations/20261022_040000_media_directories.json', import.meta.url), 'utf8'))
    const current = JSON.parse(readFileSync(new URL(`../src/migrations/${migrationName}.json`, import.meta.url), 'utf8'))
    assert.equal(current.prevId, prior.id)
    const index = current.tables['public.pages'].indexes.tenant_slug_idx
    assert.equal(index.isUnique, true)
    assert.deepEqual(index.columns.map((column: { expression: string }) => column.expression), ['tenant_id', 'slug'])
    delete current.tables['public.pages'].indexes.tenant_slug_idx
    delete current.tables['public._pages_v'].indexes.version_tenant_version_slug_idx
    assert.deepEqual({ ...current, id: prior.id, prevId: prior.prevId }, prior)

    payload = await getPayload({ key: randomUUID(), config: fixtureConfig(postgresAdapter({ pool: {}, push: false })),
      disableDBConnect: true, disableOnInit: true, cron: false })
    pool = new pg.Pool({ connectionString: uri, max: 12 })
    const db = payload.db as unknown as PostgresAdapter
    db.pool = pool; db.drizzle = drizzle({ client: pool, schema: db.schema }); db.resolveInitializing?.()
    const results = await Promise.all(Array.from({ length: 6 }, (_, n) => createPage(payload!, tenant, {}, n % 2 === 0)))
    assert.deepEqual(results.map(page => page.slug).sort(), [
      'patient-information', 'patient-information-2', 'patient-information-3', 'patient-information-4', 'patient-information-5', 'patient-information-6',
    ])
    assert.equal((await createPage(payload, other)).slug, 'patient-information')
    const heldReq = await createLocalReq({}, payload)
    const heldTransaction = await db.beginTransaction()
    assert.ok(heldTransaction)
    heldReq.transactionID = heldTransaction
    let waiting: ReturnType<typeof createPage> | undefined
    try {
      await payload.create({ collection: 'pages', req: heldReq, data: { tenant, title: 'Held Transaction' } as never })
      waiting = createPage(payload, tenant, { title: 'Held Transaction' })
      const deadline = Date.now() + 5000
      let blocked = false
      while (Date.now() < deadline) {
        blocked = (await client.query("SELECT count(*)::int n FROM pg_stat_activity WHERE datname=current_database() AND wait_event='advisory'")).rows[0].n > 0
        if (blocked) break
        await new Promise(resolve => setTimeout(resolve, 10))
      }
      assert.ok(blocked, 'Same-tenant allocation must wait until the first writer commits')
      assert.equal((await createPage(payload, other, { title: 'Held Transaction' })).slug, 'held-transaction', 'Another tenant must not wait for this tenant lock')
      await db.commitTransaction(heldReq.transactionID)
      delete heldReq.transactionID
      assert.equal((await waiting).slug, 'held-transaction-2')
    } finally {
      if (heldReq.transactionID) await db.rollbackTransaction(heldReq.transactionID)
      if (waiting) await waiting.catch(() => undefined)
    }
    const explicit = await Promise.allSettled([createPage(payload, tenant, { slug: 'explicit-race' }), createPage(payload, tenant, { slug: 'explicit-race' }, true)])
    assert.equal(explicit.filter(result => result.status === 'fulfilled').length, 1)
    for (const isDraft of [true, false]) await assert.rejects(() => createPage(payload!, tenant, { slug: 'patient-information' }, isDraft))
    await assert.rejects(() => payload!.db.create({ collection: 'pages', data: { tenant, slug: 'patient-information' } }))
    await assert.rejects(() => payload!.create({ collection: 'pages', disableTransaction: true,
      data: { tenant, title: 'No transaction' } as never }), /active PostgreSQL transaction/)
    const after = await snapshot()
    for (const table of Object.keys(before).filter(table => table.startsWith('pages') || table.startsWith('_pages_v'))) {
      const original = before[table] as { row: { id: number } }[]
      const originalIDs = new Set(original.map(entry => entry.row.id))
      assert.deepEqual((after[table] as { row: { id: number } }[]).filter(entry => originalIDs.has(entry.row.id)), original, `Allocation changed existing ${table}`)
    }
    t.diagnostic(`Preserved all ${Object.keys(before).length} predecessor tables; six concurrent draft/published creates received distinct addresses on local PG ${port}`)
  } finally {
    if (payload) await payload.destroy()
    if (pool) await pool.end()
    if (client) await client.end()
    if (running) command('pg_ctl', ['-D', cluster, '-m', 'immediate', '-w', 'stop'])
    await rm(dir, { recursive: true, force: true })
  }
})
