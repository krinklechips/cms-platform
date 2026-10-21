import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { Payload, PayloadRequest, SanitizedConfig } from 'payload'
import type { Pool, PoolConfig } from 'pg'
import {
  applyRefresh, assertRefreshEnvironment, collectCandidates, hashJSON, identifier, parseRefreshArgs, planRefresh, readSQLState, sha256, validateManifest, RefreshConflict,
  type Collection, type Destination, type Identity, type RecordState, type RefreshArgs, type RefreshRuntime, type Row, type SQLRead,
} from '../src/lib/live-content-refresh'

type Policy = { localizedFields: string[]; maxVersions: number; canPublish: boolean }
type RuntimeOptions = {
  pool: Pool; destination: Destination; tenantId: string; tenantSlug: string
  policies: Record<Collection, Policy>; payload?: Payload; actor?: PayloadRequest['user']
}

export async function createRefreshRuntime(options: RuntimeOptions): Promise<RefreshRuntime> {
  const { pool, destination, payload, actor } = options
  const api = payload ? await import('payload') : undefined
  const locking = payload ? await import('../src/lib/editorial-lock') : undefined
  const { sql } = payload ? await import('@payloadcms/db-postgres') : { sql: undefined }
  type Tx = { query: SQLRead; req?: PayloadRequest; locked?: Set<string>; initial?: Map<string, RecordState>; published?: Set<string> }
  const recordKey = (r: Identity) => r.collection + '|' + r.id
  const writeContext = async (tx: unknown, identity: Identity, locale: 'en' | 'kh' | 'cn') => {
    const req = (tx as Tx).req
    if (!payload || !req || !actor) throw new Error('apply_requires_actor')
    if (payload.collections['payload-locked-documents']) {
      const leases = await payload.db.find({ collection: 'payload-locked-documents', req, limit: 1, pagination: false,
        where: { and: [{ 'document.relationTo': { equals: identity.collection } }, { 'document.value': { equals: identity.id } }] } })
      if (leases.docs.length) throw new RefreshConflict('editor_lease')
    }
    const writeReq = Object.assign(Object.create(req), req, { context: { ...req.context }, locale })
    return { payload, actor, writeReq }
  }
  return {
    destination, tenantId: options.tenantId, tenantSlug: options.tenantSlug,
    transaction: async (readonly, run) => {
      if (readonly) {
        const client = await pool.connect()
        try {
          await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY')
          await client.query("SET LOCAL TIME ZONE 'UTC'")
          return await run({ query: async (text: string, params: unknown[] = []) => (await client.query(text, params)).rows } satisfies Tx)
        } finally { try { await client.query('ROLLBACK') } finally { client.release() } }
      }
      if (!payload || !actor || !api || payload.db.name !== 'postgres') throw new Error('apply_requires_payload_actor_postgres')
      const transactionID = await payload.db.beginTransaction({ isolationLevel: 'read committed' })
      if (!transactionID) throw new Error('missing_transaction')
      const req = await api.createLocalReq({ user: actor, locale: 'all', fallbackLocale: false, req: { transactionID } }, payload)
      const session = (payload.db as any).sessions[transactionID]
      if (!session?.db?.execute || !sql) {
        await payload.db.rollbackTransaction(transactionID)
        throw new Error('missing_transaction_session')
      }
      const query: SQLRead = async (text, params = []) => {
        const parts = text.split(/(\$\d+)/g).filter(Boolean).map(part => /^\$\d+$/.test(part)
          ? sql`${sql.param(params[Number(part.slice(1)) - 1])}` : sql.raw(part))
        return (await session.db.execute(sql.join(parts, sql.raw('')))).rows
      }
      try {
        await query("SET LOCAL TIME ZONE 'UTC'")
        const result = await run({ query, req, locked: new Set(), initial: new Map(), published: new Set() } satisfies Tx)
        try { await payload.db.commitTransaction(transactionID) }
        catch { throw new RefreshConflict('indeterminate_commit') }
        return result
      } catch (error) {
        try { await payload.db.rollbackTransaction(transactionID) } catch { /* Preserve the original commit/operation classification. */ }
        throw error
      }
    },
    resolve: async (tx, collection, sourceId) => {
      const rows = await (tx as Tx).query(`SELECT id, source_id, tenant_id FROM ${identifier(destination.schema)}.${identifier(collection.replaceAll('-', '_'))} WHERE source_id=$1 ORDER BY id`, [sourceId])
      return rows.map(r => ({ collection, id: String(r.id), sourceId: r.source_id, tenantId: String(r.tenant_id) }))
    },
    lock: async (tx, identity) => {
      const req = (tx as Tx).req
      if (!req || !locking) throw new Error('missing_transaction_request')
      await locking.lockEditorialDocument(req, identity.collection, identity.id)
      ;(tx as Tx).locked?.add(recordKey(identity))
    },
    read: async (tx, identity) => {
      const t = tx as Tx
      const state = await readSQLState(t.query, identity, destination.schema, options.policies[identity.collection])
      if (t.locked?.has(recordKey(identity)) && !t.initial?.has(recordKey(identity))) t.initial?.set(recordKey(identity), structuredClone(state))
      return state
    },
    update: async (tx, identity, locale, patch, mode) => {
      // Payload mutates its request locale; clones retain the same transaction session.
      const { payload, actor, writeReq } = await writeContext(tx, identity, locale)
      await payload.update({ collection: identity.collection, id: identity.id, locale, fallbackLocale: false,
        user: actor, overrideAccess: false, overrideLock: false, req: writeReq, draft: mode === 'draft', autosave: false,
        ...(mode === 'publish' ? { publishSpecificLocale: locale, publishAllLocales: false } : {}),
        data: { ...patch, _status: mode === 'publish' ? 'published' : 'draft' }, depth: 0 })
      if (mode === 'publish') (tx as Tx).published?.add(recordKey(identity))
    },
    finalizePublish: async (tx, identity, expectedCurrentHash) => {
      const t = tx as Tx, k = recordKey(identity), initial = t.initial?.get(k)
      const root = '_' + identity.collection.replaceAll('-', '_') + '_v'
      const initialLatest = initial?.history[root]?.filter(r => r.latest)
      if (!t.locked?.has(k) || !t.published?.has(k) || initialLatest?.length !== 1 || initialLatest[0].version__status !== 'published'
        || initial?.parent[identity.collection.replaceAll('-', '_')]?.[0]?._status !== 'published') throw new RefreshConflict('finalize_not_authorized')
      const current = await readSQLState(t.query, identity, destination.schema, options.policies[identity.collection])
      if (hashJSON(current) !== expectedCurrentHash) throw new RefreshConflict('stale_state')
      const { payload, actor, writeReq } = await writeContext(tx, identity, 'en')
      // Only our already-verified locale publications may receive this status-only final version.
      await payload.update({ collection: identity.collection, id: identity.id, locale: 'en', fallbackLocale: false,
        user: actor, overrideAccess: false, overrideLock: false, req: writeReq, draft: false, autosave: false,
        publishAllLocales: true, data: { _status: 'published' }, depth: 0 })
    },
  }
}

