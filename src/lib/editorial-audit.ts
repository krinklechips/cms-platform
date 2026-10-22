import {
  APIError, type CollectionAfterChangeHook, type CollectionAfterDeleteHook,
  type CollectionBeforeChangeHook, type CollectionBeforeDeleteHook, type CollectionBeforeOperationHook, type CollectionConfig,
  type Field, type PayloadRequest, type SanitizedCollectionConfig,
} from 'payload'

type Doc = Record<string, unknown>
type ID = string | number
export type EditorialAuditAction = 'create' | 'update' | 'draft' | 'publish' | 'unpublish' | 'restore' | 'delete'
export type EditorialAuditDiff = { path: string; label: string; scope: string; before: unknown; after: unknown }
/** Insert contract; tenant is an explicit relationship ID, actor/version/document IDs are immutable text snapshots. */
export type EditorialAuditEntry = {
  tenant: ID; actorID: string; actorLabel: string; action: EditorialAuditAction; locale: string;
  docCollection: string; documentID: string; docLabel: string; timestamp: string;
  changedFields: string[]; diffs: EditorialAuditDiff[]; truncated: boolean;
  versionID?: string; restoredFromVersionID?: string;
}
type Snapshot = { doc: Doc; versionID?: string }
type Intent = { draft: boolean; locale: string; status?: unknown; restoreID?: string }
type Pending = { before: Snapshot; publishedBefore?: Doc; actorID: string; actorLabel: string; locale: string; intent?: Intent }

const asDoc = (value: unknown): Doc => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Doc : {}
const idOf = (value: unknown): ID | undefined => {
  const id = typeof value === 'object' ? asDoc(value).id : value
  return typeof id === 'string' && id.length > 0 || typeof id === 'number' && Number.isFinite(id) ? id as ID : undefined
}
const sensitive = (key: string) => /password|passwd|secret|token|salt|hash|apikey|authorization|credential|cookie|session|privatekey|resetpassword|loginattempt|lockuntil/i.test(key.replace(/[^a-z0-9]/gi, ''))
const omitted = (key: string) => sensitive(key) || ['id', 'tenant', 'createdAt', 'updatedAt', '_status', '_editorialRevision'].includes(key)
// Payload's restore locale proxy forwards symbol properties to the original request.
// WeakMap<req, ...> alone cannot bridge its beforeChange and afterChange request identities.
const auditState = Symbol('editorialAuditState')
const stateFor = (req: PayloadRequest) => {
  const request = req as PayloadRequest & { [auditState]?: { pending: Map<string, Pending>; intents: Map<string, Intent> } }
  if (!request[auditState]) Object.defineProperty(request, auditState, { value: { pending: new Map(), intents: new Map() } })
  return request[auditState]!
}
const trustedAppends = new WeakSet<PayloadRequest>()
const keyFor = (collection: string, id?: ID) => JSON.stringify([collection, id === undefined ? 'new' : String(id)])

/** Public access remains false, even for super-admins. No request/body/context flag grants this capability. */
export const requireEditorialAuditAppend: CollectionBeforeChangeHook = ({ operation, req, data }) => {
  if (operation !== 'create' || !trustedAppends.has(req)) throw new APIError('Editorial audit is append-only; only editorial hooks may append.', 403)
  return data
}
export const denyEditorialAuditDelete: CollectionBeforeDeleteHook = () => {
  throw new APIError('Editorial audit rows cannot be deleted.', 403)
}

const requireWriter = async (req: PayloadRequest, collection: SanitizedCollectionConfig) => {
  if (collection.auth || collection.slug === 'editorial-audit') throw new APIError('Audit hooks are only for editorial collections.', 500)
  if (!req.payload.collections['editorial-audit']) throw new APIError('The editorial-audit collection must be registered before editorial writes.', 503)
  if (await req.transactionID == null) throw new APIError('Editorial audit requires the content write transaction.', 503)
  const user = asDoc(req.user)
  const roles = Array.isArray(user.roles) ? user.roles : []
  const id = idOf(user.id)
  if (user.collection !== 'users' || id === undefined || !roles.some(role => ['super-admin', 'tenant-admin', 'editor'].includes(String(role)))) {
    throw new APIError('Editorial audit requires an authenticated staff actor.', 403)
  }
  // Do not copy the user object, email, auth credentials, or caller-supplied actor fields.
  const name = typeof user.name === 'string' ? user.name.trim() : ''
  return { actorID: String(id), actorLabel: (name || `Staff ${id}`).slice(0, 200) }
}

