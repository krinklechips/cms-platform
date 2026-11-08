import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { drizzle } from '@payloadcms/db-postgres/drizzle/node-postgres'
import pg from 'pg'
import { migrations } from '../src/migrations'

const name = '20261108_030000_service_section_spacing'
test('spacing snapshot adds exactly 26 nullable columns and one enum, retaining every predecessor definition', () => {
  const previous = JSON.parse(readFileSync(new URL('../src/migrations/20261106_030000_home_services.json', import.meta.url), 'utf8'))
  const next = JSON.parse(readFileSync(new URL(`../src/migrations/${name}.json`, import.meta.url), 'utf8'))
  assert.equal(next.prevId, previous.id)
  let count = 0
  for (const [key, table] of Object.entries(next.tables) as [string, { columns: Record<string, { notNull: boolean; default?: unknown }> }][]) {
    if (!table.columns.section_spacing) continue
    assert.match(key, /^public\.(services|_services_v)_blocks_/)
    assert.equal(table.columns.section_spacing.notNull, false)
    assert.equal(table.columns.section_spacing.default, undefined)
    delete table.columns.section_spacing; count++
  }
  assert.equal(count, 26)
  assert.deepEqual(next.enums['public.service_section_spacing'].values, ['default', 'compact', 'none'])
  delete next.enums['public.service_section_spacing']
  assert.deepEqual({ ...next, id: previous.id, prevId: previous.prevId }, previous)
  assert.ok(migrations.some(migration => migration.name === name), 'The safe additive migration must be registered')
})

const bin = '/opt/homebrew/opt/postgresql@18/bin'
test('PostgreSQL spacing migration preserves every old table column, published locale, draft and version', {
  timeout: 120000, skip: !existsSync(path.join(bin, 'initdb')) ? 'Owned PostgreSQL fixture unavailable' : false,
}, async t => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'service-layout-migration-'))
  const listener = net.createServer()
  await new Promise<void>(resolve => listener.listen(0, '127.0.0.1', resolve))
  const port = (listener.address() as net.AddressInfo).port
  await new Promise<void>(resolve => listener.close(() => resolve()))
  const command = (name: string, args: string[]) => execFileSync(path.join(bin, name), args, {
    encoding: 'utf8', env: { PATH: process.env.PATH, HOME: dir, LC_ALL: 'C', NODE_ENV: 'test' },
  })
  let running = false
  let pool: pg.Pool | undefined
  try {
    command('initdb', ['-D', path.join(dir, 'cluster'), '-U', 'layout_fixture', '-A', 'trust', '--no-locale'])
    command('pg_ctl', ['-D', path.join(dir, 'cluster'), '-l', path.join(dir, 'pg.log'), '-o', `-h 127.0.0.1 -p ${port} -k ${dir}`, '-w', 'start'])
    running = true
    pool = new pg.Pool({ host: '127.0.0.1', port, user: 'layout_fixture', database: 'postgres' })
    const args = { db: drizzle(pool) } as never
    const index = migrations.findIndex(migration => migration.name === name)
    assert.ok(index > 0)
    for (const old of migrations.slice(0, index)) await old.up(args)
    const tenant = (await pool.query("INSERT INTO tenants (name,slug) VALUES ('Layout fixture','layout-fixture') RETURNING id")).rows[0].id
    const service = (await pool.query("INSERT INTO services (tenant_id,slug,_status) VALUES ($1,'fixture','published') RETURNING id", [tenant])).rows[0].id
    const version = (await pool.query("INSERT INTO _services_v (parent_id,version_tenant_id,version__status,latest) VALUES ($1,$2,'draft',true) RETURNING id", [service, tenant])).rows[0].id
    for (const locale of ['en', 'kh', 'cn']) {
      await pool.query('INSERT INTO services_locales (_parent_id,_locale,name) VALUES ($1,$2,$3)', [service, locale, `${locale} published title`])
      await pool.query('INSERT INTO _services_v_locales (_parent_id,_locale,version_name) VALUES ($1,$2,$3)', [version, locale, `${locale} private title`])
      await pool.query('INSERT INTO services_blocks_text (_order,_parent_id,_path,_locale,id,body) VALUES (1,$1,$2,$3,$4,$5)', [service, 'sections', locale, `published-${locale}`, `${locale} published wording`])
      await pool.query('INSERT INTO _services_v_blocks_text (_order,_parent_id,_path,_locale,_uuid,body) VALUES (1,$1,$2,$3,$4,$5)', [version, 'version.sections', locale, `draft-${locale}`, `${locale} private wording`])
    }
    const quote = (s: string) => `"${s.replaceAll('"', '""')}"`
    const tables = (await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename")).rows.map(row => row.tablename)
    const before = new Map<string, { columns: string[]; rows: unknown[] }>()
    for (const table of tables) {
      const columns = (await pool.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position", [table])).rows.map(row => row.column_name)
      before.set(table, { columns, rows: (await pool.query(`SELECT * FROM ${quote(table)} ORDER BY id`)).rows })
    }
    await migrations[index].up(args)
    for (const [table, saved] of before) assert.deepEqual((await pool.query(`SELECT ${saved.columns.map(quote).join(',')} FROM ${quote(table)} ORDER BY id`)).rows, saved.rows, table)
    assert.equal((await pool.query("SELECT count(*)::int n FROM pg_tables WHERE schemaname='public'")).rows[0].n, tables.length)
    assert.ok((await pool.query('SELECT section_spacing FROM services_blocks_text')).rows.every(row => row.section_spacing === null))
    await pool.query("UPDATE services_blocks_text SET section_spacing='compact' WHERE _locale='kh'")
    await assert.rejects(() => migrations[index].down(args), /retained|Roll back/i)
    assert.equal((await pool.query("SELECT section_spacing FROM services_blocks_text WHERE _locale='kh'")).rows[0].section_spacing, 'compact')
    t.diagnostic(`Preserved all predecessor columns/rows across ${tables.length} tables; no backfill; destructive downgrade refused`)
  } finally {
    await pool?.end()
    if (running) command('pg_ctl', ['-D', path.join(dir, 'cluster'), '-m', 'immediate', '-w', 'stop'])
    await rm(dir, { recursive: true, force: true })
  }
})
