import assert from 'node:assert/strict'
import pg from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { buildConfig, getPayload, type CollectionSlug, type Payload } from 'payload'
import { migrations } from '../src/migrations'
import { localizedFieldFixtures, toColumn } from './lib/cms-localized-field-fixtures'

const uri = 'postgres://cms_fixture@127.0.0.1:55439/cms_mapping_fixture'
if (process.env.MIGRATION_TEST_DATABASE_URI !== uri) throw new Error(`Requires disposable fixture ${uri}`)
const migration = migrations.find(({ name }) => name.endsWith('_cms_localized_field_coverage'))
assert.ok(migration, 'Task2 additive migration must be registered')

// This is the only database this fixture may create or write. Never use the restore baseline.
const admin = new pg.Pool({ connectionString: 'postgres://cms_fixture@127.0.0.1:55439/postgres' })
try {
  if (!(await admin.query("SELECT 1 FROM pg_database WHERE datname='cms_mapping_fixture'")).rowCount) {
    await admin.query('CREATE DATABASE cms_mapping_fixture')
  }
} finally {
  await admin.end()
}
const pool = new pg.Pool({ connectionString: uri })
const client = await pool.connect()
let committed = false
let payload: Payload | undefined
const quote = (name: string) => `"${name.replaceAll('"', '""')}"`
const columns = async (table: string) => (await client.query<{
  column_name: string; is_nullable: string; column_default: string | null; data_type: string
}>('SELECT column_name,is_nullable,column_default,data_type FROM information_schema.columns WHERE table_schema=\'public\' AND table_name=$1 ORDER BY ordinal_position', [table])).rows
const exists = async (table: string) => (await columns(table)).length > 0
const insert = async (table: string, supplied: Record<string, unknown>) => {
  const values: Record<string, unknown> = {}
  for (const column of await columns(table)) {
    const name = column.column_name
    if (Object.hasOwn(supplied, name)) values[name] = supplied[name]
    else if (column.is_nullable === 'NO' && column.column_default === null) {
      values[name] = column.data_type.includes('timestamp') ? '2026-01-02T03:04:05Z'
        : column.data_type === 'integer' || column.data_type === 'numeric' ? 7
          : column.data_type === 'boolean' ? false : `fixture-${name}`
    }
  }
  const names = Object.keys(values)
  return (await client.query(`INSERT INTO ${quote(table)} (${names.map(quote).join(',')}) VALUES (${names.map((_, i) => `$${i + 1}`).join(',')}) RETURNING id`, Object.values(values))).rows[0].id as number
}
const snapshot = async () => {
  const tables = (await client.query<{ table_name: string }>("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name")).rows
  const result = new Map<string, { columns: string[]; rows: unknown[] }>()
  for (const { table_name: table } of tables) {
    const names = (await columns(table)).map(({ column_name }) => column_name)
    const rows = (await client.query(`SELECT ${names.map(quote).join(',')} FROM ${quote(table)} ORDER BY id`)).rows
    result.set(table, { columns: names, rows })
  }
  return result
}