const rawSnapshot = async (req: PayloadRequest, collection: SanitizedCollectionConfig, id: ID): Promise<Snapshot | undefined> => {
  // Adapter reads avoid fallback, population and afterRead virtual fields. Clone the locale, not the transaction.
  const rawReq = Object.assign(Object.create(req), req, { locale: 'all', fallbackLocale: false }) as PayloadRequest
  if (collection.versions) {
    const result = await req.payload.db.findVersions({ collection: collection.slug, req: rawReq, locale: 'all',
      where: { and: [{ parent: { equals: id } }, { latest: { equals: true } }] },
      sort: '-updatedAt', limit: 1, pagination: false,
    })
    const version = result.docs[0]
    if (version) return { doc: { ...asDoc(version.version), id }, versionID: String(version.id) }
  }
  const doc = await req.payload.db.findOne({ collection: collection.slug, req: rawReq, locale: 'all', where: { id: { equals: id } } })
  return doc ? { doc } : undefined
}

/** Install LAST in beforeOperation, after localeScopedRestore preparation and the parent's lock/CAS. */
export const captureEditorialAuditBeforeOperation: CollectionBeforeOperationHook = ({ args, collection, operation, req }) => {
  if (!['create', 'update', 'restoreVersion', 'delete'].includes(operation)) return
  const input = args as unknown as { draft?: boolean; data?: Doc; id?: ID; publishAllLocales?: boolean; unpublishAllLocales?: boolean }
  stateFor(req).intents.set(collection.slug, { draft: Boolean(input.draft && input.data?._status !== 'published'),
    locale: input.publishAllLocales === true || input.unpublishAllLocales === true ? 'all' : req.locale || 'all', status: input.data?._status,
    ...(operation === 'restoreVersion' && input.id !== undefined ? { restoreID: String(input.id) } : {}),
  })
}

/** Install FIRST in beforeChange. Returns data unchanged; rejected/failed saves never append. */
export const captureEditorialAuditBeforeChange: CollectionBeforeChangeHook = async ({ collection, data, operation, originalDoc, req }) => {
  const actor = await requireWriter(req, collection)
  const id = idOf(originalDoc?.id ?? data?.id)
  const before = operation === 'update' && id !== undefined ? await rawSnapshot(req, collection, id) : undefined
  const state = stateFor(req)
  const intent = state.intents.get(collection.slug)
  const publishedBefore = operation === 'update' && id !== undefined && collection.versions && !intent?.draft
    ? await req.payload.db.findOne({ collection: collection.slug, req, locale: 'all', where: { id: { equals: id } } }) ?? undefined
    : undefined
  state.pending.set(keyFor(collection.slug, operation === 'create' ? undefined : id), {
    before: before ?? { doc: operation === 'create' ? {} : asDoc(originalDoc) }, publishedBefore, ...actor,
    locale: state.intents.get(collection.slug)?.locale ?? req.locale ?? 'all', intent: state.intents.get(collection.slug),
  })
  return data
}

