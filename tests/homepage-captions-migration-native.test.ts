import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { drizzle } from '@payloadcms/db-postgres/drizzle/node-postgres'
import pg from 'pg'
import { migrations } from '../src/migrations'

const postgresBin = '/opt/homebrew/opt/postgresql@18/bin'
const name = '20261023_040000_homepage_captions'
const quote = (value: string) => `"${value.replaceAll('"', '""')}"`

test('isolated PG18 caption migration preserves all existing rows and defaults, leaving old caption values null', {
  skip: !existsSync(path.join(postgresBin, 'initdb')) || !existsSync(path.join(postgresBin, 'pg_ctl'))
    ? 'Local PostgreSQL 18 binaries unavailable' : false,
  timeout: 120000,
}, async t => {
  const migration = migrations.find(migration => migration.name === name)
  assert.ok(migration)
  const dir = await mkdtemp(path.join(os.tmpdir(), 'homepage-caption-pg-'))
  const cluster = path.join(dir, 'cluster')
  const server = net.createServer()
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  const port = (server.address() as net.AddressInfo).port
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
  const command = (name: string, args: string[]) => execFileSync(path.join(postgresBin, name), args, {
    encoding: 'utf8', env: { PATH: process.env.PATH, HOME: dir, LC_ALL: 'C', NODE_ENV: 'test' },
  })
  let running = false
  let pool: pg.Pool | undefined
  try {
    command('initdb', ['-D', cluster, '-U', 'caption_fixture', '-A', 'trust', '--no-locale'])
    command('pg_ctl', ['-D', cluster, '-l', path.join(dir, 'postgres.log'), '-o', `-h 127.0.0.1 -p ${port} -k ${dir}`, '-w', 'start'])
    running = true
    pool = new pg.Pool({ host: '127.0.0.1', port, user: 'caption_fixture', database: 'postgres' })
    const db = pool
    assert.equal((await db.query("SELECT count(*)::int n FROM information_schema.tables WHERE table_schema='public'")).rows[0].n, 0)
    const args = { db: drizzle(db) } as never
    for (const previous of migrations.slice(0, migrations.indexOf(migration))) await previous.up(args)
    const tenant = (await db.query("INSERT INTO tenants (name,slug) VALUES ('Caption fixture','caption-fixture') RETURNING id")).rows[0].id
    const home = (await db.query("INSERT INTO homepage (tenant_id,_status) VALUES ($1,'published') RETURNING id", [tenant])).rows[0].id
    const version = (await db.query(`INSERT INTO _homepage_v (parent_id,version_tenant_id,version__status,latest)
      VALUES ($1,$2,'draft',true) RETURNING id`, [home, tenant])).rows[0].id
    for (const locale of ['en', 'kh', 'cn']) {
      await db.query('INSERT INTO homepage_locales (_parent_id,_locale,hero_pill) VALUES ($1,$2,$3)', [home, locale, `${locale} published pill`])
      await db.query('INSERT INTO _homepage_v_locales (_parent_id,_locale,version_hero_pill) VALUES ($1,$2,$3)', [version, locale, `${locale} private draft pill`])
    }
    const columns = async () => (await db.query(`SELECT table_name,column_name,column_default,is_nullable,data_type
      FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name,ordinal_position`)).rows
    const beforeColumns = await columns()
    const tables = (await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name")).rows
    const before = new Map<string, { columns: string[]; rows: Record<string, unknown>[] }>()
    for (const { table_name: table } of tables) {
      before.set(table, { columns: beforeColumns.filter(column => column.table_name === table).map(column => column.column_name),
        rows: (await db.query(`SELECT * FROM ${quote(table)} ORDER BY id`)).rows })
    }
    await migration.up(args)
    const additions = new Set(['homepage_locales.show_captions', '_homepage_v_locales.version_show_captions'])
    const afterColumns = await columns()
    assert.deepEqual(afterColumns.filter(column => !additions.has(`${column.table_name}.${column.column_name}`)), beforeColumns,
      'Every existing column type, nullability and default must be unchanged')
    assert.deepEqual(afterColumns.filter(column => additions.has(`${column.table_name}.${column.column_name}`)), [
      { table_name: '_homepage_v_locales', column_name: 'version_show_captions', column_default: null, is_nullable: 'YES', data_type: 'boolean' },
      { table_name: 'homepage_locales', column_name: 'show_captions', column_default: null, is_nullable: 'YES', data_type: 'boolean' },
    ])
    for (const [table, saved] of before) {
      assert.deepEqual((await db.query(`SELECT ${saved.columns.map(quote).join(',')} FROM ${quote(table)} ORDER BY id`)).rows,
        saved.rows, `${table}: preserve all old rows, timestamps, translations, defaults and draft versions`)
    }
    assert.deepEqual((await db.query('SELECT show_captions FROM homepage_locales ORDER BY id')).rows, Array(3).fill({ show_captions: null }))
    assert.deepEqual((await db.query('SELECT version_show_captions FROM _homepage_v_locales ORDER BY id')).rows, Array(3).fill({ version_show_captions: null }))
    await assert.rejects(() => migration.down(args), /refus|discard/i)
    t.diagnostic(`Preserved old rows and column definitions across ${before.size} tables in a fresh owned PostgreSQL 18 cluster`)
  } finally {
    await pool?.end()
    if (running) command('pg_ctl', ['-D', cluster, '-m', 'immediate', '-w', 'stop'])
    await rm(dir, { recursive: true, force: true })
  }
})