try {
  assert.match((await client.query('SHOW server_version')).rows[0].server_version, /^18\./)
  assert.equal((await client.query("SELECT count(*)::int n FROM information_schema.tables WHERE table_schema='public'")).rows[0].n, 0, 'Dedicated database must be empty; do not reset existing data')
  await client.query('BEGIN')
  const args = { db: drizzle(client) } as never
  for (const old of migrations) {
    if (old.name === migration.name) break
    await old.up(args)
  }
  const expected: { table: string; prefix: string; id: number; fields: readonly (readonly [string, string])[]; marker: string }[] = []
  for (const fixture of localizedFieldFixtures) {
    const table = fixture.config.slug.replaceAll('-', '_')
    const parentData = Object.fromEntries(Object.entries(fixture.seed).map(([field, value]) => [toColumn(field), value]))
    fixture.fields.forEach(([, source]) => { parentData[toColumn(source)] = `parent-${table}-${source}` })
    const id = await insert(table, { ...parentData, _status: 'published', order: 19, source_id: `source-${table}` })
    expected.push({ table, prefix: '', id, fields: fixture.fields, marker: 'parent' })
    if (await exists(`${table}_locales`)) {
      for (const locale of ['en', 'kh', 'cn']) {
        const saved: Record<string, unknown> = { _parent_id: id, _locale: locale }
        for (const column of await columns(`${table}_locales`)) {
          if (column.data_type === 'character varying') saved[column.column_name] = `${locale}-existing-${column.column_name}`
        }
        await insert(`${table}_locales`, saved)
      }
    }
    for (const child of ['requirements', 'benefits', 'body', 'images']) {
      const childTable = `${table}_${child}`
      if (!await exists(childTable)) continue
      const translated = (await columns(childTable)).some(({ column_name }) => column_name === '_locale')
      for (const locale of translated ? ['en', 'kh', 'cn'] : ['shared']) {
        for (const order of [2, 1]) {
          await insert(childTable, { id: `stable-${table}-${child}-${locale}-${order}`, _parent_id: id, _order: order,
            _locale: locale, value: `${locale}-existing-value-${order}`, paragraph: `${locale}-paragraph-${order}`,
            url: `https://example.test/image-${order}` })
        }
      }
    }
    for (const state of ['historical', 'draft']) {
      const versionTable = `_${table}_v`
      const data: Record<string, unknown> = { parent_id: id, version__status: state === 'draft' ? 'draft' : 'published', latest: state === 'draft', version_order: 23 }
      fixture.fields.forEach(([, source]) => { data[`version_${toColumn(source)}`] = `${state}-${table}-${source}` })
      const versionID = await insert(versionTable, data)
      expected.push({ table: versionTable, prefix: 'version_', id: versionID, fields: fixture.fields, marker: state })
      if (await exists(`${versionTable}_locales`)) {
        // Draft has no EN row: migration must create EN using this draft's values.
        for (const locale of state === 'draft' ? ['kh', 'cn'] : ['en', 'kh', 'cn']) {
          const saved: Record<string, unknown> = { _parent_id: versionID, _locale: locale }
          for (const column of await columns(`${versionTable}_locales`)) {
            if (column.data_type === 'character varying') saved[column.column_name] = `${locale}-${state}-${column.column_name}`
          }
          await insert(`${versionTable}_locales`, saved)
        }
      }
    }
    // An untranslated parent with null recovery values must still get its own EN row.
    const missingEnglishID = await insert(table, { slug: `missing-en-${table}`, _status: 'draft', order: 29 })
    if (await exists(`${table}_locales`)) await insert(`${table}_locales`, { _parent_id: missingEnglishID, _locale: 'kh' })
    expected.push({ table, prefix: '', id: missingEnglishID, fields: fixture.fields, marker: 'null' })
  }
  const categories = [
    ['Full Mouth', 'full-mouth-reconstruction'], ['Implants & Crowns', 'implants-and-crowns'],
    ['Implant Bridges', 'implant-bridges'], ['Orthodontics', 'orthodontics'], ['Cosmetic & E-Max', 'cosmetic-and-emax'],
    ['unknown category', null], [null, null], ['implants-and-crowns', 'implants-and-crowns'],
  ] as const
  const clinicalExpected: { table: string; id: number; key: string | null }[] = []
  for (const [index, [category, key]] of categories.entries()) {
    const id = await insert('clinical_cases', { slug: `stable-case-${index}`, _status: 'published' })
    clinicalExpected.push({ table: 'clinical_cases', id, key })
    for (const locale of ['en', 'kh', 'cn']) {
      if (category === null && locale === 'en') continue
      await insert('clinical_cases_locales', { _parent_id: id, _locale: locale, title: `${locale}-case`, category: locale === 'en' ? category : 'Orthodontics' })
    }
    for (const state of ['historical', 'draft']) {
      const versionID = await insert('_clinical_cases_v', { parent_id: id, version_slug: `older-slug-${index}`, version__status: state === 'draft' ? 'draft' : 'published', latest: state === 'draft' })
      const ownKey = state === 'historical' ? 'implant-bridges' : null
      clinicalExpected.push({ table: '_clinical_cases_v', id: versionID, key: ownKey })
      for (const locale of ['en', 'kh', 'cn']) {
        await insert('_clinical_cases_v_locales', { _parent_id: versionID, _locale: locale, version_title: `${locale}-${state}`, version_category: locale === 'en' ? (state === 'historical' ? 'Implant Bridges' : 'unrecognized private draft') : 'Full Mouth' })
      }
    }
  }
  const before = await snapshot()
  await migration.up(args)
  for (const [table, old] of before) {
    const after = (await client.query(`SELECT ${old.columns.map(quote).join(',')} FROM ${quote(table)} ORDER BY id`)).rows
    // Locale tables can gain EN rows, but all existing rows must be exactly unchanged.
    if (table.endsWith('_locales')) {
      for (const row of old.rows as { id: number }[]) assert.deepEqual(after.find((newRow) => newRow.id === row.id), row, `${table} old localized columns/IDs unchanged`)
    } else assert.deepEqual(after, old.rows, `${table} every old column/ID/order/timestamp/status unchanged`)
  }
  for (const { table, prefix, id, fields, marker } of expected) {
    const rows = (await client.query(`SELECT * FROM ${quote(`${table}_locales`)} WHERE _parent_id=$1`, [id])).rows
    const en = rows.find((row) => row._locale === 'en')
    assert.ok(en, `${table} EN row created from its own record`)
    const sourceTable = table.replace(/^_/, '').replace(/_v$/, '')
    for (const [target, source] of fields) {
      assert.equal(en[`${prefix}${toColumn(target)}`], marker === 'null' ? null : `${marker}-${sourceTable}-${source}`, `${table}.${target}: own ${marker}, not parent's value`)
      for (const row of rows.filter((row) => row._locale !== 'en')) assert.equal(row[`${prefix}${toColumn(target)}`], null, `${table}: never clone English into ${row._locale}`)
    }
    const oldRows = before.get(`${table}_locales`)?.rows as { id: number }[] | undefined
    assert.equal(rows.length, oldRows ? oldRows.filter((row) => (row as unknown as Record<string, unknown>)._parent_id === id).length + (oldRows.some((row) => (row as unknown as Record<string, unknown>)._parent_id === id && (row as unknown as Record<string, unknown>)._locale === 'en') ? 0 : 1) : 1)
  }
  for (const { table, id, key } of clinicalExpected) {
    const column = table === 'clinical_cases' ? 'category_key' : 'version_category_key'
    assert.equal((await client.query(`SELECT ${quote(column)} key FROM ${quote(table)} WHERE id=$1`, [id])).rows[0].key, key, `${table}: key from own EN label; unknown stays NULL`)
  }
  // Retry safety: existing editorial values/keys (including explicit empty strings) win.
  for (const { table, prefix, id, fields } of expected) {
    for (const [target] of fields) await client.query(`UPDATE ${quote(`${table}_locales`)} SET ${quote(`${prefix}${toColumn(target)}`)}=$1 WHERE _parent_id=$2`, [target === 'abstract' ? '' : 'retained editorial value', id])
  }
  await client.query("UPDATE clinical_cases SET category_key='orthodontics'")
  await client.query("UPDATE _clinical_cases_v SET version_category_key='cosmetic-and-emax'")
  const retryBefore = await snapshot()
  await migration.up(args)
  assert.deepEqual(await snapshot(), retryBefore, 'Rerun never overwrites existing values or keys')
  await assert.rejects(migration.down(args), /refus|discard|loss/i)
  console.log(`PASS: PostgreSQL 18 full migration chain; ${expected.length} own-row EN backfills, ${clinicalExpected.length} clinical mappings; all old columns, localized rows, IDs, ordering, timestamps, slugs, drafts and versions preserved; retry safe; down refused`)

  // Commit only this disposable fixture so a real Payload pool can exercise generated SQL.
  await client.query('COMMIT')
  committed = true
  payload = await getPayload({ config: buildConfig({
    secret: 'local-only-cms-mapping-pg-fixture',
    typescript: { autoGenerate: false },
    db: postgresAdapter({ pool: { connectionString: uri }, push: false }),
    localization: { locales: ['en', 'kh', 'cn'], defaultLocale: 'en', fallback: true },
    collections: localizedFieldFixtures.map(({ config }) => ({ ...config, versions: { drafts: true, maxPerDoc: 100 } })),
  }), disableDBConnect: true })
  // Supply our own pool: Payload 3.85's bootstrap checks out an unreleased listener client.
  // Generated queries/transactions still use the real PostgreSQL adapter, with push disabled.
  const applicationPool = new pg.Pool({ connectionString: uri })
  ;(payload.db as unknown as { pool: pg.Pool }).pool = applicationPool
  await payload.db.connect?.()
  for (const fixture of localizedFieldFixtures) {
    const collection = fixture.config.slug as CollectionSlug
    const locales = ['en', 'kh', 'cn'] as const
    const values = (locale: string) => Object.fromEntries(fixture.fields.map(([field]) => [field, `${locale}-${collection}-${field}`]))
    const translatedSeed = Object.fromEntries(Object.entries(fixture.seed).filter(([name]) => fixture.config.fields.some((field) => 'name' in field && field.name === name && 'localized' in field && field.localized)))
    const doc: { id: number | string } = await payload.create({ collection, locale: 'en', data: { ...fixture.seed, ...values('en'), _status: 'published' } as never })
    const read = (locale: typeof locales[number], draft = false, fallbackLocale: false | 'en' = false): Promise<Record<string, unknown>> =>
      payload!.findByID({ collection, id: doc.id, locale, draft, fallbackLocale, depth: 0 }) as unknown as Promise<Record<string, unknown>>
    const english: Record<string, unknown> = await read('en')
    for (const locale of ['kh', 'cn'] as const) {
      const missing = await read(locale)
      const fallback = await read(locale, false, 'en')
      for (const [field] of fixture.fields) {
        assert.ok(missing[field] == null, `${collection}.${field}: PG does not clone ${locale}`)
        assert.equal(fallback[field], english[field])
      }
      await payload.update({ collection, id: doc.id, locale, data: { ...translatedSeed, ...values(locale), _status: 'published' } as never })
    }
    for (const locale of locales) {
      const before = await Promise.all(locales.map((other) => read(other)))
      await payload.update({ collection, id: doc.id, locale, data: { ...values(`${locale}-edited`), _status: 'published' } as never })
      for (const [index, other] of locales.entries()) {
        const after = await read(other)
        for (const [field] of fixture.fields) assert.equal(after[field], other === locale ? values(`${locale}-edited`)[field] : before[index][field])
        for (const field of fixture.shared ?? []) assert.equal(after[field], english[field])
      }
    }
    const published = await Promise.all(locales.map((locale) => read(locale)))
    const historical: { docs: { id: number | string; version: unknown }[] } = await payload.findVersions({ collection, locale: 'all', pagination: false, where: { parent: { equals: doc.id } } })
    for (const locale of locales) {
      const before = await Promise.all(locales.map((other) => read(other, true)))
      await payload.update({ collection, id: doc.id, locale, draft: true, data: values(`${locale}-draft`) as never })
      for (const [index, other] of locales.entries()) {
        for (const [field] of fixture.fields) {
          assert.equal((await read(other, true))[field], other === locale ? values(`${locale}-draft`)[field] : before[index][field])
          assert.equal((await read(other))[field], published[index][field])
        }
      }
    }
    const afterVersions: { docs: { id: number | string; version: unknown }[] } = await payload.findVersions({ collection, locale: 'all', pagination: false, where: { parent: { equals: doc.id } } })
    for (const old of historical.docs) assert.deepEqual(afterVersions.docs.find((row) => row.id === old.id)?.version, old.version)
    console.log(`PASS: Payload-generated PG SQL ${collection}: EN/KH/CN published and draft edits isolated; fallback, shared fields, and history preserved`)
  }
} finally {
  if (payload) {
    const payloadPool = (payload.db as unknown as { pool: pg.Pool }).pool
    await payload.destroy()
    await payloadPool.end()
  }
  if (committed) {
    // This database was asserted empty before this run; remove only this run's fixture schema.
    await client.query('DROP SCHEMA public CASCADE')
    await client.query('CREATE SCHEMA public')
  } else await client.query('ROLLBACK')
  client.release()
  await pool.end()
}
