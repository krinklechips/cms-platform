import assert from 'node:assert/strict'
import pg from 'pg'
import { drizzle } from '@payloadcms/db-postgres/drizzle/node-postgres'
import { up } from '../src/migrations/20261020_105541_cms_localized_field_coverage'

const uri = 'postgres://cms_fixture@127.0.0.1:55439/cms_full_upgrade_fixture'
if (process.env.UPGRADE_TEST_DATABASE_URI !== uri) throw new Error('Requires the disposable full-upgrade fixture database')
const quote = (name: string) => `"${name.replaceAll('"', '""')}"`
const client = new pg.Client({ connectionString: uri })
await client.connect()
type TableSnapshot = { name: string; columns: string[]; ids: unknown[]; rows: number; hash: string }
const digest = async (name: string, columns: string[], ids?: unknown[]) => {
  const result = await client.query<{ rows: number; hash: string }>(`
    SELECT count(*)::int AS rows,
      md5(COALESCE(string_agg(md5(to_jsonb(r)::text), '' ORDER BY md5(to_jsonb(r)::text)), '')) AS hash
    FROM (SELECT ${columns.map(quote).join(',')} FROM ${quote(name)}
      ${ids ? 'WHERE id = ANY($1)' : ''}) r`, ids ? [ids] : [])
  return result.rows[0]
}

try {
  await client.query('BEGIN')
  await client.query("SET LOCAL timezone='UTC'")
  const names = (await client.query<{ table_name: string }>(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name`)).rows
  assert.equal(names.length, 490, 'Must be the restored hosted baseline, not an empty generated schema')
  const before: TableSnapshot[] = []
  for (const { table_name: name } of names) {
    const columns = (await client.query<{ column_name: string }>(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position`, [name])).rows.map((row) => row.column_name)
    assert.ok(columns.includes('id'), `${name}: stable row identity required`)
    const ids = (await client.query(`SELECT id FROM ${quote(name)}`)).rows.map((row) => row.id)
    before.push({ name, columns, ids, ...await digest(name, columns) })
  }
  await up({ db: drizzle(client) } as never)
  let oldRows = 0
  let addedEnglishRows = 0
  for (const saved of before) {
    const after = await digest(saved.name, saved.columns, saved.ids)
    assert.equal(after.rows, saved.rows, `${saved.name}: an existing row was removed`)
    assert.equal(after.hash, saved.hash, `${saved.name}: an existing column value was changed`)
    oldRows += saved.rows
    const added = (await client.query(`SELECT * FROM ${quote(saved.name)} WHERE NOT (id=ANY($1))`, [saved.ids])).rows
    if (added.length) {
      assert.ok(saved.name.endsWith('_locales'), `${saved.name}: unexpected new records`)
      assert.ok(added.every((row) => row._locale === 'en'), `${saved.name}: copied English into another language`)
      addedEnglishRows += added.length
    }
  }
  const originalNames = new Set(before.map(({ name }) => name))
  const afterNames = (await client.query<{ table_name: string }>(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name`)).rows
  for (const { table_name: name } of afterNames) {
    if (originalNames.has(name)) continue
    assert.ok(name.endsWith('_locales'), `${name}: only new localization tables expected`)
    const { rows } = await client.query(`SELECT _locale FROM ${quote(name)}`)
    assert.ok(rows.every((row) => row._locale === 'en'), `${name}: new tables must contain EN-only recovery rows`)
    addedEnglishRows += rows.length
  }
  const cases = (await client.query('SELECT category_key FROM clinical_cases')).rows
  assert.equal(cases.length, 11)
  assert.ok(cases.every((row) => typeof row.category_key === 'string'), 'All existing clinical cases have canonical categories')
  console.log(`PASS: full hosted-backup upgrade preserves all ${before.length} original tables / ${oldRows} rows and every old column, including drafts/history; ${addedEnglishRows} EN-only recovery rows; all 11 clinical categories mapped; fixture rolled back`)
} finally {
  await client.query('ROLLBACK')
  await client.end()
}