/** Bound every value, traversal and final row. Truncation is explicit, never silently presented as a full diff. */
const changes = (collection: SanitizedCollectionConfig, before: Doc, after: Doc, locale: string, req: PayloadRequest) => {
  const diffs: EditorialAuditDiff[] = []
  let truncated = false
  let visits = 0
  let bytes = 2
  const marker = '[Audit detail truncated]'
  const clean = (input: unknown) => {
    let nodes = 0
    const copy = (value: unknown, depth: number): unknown => {
      if (++nodes > 300 || depth > 8) { truncated = true; return marker }
      if (value == null) return null
      if (typeof value === 'string') {
        if (value.length > 1500) { truncated = true; return value.slice(0, 1500) + marker }
        return value
      }
      if (typeof value === 'boolean' || typeof value === 'number') return value
      if (value instanceof Date) return value.toISOString()
      if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return '[Binary data omitted]'
      if (Array.isArray(value)) {
        const result = value.slice(0, 40).map(entry => copy(entry, depth + 1))
        if (value.length > 40) { truncated = true; result.push(marker) }
        return result
      }
      const result: Doc = {}
      let count = 0
      for (const key of Object.keys(asDoc(value))) {
        if (sensitive(key) || key === '_editorialRevision') continue
        if (++count > 40) { truncated = true; result._auditTruncated = true; break }
        // JSON can contain arbitrary keys; avoid prototype mutation as well as oversized keys.
        if (key.length > 200 || ['__proto__', 'constructor', 'prototype'].includes(key)) { truncated = true; continue }
        result[key] = copy(asDoc(value)[key], depth + 1)
      }
      return result
    }
    return copy(input, 0)
  }
  const add = (path: string, label: string, scope: string, left: unknown, right: unknown) => {
    const old = clean(left)
    const next = clean(right)
    if (JSON.stringify(old) === JSON.stringify(next)) return
    const diff = { path, label, scope, before: old, after: next }
    // changedFields repeats each path; include that duplication in the same byte budget.
    const size = Buffer.byteLength(JSON.stringify(diff), 'utf8') + Buffer.byteLength(JSON.stringify(path), 'utf8') + 2
    if (diffs.length >= 80 || bytes + size > 60000) { truncated = true; return }
    diffs.push(diff)
    bytes += size
  }
  const walkValue = (left: unknown, right: unknown, path: string, label: string, scope: string, depth = 0) => {
    if (++visits > 2000) { truncated = true; return }
    if (depth > 10) { add(path, label, scope, left, right); truncated = true; return }
    const objects = (value: unknown) => value !== null && typeof value === 'object' && !Array.isArray(value)
    if ((objects(left) || objects(right)) && (left == null || objects(left)) && (right == null || objects(right))) {
      const keys = new Set([...Object.keys(asDoc(left)), ...Object.keys(asDoc(right))])
      if (!keys.size) { add(path, label, scope, left, right); return }
      for (const key of keys) {
        if (sensitive(key) || key === '_editorialRevision') continue
        if (key.length > 200 || visits >= 2000) { truncated = true; break }
        walkValue(asDoc(left)[key], asDoc(right)[key], `${path}.${key}`, `${label} / ${key}`, scope, depth + 1)
      }
    } else add(path, label, scope, left, right)
  }
  const valueAt = (value: unknown, localized: boolean) => localized && locale !== 'all' && value !== null && typeof value === 'object' && !Array.isArray(value)
    ? asDoc(value)[locale] ?? null : value
  const labelOf = (field: { label?: unknown; name?: string }) => {
    const label = typeof field.label === 'object' ? asDoc(field.label)[locale] ?? asDoc(field.label).en : field.label
    return typeof label === 'string' ? label : (field.name ?? '').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, char => char.toUpperCase())
  }
  const visit = (fields: Field[], left: Doc, right: Doc, prefix = '', inherited = false, depth = 0) => {
    if (depth > 10 || ++visits > 2000) { truncated = true; return }
    for (const field of fields) {
      if (field.type === 'tabs') {
        for (const tab of field.tabs) {
          if ('name' in tab && tab.name) {
            if (omitted(tab.name)) continue
            const local = inherited || Boolean(tab.localized)
            visit(tab.fields, asDoc(valueAt(left[tab.name], Boolean(tab.localized) && !inherited)), asDoc(valueAt(right[tab.name], Boolean(tab.localized) && !inherited)), `${prefix}${tab.name}.`, local, depth + 1)
          } else visit(tab.fields, left, right, prefix, inherited, depth + 1)
        }
        continue
      }
      if (!('name' in field) || !field.name) {
        if ('fields' in field) visit(field.fields, left, right, prefix, inherited, depth + 1)
        continue
      }
      if (field.type === 'ui' || omitted(field.name) || 'virtual' in field && field.virtual) continue
      const path = `${prefix}${field.name}`
      const local = inherited || ('localized' in field && Boolean(field.localized))
      const scope = local ? locale : 'all'
      const a = valueAt(left[field.name], local && !inherited)
      const b = valueAt(right[field.name], local && !inherited)
      if (field.type === 'group') visit(field.fields, asDoc(a), asDoc(b), `${path}.`, local, depth + 1)
      else if (field.type === 'array' || field.type === 'blocks') {
        const oldRows = Array.isArray(a) ? a : []
        const nextRows = Array.isArray(b) ? b : []
        const shape = (rows: unknown[]) => rows.slice(0, 40).map(row => [asDoc(row).id, asDoc(row).blockType])
        if (oldRows.length > 40 || nextRows.length > 40) truncated = true
        if (oldRows.length !== nextRows.length || JSON.stringify(shape(oldRows)) !== JSON.stringify(shape(nextRows))) {
          // Structure/order is shared unless the entire array is localized. Keep structured arrays, not joined strings.
          // Child values are also recorded below with their own schema-derived language scope.
          add(path, labelOf(field), scope, oldRows, nextRows)
        }
        const byID = new Map<string, Doc | undefined>()
        for (const row of oldRows.slice(0, 40)) {
          const id = idOf(asDoc(row).id)
          if (id !== undefined) byID.set(String(id), byID.has(String(id)) ? undefined : asDoc(row))
        }
        for (let index = 0; index < Math.min(40, nextRows.length); index++) {
          const nextRow = asDoc(nextRows[index])
          const id = idOf(nextRow.id)
          // A reorder is not an edit to another row. Removed rows remain in the structural snapshot above.
          let oldRow = id !== undefined ? byID.get(String(id)) ?? {} : idOf(asDoc(oldRows[index]).id) === undefined ? asDoc(oldRows[index]) : {}
          if (field.type === 'blocks' && oldRow.blockType !== nextRow.blockType) oldRow = {}
          if (field.type === 'array') visit(field.fields, oldRow, nextRow, `${path}.${index}.`, local, depth + 1)
          else {
            const type = nextRow.blockType ?? oldRow.blockType
            const block = (field.blockReferences ?? field.blocks).map(entry => typeof entry === 'string' ? req.payload.blocks[entry] : entry).find(entry => entry?.slug === type)
            if (block) visit(block.fields, oldRow, nextRow, `${path}.${index}.`, local, depth + 1)
          }
        }
      } else if (field.type === 'relationship' || field.type === 'upload') {
        const reference = (value: unknown): unknown => {
          if (Array.isArray(value)) {
            if (value.length > 40) truncated = true
            return value.slice(0, 40).map(reference)
          }
          return value == null ? null : 'relationTo' in asDoc(value)
            ? { relationTo: asDoc(value).relationTo, value: idOf(asDoc(value).value) ?? null } : idOf(value) ?? null
        }
        add(path, labelOf(field), scope, reference(a), reference(b))
      } else walkValue(a, b, path, labelOf(field), scope)
    }
  }
  visit(collection.fields, before, after)
  return { diffs, changedFields: diffs.map(diff => diff.path), truncated }
}