export function collectionPolicies(config: SanitizedConfig): Record<Collection, Policy> {
  const codes = config.localization ? config.localization.localeCodes : []
  if (codes.length !== 3 || !['en', 'kh', 'cn'].every(l => codes.includes(l))) throw new Error('requires_exact_en_kh_cn_locales')
  return Object.fromEntries((['faq-items', 'career-positions'] as const).map(slug => {
    const collection = config.collections.find(c => c.slug === slug)
    if (!collection || !collection.versions || !collection.versions.drafts) throw new Error('requires_versioned_collections')
    const localizedFields = collection.flattenedFields.filter(f => 'name' in f && 'localized' in f && f.localized && ['text', 'textarea'].includes(f.type)).map(f => 'name' in f ? f.name : '').sort()
    return [slug, { localizedFields, maxVersions: collection.versions.maxPerDoc ?? 100, canPublish: false }]
  })) as Record<Collection, Policy>
}

function guardConnection(poolOptions: PoolConfig, args: RefreshArgs, pg: typeof import('pg')) {
  // pg resolves PGHOST/PGPORT/TLS supplied by the parent wrapper; never load an env file.
  const effective = (new pg.Client(poolOptions) as any).connectionParameters
  if (effective.host !== args.host || Number(effective.port) !== args.port || effective.database !== args.database) throw new Error('database_destination_mismatch')
}

