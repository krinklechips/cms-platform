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

const name = '20261106_030000_home_services'
const belongs = (table: string) => /^public\._?home_services(?:_|$)/.test(table)
test('the new snapshot retains every predecessor schema definition', () => {
  const previous = JSON.parse(readFileSync(new URL('../src/migrations/20261102_063727_meanpack_website.json', import.meta.url), 'utf8'))
  const current = JSON.parse(readFileSync(new URL(`../src/migrations/${name}.json`, import.meta.url), 'utf8'))
  assert.equal(current.prevId, previous.id)
  const added = Object.keys(current.tables).filter(belongs)
  assert.equal(added.length, 4)
  for (const table of added) { assert.equal(current.tables[table].isRLSEnabled, true); delete current.tables[table] }
  for (const key of Object.keys(current.enums)) if (/^public\.enum__?home_services_/.test(key)) delete current.enums[key]
  const relation = current.tables['public.payload_locked_documents_rels']
  for (const section of ['columns', 'indexes', 'foreignKeys']) for (const key of Object.keys(relation[section])) if (key.includes('home_services')) delete relation[section][key]
  assert.deepEqual({ ...current, id: previous.id, prevId: previous.prevId }, previous)
})

const bin = '/opt/homebrew/opt/postgresql@18/bin'
test('PostgreSQL migration adds only new section storage and preserves all old rows, drafts and versions', {
  timeout: 120000, skip: !existsSync(path.join(bin, 'initdb')) ? 'Owned PostgreSQL fixture unavailable' : false,
}, async t => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'home-services-migration-'))
  const server = net.createServer()
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  const port = (server.address() as net.AddressInfo).port
  await new Promise<void>(resolve => server.close(() => resolve()))
  const command = (name: string, args: string[]) => execFileSync(path.join(bin, name), args, { encoding: 'utf8', env: { PATH: process.env.PATH, HOME: dir, LC_ALL: 'C', NODE_ENV: 'test' } })
  let running = false
  let pool: pg.Pool | undefined
  try {
    command('initdb', ['-D', path.join(dir, 'cluster'), '-U', 'section_fixture', '-A', 'trust', '--no-locale'])
    command('pg_ctl', ['-D', path.join(dir, 'cluster'), '-l', path.join(dir, 'pg.log'), '-o', `-h 127.0.0.1 -p ${port} -k ${dir}`, '-w', 'start'])
    running = true
    pool = new pg.Pool({ host: '127.0.0.1', port, user: 'section_fixture', database: 'postgres' })
    const args = { db: drizzle(pool) } as never
    const migration = migrations.find(m => m.name === name)!
    assert.ok(migration)
    for (const old of migrations.slice(0, migrations.indexOf(migration))) await old.up(args)
    const tenant = (await pool.query("INSERT INTO tenants (name,slug) VALUES ('Section fixture','section-fixture') RETURNING id")).rows[0].id
    const hero = (await pool.query("INSERT INTO homepage (tenant_id,_status) VALUES ($1,'published') RETURNING id", [tenant])).rows[0].id
    const version = (await pool.query("INSERT INTO _homepage_v (parent_id,version_tenant_id,version__status,latest) VALUES ($1,$2,'draft',true) RETURNING id", [hero, tenant])).rows[0].id
    for (const locale of ['en','kh','cn']) {
      await pool.query('INSERT INTO homepage_locales (_parent_id,_locale,hero_pill) VALUES ($1,$2,$3)', [hero,locale,`${locale} published`])
      await pool.query('INSERT INTO _homepage_v_locales (_parent_id,_locale,version_hero_pill) VALUES ($1,$2,$3)', [version,locale,`${locale} private draft`])
    }
    const quote = (s: string) => `"${s.replaceAll('"','""')}"`
    const tables = (await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename")).rows.map(row => row.tablename)
    const before = new Map<string, { columns: string[]; rows: unknown[] }>()
    for (const table of tables) {
      const columns = (await pool.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position", [table])).rows.map(row => row.column_name)
      before.set(table, { columns, rows: (await pool.query(`SELECT * FROM ${quote(table)} ORDER BY id`)).rows })
    }
    await migration.up(args)
    for (const [table, saved] of before) assert.deepEqual((await pool.query(`SELECT ${saved.columns.map(quote).join(',')} FROM ${quote(table)} ORDER BY id`)).rows, saved.rows, table)
    assert.equal((await pool.query("SELECT count(*)::int n FROM pg_tables WHERE schemaname='public'")).rows[0].n, tables.length + 4)
    const secure = (await pool.query("SELECT relname,relrowsecurity FROM pg_class WHERE relname IN ('home_services','home_services_locales','_home_services_v','_home_services_v_locales')")).rows
    assert.equal(secure.length, 4); assert.ok(secure.every(row => row.relrowsecurity))
    await pool.query('INSERT INTO home_services (tenant_id) VALUES ($1)', [tenant])
    await assert.rejects(() => pool!.query('INSERT INTO home_services (tenant_id) VALUES ($1)', [tenant]), /unique|duplicate/i)
    await assert.rejects(() => migration.down(args), /retained|Roll back/i)
    t.diagnostic(`Preserved every old row across ${tables.length} predecessor tables; four RLS-protected tables added; duplicate tenant rejected; destructive rollback refused`)
  } finally {
    await pool?.end()
    if (running) command('pg_ctl', ['-D', path.join(dir, 'cluster'), '-m', 'immediate', '-w', 'stop'])
    await rm(dir, { recursive: true, force: true })
  }
})
