import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import pg from 'pg'
import { postgresAdapter, type PostgresAdapter } from '@payloadcms/db-postgres'
import { drizzle } from '@payloadcms/db-postgres/drizzle/node-postgres'
import { getPayload, type Payload } from 'payload'
import { buildFindManyArgs } from '../node_modules/@payloadcms/drizzle/dist/find/buildFindManyArgs.js'
import { migrations } from '../src/migrations'
import * as repair from '../src/migrations/20261111_030000_nested_block_copies'
import { loadPayloadConfig } from './helpers/load-payload-config'
import { locales, nestedBlockFixture, wording } from './fixtures/nested-blocks'

const binaries = '/opt/homebrew/opt/postgresql@18/bin'
const quote = (value: string) => `"${value.replaceAll('"', '""')}"`
const sources = ['services_blocks_text_2', 'services_blocks_callout_3', 'technology_blocks_text_2', 'technology_blocks_image_3',
  '_services_v_blocks_text_2', '_services_v_blocks_callout_3', '_technology_v_blocks_text_2', '_technology_v_blocks_image_3']
const nativeError = (error: unknown): Error => {
  while (error instanceof Error && error.cause) error = error.cause
  return error as Error
}

test('additive nested block repair preserves published locales, latest drafts and all history through the native reader', {
  timeout: 120000, skip: existsSync(`${binaries}/initdb`) ? false : 'Local PostgreSQL unavailable',
}, async t => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cms-nested-pg-'))
  const cluster = path.join(dir, 'cluster')
  const socket = net.createServer()
  await new Promise<void>(resolve => socket.listen(0, '127.0.0.1', resolve))
  const port = (socket.address() as net.AddressInfo).port
  await new Promise<void>(resolve => socket.close(() => resolve()))
  const command = (name: string, args: string[]) => execFileSync(`${binaries}/${name}`, args, {
    encoding: 'utf8', env: { PATH: process.env.PATH, HOME: dir, LC_ALL: 'C', NODE_ENV: 'test' },
  })
  let running = false
  let client: pg.Client | undefined
  let pool: pg.Pool | undefined
  let cms: Payload | undefined
  try {
    command('initdb', ['-D', cluster, '-U', 'nested_fixture', '-A', 'trust', '--no-locale', '--encoding=UTF8'])
    command('pg_ctl', ['-D', cluster, '-l', path.join(dir, 'postgres.log'), '-o', `-h 127.0.0.1 -p ${port} -k ${dir}`, '-w', 'start'])
    running = true
    const uri = `postgres://nested_fixture@127.0.0.1:${port}/postgres`
    client = new pg.Client({ connectionString: uri }); await client.connect()
    const db = client
    const args = { db: drizzle(db) } as never
    for (const migration of migrations) await migration.up(args)
    const insert = async (table: string, row: Record<string, unknown>) => {
      const columns = Object.keys(row)
      return (await db.query(`INSERT INTO ${quote(table)} (${columns.map(quote).join(',')})
        VALUES (${columns.map((_, i) => `$${i + 1}`).join(',')}) RETURNING id`, Object.values(row))).rows[0].id as number
    }
    // Roomchang intentionally is NOT tenant 1.
    const otherTenant = await insert('tenants', { name: 'Other synthetic tenant', slug: 'other-fixture' })
    const tenant = await insert('tenants', { name: 'Synthetic Roomchang fixture', slug: 'roomchang' })
    const media = await insert('media', { tenant_id: tenant, filename: 'synthetic-only.png',
      url: 'https://example.invalid/synthetic-only.png', mime_type: 'image/png', width: 640, height: 480 })
    const parents = new Map<'services' | 'technology', number>()
    const otherParents = new Map<'services' | 'technology', number>()
    for (const owner of [tenant, otherTenant]) for (const collection of ['services', 'technology'] as const) {
      const parent = await insert(collection, { tenant_id: owner, slug: 'synthetic-nested', _status: 'published' })
      const parentMap = owner === tenant ? parents : otherParents
      parentMap.set(collection, parent)
      // Match the audited row counts without including any real editorial content.
      const versions = owner === otherTenant ? 1 : collection === 'services' ? 17 : 16
      for (let i = -1; i < versions; i++) {
        const phase = `${owner === otherTenant ? 'other-' : ''}${i === -1 ? 'published' : i === versions - 1 ? 'draft' : `history-${i}`}`
        const version = i === -1 ? undefined : await insert(`_${collection}_v`, {
          parent_id: parent, version_tenant_id: owner, version_slug: 'synthetic-nested',
          version__status: 'draft', latest: i === versions - 1,
          created_at: new Date(Date.UTC(2026, 0, i + 1)), updated_at: new Date(Date.UTC(2026, 0, i + 1)),
        })
        for (const locale of locales) await insert(version ? `_${collection}_v_locales` : `${collection}_locales`, {
          _parent_id: version ?? parent, _locale: locale,
          [version ? 'version_name' : 'name']: `${locale} ${phase}`,
          [version ? 'version_content' : 'content']: JSON.stringify([{ type: 'text', body: 'STALE JSON - NEVER COPY' }]),
        })
        for (const [table, rows] of Object.entries(nestedBlockFixture(collection, version ?? parent, phase, media, !!version))) {
          for (const row of rows) {
            const id = await insert(table, row)
            if (table.endsWith('_blocks_callout')) await insert(`${table}_stats`, {
              _parent_id: id, _order: 1, _locale: row._locale, value: '7', label: `${phase} untouched stat`,
              [version ? '_uuid' : 'id']: `${row[version ? '_uuid' : 'id']}-stat`,
            })
          }
        }
      }
    }
    const config = await loadPayloadConfig()
    cms = await getPayload({ key: randomUUID(), config: { ...config, secret: 'isolated-nested-read-test', telemetry: false,
      db: postgresAdapter({ pool: {}, push: false }) as typeof config.db, typescript: { ...config.typescript, autoGenerate: false } },
      disableDBConnect: true, disableOnInit: true, cron: false })
    pool = new pg.Pool({ connectionString: uri })
    const adapter = cms.db as unknown as PostgresAdapter
    adapter.pool = pool; adapter.drizzle = drizzle({ client: pool, schema: adapter.schema }); adapter.resolveInitializing?.()
    const payload = cms
    for (const collection of ['services', 'technology'] as const) {
      const field = payload.collections[collection].config.flattenedFields.find(field => field.name === 'sections')!
      const readAdapter = adapter as unknown as Parameters<typeof buildFindManyArgs>[0]['adapter']
      const joins = buildFindManyArgs({ adapter: readAdapter, fields: [field], tableName: collection, depth: 0 }).with!
      assert.ok(joins._blocks_text)
      assert.equal(joins._blocks_text_2, undefined, 'Native schema no longer joins obsolete nested tables')
      const before = await payload.findByID({ collection, id: parents.get(collection)!, depth: 0, locale: 'en', fallbackLocale: false })
      const sections = before.sections as unknown as { left?: unknown[]; right?: unknown[] }[]
      assert.equal(sections[collection === 'services' ? 0 : 2].left?.length ?? 0, 0, 'Reproduce the dropped stored left column')
    }

    const tables = (await db.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename")).rows.map(row => row.tablename as string)
    const snapshot = async () => {
      const rows: Record<string, { id: string; fingerprint: string }[]> = {}
      for (const table of tables) rows[table] = (await db.query(`SELECT id::text, to_jsonb(t) AS data FROM ${quote(table)} t ORDER BY id`)).rows
        .map(row => ({ id: row.id, fingerprint: createHash('sha256').update(JSON.stringify(row.data)).digest('hex') }))
      return rows
    }
    const schema = async () => (await db.query(`SELECT table_name,column_name,udt_name,is_nullable,column_default
      FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name,ordinal_position`)).rows
    const sequences = async () => {
      const values = []
      for (const source of sources.filter(source => source.startsWith('_'))) {
        values.push((await db.query(`SELECT last_value,is_called FROM ${quote(`${source.slice(0, -2)}_id_seq`)}`)).rows[0])
      }
      return values
    }
    const rejectChange = async (name: string, change: () => Promise<unknown>, message: RegExp) => t.test(name, async () => {
      await db.query('BEGIN')
      try {
        await change()
        const before = await snapshot()
        const beforeSequences = await sequences()
        await db.query('SAVEPOINT repair_attempt')
        await assert.rejects(async () => {
          try { await repair.up(args) }
          catch (error) { await db.query('ROLLBACK TO repair_attempt'); throw nativeError(error) }
        }, message)
        assert.deepEqual(await snapshot(), before, 'Failure must retain every row fingerprint, including earlier copy candidates')
        assert.deepEqual(await sequences(), beforeSequences, 'Preflight failures must not consume destination IDs')
      } finally { await db.query('ROLLBACK') }
    })
    const cloneSource = async (source: string, target: string, overrides: Record<string, unknown>) => {
      const row = (await db.query(`SELECT s.* FROM ${quote(source)} s JOIN ${quote(source.split('_blocks_')[0])} p ON p.id=s._parent_id
        WHERE p.${source.startsWith('_') ? 'version_tenant_id' : 'tenant_id'}=$1 ORDER BY s.id LIMIT 1`, [tenant])).rows[0]
      if (source.startsWith('_')) delete row.id
      return insert(target, Object.fromEntries(Object.entries({ ...row, ...overrides }).filter(([, value]) => value !== undefined)))
    }
    await rejectChange('missing tenant fails closed', () => db.query("UPDATE tenants SET slug='roomchang-renamed' WHERE id=$1", [tenant]), /exactly one Roomchang tenant/)
    await rejectChange('published ID cannot be reused at another address', () => cloneSource('technology_blocks_text_2', 'technology_blocks_text', { _path: 'sections', _order: 8 }), /conflicting.*identity, address or value/)
    await rejectChange('published address cannot contain another ID', () => cloneSource('technology_blocks_text_2', 'technology_blocks_text', { id: 'conflicting-new-id' }), /conflicting.*identity, address or value/)
    await rejectChange('published copy with changed value is not overwritten', () => cloneSource('technology_blocks_text_2', 'technology_blocks_text', { body: 'different editor wording' }), /conflicting.*identity, address or value/)
    await rejectChange('cross-type nested address conflicts', () => cloneSource('services_blocks_text_2', 'services_blocks_callout', {
      id: 'different-block-type', heading: undefined, card: undefined, title: 'Another type',
    }), /conflicting.*identity, address or value/)
    await rejectChange('version UUID cannot move to another address', () => cloneSource('_technology_v_blocks_text_2', '_technology_v_blocks_text', { _path: 'version.sections', _order: 8 }), /conflicting.*identity, address or value/)
    await rejectChange('version address cannot contain another UUID', () => cloneSource('_technology_v_blocks_text_2', '_technology_v_blocks_text', { _uuid: 'another-version-uuid' }), /conflicting.*identity, address or value/)
    await rejectChange('version value conflict aborts before any copy', () => cloneSource('_technology_v_blocks_image_3', '_technology_v_blocks_image', { caption: 'changed draft caption' }), /conflicting.*identity, address or value/)
    await rejectChange('published child arrays require a separate approved repair', async () => {
      const parent = (await db.query('SELECT id,_locale FROM services_blocks_callout_3 WHERE _parent_id=$1 LIMIT 1', [parents.get('services')])).rows[0]
      await insert('services_blocks_callout_3_stats', { _parent_id: parent.id, _locale: parent._locale, _order: 1, id: 'obsolete-stat', value: '9', label: 'must survive' })
    }, /unhandled populated obsolete table/)
    await rejectChange('version child arrays require a separate approved repair', async () => {
      const parent = (await db.query('SELECT id,_locale FROM _services_v_blocks_callout_3 ORDER BY id LIMIT 1')).rows[0]
      await insert('_services_v_blocks_callout_3_stats', { _parent_id: parent.id, _locale: parent._locale, _order: 1, _uuid: 'obsolete-draft-stat', value: '9', label: 'private stat' })
    }, /unhandled populated obsolete table/)
    await rejectChange('unknown populated old block type is not ignored', () => cloneSource('services_blocks_text_2', 'services_blocks_text_3', { id: 'unsupported-old-row' }), /unhandled populated obsolete table/)
    await rejectChange('unexpected source address refuses stale resurrection', () => db.query("UPDATE services_blocks_text_2 SET _path='sections.9.left' WHERE _parent_id=$1", [parents.get('services')]), /unexpected source address/)
    await rejectChange('removed two-column parent refuses stale resurrection', () => db.query("UPDATE services_blocks_twocol SET _order=7 WHERE _parent_id=$1", [parents.get('services')]), /missing or ambiguous two-column parent/)
    await rejectChange('unknown source columns cannot be silently dropped', () => db.query('ALTER TABLE _technology_v_blocks_image_3 ADD COLUMN unknown_editor_value text'), /source values\/columns do not round-trip/)
    await rejectChange('new required target columns fail closed', () => db.query("ALTER TABLE _technology_v_blocks_image ADD COLUMN new_required text NOT NULL DEFAULT 'new value'"), /unsupported required destination column/)
    for (const collection of ['services', 'technology'] as const) {
      await rejectChange(`${collection} version tenant must agree with original parent`, () => db.query(`UPDATE _${collection}_v SET version_tenant_id=$1 WHERE parent_id=$2 AND NOT latest`, [otherTenant, parents.get(collection)]), /inconsistent version\/original tenant ownership/)
      await rejectChange(`${collection} Roomchang version cannot point at another tenant`, () => db.query(`UPDATE _${collection}_v SET parent_id=$1 WHERE version_tenant_id=$2`, [otherParents.get(collection), tenant]), /inconsistent version\/original tenant ownership/)
    }

    await t.test('active source and target writers cause NOWAIT refusal, not partial copies', async () => {
      const writer = new pg.Client({ connectionString: uri }); await writer.connect()
      try {
        for (const table of ['services_blocks_text_2', '_technology_v_blocks_image']) {
          await writer.query('BEGIN')
          try {
            await writer.query(`LOCK TABLE ${quote(table)} IN ROW EXCLUSIVE MODE`)
            const before = await snapshot()
            await assert.rejects(async () => { try { await repair.up(args) } catch (error) { throw nativeError(error) } }, /could not obtain lock/)
            assert.deepEqual(await snapshot(), before)
          } finally { await writer.query('ROLLBACK') }
        }
      } finally { await writer.end() }
    })
    await t.test('late insert failure rolls back earlier copies without a caller transaction', async () => {
      await db.query(`CREATE FUNCTION refuse_nested_fixture() RETURNS trigger LANGUAGE plpgsql AS $$
        BEGIN IF NEW._path='version.sections.2.right' THEN RAISE EXCEPTION 'synthetic late insert refusal'; END IF; RETURN NEW; END $$`)
      await db.query('CREATE TRIGGER refuse_nested_fixture BEFORE INSERT ON _technology_v_blocks_image FOR EACH ROW EXECUTE FUNCTION refuse_nested_fixture()')
      try {
        const before = await snapshot()
        await assert.rejects(async () => { try { await repair.up(args) } catch (error) { throw nativeError(error) } }, /synthetic late insert refusal/)
        assert.deepEqual(await snapshot(), before)
      } finally {
        await db.query('DROP TRIGGER refuse_nested_fixture ON _technology_v_blocks_image')
        await db.query('DROP FUNCTION refuse_nested_fixture()')
      }
    })
    await t.test('partial identical copies and nullable destination extras remain lossless', async () => {
      await db.query('BEGIN')
      try {
        await db.query("ALTER TABLE services_blocks_text ADD COLUMN nullable_extra text DEFAULT 'must not copy default'")
        // Existing identical copies are retained, not inserted twice.
        await cloneSource('technology_blocks_image_3', 'technology_blocks_image', {})
        await repair.up(args)
        const extras = (await db.query("SELECT nullable_extra FROM services_blocks_text WHERE _path='sections.0.left'")).rows
        assert.equal(extras.length, 3)
        assert.ok(extras.every(row => row.nullable_extra === null))
        const once = await snapshot()
        await repair.up(args)
        assert.deepEqual(await snapshot(), once)
      } finally { await db.query('ROLLBACK') }
    })
    // Existing other-tenant arrays must neither be restored nor block Roomchang.
    const otherCallout = (await db.query('SELECT id,_locale FROM services_blocks_callout_3 WHERE _parent_id=$1 LIMIT 1', [otherParents.get('services')])).rows[0]
    await insert('services_blocks_callout_3_stats', { _parent_id: otherCallout.id, _locale: otherCallout._locale, _order: 1, id: 'other-tenant-stat', value: '4', label: 'other tenant only' })
    const retained = await snapshot()
    const retainedSchema = await schema()
    await repair.up(args)
    const repaired = await snapshot()
    let additions = 0
    for (const table of tables) {
      const originalIDs = new Set(retained[table].map(row => row.id))
      assert.deepEqual(repaired[table].filter(row => originalIDs.has(row.id)), retained[table], `${table}: original fingerprints changed`)
      const count = repaired[table].length - retained[table].length
      additions += count
      assert.equal(count, sources.map(source => source.slice(0, -2)).includes(table)
        ? table.startsWith('_services_v') ? 51 : table.startsWith('_technology_v') ? 48 : 3 : 0, `${table}: only approved copies may be added`)
    }
    assert.equal(additions, 210)
    assert.deepEqual(await schema(), retainedSchema, 'Data-only repair must not change schema definitions')
    for (const source of sources) {
      const root = source.split('_blocks_')[0]
      const version = source.startsWith('_')
      const originals = (await db.query(`SELECT s.* FROM ${quote(source)} s JOIN ${quote(root)} p ON p.id=s._parent_id
        WHERE p.${version ? 'version_tenant_id' : 'tenant_id'}=$1`, [tenant])).rows
      for (const original of originals) {
        const copy = (await db.query(`SELECT * FROM ${quote(source.slice(0, -2))} WHERE _parent_id=$1 AND _path=$2 AND _locale=$3 AND _order=$4`,
          [original._parent_id, original._path, original._locale, original._order])).rows
        assert.equal(copy.length, 1)
        if (version) assert.notEqual(copy[0].id, original.id, 'Colliding historical surrogate IDs must be regenerated')
        for (const [column, value] of Object.entries(original)) if (!(version && column === 'id')) assert.deepEqual(copy[0][column], value, `${source}.${column}`)
        for (const column of Object.keys(copy[0])) if (!(column in original)) assert.equal(copy[0][column], null)
      }
    }
    await t.test('idempotent retry and destructive down refusal retain every fingerprint and sequence', async () => {
      const beforeSequences = await sequences()
      await repair.up(args)
      assert.deepEqual(await snapshot(), repaired)
      assert.deepEqual(await sequences(), beforeSequences)
      await assert.rejects(() => repair.down(), /retained.*destructive removal is refused/)
      assert.deepEqual(await snapshot(), repaired)
    })
    await rejectChange('new target nullable settings cannot be silently accepted', () => db.query("UPDATE services_blocks_text SET section_spacing='compact' WHERE _path='sections.0.left'"), /conflicting.*identity, address or value/)
    await rejectChange('new target child content cannot be silently accepted', async () => {
      const parent = (await db.query("SELECT id,_locale FROM _services_v_blocks_callout WHERE _path='version.sections.0.right' ORDER BY id LIMIT 1")).rows[0]
      await insert('_services_v_blocks_callout_stats', { _parent_id: parent.id, _locale: parent._locale, _order: 1, _uuid: 'new-editor-stat', value: '8', label: 'must not overwrite' })
    }, /conflicting target child array/)
    for (const collection of ['services', 'technology'] as const) for (const locale of locales) {
      for (const draft of [false, true]) {
        const result = await payload.findByID({ collection, id: parents.get(collection)!, depth: 0, locale, fallbackLocale: false, draft })
        const phase = draft ? 'draft' : 'published'
        assert.equal(result.name, `${locale} ${phase}`)
        const sections = result.sections as unknown as { left?: { id: string; body: string }[]; right?: { id: string; body?: string; media?: number; src?: string }[] }[]
        const twocol = sections[collection === 'services' ? 0 : 2]
        assert.equal(twocol.left?.length, 1, `${collection} ${locale} ${phase}: stored left column was dropped`)
        assert.equal(twocol.right?.length, 1, `${collection} ${locale} ${phase}: stored right column was dropped`)
        assert.equal(twocol.left![0].id, `${collection}-${phase}-${locale}-left`)
        assert.equal(twocol.left![0].body, wording(locale, phase))
        assert.equal(twocol.right![0].id, `${collection}-${phase}-${locale}-right`)
        if (collection === 'services') assert.equal(twocol.right![0].body, `${wording(locale, phase)} right`)
        else {
          assert.equal(twocol.right![0].media, media)
          assert.equal(twocol.right![0].src, 'https://example.invalid/fallback.png')
        }
      }
      const history = await payload.findVersions({ collection, where: { parent: { equals: parents.get(collection)! } },
        limit: 100, depth: 0, locale, fallbackLocale: false })
      assert.equal(history.docs.length, collection === 'services' ? 17 : 16)
      for (const entry of history.docs) {
        const phase = entry.version.name!.slice(locale.length + 1)
        const sections = entry.version.sections as unknown as { left: { body: string }[] }[]
        assert.equal(sections[collection === 'services' ? 0 : 2].left[0].body, wording(locale, phase))
      }
    }
    await t.test('other tenant published and draft data remain uncopied and unchanged', async () => {
      for (const collection of ['services', 'technology'] as const) for (const locale of locales) for (const draft of [false, true]) {
        const result = await payload.findByID({ collection, id: otherParents.get(collection)!, depth: 0, locale, fallbackLocale: false, draft })
        assert.equal(result.name, `${locale} other-${draft ? 'draft' : 'published'}`)
        const sections = result.sections as unknown as { left: unknown[]; right: unknown[] }[]
        const twocol = sections[collection === 'services' ? 0 : 2]
        assert.deepEqual(twocol.left, [])
        assert.deepEqual(twocol.right, [])
      }
      assert.deepEqual(await snapshot(), repaired, 'Native reads and rollback refusal must not change data')
    })
    t.diagnostic(`210 Roomchang-only copies; all original fingerprints across ${tables.length} tables/schema preserved; 33 versions + published EN/KH/CN; synthetic only`)
  } finally {
    if (cms) await cms.destroy()
    if (pool) await pool.end()
    if (client) await client.end()
    if (running) command('pg_ctl', ['-D', cluster, '-m', 'immediate', '-w', 'stop'])
    await rm(dir, { recursive: true, force: true })
  }
})
