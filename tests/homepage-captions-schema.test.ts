import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { test } from 'node:test'
import { postgresAdapter, type PostgresAdapter } from '@payloadcms/db-postgres'
import { PgDialect } from '@payloadcms/db-postgres/drizzle/pg-core'
import { getPayload } from 'payload'
import { Homepage } from '../src/collections/Homepage'
import { migrations } from '../src/migrations'
import { loadPayloadConfig } from './helpers/load-payload-config'

process.env.PAYLOAD_SECRET = 'homepage-caption-schema-disposable-fixture-only'
process.env.DATABASE_URI = 'file:/tmp/homepage-caption-schema-config-unused.db'
const name = '20261023_040000_homepage_captions'

test('homepage captions are optional, localized and off by default without a database backfill default', async () => {
  const field = Homepage.fields.find(field => 'name' in field && field.name === 'showCaptions')
  assert.ok(field, 'Homepage needs an explicit caption opt-in')
  assert.equal(field.type, 'checkbox')
  if (field.type !== 'checkbox') throw new Error('Expected checkbox')
  assert.equal(field.localized, true)
  assert.notEqual(field.required, true)
  const defaultValue = typeof field.defaultValue === 'function' ? await field.defaultValue({} as never) : field.defaultValue
  assert.equal(defaultValue, false)

  const config = await loadPayloadConfig()
  const payload = await getPayload({ key: randomUUID(), disableDBConnect: true, disableOnInit: true, cron: false, config: {
    ...config, telemetry: false, typescript: { ...config.typescript, autoGenerate: false },
    admin: { ...config.admin, importMap: { ...config.admin.importMap, autoGenerate: false } },
    db: postgresAdapter({ pool: { connectionString: 'postgres://unused@127.0.0.1:1/never_connect' }, push: false }) as typeof config.db,
  } })
  try {
    const db = payload.db as unknown as PostgresAdapter
    for (const [table, key, column] of [
      ['homepage_locales', 'showCaptions', 'show_captions'],
      ['_homepage_v_locales', 'version_showCaptions', 'version_show_captions'],
    ]) {
      const generated = db.rawTables[table].columns[key]
      assert.ok(generated, `${table}.${key} must exist in the actual generated schema`)
      assert.equal(generated.name, column)
      assert.equal(generated.type, 'boolean')
      assert.notEqual(generated.notNull, true)
      assert.equal(generated.default, undefined, 'An application-only default must not populate existing locale rows')
    }
    assert.equal(db.rawTables.homepage.columns.showCaptions, undefined)
    assert.equal(db.rawTables._homepage_v.columns.version_showCaptions, undefined)
  } finally { await payload.destroy() }
})

test('caption migration emits only two nullable boolean additions and refuses destructive downgrade', async () => {
  const migration = migrations.find(migration => migration.name === name)
  assert.ok(migration, 'Register the additive homepage caption migration')
  assert.ok(migrations.indexOf(migration) > migrations.findIndex(migration => migration.name === '20261022_070000_page_addresses'))
  const statements: string[] = []
  await migration.up({ db: { execute: async (query: Parameters<PgDialect['sqlToQuery']>[0]) => {
    const compiled = new PgDialect().sqlToQuery(query)
    assert.deepEqual(compiled.params, [])
    statements.push(...compiled.sql.split(';').map(value => value.trim()).filter(Boolean))
  } } } as never)
  assert.deepEqual(statements, [
    'ALTER TABLE "homepage_locales" ADD COLUMN "show_captions" boolean',
    'ALTER TABLE "_homepage_v_locales" ADD COLUMN "version_show_captions" boolean',
  ])
  await assert.rejects(() => migration.down({ db: { execute: () => assert.fail('Downgrade must not execute SQL') } } as never), /refus|discard/i)
})

test('caption snapshot preserves every old schema definition and adds only the nullable locale columns', () => {
  const previous = JSON.parse(readFileSync(new URL('../src/migrations/20261022_070000_page_addresses.json', import.meta.url), 'utf8'))
  const file = new URL(`../src/migrations/${name}.json`, import.meta.url)
  assert.ok(existsSync(file), 'Add the matching migration snapshot')
  const current = JSON.parse(readFileSync(file, 'utf8'))
  assert.equal(current.prevId, previous.id)
  assert.notEqual(current.id, previous.id)
  for (const [table, column] of [
    ['public.homepage_locales', 'show_captions'], ['public._homepage_v_locales', 'version_show_captions'],
  ]) {
    assert.deepEqual(current.tables[table].columns[column], { name: column, type: 'boolean', primaryKey: false, notNull: false })
    delete current.tables[table].columns[column]
  }
  assert.deepEqual({ ...current, id: previous.id, prevId: previous.prevId }, previous)
})
