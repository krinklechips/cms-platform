import { createHash } from 'node:crypto'

export type Row = Record<string, any>
export type Collection = 'faq-items' | 'career-positions'
export type Locale = 'kh' | 'cn'
export type Mode = 'publish' | 'draft'
export type Identity = { collection: Collection; id: string; sourceId: string; tenantId: string }
export type Cell = { collection: Collection; sourceId: string; locale: Locale; field: string; value: string }
export type Graph = Record<string, Row[]>
export type Link = { table: string; parent: string }
export type RecordState = {
  identity: Identity; parent: Graph; history: Graph; columns: string[]; localizedFields: string[]
  links: Link[]; maxVersions: number; canPublish: boolean
}
export type Destination = { host: string; port: number; database: string; schema: string }
export type ManifestRecord = Identity & {
  expectedHash: string; mode: Mode; cells: { locale: Locale; field: string; valueHash: string }[]
}
export type Manifest = {
  version: 1; tenantSlug: 'roomchang'; sourceHash: string; destination: Destination; records: ManifestRecord[]
}
export type Issue = { code: string; collection?: Collection; sourceId?: string; field?: string; locale?: Locale; invariant?: string }
export type RefreshRuntime = {
  destination: Destination; tenantSlug: string; tenantId: string
  transaction<T>(readonly: boolean, run: (tx: unknown) => Promise<T>): Promise<T>
  resolve(tx: unknown, collection: Collection, sourceId: string): Promise<Identity[]>
  lock(tx: unknown, identity: Identity): Promise<void>
  read(tx: unknown, identity: Identity): Promise<RecordState>
  update(tx: unknown, identity: Identity, locale: Locale, patch: Record<string, string>, mode: Mode): Promise<void>
  finalizePublish(tx: unknown, identity: Identity, expectedCurrentHash: string): Promise<void>
}

// Reviewed identity set only: runtime snapshots supply values, never expand import scope.
export const APPROVED_IDENTITIES: Readonly<Record<Collection, readonly string[]>> = {
  'faq-items': Object.freeze(`e1afc59c-6012-4c04-b0d5-aeaddfe46889 3ac99e80-b717-4fd9-84ad-18c40800d776
0355d7d5-48c7-484c-adfd-7e0f31d1af2a c359f7c1-95c1-4942-8da2-0deb1b637d20 7305193f-a8ed-468a-b927-b907f08bf186
b83a01e1-a882-46be-af20-80b7197445c0 29323ae6-4326-4fbd-bfec-1d49c23c1a4c c9b79eb3-426b-4e5b-a6a8-42c3b1fdf0be
8c366ca5-cda5-4af8-af6c-169c4761ff41 f8a0cd93-116e-48ac-9c2e-a0b04b9eba89 4fa61950-c704-4a6b-946e-61fb5948a7ff
4617dd72-4eed-4c21-8ce5-eb367ccbeff9 acfd033e-f9d4-447d-b20b-a648fd15104b 74dd0357-7a9e-4315-a7c9-72dd87f46fa5
0ef6e3fd-c1bb-44fc-8c44-6e88c9a160e6 1eb5f8b3-2d46-4914-93b4-2cb54a0b3267 82a89730-1e29-4375-8ca0-d56410270db7
e27eeac5-501b-4865-9ccf-f646e254874b 8b55219f-49e7-4e0f-b49b-01ddb8675090 18762911-8472-4b7f-8623-84cb2315fce5
894d59ec-9f02-4b9f-ba4d-ebc92561fbc1 abd5ccba-b25c-4139-a0d8-c7e1b3c28df2 e00e0249-519c-4400-8e22-4cc0c8b70447
a5f045e4-9b10-4bd3-a9af-d92569ccd125 3ed8094b-d04c-440c-bb91-ac16d8a903b1 15bea1fc-61d2-4d59-9b47-3a6adc31d587
3d50ea78-3d08-449f-bb03-047b86d539c4 5de934ef-0241-4f1b-8f8e-265762330047 f7dfd72a-77d7-46dc-87b2-587655959765
d97bb876-b4b1-40d5-a4e7-28d48f2ad27b ffd26783-018f-48a3-b6eb-28e8d1360e7c e4df1a26-a600-457f-a470-e435e7f1081a
e79fbb28-2ef6-4dd5-af65-06753fe474ee 30036ccb-cca7-4eb1-87e5-6aee44292368 7a2edfb8-35b4-4039-821b-0f304772ed2e`.split(/\s+/)),
  'career-positions': Object.freeze(['c89d76a4-1d2e-461c-b3ad-444f9df08903', '035b7e06-7df1-4a4f-bcdb-c43e46cce945',
    '194467ce-c9e2-4195-8ec5-21c335b00f79', '200cd04e-d4ad-41a6-8a58-e3498f7edbca']),
}
const fields: Record<Collection, readonly string[]> = { 'faq-items': ['question', 'answer', 'category'], 'career-positions': ['description'] }
const locales: readonly string[] = ['kh', 'cn']
const tableOf = (c: Collection) => c.replaceAll('-', '_')
export const sha256 = (bytes: string | Uint8Array): string => createHash('sha256').update(bytes).digest('hex')
const canonical = (v: any): any => v instanceof Date ? v.toISOString() : Array.isArray(v) ? v.map(canonical)
  : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canonical(v[k])])) : v
