import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { test } from 'node:test'
import pg from 'pg'
import { drizzle } from '@payloadcms/db-postgres/drizzle/node-postgres'
import type { PostgresAdapter } from '@payloadcms/db-postgres'
import { createLocalReq, getPayload, type Payload } from 'payload'
import { migrations } from '../src/migrations'
import { createMediaFolder, mediaFolderCatalog } from '../src/lib/media-folder-catalog'

const uri = 'postgres://cms_fixture@127.0.0.1:55439/cms_folder_upgrade_fixture'
const name = '20261022_040000_media_directories'
const quote = (name: string) => `"${name.replaceAll('"', '""')}"`

test('PG18 adds persistent folders without changing old rows and safely handles concurrent creation', {
  skip: process.env.MEDIA_FOLDER_TEST_DATABASE_URI === undefined ? 'Set MEDIA_FOLDER_TEST_DATABASE_URI to the dedicated local fixture' : false,
  timeout: 120000,
}, async t => {
  assert.equal(process.env.MEDIA_FOLDER_TEST_DATABASE_URI, uri, 'Never run this against another database')
  const admin = new pg.Client({ connectionString: 'postgres://cms_fixture@127.0.0.1:55439/postgres' })
  await admin.connect()
  try {
    if (!(await admin.query("SELECT 1 FROM pg_database WHERE datname='cms_folder_upgrade_fixture'")).rowCount) await admin.query('CREATE DATABASE cms_folder_upgrade_fixture')
  } finally { await admin.end() }
  const client = new pg.Client({ connectionString: uri })
  await client.connect()
  let ownsSchema = false
  let payload: Payload | undefined
  let fixturePool: pg.Pool | undefined
  const snapshot = async () => {
    const tables = (await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name")).rows
    const result = new Map<string, any>()
    for (const { table_name: table } of tables) result.set(table, {
      columns: (await client.query("SELECT column_name,data_type,is_nullable FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position", [table])).rows,
      rows: (await client.query(`SELECT to_jsonb(t) AS row FROM ${quote(table)} t ORDER BY id`)).rows,
    })
    return result
  }
  try {
    assert.match((await client.query('SHOW server_version')).rows[0].server_version, /^18\./)
    assert.equal((await client.query("SELECT count(*)::int n FROM information_schema.tables WHERE table_schema='public'")).rows[0].n, 0, 'Fixture must be initially empty; never reset an existing schema')
    ownsSchema = true
    const args = { db: drizzle(client) } as never
    for (const migration of migrations.filter(m => m.name !== name)) await migration.up(args)
    const tenant = (await client.query("INSERT INTO tenants (name,slug) VALUES ('Roomchang fixture','roomchang') RETURNING id")).rows[0].id
    const userID = (await client.query("INSERT INTO users (email,name) VALUES ('folder-fixture@example.invalid','Folder fixture') RETURNING id")).rows[0].id
    const media = (await client.query("INSERT INTO media (tenant_id,prefix,filename,url,mime_type) VALUES ($1,'roomchang/technology','unchanged.png','https://storage-fixture.invalid/roomchang/technology/unchanged.png','image/png') RETURNING id", [tenant])).rows[0].id
    const page = (await client.query("INSERT INTO pages (tenant_id,slug,_status) VALUES ($1,'folder-fixture-page','published') RETURNING id", [tenant])).rows[0].id
    const version = (await client.query("INSERT INTO _pages_v (parent_id,version_tenant_id,version_slug,version__status,latest) VALUES ($1,$2,'folder-fixture-page','draft',true) RETURNING id", [page, tenant])).rows[0].id
    for (const locale of ['en', 'kh', 'cn']) {
      await client.query('INSERT INTO media_locales (_parent_id,_locale,alt) VALUES ($1,$2,$3)', [media, locale, `${locale} original alt`])
      await client.query('INSERT INTO pages_locales (_parent_id,_locale,title) VALUES ($1,$2,$3)', [page, locale, `${locale} published`])
      await client.query('INSERT INTO _pages_v_locales (_parent_id,_locale,version_title) VALUES ($1,$2,$3)', [version, locale, `${locale} saved draft`])
    }
    const before = await snapshot()
    await migrations.find(m => m.name === name)!.up(args)
    const migrated = await snapshot()
    for (const [table, value] of before) assert.deepEqual(migrated.get(table), value, `Migration changed ${table}`)
    Object.assign(process.env, { DATABASE_URI: uri, PAYLOAD_SECRET: 'folder-native-pg-fixture-only', PAYLOAD_TELEMETRY_DISABLED: '1',
      R2_ACCESS_KEY_ID: 'fixture-only', R2_SECRET_ACCESS_KEY: 'fixture-only', R2_ACCOUNT_ID: 'fixture-only', R2_BUCKET_NAME: 'fixture-only', R2_PUBLIC_BASE_URL: 'https://storage-fixture.invalid' })
    const config = await (await import('../src/payload.config')).default
    payload = await getPayload({ key: randomUUID(), config: { ...config, telemetry: false, typescript: { ...config.typescript, autoGenerate: false } }, disableOnInit: true, disableDBConnect: true })
    // Own the fixture pool: Payload's reconnect listener deliberately retains a boot-time client.
    fixturePool = new pg.Pool({ connectionString: uri })
    const database = payload.db as unknown as PostgresAdapter
    database.pool = fixturePool
    database.drizzle = drizzle({ client: fixturePool, schema: database.schema })
    database.resolveInitializing?.()
    const editor = { id: userID, name: 'Folder fixture', collection: 'users', roles: ['editor'], tenants: [{ tenant }] } as never
    const request = async () => Object.assign(await createLocalReq({ user: editor }, payload!), {
      data: { parent: 'technology', name: 'Dürr Dental MyLunos' }, searchParams: new URLSearchParams(`tenant=${tenant}`),
    })
    const results = await Promise.all([request().then(createMediaFolder), request().then(createMediaFolder)])
    assert.equal(results.filter(result => result.created).length, 1)
    assert.ok(results.every(result => result.path === 'technology/durr-dental-mylunos'))
    assert.equal((await client.query('SELECT count(*)::int n FROM media_directories')).rows[0].n, 1)
    assert.equal((await client.query("SELECT count(*)::int n FROM editorial_audit WHERE doc_collection='media-directories'")).rows[0].n, 1)
    const reloaded = await mediaFolderCatalog(await request())
    assert.equal(reloaded.folders.find(folder => folder.path === results[0].path)?.count, 0)
    const after = await snapshot()
    for (const [table, value] of before) {
      if (table === 'editorial_audit') continue
      assert.deepEqual(after.get(table), value, `Folder creation changed ${table}`)
    }
    t.diagnostic(`Preserved all ${before.size} predecessor tables; concurrent folder creation produced one row and one audit event`)
  } finally {
    if (payload) await payload.destroy()
    if (fixturePool) await fixturePool.end()
    if (ownsSchema) { await client.query('DROP SCHEMA public CASCADE'); await client.query('CREATE SCHEMA public') }
    await client.end()
  }
})
