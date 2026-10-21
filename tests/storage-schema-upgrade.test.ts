import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import http from 'node:http'
import https from 'node:https'
import { test } from 'node:test'
import pg from 'pg'
import { drizzle } from '@payloadcms/db-postgres/drizzle/node-postgres'
import { getPayload, type Payload, type SanitizedConfig } from 'payload'
import { migrations } from '../src/migrations'

const migrationName = '20261021_120000_payload_391_schema'
const fixtureURI = 'postgres://cms_fixture@127.0.0.1:55439/cms_storage_upgrade_fixture'
const assetBase = 'https://storage-fixture.invalid'
const quote = (name: string) => `"${name.replaceAll('"', '""')}"`

async function withR2Config(run: (config: SanitizedConfig) => Promise<void>) {
  const environment = {
    DATABASE_URI: fixtureURI,
    PAYLOAD_SECRET: 'storage-upgrade-local-fixture-only',
    R2_ACCESS_KEY_ID: 'storage-fixture-only',
    R2_SECRET_ACCESS_KEY: 'storage-fixture-only',
    R2_ACCOUNT_ID: 'storage-fixture-only',
    R2_BUCKET_NAME: 'storage-fixture-only',
    R2_PUBLIC_BASE_URL: assetBase,
    PAYLOAD_TELEMETRY_DISABLED: '1',
  }
  const previous = Object.fromEntries(Object.keys(environment).map((key) => [key, process.env[key]]))
  Object.assign(process.env, environment)
  try {
    const config = await (await import('../src/payload.config')).default
    await run({ ...config, telemetry: false, typescript: { ...config.typescript, autoGenerate: false } })
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
}

test('the registered storage upgrade preserves data on downgrade', async () => {
  const migration = migrations.find(({ name }) => name === migrationName)
  assert.ok(migration, 'Register an additive migration for the R2 media storage key')
  assert.equal(migrations.at(-1), migration, 'Apply the storage upgrade after all existing migrations')
  await assert.rejects(() => migration.down({} as never), /refus|recovery|discard/i)
})

test('the frozen migration snapshot adds only the two nullable Payload 3.91 fields', () => {
  const previous = JSON.parse(readFileSync(new URL('../src/migrations/20261020_105541_cms_localized_field_coverage.json', import.meta.url), 'utf8'))
  const current = JSON.parse(readFileSync(new URL(`../src/migrations/${migrationName}.json`, import.meta.url), 'utf8'))
  assert.deepEqual(current.tables['public.media'].columns._objectkey,
    { name: '_objectkey', type: 'varchar', primaryKey: false, notNull: false })
  assert.deepEqual(current.tables['public.users'].columns.reset_password_requested_at,
    { name: 'reset_password_requested_at', type: 'timestamp(3) with time zone', primaryKey: false, notNull: false })
  assert.equal(current.prevId, previous.id)
  assert.notEqual(current.id, previous.id)
  delete current.tables['public.media'].columns._objectkey
  delete current.tables['public.users'].columns.reset_password_requested_at
  assert.deepEqual({ ...current, id: previous.id, prevId: previous.prevId }, previous)
})

test('actual R2 URL hooks preserve legacy folders when the storage key is null or absent', async () => {
  await withR2Config(async (config) => {
    const media = config.collections.find(({ slug }) => slug === 'media')!
    assert.equal(typeof media.upload === 'object' && media.upload.adapter, 's3')
    const field = media.flattenedFields.find((field) => field.name === 'url')!
    assert.ok('hooks' in field)
    const filename = 'legacy-doctor.png'
    const prefix = 'roomchang/doctors'
    const url = `${assetBase}/${prefix}/${filename}`
    for (const storageKey of [undefined, null, 'existing-client-object']) {
      const data = { filename, prefix, _objectKey: storageKey }
      const expected = storageKey ? `${assetBase}/${prefix}/${storageKey}/${filename}` : url
      for (const phase of ['afterRead', 'beforeChange'] as const) {
        const hooks = field.hooks?.[phase]
        assert.ok(hooks?.length, `R2 must register the ${phase} URL hooks`)
        let value: unknown = url
        for (const hook of hooks) {
          value = await hook({ collection: media, data, originalDoc: data, req: { payload: { config } }, value } as never)
        }
        assert.equal(value, expected)
        assert.deepEqual(data, { filename, prefix, _objectKey: storageKey }, 'URL hooks must not rewrite stored identity')
      }
    }
  })
})

test('PG18 storage upgrade preserves every old row and supports the full R2 schema and metadata API', {
  skip: process.env.STORAGE_UPGRADE_TEST_DATABASE_URI === undefined
    ? `Set STORAGE_UPGRADE_TEST_DATABASE_URI=${fixtureURI} for the dedicated native fixture`
    : false,
  timeout: 120000,
}, async (t) => {
  assert.equal(process.env.STORAGE_UPGRADE_TEST_DATABASE_URI, fixtureURI, 'Never use another database for this test')
  const denyNetwork = () => { throw new Error('Storage upgrade verification must not make HTTP requests') }
  t.mock.method(http, 'request', denyNetwork)
  t.mock.method(https, 'request', denyNetwork)
  t.mock.method(globalThis, 'fetch', denyNetwork)

  const admin = new pg.Pool({ connectionString: 'postgres://cms_fixture@127.0.0.1:55439/postgres' })
  try {
    if (!(await admin.query("SELECT 1 FROM pg_database WHERE datname='cms_storage_upgrade_fixture'")).rowCount) {
      await admin.query('CREATE DATABASE cms_storage_upgrade_fixture')
    }
  } finally {
    await admin.end()
  }

  const pool = new pg.Pool({ connectionString: fixtureURI })
  const client = await pool.connect()
  let ownsSchema = false
  let payload: Payload | undefined
  const columns = async (table: string) => (await client.query<{ column_name: string }>(
    "SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position", [table],
  )).rows.map(({ column_name }) => column_name)
  const snapshot = async () => {
    const tables = (await client.query<{ table_name: string }>(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name",
    )).rows
    const result = new Map<string, { columns: string[]; rows: Record<string, unknown>[] }>()
    for (const { table_name: table } of tables) {
      result.set(table, {
        columns: await columns(table),
        rows: (await client.query(`SELECT * FROM ${quote(table)} ORDER BY id`)).rows,
      })
    }
    return result
  }

  try {
    assert.match((await client.query('SHOW server_version')).rows[0].server_version, /^18\./)
    assert.equal((await client.query("SELECT count(*)::int n FROM information_schema.tables WHERE table_schema='public'")).rows[0].n, 0,
      'Dedicated fixture must be empty; never reset preexisting data')
    ownsSchema = true
    const args = { db: drizzle(client) } as never
    for (const migration of migrations.filter(({ name }) => name !== migrationName)) await migration.up(args)

    const tenantID = (await client.query("INSERT INTO tenants (name,slug) VALUES ('Storage fixture','roomchang') RETURNING id")).rows[0].id
    const userID = (await client.query(`INSERT INTO users (email,name,salt,hash,reset_password_token)
      VALUES ('storage-fixture@example.invalid','Storage fixture','retained-salt','retained-hash','retained-reset-token') RETURNING id`)).rows[0].id
    const filename = 'legacy-doctor.png'
    const prefix = 'roomchang/doctors'
    const url = `${assetBase}/${prefix}/${filename}`
    const mediaID = (await client.query(`INSERT INTO media
      (tenant_id,prefix,filename,url,mime_type,filesize,width,height,focal_x,focal_y,created_at,updated_at)
      VALUES ($1,$2,$3,$4,'image/png',1234,800,600,50,50,'2025-01-02T03:04:05Z','2025-02-03T04:05:06Z') RETURNING id`,
    [tenantID, prefix, filename, url])).rows[0].id
    for (const locale of ['en', 'kh', 'cn']) {
      await client.query('INSERT INTO media_locales (_parent_id,_locale,alt) VALUES ($1,$2,$3)', [mediaID, locale, `${locale} original alt`])
    }
    const pageID = (await client.query("INSERT INTO pages (tenant_id,slug,_status) VALUES ($1,'storage-fixture-page','published') RETURNING id", [tenantID])).rows[0].id
    const versionID = (await client.query(`INSERT INTO _pages_v (parent_id,version_tenant_id,version_slug,version__status,latest)
      VALUES ($1,$2,'storage-fixture-page','draft',true) RETURNING id`, [pageID, tenantID])).rows[0].id
    for (const locale of ['en', 'kh', 'cn']) {
      await client.query('INSERT INTO pages_locales (_parent_id,_locale,title) VALUES ($1,$2,$3)', [pageID, locale, `${locale} published title`])
      await client.query('INSERT INTO _pages_v_locales (_parent_id,_locale,version_title) VALUES ($1,$2,$3)', [versionID, locale, `${locale} private draft`])
    }
    const before = await snapshot()

    await withR2Config(async (config) => {
      payload = await getPayload({ config, disableDBConnect: true })
      const database = payload.db as unknown as {
        rawTables: Record<string, { name: string; columns: Record<string, { name: string }> }>
        pool: pg.Pool
      }
      const missingColumns = async () => {
        const missing: string[] = []
        for (const table of Object.values(database.rawTables)) {
          const existing = new Set(await columns(table.name))
          for (const column of Object.values(table.columns)) {
            if (!existing.has(column.name)) missing.push(`${table.name}.${column.name}`)
          }
        }
        return missing.sort()
      }
      assert.deepEqual(await missingColumns(), ['media._objectkey', 'users.reset_password_requested_at'],
        'Detect every newly required field in the full R2-enabled Payload 3.91 schema')
      const migration = migrations.find(({ name }) => name === migrationName)
      if (migration) await migration.up(args)
      assert.deepEqual(await missingColumns(), [], 'Registered migrations must satisfy the entire R2-enabled schema')
      const column = (await client.query(`SELECT is_nullable,column_default,data_type FROM information_schema.columns
        WHERE table_schema='public' AND table_name='media' AND column_name='_objectkey'`)).rows[0]
      assert.deepEqual(column, { is_nullable: 'YES', column_default: null, data_type: 'character varying' })
      const resetColumn = (await client.query(`SELECT is_nullable,column_default,data_type,datetime_precision FROM information_schema.columns
        WHERE table_schema='public' AND table_name='users' AND column_name='reset_password_requested_at'`)).rows[0]
      assert.deepEqual(resetColumn, { is_nullable: 'YES', column_default: null, data_type: 'timestamp with time zone', datetime_precision: 3 })

      for (const [table, saved] of before) {
        assert.deepEqual((await client.query(`SELECT ${saved.columns.map(quote).join(',')} FROM ${quote(table)} ORDER BY id`)).rows,
          saved.rows, `${table}: preserve all old columns, rows, locale values, timestamps and draft versions`)
      }
      assert.equal((await client.query('SELECT _objectkey FROM media WHERE id=$1', [mediaID])).rows[0]._objectkey, null)
      assert.equal((await client.query('SELECT reset_password_requested_at FROM users WHERE id=$1', [userID])).rows[0].reset_password_requested_at, null)
      await client.query('UPDATE media SET _objectkey=$1 WHERE id=$2', ['existing-client-object', mediaID])
      await client.query("UPDATE users SET reset_password_requested_at='2026-10-21T01:02:03Z' WHERE id=$1", [userID])
      await migration!.up(args)
      assert.equal((await client.query('SELECT _objectkey FROM media WHERE id=$1', [mediaID])).rows[0]._objectkey, 'existing-client-object',
        'Retry must preserve already assigned storage keys')
      assert.equal((await client.query('SELECT reset_password_requested_at FROM users WHERE id=$1', [userID]))
        .rows[0].reset_password_requested_at.toISOString(), '2026-10-21T01:02:03.000Z', 'Retry must preserve reset request state')
      await client.query('UPDATE media SET _objectkey=NULL WHERE id=$1', [mediaID])
      await assert.rejects(() => migration!.down(args), /refus|recovery|discard/i)

      database.pool = pool
      await payload!.db.connect?.()
      const identity = (doc: Record<string, unknown>) => Object.fromEntries(
        ['tenant', 'prefix', 'filename', 'url', '_objectKey', 'mimeType', 'filesize', 'width', 'height', 'focalX', 'focalY', 'createdAt']
          .map((key) => [key, doc[key]]),
      )
      const user = { id: userID, collection: 'users', roles: ['super-admin'] }
      const visibleUser = await payload!.findByID({ collection: 'users', id: userID, depth: 0, overrideAccess: false, user })
      assert.equal(visibleUser.email, 'storage-fixture@example.invalid')
      assert.equal(Object.hasOwn(visibleUser, 'resetPasswordRequestedAt'), false, 'The new auth state remains hidden')
      const read = (id: number, locale: 'en' | 'kh' | 'cn') => payload!.findByID({ collection: 'media', id, depth: 0, locale,
        overrideAccess: false, user }) as unknown as Promise<Record<string, unknown>>
      const keyedURL = `${assetBase}/roomchang/client-files/existing-client-object/new-file.png`
      const keyedID = (await client.query(`INSERT INTO media (tenant_id,prefix,_objectkey,filename,url,mime_type,filesize)
        VALUES ($1,'roomchang/client-files','existing-client-object','new-file.png',$2,'image/png',5678) RETURNING id`, [tenantID, keyedURL])).rows[0].id
      for (const locale of ['en', 'kh', 'cn']) {
        await client.query('INSERT INTO media_locales (_parent_id,_locale,alt) VALUES ($1,$2,$3)', [keyedID, locale, `${locale} keyed alt`])
      }
      for (const [id, expectedURL, expectedKey] of [[mediaID, url, null], [keyedID, keyedURL, 'existing-client-object']] as const) {
        const original = await read(id, 'en')
        assert.equal(original.url, expectedURL)
        assert.equal(original._objectKey, expectedKey)
        for (const locale of ['en', 'kh', 'cn'] as const) {
          await payload!.update({ collection: 'media', id, locale, depth: 0, overrideLock: true, overrideAccess: false, user,
            data: { alt: `${locale} edited alt`, _objectKey: 'must-not-replace-object' } as never })
          const current = await read(id, locale)
          assert.equal(current.alt, `${locale} edited alt`)
          assert.deepEqual(identity(current), identity(original), `${locale} metadata edits retain null or existing keyed object identity`)
        }
        for (const locale of ['en', 'kh', 'cn'] as const) assert.equal((await read(id, locale)).alt, `${locale} edited alt`)
        assert.equal((await client.query('SELECT url FROM media WHERE id=$1', [id])).rows[0].url, expectedURL)
      }
      assert.deepEqual((await client.query('SELECT * FROM _pages_v ORDER BY id')).rows, before.get('_pages_v')!.rows)
      assert.deepEqual((await client.query('SELECT * FROM _pages_v_locales ORDER BY id')).rows, before.get('_pages_v_locales')!.rows)
      t.diagnostic(`Full R2 schema validated: ${Object.keys(database.rawTables).length} tables; legacy media reads and EN/KH/CN metadata edits preserve URLs and identity`)
    })
  } finally {
    if (payload) await payload.destroy()
    if (ownsSchema) {
      // This test owns only its explicitly guarded, initially empty local fixture database.
      await client.query('DROP SCHEMA public CASCADE')
      await client.query('CREATE SCHEMA public')
    }
    client.release()
    await pool.end()
  }
})