const append = async ({ collection, req, state, after, id, action, versionID, restoredFromVersionID }: {
  collection: SanitizedCollectionConfig; req: PayloadRequest; state: Pending; after: Doc; id: ID;
  action: EditorialAuditAction; versionID?: string; restoredFromVersionID?: string
}) => {
  await requireWriter(req, collection)
  const source = action === 'delete' ? state.before.doc : after
  const tenant = idOf(source.tenant)
  if (tenant === undefined) throw new APIError('Editorial audit requires an explicit tenant on every document.', 400)
  const title = source[collection.admin.useAsTitle || 'title'] ?? source.title ?? source.name ?? source.filename ?? id
  const selectedTitle = typeof title === 'object' ? asDoc(title)[state.locale] : title
  const docLabel = typeof selectedTitle === 'string' && selectedTitle.trim() ? selectedTitle.slice(0, 250) : `${collection.slug} ${id}`
  const data: EditorialAuditEntry = { tenant, actorID: state.actorID, actorLabel: state.actorLabel, action, locale: state.locale,
    docCollection: collection.slug, documentID: String(id), docLabel, timestamp: new Date().toISOString(),
    ...changes(collection, state.before.doc, after, state.locale, req), versionID, restoredFromVersionID,
  }
  trustedAppends.add(req)
  try {
    // Passing THIS req preserves transactionID. Never swallow an insert failure or commit independently.
    await req.payload.create({ collection: 'editorial-audit', req, overrideAccess: true, depth: 0, data: data as never })
  } finally { trustedAppends.delete(req) }
}