export const hashJSON = (value: unknown): string => sha256(JSON.stringify(canonical(value)))
const eq = (a: unknown, b: unknown) => hashJSON(a) === hashJSON(b)
const key = (c: Pick<Cell, 'collection' | 'sourceId' | 'locale' | 'field'>) => [c.collection, c.sourceId, c.locale, c.field].join('|')
export class RefreshConflict extends Error { constructor(public code: string, public invariant?: string) { super(code) } }
const refuse = (code: string): never => { throw new RefreshConflict(code) }
const object = (v: unknown): Row => v && typeof v === 'object' && !Array.isArray(v) ? v as Row : refuse('invalid_object')
const exactKeys = (v: unknown, keys: string[]) => {
  const r = object(v)
  if (Object.keys(r).some(k => !keys.includes(k)) || keys.some(k => !(k in r))) refuse('invalid_keys')
  return r
}
const isHash = (s: unknown): s is string => typeof s === 'string' && /^[a-f0-9]{64}$/.test(s)

export function collectCandidates(bytes: Uint8Array): { sourceHash: string; cells: Cell[] } {
  const tables = object(object(JSON.parse(Buffer.from(bytes).toString('utf8'))).tables)
  for (const t of ['faq_items', 'career_positions', 'content_translations']) if (!Array.isArray(tables[t])) refuse('invalid_snapshot')
  for (const t of ['faq_items', 'career_positions']) {
    const ids = tables[t].map((r: Row) => String(r.id))
    if (new Set(ids).size !== ids.length) refuse('duplicate_source_identity')
  }
  const translations = new Map<string, Row>()
  for (const tr of tables.content_translations) {
    const k = [tr.entity_type, tr.entity_id, tr.locale, tr.field].join('|')
    if (translations.has(k)) refuse('duplicate_translation')
    translations.set(k, tr)
  }
  const cells: Cell[] = []
  for (const collection of ['faq-items', 'career-positions'] as const) {
    for (const row of tables[tableOf(collection)]) {
      const sourceId = String(row.id)
      if (!APPROVED_IDENTITIES[collection].includes(sourceId)) continue
      const entity = collection === 'faq-items' ? 'faq' : 'career_position'
      const id = collection === 'faq-items' ? sourceId : row.slug
      if (typeof id !== 'string' || !id || collection === 'career-positions' && tables.career_positions.filter((r: Row) => r.slug === id).length !== 1) refuse('ambiguous_source_slug')
      for (const [sourceLocale, locale] of [['km', 'kh'], ['zh', 'cn']] as const) for (const field of fields[collection]) {
        const tr = translations.get([entity, id, sourceLocale, field === 'description' ? 'shortDescription' : field].join('|'))
        if (tr && typeof tr.value === 'string' && tr.value.trim()) cells.push({ collection, sourceId, locale, field, value: tr.value })
      }
    }
  }
  return { sourceHash: sha256(bytes), cells }
}

function checkRuntime(runtime: RefreshRuntime) {
  if (runtime.tenantSlug !== 'roomchang' || !runtime.tenantId) refuse('tenant_mismatch')
}

