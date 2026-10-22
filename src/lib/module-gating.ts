import { Forbidden, type CollectionBeforeDeleteHook, type CollectionBeforeValidateHook, type CollectionConfig, type CollectionSlug, type Where } from 'payload'
import { getHostTenant } from './host-scope'

type AccessFn = NonNullable<NonNullable<CollectionConfig['access']>['create']>
type AccessArgs = Parameters<AccessFn>[0]
type AccessResult = boolean | Where
type TenantID = number | string
type WriteOperation = 'create' | 'update' | 'delete'

type TenantDoc = {
  enabledCollections?: unknown
}

type UserWithRolesAndTenants = {
  roles?: string[] | null
  tenants?: { tenant?: number | string | TenantDocWithID | null }[] | null
} | null

type TenantDocWithID = TenantDoc & {
  id?: number | string | null
}

const isSuperAdmin = (user: unknown): boolean =>
  Boolean((user as UserWithRolesAndTenants)?.roles?.includes('super-admin'))

const tenantID = (value: unknown): TenantID | null => {
  const id = value && typeof value === 'object' && !Array.isArray(value)
    ? (value as TenantDocWithID).id : value
  if (typeof id === 'number' && Number.isFinite(id)) return id
  if (typeof id === 'string' && id.trim()) return id
  return null
}

// WRITE gate (fail-CLOSED, per Codex review): a tenant user may only
// create/update/delete a collection their tenant is entitled to. If we can't
// resolve entitlements, deny — a tenant must never edit an unentitled
// collection. (Reads are intentionally NOT gated here — the public dummy site
// reads the REST API anonymously, and the multi-tenant plugin already enforces
// tenant row-isolation on reads. Module gating is an entitlement/UX layer, not
// the tenant-isolation security boundary.)
const isCollectionEnabledForWrite = (tenant: TenantDoc | null | undefined, slug: string): boolean => {
  if (!Array.isArray(tenant?.enabledCollections)) return false // fail closed
  return tenant.enabledCollections.includes(slug)
}

// NAV visibility (cosmetic): fail-OPEN so a mid-provisioning tenant sees their
// collection rather than a blank admin. The write gate above is the real fence.
const isCollectionVisible = (tenant: TenantDoc | null | undefined, slug: string): boolean => {
  if (!Array.isArray(tenant?.enabledCollections)) return true
  return tenant.enabledCollections.includes(slug)
}

// Local API reads mutate their request. Preserve the writer's locale/fallback
// while retaining its transaction and the request-local entitlement cache.
const readReq = (req: AccessArgs['req']): AccessArgs['req'] => Object.assign(Object.create(req), req)

const getCachedTenant = async (req: AccessArgs['req'], id: TenantID): Promise<TenantDoc | null> => {
  if (!(req.context.moduleGatingTenants instanceof Map)) {
    req.context.moduleGatingTenants = new Map<string, Promise<TenantDoc | null>>()
  }
  const cache = req.context.moduleGatingTenants as Map<string, Promise<TenantDoc | null>>
  const key = String(id)
  if (!cache.has(key)) {
    cache.set(key, req.payload.findByID({
      collection: 'tenants', id, depth: 0, overrideAccess: true, disableErrors: true,
      req: readReq(req), select: { enabledCollections: true },
    }).catch(() => null))
  }
  return cache.get(key)!
}

const enabledForTenant = async (req: AccessArgs['req'], id: TenantID | null, slug: string): Promise<boolean> =>
  id !== null && isCollectionEnabledForWrite(await getCachedTenant(req, id), slug)

const hasTenantMembership = (req: AccessArgs['req'], id: TenantID | null): boolean => id !== null
  && Boolean((req.user as UserWithRolesAndTenants)?.tenants?.some(row => String(tenantID(row.tenant)) === String(id)))

const storedOwner = async (req: AccessArgs['req'], slug: string, id: TenantID | null, draft = false): Promise<TenantID | null> => {
  if (id === null) return null
  const doc = await req.payload.findByID({
    collection: slug as CollectionSlug, id, depth: 0, draft, trash: true,
    overrideAccess: true, disableErrors: true, req: readReq(req), select: { tenant: true },
  })
  return tenantID((doc as { tenant?: unknown } | null)?.tenant)
}

const entitledMemberships = async (req: AccessArgs['req'], slug: string): Promise<TenantID[]> => {
  const ids = new Map<string, TenantID>()
  for (const row of (req.user as UserWithRolesAndTenants)?.tenants ?? []) {
    const id = tenantID(row.tenant)
    if (id !== null) ids.set(String(id), id)
  }
  const enabled: TenantID[] = []
  for (const id of ids.values()) {
    if (await enabledForTenant(req, id, slug)) enabled.push(id)
  }
  return enabled
}