export async function runRefreshCLI(argv: string[]): Promise<number> {
  // All local inputs and hash pins are validated before importing application configuration.
  const args = parseRefreshArgs(argv)
  assertRefreshEnvironment(process.env.PAYLOAD_DROP_DATABASE)
  const bytes = await readFile(resolve(args.snapshot))
  if (sha256(bytes) !== args.sourceSHA) throw new Error('source_hash_mismatch')
  collectCandidates(bytes)
  let manifest: unknown
  if (args.apply) {
    const bytes = await readFile(resolve(args.manifest!))
    if (sha256(bytes) !== args.manifestSHA) throw new Error('manifest_hash_mismatch')
    manifest = JSON.parse(bytes.toString('utf8'))
    const m = manifest as Row
    if (m?.tenantSlug !== 'roomchang' || m?.sourceHash !== args.sourceSHA || m?.destination?.host !== args.host
      || m?.destination?.port !== args.port || m?.destination?.database !== args.database) throw new Error('manifest_destination_mismatch')
  }
  const actorID = process.env.CMS_REFRESH_ACTOR_USER_ID
  if (!actorID || !/^[a-zA-Z0-9_-]+$/.test(actorID)) throw new Error('requires_existing_CMS_REFRESH_ACTOR_USER_ID')
  const imported = await import(pathToFileURL(resolve(args.config)).href)
  const config = await imported.default as SanitizedConfig
  assertRefreshEnvironment(process.env.PAYLOAD_DROP_DATABASE)
  if (config.db.name !== 'postgres') throw new Error('requires_postgres')
  // Constructing the adapter exposes its supplied pool config; it does not init/connect Payload.
  const probe = config.db.init({ payload: { config } as Payload }) as any
  probe.dropDatabase = async () => { throw new Error('database_drop_disabled') }
  const pg = await import('pg')
  guardConnection(probe.poolOptions, args, pg)
  if (probe.readReplicaOptions?.length) throw new Error('read_replicas_not_supported')
  const destination: Destination = { host: args.host, port: args.port, database: args.database, schema: probe.schemaName ?? 'public' }
  identifier(destination.schema)
  const policies = collectionPolicies(config)
  const lockModule = await import('../src/lib/editorial-lock')
  for (const slug of ['faq-items', 'career-positions'] as const) {
    const c = config.collections.find(c => c.slug === slug)!
    if (!c.hooks.beforeOperation?.includes(lockModule.serializeEditorialUpdate)) throw new Error('requires_shared_editorial_lock')
    policies[slug].canPublish = true
  }
  const pool = new pg.Pool(probe.poolOptions)
  let payload: Payload | undefined
  const checkedOut = new Set<import('pg').PoolClient>()
  try {
    const client = await pool.connect()
    let tenantId: string
    try {
      await client.query('BEGIN READ ONLY')
      const tenants = (await client.query(`SELECT id FROM ${identifier(destination.schema)}.tenants WHERE slug=$1`, ['roomchang'])).rows
      if (tenants.length !== 1) throw new Error('tenant_not_unique')
      tenantId = String(tenants[0].id)
    } finally { try { await client.query('ROLLBACK') } finally { client.release() } }
    const options: RuntimeOptions = { pool, destination, tenantId, tenantSlug: 'roomchang', policies }
    const readonlyRuntime = await createRefreshRuntime(options)
    if (!args.apply) {
      const plan = await planRefresh(bytes, readonlyRuntime)
      if (args.manifest) await writeFile(resolve(args.manifest), JSON.stringify(plan.manifest, null, 2) + '\n', { flag: 'wx', mode: 0o600 })
      console.log(JSON.stringify({ ...plan, manifestSHA: sha256(JSON.stringify(plan.manifest, null, 2) + '\n') }, null, 2))
      return plan.conflicts.some(c => !['category_not_migrated', 'staged_not_visible'].includes(c.code)) ? 2 : 0
    }
    validateManifest(manifest, bytes, readonlyRuntime)
    // Preflight storage without Payload initialization; absent migrations cannot trigger schema push.
    await readonlyRuntime.transaction(true, async tx => {
      for (const r of (manifest as import('../src/lib/live-content-refresh').Manifest).records) {
        const state = await readonlyRuntime.read(tx, r)
        if (r.cells.some(c => !state.columns.includes(c.field))) throw new Error('required_migration_missing')
      }
    })
    const originalInit = config.db.init
    config.db = { ...config.db, init: options => {
      const adapter = originalInit(options) as any
      adapter.push = false
      adapter.disableCreateDatabase = true
      adapter.dropDatabase = async () => { throw new Error('database_drop_disabled') }
      adapter.prodMigrations = undefined
      adapter.createExtensions = async () => undefined
      const NativePool = adapter.pg.Pool
      adapter.pg = { ...adapter.pg, Pool: class extends NativePool {
        constructor(options: PoolConfig) {
          super(options)
          this.on('acquire', (c: import('pg').PoolClient) => checkedOut.add(c))
          this.on('release', (_e: unknown, c: import('pg').PoolClient) => checkedOut.delete(c))
        }
      } }
      return adapter
    } }
    config.telemetry = false
    config.typescript = { ...config.typescript, autoGenerate: false }
    const api = await import('payload')
    payload = await api.getPayload({ config, disableOnInit: true, cron: false, key: 'guarded-live-content-refresh' })
    const adapter = payload.db as any
    // Bootstrap the supplied existing identity, then obtain the full native access-checked user.
    const storedActor = await payload.db.findOne({ collection: 'users', where: { id: { equals: actorID } },
      select: { id: true, roles: true, tenants: true, email: true, updatedAt: true, createdAt: true } })
    if (!storedActor) throw new Error('actor_not_found')
    const actor = await payload.findByID({ collection: 'users', id: actorID, depth: 1,
      user: { ...storedActor, collection: 'users' } as unknown as PayloadRequest['user'], overrideAccess: false })
    const runtime = await createRefreshRuntime({ ...options, payload, actor: { ...actor, collection: 'users' } as PayloadRequest['user'] })
    const report = await applyRefresh(bytes, manifest, runtime)
    console.log(JSON.stringify(report, null, 2))
    return report.records.some(r => !['published', 'staged_not_visible'].includes(r.code)) ? 2 : 0
  } finally {
    if (payload) {
      await payload.destroy()
      for (const c of checkedOut) c.release(true)
      const adapter = payload.db as any
      if (adapter.pool) await adapter.pool.end()
    }
    await pool.end()
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  runRefreshCLI(process.argv.slice(2)).then(code => { process.exitCode = code }).catch(() => {
    // Do not echo driver errors or config values that could contain credentials.
    console.error('LIVE_CONTENT_REFRESH_REFUSED: inputs, permissions, configuration, or database guard failed.')
    process.exitCode = 1
  })
}