export function validateManifest(input: unknown, bytes: Uint8Array, runtime: RefreshRuntime): Manifest {
  checkRuntime(runtime)
  const source = collectCandidates(bytes), available = new Map(source.cells.map(c => [key(c), c]))
  const m = exactKeys(input, ['version', 'tenantSlug', 'sourceHash', 'destination', 'records'])
  if (m.version !== 1 || m.tenantSlug !== 'roomchang' || m.sourceHash !== source.sourceHash || !eq(m.destination, runtime.destination) || !Array.isArray(m.records)) refuse('manifest_mismatch')
  const records = new Set<string>()
  for (const inputRecord of m.records) {
    const r = exactKeys(inputRecord, ['collection', 'id', 'sourceId', 'tenantId', 'expectedHash', 'mode', 'cells'])
    if (!Object.hasOwn(fields, r.collection) || !APPROVED_IDENTITIES[r.collection as Collection].includes(r.sourceId)
      || typeof r.id !== 'string' || !r.id || r.tenantId !== runtime.tenantId || !isHash(r.expectedHash)
      || !['publish', 'draft'].includes(r.mode) || !Array.isArray(r.cells) || !r.cells.length) refuse('invalid_manifest_record')
    const recordKey = r.collection + '|' + r.sourceId
    if (records.has(recordKey)) refuse('duplicate_manifest_record')
    records.add(recordKey)
    const seen = new Set<string>()
    for (const inputCell of r.cells) {
      const c = exactKeys(inputCell, ['locale', 'field', 'valueHash'])
      if (!locales.includes(c.locale) || !fields[r.collection as Collection].includes(c.field) || !isHash(c.valueHash)) refuse('invalid_manifest_cell')
      const k = key({ ...r, ...c } as Cell), sourceCell = available.get(k)
      if (seen.has(k)) refuse('duplicate_manifest_cell')
      seen.add(k)
      if (!sourceCell || sha256(sourceCell.value) !== c.valueHash) refuse('source_value_mismatch')
    }
  }
  return structuredClone(m) as Manifest
}

const versions = (s: RecordState) => s.history['_' + tableOf(s.identity.collection) + '_v'] ?? []
function eligible(s: RecordState, cells: Cell[], mode: Mode): void {
  const roots = versions(s), latest = roots.filter(r => r.latest === true)
  if (latest.length !== 1 || !roots.length) refuse('ambiguous_latest')
  if (latest[0].version__status === 'draft') refuse('pending_draft')
  if (roots.some(r => String(r.parent_id) !== s.identity.id || String(r.version_source_id) !== s.identity.sourceId || String(r.version_tenant_id) !== s.identity.tenantId)) refuse('history_identity_mismatch')
  const table = tableOf(s.identity.collection)
  for (const cell of cells) {
    if (!s.columns.includes(cell.field) || !s.localizedFields.includes(cell.field)) refuse('field_not_localized')
    const parent = (s.parent[table + '_locales'] ?? []).filter(r => r._locale === cell.locale)
    if (parent.length > 1 || parent.some(r => r[cell.field] != null)) refuse('parent_has_value')
    if ((s.history['_' + table + '_v_locales'] ?? []).some(r => r._locale === cell.locale && r['version_' + cell.field] != null)) refuse('history_has_value')
  }
  const reserve = new Set(cells.map(c => c.locale)).size * (mode === 'publish' ? 2 : 1) + (mode === 'publish' ? 1 : 0)
  if (!Number.isInteger(s.maxVersions) || s.maxVersions < 0 || s.maxVersions > 0 && roots.length + reserve > s.maxVersions) refuse('retention_headroom')
}