const intersectAccess = (existing: AccessResult, constraint: Where): Where =>
  typeof existing === 'object' ? { and: [existing, constraint] } : constraint

const passesExistingAccess = async (
  existing: AccessFn | undefined,
  args: AccessArgs,
): Promise<AccessResult> => {
  if (!existing) return true
  return existing(args)
}

// Cross-cutting collections every tenant needs regardless of which modules
// they subscribe to. Media is not a sellable module: without this, an editor
// could pick existing images but NOT upload new ones (functional battery,
// 2026-09-23 — "You are not allowed to perform this action").
const ALWAYS_ENTITLED = new Set(['media'])

const composeWriteAccess =
  (slug: string, operation: WriteOperation, existing: AccessFn | undefined): AccessFn =>
  async (args) => {
    const existingResult = await passesExistingAccess(existing, args)
    if (existingResult === false) return false

    if (isSuperAdmin(args.req.user)) return existingResult
    if (ALWAYS_ENTITLED.has(slug)) return existingResult
    if (!args.req.user) return false

    if (operation === 'create') {
      // getEntityPermissions supplies collectionConfig; native create access
      // does not. A discovery grant must not authorize a targetless write.
      if (args.data === undefined && args.id === undefined && args.collectionConfig?.slug === slug) {
        const ids = await entitledMemberships(args.req, slug)
        return ids.length ? intersectAccess(existingResult, { tenant: { in: ids } }) : false
      }
      return await enabledForTenant(args.req, tenantID(args.data?.tenant), slug) ? existingResult : false
    }

    // A transfer must be entitled at BOTH ends. Native plugin membership
    // access and beforeValidate still enforce who may own/assign each tenant.
    if (operation === 'update' && args.data && 'tenant' in args.data
      && !await enabledForTenant(args.req, tenantID(args.data.tenant), slug)) return false

    if (args.id !== undefined && args.id !== null) {
      const parent = await storedOwner(args.req, slug, args.id)
      if (!await enabledForTenant(args.req, parent, slug)) return false
      const owner = await storedOwner(args.req, slug, args.id, true)
      if (!await enabledForTenant(args.req, owner, slug)) return false
      if (!hasTenantMembership(args.req, parent) || !hasTenantMembership(args.req, owner)) return false
      // Native document permissions and restore inspect the parent, while
      // update/restore also query the latest version using this same filter.
      // Both owners are authorized above; neither lookup may exclude the other.
      const owners = [...new Set([parent, owner])]
      return intersectAccess(existingResult, { tenant: { in: owners } })
    }

    // Collection permissions and bulk operations have no document ID. Never
    // return an unbounded true: Payload intersects this with the native filter.
    const ids = await entitledMemberships(args.req, slug)
    return ids.length ? intersectAccess(existingResult, { tenant: { in: ids } }) : false
  }

const checkWriteOwnership = (slug: string): CollectionBeforeValidateHook => async ({ data, originalDoc, operation, req }) => {
  if (!req.user || isSuperAdmin(req.user) || ALWAYS_ENTITLED.has(slug)) return data
  const owner = operation === 'create' ? tenantID(data?.tenant) : tenantID(originalDoc?.tenant)
  const proposed = data && 'tenant' in data ? tenantID(data.tenant) : owner
  const parent = operation === 'update' ? await storedOwner(req, slug, tenantID(originalDoc?.id)) : owner
  const latest = operation === 'update' ? await storedOwner(req, slug, tenantID(originalDoc?.id), true) : owner
  // Restore's access callback sees only _status, not the historical tenant.
  // Check the actual native snapshot too, including draft/autosave transfers.
  if (operation === 'update' && (!hasTenantMembership(req, parent) || !hasTenantMembership(req, latest))) {
    throw new Forbidden(req.t)
  }
  if (!await enabledForTenant(req, parent, slug) || !await enabledForTenant(req, latest, slug) || !await enabledForTenant(req, owner, slug)
    || !await enabledForTenant(req, proposed, slug)) {
    throw new Forbidden(req.t)
  }
  return data
}

const checkDeleteOwnership = (slug: string): CollectionBeforeDeleteHook => async ({ id, req }) => {
  if (!req.user || isSuperAdmin(req.user) || ALWAYS_ENTITLED.has(slug)) return
  // Native bulk delete authorizes the parent query once, then removes every
  // version. Recheck both owners per document before any deletion occurs.
  const parent = await storedOwner(req, slug, id)
  const latest = await storedOwner(req, slug, id, true)
  if (!hasTenantMembership(req, parent) || !hasTenantMembership(req, latest)
    || !await enabledForTenant(req, parent, slug) || !await enabledForTenant(req, latest, slug)) {
    throw new Forbidden(req.t)
  }
}