/** Install LAST in afterChange. Always append for a successful save, including publish/no-op draft metadata. */
export const recordEditorialAuditAfterChange: CollectionAfterChangeHook = async ({ collection, doc, operation, previousDoc, req }) => {
  const id = idOf(doc.id)
  if (id === undefined) throw new APIError('Editorial audit requires a saved document ID.', 500)
  const key = keyFor(collection.slug, operation === 'create' ? undefined : id)
  const state = stateFor(req).pending.get(key)
  if (!state) throw new APIError('Editorial audit beforeChange capture is missing.', 500)
  stateFor(req).pending.delete(key)
  // The capture is raw; previousDoc/doc are only fallbacks for adapters without a readable saved snapshot.
  const current = await rawSnapshot(req, collection, id)
  const after = current?.doc ?? asDoc(doc)
  if (!Object.keys(state.before.doc).length && operation !== 'create') state.before.doc = asDoc(previousDoc)
  const restore = asDoc(req.context.localeScopedRestore)
  // A reused req can retain localeScopedRestore. Only this operation's beforeOperation intent activates it.
  const restoreID = state.intent?.restoreID
  const restoredFromVersionID = restoreID && restore.collection === collection.slug && String(restore.parentID) === String(id) && String(restore.versionID) === restoreID
    ? String(restore.versionID) : restoreID
  const hasDrafts = Boolean(collection.versions && collection.versions.drafts)
  let action: EditorialAuditAction = operation === 'create' ? 'create' : hasDrafts ? 'draft' : 'update'
  if (restoredFromVersionID) action = 'restore'
  else if (operation !== 'create' && !state.intent?.draft) {
    if (state.intent?.status === 'draft') action = 'unpublish'
    else if (state.intent?.status === 'published' || after._status === 'published') action = 'publish'
  }
  const publishedAfter = action === 'publish'
    ? await req.payload.db.findOne({ collection: collection.slug, req, locale: 'all', where: { id: { equals: id } } })
    : undefined
  // Publish compares what patients could read, even when the staged text was saved earlier.
  const comparison = action === 'publish' && state.publishedBefore
    ? { ...state, before: { ...state.before, doc: state.publishedBefore } } : state
  await append({ collection, req, state: comparison, after: publishedAfter ?? after, id, action, versionID: current?.versionID, restoredFromVersionID })
  return doc
}

export const captureEditorialAuditBeforeDelete: CollectionBeforeDeleteHook = async ({ collection, id, req }) => {
  const actor = await requireWriter(req, collection)
  const before = await rawSnapshot(req, collection, id)
  if (!before) throw new APIError('Editorial audit cannot capture the document being deleted.', 500)
  stateFor(req).pending.set(keyFor(collection.slug, id), { ...actor, before, locale: req.locale || 'all' })
}

export const recordEditorialAuditAfterDelete: CollectionAfterDeleteHook = async ({ collection, doc, id, req }) => {
  const key = keyFor(collection.slug, id)
  const state = stateFor(req).pending.get(key)
  if (!state) throw new APIError('Editorial audit beforeDelete capture is missing.', 500)
  stateFor(req).pending.delete(key)
  await append({ collection, req, state, after: {}, id, action: 'delete', versionID: state.before.versionID })
  return doc
}

/**
 * Final-map integration: register EditorialAudit separately, outside multiTenantPlugin's collection map.
 * Apply this wrapper after withDrafts/withEditorialConcurrency so beforeOperation captures their resolved intent.
 * Existing hooks retain order: capture before changes/deletes, record after existing successful hooks.
 * Requires authenticated users staff, an explicit document tenant, and the SAME active req.transactionID.
 * Do not swallow hook errors, call hooks on reads, backfill old actors, or disable transactions.
 * AuditChanges#AuditChanges must be registered by the parent's generated admin import map.
 */
export const withEditorialAudit = (config: CollectionConfig): CollectionConfig => {
  if (config.slug === 'editorial-audit' || !['media', 'media-directories'].includes(config.slug) && !(config.versions && typeof config.versions === 'object' && config.versions.drafts)) return config
  return {
    ...config,
    hooks: {
      ...config.hooks,
      beforeOperation: [...(config.hooks?.beforeOperation ?? []), captureEditorialAuditBeforeOperation],
      beforeChange: [captureEditorialAuditBeforeChange, ...(config.hooks?.beforeChange ?? [])],
      afterChange: [...(config.hooks?.afterChange ?? []), recordEditorialAuditAfterChange],
      beforeDelete: [captureEditorialAuditBeforeDelete, ...(config.hooks?.beforeDelete ?? [])],
      afterDelete: [...(config.hooks?.afterDelete ?? []), recordEditorialAuditAfterDelete],
    },
  }
}