export async function planRefresh(bytes: Uint8Array, runtime: RefreshRuntime, requestedMode: Mode = 'publish') {
  checkRuntime(runtime)
  const source = collectCandidates(bytes), conflicts: Issue[] = [], records: ManifestRecord[] = []
  await runtime.transaction(true, async tx => {
    const groups = new Map<string, Cell[]>()
    for (const cell of source.cells) {
      const k = cell.collection + '|' + cell.sourceId
      const group = groups.get(k) ?? []
      group.push(cell)
      groups.set(k, group)
    }
    for (const group of groups.values()) {
      const first = group[0], identity = { collection: first.collection, sourceId: first.sourceId }
      try {
        const matches = await runtime.resolve(tx, first.collection, first.sourceId)
        if (matches.length !== 1 || matches[0].tenantId !== runtime.tenantId) refuse('identity_not_unique')
        const s = await runtime.read(tx, matches[0])
        let cells = group
        if (first.collection === 'faq-items' && (!s.columns.includes('category') || !s.localizedFields.includes('category'))) {
          cells = group.filter(c => c.field !== 'category')
          if (cells.length !== group.length) conflicts.push({ ...identity, field: 'category', code: 'category_not_migrated' })
        }
        const mode = requestedMode === 'publish' && s.canPublish && s.parent[tableOf(first.collection)][0]._status === 'published' ? 'publish' : 'draft'
        eligible(s, cells, mode)
        if (!cells.length) continue
        if (mode === 'draft') conflicts.push({ ...identity, code: 'staged_not_visible' })
        records.push({ ...matches[0], expectedHash: hashJSON(s), mode, cells: cells.map(c => ({ locale: c.locale, field: c.field, valueHash: sha256(c.value) })) })
      } catch (e) { if (!(e instanceof RefreshConflict)) throw e; conflicts.push({ ...identity, code: e.code }) }
    }
  })
  return { manifest: { version: 1, tenantSlug: 'roomchang', sourceHash: source.sourceHash, destination: { ...runtime.destination }, records } as Manifest,
    candidateCells: records.reduce((n, r) => n + r.cells.length, 0), conflicts }
}

function sortedGraph(g: Graph): Graph {
  const rowKey = (r: Row) => r.id == null ? String(r._parent_id) + '|' + String(r._locale) : String(r.id)
  return Object.fromEntries(Object.entries(g).map(([t, rows]) => [t, [...rows].sort((a, b) => rowKey(a).localeCompare(rowKey(b)))]))
}

// Logical snapshots retain array row IDs (_uuid on versions), structure, order, and every locale.
function document(s: RecordState, side: 'parent' | 'history', versionID?: unknown): Row {
  const base = tableOf(s.identity.collection), root = side === 'parent' ? base : '_' + base + '_v'
  const prefix = side === 'parent' ? '' : 'version_', graph = s[side]
  const row = (graph[root] ?? []).find(r => side === 'parent' || String(r.id) === String(versionID))
  if (!row) throw new RefreshConflict('preservation_failed')
  const localRows = (graph[root + '_locales'] ?? []).filter(r => String(r._parent_id) === String(row.id))
  const result: Row = {}
  for (const [column, value] of Object.entries(row)) {
    if (side === 'history' && !column.startsWith('version_')) continue
    const name = column.slice(prefix.length)
    if (['id', 'created_at', 'updated_at', '_status'].includes(name) || s.columns.includes(name)) continue
    result[name] = value
  }
  for (const name of s.columns) result[name] = Object.fromEntries(['en', 'kh', 'cn'].map(loc => [loc, localRows.find(r => r._locale === loc)?.[prefix + name] ?? null]))
  const visit = (parentTable: string, parentIDs: unknown[]): Row => Object.fromEntries(s.links.filter(l => l.parent === parentTable && l.table !== root + '_locales').map(link => {
    const children = (graph[link.table] ?? []).filter(r => parentIDs.some(id => String(id) === String(r._parent_id)))
    const name = link.table.slice(parentTable.length + 1).replace(/^version_/, '')
    const rows = children.map(r => ({ ...Object.fromEntries(Object.entries(r).filter(([k]) => !['_parent_id', '_uuid'].includes(k))), id: r._uuid ?? r.id,
      children: visit(link.table, [r.id]) })).sort((a, b) => JSON.stringify(canonical(a)).localeCompare(JSON.stringify(canonical(b))))
    return [name, rows]
  }))
  result.children = visit(root, [row.id])
  return result
}