const collectionHasDrafts = (config: CollectionConfig): boolean =>
  Boolean((config.versions as { drafts?: unknown } | undefined)?.drafts)

const collectionHasPublishedField = (config: CollectionConfig): boolean =>
  Array.isArray(config.fields) &&
  config.fields.some((f) => 'name' in f && (f as { name?: string }).name === 'published')

// READ gate for anonymous callers:
//  1. published-only — drafts/unpublished stay private (they were queryable
//     over the raw REST/GraphQL API before the 2026-07 hardening).
//  2. TENANT-SCOPED BY HOST — on a tenant's own domain (roomchang.serviettelab
//     .com) anon reads return ONLY that tenant's rows. This closes the
//     cross-tenant content bleed flagged as the Bar-A blocker in the
//     production-readiness audit: without it, GET /api/services commingles
//     every tenant the moment tenant #2 has content.
//
//     ⚠ PLATFORM HOST CLOSED (2026-08-31): the last anonymous consumer (the
//     sandbox site) now reads the tenant host, so anonymous calls on a host
//     that maps to NO tenant are denied outright in production — a second
//     tenant's content can never bleed through serviettelab.com. Local dev
//     keeps published-only reads (localhost maps to no tenant and the dummy
//     site reads the API anonymously).
//
// Logged-in users keep the collection's existing read (the multi-tenant
// plugin scopes them to their tenant; staff still see drafts). Collections
// whose existing read already denies anonymous access (Enquiries,
// BookingSlots) fall through unchanged.
const composeReadAccess =
  (config: CollectionConfig, existing: AccessFn | undefined): AccessFn =>
  async (args) => {
    const existingResult = await passesExistingAccess(existing, args)
    if (existingResult === false) return false
    if (args.req.user) return existingResult

    const hostTenant = await getHostTenant(args.req)
    if (!hostTenant && process.env.NODE_ENV === 'production') return false

    const constraints: Where[] = []
    if (collectionHasDrafts(config)) {
      // Parent rows of never-published docs carry _status 'draft'; Payload does
      // NOT exclude them from non-draft reads by itself (checked in 3.85's
      // find operation) — this is where the public gets published-only.
      constraints.push({ _status: { equals: 'published' } })
    } else if (collectionHasPublishedField(config)) {
      constraints.push({ published: { equals: true } })
    }
    if (hostTenant) {
      constraints.push({ tenant: { equals: hostTenant.id } })
    }

    if (constraints.length === 0) return existingResult
    if (constraints.length === 1) return constraints[0]
    return { and: constraints }
  }

export const withModuleGating = (config: CollectionConfig): CollectionConfig => {
  const existingHidden = config.admin?.hidden
  const gatedHidden: NonNullable<NonNullable<CollectionConfig['admin']>['hidden']> = (args) => {
    const existingResult =
      typeof existingHidden === 'function' ? existingHidden(args) : Boolean(existingHidden)

    // Super-admins keep collections VISIBLE — hidden:true also blocks the
    // routes (views throw not-found for non-visible entities; learned the
    // hard way). The clean Platform-only sidebar is done in the custom Nav
    // component (PlatformNav) instead, which doesn't affect routing.
    if (isSuperAdmin(args.user)) return false
    if (existingResult) return true

    const memberships = (args.user as UserWithRolesAndTenants)?.tenants ?? []
    if (!memberships.length) return false
    return memberships.every(({ tenant }) => tenant && typeof tenant === 'object'
      && !isCollectionVisible(tenant, config.slug))
  }

  return {
    ...config,
    ...(collectionHasDrafts(config) ? { disableBulkDelete: true } : {}),
    admin: {
      ...config.admin,
      hidden: gatedHidden,
    },
    hooks: {
      ...config.hooks,
      beforeDelete: [checkDeleteOwnership(config.slug), ...(config.hooks?.beforeDelete ?? [])],
      beforeValidate: [...(config.hooks?.beforeValidate ?? []), checkWriteOwnership(config.slug)],
    },
    access: {
      ...config.access,
      read: composeReadAccess(config, config.access?.read),
      create: composeWriteAccess(config.slug, 'create', config.access?.create),
      update: composeWriteAccess(config.slug, 'update', config.access?.update),
      delete: composeWriteAccess(config.slug, 'delete', config.access?.delete),
    },
  }
}
