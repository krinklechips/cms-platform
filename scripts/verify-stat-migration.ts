import assert from 'node:assert/strict'
import pg from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { up } from '../src/migrations/20261020_095018_stat_values_localized'

const uri = 'postgres://cms_fixture@127.0.0.1:55438/postgres'
if (process.env.MIGRATION_TEST_DATABASE_URI !== uri) throw new Error('Requires the disposable localhost migration fixture')
const pool = new pg.Pool({ connectionString: uri })
const client = await pool.connect()
try {
  await client.query('CREATE SCHEMA stat_migration_fixture')
  await client.query('SET search_path TO stat_migration_fixture')
  await client.query(`
    CREATE TYPE "_locales" AS ENUM ('en', 'kh', 'cn');
    CREATE TABLE site_stats (id serial PRIMARY KEY, display_value varchar, suffix varchar, updated_at timestamptz);
    CREATE TABLE site_stats_locales (id serial PRIMARY KEY, _parent_id integer, _locale "_locales", label varchar, UNIQUE (_parent_id, _locale));
    CREATE TABLE _site_stats_v (id serial PRIMARY KEY, parent_id integer, version_display_value varchar, version_suffix varchar, latest boolean, version__status varchar);
    CREATE TABLE _site_stats_v_locales (id serial PRIMARY KEY, _parent_id integer, _locale "_locales", version_label varchar, UNIQUE (_parent_id, _locale));
    INSERT INTO site_stats VALUES (1, '30 yrs', ' yrs', '2026-10-20T00:00:00Z');
    INSERT INTO site_stats_locales (_parent_id, _locale, label) VALUES (1, 'en', 'English label'), (1, 'kh', 'Saved Khmer label');
    INSERT INTO _site_stats_v VALUES (1, 1, '29 yrs', ' yrs', false, 'published'), (2, 1, 'Saved private draft', ' draft suffix', true, 'draft');
    INSERT INTO _site_stats_v_locales (_parent_id, _locale, version_label) VALUES (1, 'en', 'Older label'), (2, 'kh', 'Private draft label');
  `)
  const parentBefore = (await client.query('SELECT * FROM site_stats')).rows
  const versionsBefore = (await client.query('SELECT * FROM _site_stats_v ORDER BY id')).rows
  await up({ db: drizzle(client) } as never)
  assert.deepEqual((await client.query('SELECT id, display_value, suffix, updated_at FROM site_stats')).rows, parentBefore, 'The original published columns and timestamp must remain intact')
  assert.deepEqual((await client.query('SELECT id, parent_id, version_display_value, version_suffix, latest, version__status FROM _site_stats_v ORDER BY id')).rows, versionsBefore, 'The original draft and version rows must remain intact')
  const localized = (await client.query('SELECT _locale, display_value, suffix, label FROM site_stats_locales ORDER BY _locale')).rows
  assert.deepEqual(localized, [
    { _locale: 'en', display_value: '30 yrs', suffix: ' yrs', label: 'English label' },
    { _locale: 'kh', display_value: '30 yrs', suffix: ' yrs', label: 'Saved Khmer label' },
    { _locale: 'cn', display_value: '30 yrs', suffix: ' yrs', label: null },
  ])
  const versions = (await client.query('SELECT _parent_id, _locale, version_display_value, version_suffix FROM _site_stats_v_locales ORDER BY _parent_id, _locale')).rows
  assert.equal(versions.length, 6)
  for (const row of versions) {
    assert.equal(row.version_display_value, row._parent_id === 1 ? '29 yrs' : 'Saved private draft')
    assert.equal(row.version_suffix, row._parent_id === 1 ? ' yrs' : ' draft suffix')
  }
  assert.equal((await client.query("SELECT version_label FROM _site_stats_v_locales WHERE _parent_id=2 AND _locale='kh'")).rows[0].version_label, 'Private draft label')
  console.log('PASS: Postgres migration preserves published fields, private drafts, labels and every older version in all three locales')
} finally {
  await client.query('DROP SCHEMA IF EXISTS stat_migration_fixture CASCADE')
  client.release()
  await pool.end()
}