function preserve(before: RecordState, after: RecordState, cells: Cell[], mode: Mode, original: RecordState, finalizing = false): void {
  const table = tableOf(before.identity.collection), root = '_' + table + '_v'
  const fail = (invariant: string): never => { throw new RefreshConflict('preservation_failed', invariant) }
  // Existing version content is immutable; only native latest-pointer changes are permitted.
  for (const [t, rows] of Object.entries(before.history)) for (const row of rows) {
    const found = after.history[t]?.find(r => String(r.id) === String(row.id))
    const strip = (r: Row) => Object.fromEntries(Object.entries(r).filter(([k]) => t !== root || k !== 'latest'))
    if (!found || !eq(strip(row), strip(found))) fail('existing_history')
  }
  const newVersionIDs = new Set(versions(after).filter(r => !versions(before).some(old => String(old.id) === String(r.id))).map(r => String(r.id)))
  for (const [table, rows] of Object.entries(after.history)) {
    if (table === root) continue
    for (const row of rows) {
      if (before.history[table]?.some(old => String(old.id) === String(row.id))) continue
      let currentTable = table, currentRow = row
      const seen = new Set<string>()
      while (currentTable !== root) {
        if (seen.has(currentTable)) fail('history_ancestry_cycle')
        seen.add(currentTable)
        const parentTable = after.links.find(l => l.table === currentTable)?.parent
          ?? (currentTable === root + '_locales' ? root : undefined)
        const parentRow = parentTable ? after.history[parentTable]?.find(r => String(r.id) === String(currentRow._parent_id)) : undefined
        if (!parentTable || !parentRow) throw new RefreshConflict('preservation_failed', 'history_ancestry_missing')
        currentTable = parentTable
        currentRow = parentRow
      }
      if (!newVersionIDs.has(String(currentRow.id))) fail('old_version_new_child')
    }
  }
  const cleanParent = (s: RecordState, isAfter: boolean): Graph => {
    const g = structuredClone(s.parent)
    for (const row of g[table] ?? []) delete row.updated_at
    const oldLocales = original.parent[table + '_locales'] ?? []
    g[table + '_locales'] = (g[table + '_locales'] ?? []).filter(row => {
      const selected = mode === 'publish' ? cells.filter(c => c.locale === row._locale).map(c => c.field) : []
      for (const f of selected) delete row[f]
      // Native upsert regenerates parent-locale surrogate IDs, not document or array IDs.
      delete row.id
      if (isAfter && !oldLocales.some(r => String(r._parent_id) === String(row._parent_id) && r._locale === row._locale)) {
        if (!selected.length || Object.entries(row).some(([k, v]) => !['id', '_parent_id', '_locale'].includes(k) && v != null)) fail('unexpected_parent_locale')
        return false
      }
      return true
    })
    return sortedGraph(g)
  }
  if (!eq(cleanParent(original, false), cleanParent(after, true))) fail('parent_graph')
  const oldLatest = versions(before).filter(r => r.latest)
  const newLatest = versions(after).filter(r => r.latest)
  if (oldLatest.length !== 1 || newLatest.length !== 1) fail('latest_count')
  const expected = document(before, 'history', oldLatest[0].id)
  for (const c of cells) expected[c.field][c.locale] = c.value
  const added = versions(after).filter(r => !versions(before).some(o => String(o.id) === String(r.id)))
  if (!added.length || added.length > (mode === 'publish' ? 2 : 1)) fail('new_version_count')
  if (!added.some(r => String(r.id) === String(newLatest[0].id))) fail('latest_not_new')
  if (finalizing && (added.length !== 1 || newLatest[0].version__status !== 'published' || newLatest[0].snapshot === true)) fail('final_publication_status')
  for (const row of added) if (!eq(document(after, 'history', row.id), expected)
    || !(row.version__status === (mode === 'publish' ? 'published' : 'draft') || !finalizing && mode === 'publish' && row.snapshot === true && row.version__status === 'draft')) fail('new_version_content')
  if (mode === 'publish') {
    const parentExpected = document(original, 'parent')
    for (const c of cells) parentExpected[c.field][c.locale] = c.value
    if (!eq(document(after, 'parent'), parentExpected) || after.parent[table][0]._status !== 'published') fail('published_parent_content')
  }
}

export async function applyRefresh(bytes: Uint8Array, input: unknown, runtime: RefreshRuntime) {
  const manifest = validateManifest(input, bytes, runtime)
  const source = new Map(collectCandidates(bytes).cells.map(c => [key(c), c]))
  const records: (Issue & { cells: number; mode?: Mode; nativeSnapshot?: boolean })[] = []
  let appliedCells = 0
  for (const record of manifest.records) {
    try {
      const result = await runtime.transaction(false, async tx => {
        await runtime.lock(tx, record)
        if (sha256(bytes) !== manifest.sourceHash) refuse('source_hash_mismatch')
        const matches = await runtime.resolve(tx, record.collection, record.sourceId)
        if (matches.length !== 1 || !eq(matches[0], { collection: record.collection, id: record.id, sourceId: record.sourceId, tenantId: record.tenantId })) refuse('identity_changed')
        const initial = await runtime.read(tx, record)
        if (hashJSON(initial) !== record.expectedHash) refuse('stale_state')
        const cells = record.cells.map(c => source.get(key({ ...record, ...c }))!)
        eligible(initial, cells, record.mode)
        if (record.mode === 'publish' && (!initial.canPublish || initial.parent[tableOf(record.collection)][0]._status !== 'published')) refuse('publish_not_verified')
        let current = initial
        const completed: Cell[] = []
        for (const locale of ['kh', 'cn'] as const) {
          const selected = cells.filter(c => c.locale === locale)
          if (!selected.length) continue
          await runtime.update(tx, record, locale, Object.fromEntries(selected.map(c => [c.field, c.value])), record.mode)
          const after = await runtime.read(tx, record)
          completed.push(...selected)
          preserve(current, after, completed, record.mode, initial)
          current = after
        }
        if (record.mode === 'publish') {
          await runtime.finalizePublish(tx, record, hashJSON(current))
          const finalized = await runtime.read(tx, record)
          preserve(current, finalized, completed, 'publish', initial, true)
          current = finalized
        }
        return { expectedDurableHash: hashJSON(current), nativeSnapshot: versions(current).some(v => v.latest && v.snapshot === true) }
      })
      let durable = false
      try {
        durable = await runtime.transaction(true, async tx => hashJSON(await runtime.read(tx, record)) === result.expectedDurableHash)
      } catch { /* An unverified commit must not be retried or reported as applied. */ }
      if (!durable) {
        records.push({ collection: record.collection, sourceId: record.sourceId, code: 'indeterminate_commit', mode: record.mode, cells: 0 })
        continue
      }
      appliedCells += record.cells.length
      records.push({ collection: record.collection, sourceId: record.sourceId, code: record.mode === 'publish' ? 'published' : 'staged_not_visible', mode: record.mode, cells: record.cells.length, nativeSnapshot: result.nativeSnapshot })
    } catch (e) {
      records.push({ collection: record.collection, sourceId: record.sourceId, code: e instanceof RefreshConflict ? e.code : 'transaction_failed',
        ...(e instanceof RefreshConflict && e.invariant ? { invariant: e.invariant } : {}), cells: 0 })
    }
  }
  return { appliedCells, records }
}

export type SQLRead = (text: string, params?: unknown[]) => Promise<Row[]>
export const identifier = (name: string) => {
  if (!/^[a-z_][a-z0-9_]*$/.test(name)) refuse('invalid_sql_identifier')
  return '"' + name + '"'
}

/** The same SQL reader is used by read-only planning and the locked Payload session. */
export async function readSQLState(query: SQLRead, identity: Identity, schema: string,
  config: { localizedFields: string[]; maxVersions: number; canPublish: boolean }): Promise<RecordState> {
  const base = tableOf(identity.collection), version = '_' + base + '_v', qualify = (t: string) => identifier(schema) + '.' + identifier(t)
  const metadata = await query(`SELECT table_name, column_name FROM information_schema.columns WHERE table_schema=$1 AND (table_name=$2 OR table_name LIKE $3 OR table_name=$4 OR table_name LIKE $5) ORDER BY table_name, ordinal_position`,
    [schema, base, base + '\\_%', version, version + '\\_%'])
  const foreign = await query(`SELECT child.relname AS "table", parent.relname AS parent FROM pg_constraint c JOIN pg_class child ON child.oid=c.conrelid JOIN pg_namespace n ON n.oid=child.relnamespace JOIN pg_class parent ON parent.oid=c.confrelid JOIN pg_attribute a ON a.attrelid=c.conrelid AND a.attnum=c.conkey[1] WHERE c.contype='f' AND n.nspname=$1 AND array_length(c.conkey,1)=1 AND a.attname='_parent_id'`, [schema])
  const names = new Set(metadata.map(r => r.table_name))
  const links: Link[] = foreign.filter(r => names.has(r.table) && names.has(r.parent)).map(r => ({ table: r.table, parent: r.parent })).sort((a, b) => a.table.localeCompare(b.table))
  // Walk once per parent table; keep SQL reads entirely on the caller's connection.
  const loadGraph = async (root: string, where: string, params: unknown[]): Promise<Graph> => {
    // PostgreSQL JSON preserves identical timestamp precision across pg and Drizzle parsers.
    const load = async (table: string, condition: string, values: unknown[]) =>
      (await query(`SELECT to_jsonb(record) AS record FROM ${qualify(table)} record WHERE ${condition} ORDER BY id`, values)).map(r => r.record)
    const g: Graph = { [root]: await load(root, where, params) }
    const queue = [root], visited = new Set(queue)
    for (let i = 0; i < queue.length; i++) for (const link of links.filter(l => l.parent === queue[i])) {
      if (visited.has(link.table)) refuse('cyclic_schema')
      visited.add(link.table)
      g[link.table] = await load(link.table, '_parent_id::text = ANY($1::text[])', [g[link.parent].map(r => String(r.id))])
      queue.push(link.table)
    }
    return g
  }
  const parent = await loadGraph(base, 'id::text=$1 AND tenant_id::text=$2 AND source_id=$3', [identity.id, identity.tenantId, identity.sourceId])
  if (parent[base].length !== 1) refuse('identity_changed')
  const history = await loadGraph(version, 'parent_id::text=$1', [identity.id])
  const parentColumns = metadata.filter(r => r.table_name === base + '_locales').map(r => r.column_name)
  const versionColumns = metadata.filter(r => r.table_name === version + '_locales').map(r => r.column_name)
  const columns = parentColumns.filter(c => !['id', '_locale', '_parent_id'].includes(c) && versionColumns.includes('version_' + c)).sort()
  return { identity: { collection: identity.collection, id: identity.id, sourceId: identity.sourceId, tenantId: identity.tenantId },
    parent, history, columns, links, ...config }
}

export type RefreshArgs = {
  apply: boolean; config: string; snapshot: string; manifest?: string; manifestSHA?: string
  sourceSHA: string; tenantSlug: 'roomchang'; host: string; port: number; database: string
}
export function assertRefreshEnvironment(dropDatabase: string | undefined): void {
  if (dropDatabase && dropDatabase !== 'false') refuse('drop_database_environment_blocked')
}
export function parseRefreshArgs(argv: string[]): RefreshArgs {
  const allowed = ['--config', '--snapshot', '--manifest', '--manifest-sha256', '--source-sha256', '--tenant-slug', '--expected-db-host', '--expected-db-port', '--expected-db-name']
  const values = new Map<string, string>(), switches = new Set<string>()
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--apply') { if (switches.has(a)) refuse('duplicate_argument'); switches.add(a); continue }
    if (!allowed.includes(a) || values.has(a) || !argv[i + 1] || argv[i + 1].startsWith('--')) refuse('invalid_argument')
    values.set(a, argv[++i])
  }
  for (const k of ['--config', '--snapshot', '--source-sha256', '--tenant-slug', '--expected-db-host', '--expected-db-port', '--expected-db-name']) if (!values.get(k)) refuse('missing_argument_' + k)
  if (values.get('--tenant-slug') !== 'roomchang' || !isHash(values.get('--source-sha256'))) refuse('invalid_tenant_or_source_hash')
  const port = Number(values.get('--expected-db-port'))
  if (!Number.isInteger(port) || port < 1 || port > 65535 || !/^[a-zA-Z0-9_.:-]+$/.test(values.get('--expected-db-host')!)) refuse('invalid_destination')
  if (switches.has('--apply') && (!values.get('--manifest') || !isHash(values.get('--manifest-sha256')))) refuse('apply_requires_manifest_and_sha256')
  return { apply: switches.has('--apply'), config: values.get('--config')!, snapshot: values.get('--snapshot')!, manifest: values.get('--manifest'),
    manifestSHA: values.get('--manifest-sha256'), sourceSHA: values.get('--source-sha256')!, tenantSlug: 'roomchang', host: values.get('--expected-db-host')!, port, database: values.get('--expected-db-name')! }
}
