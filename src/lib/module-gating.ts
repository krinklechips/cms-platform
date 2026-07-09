import type { CollectionConfig, Where } from 'payload'

type AccessFn = NonNullable<NonNullable<CollectionConfig['access']>['create']>
type AccessArgs = Parameters<AccessFn>[0]
type AccessResult = boolean | Where

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

const firstTenantValue = (user: unknown): number | string | TenantDocWithID | null | undefined =>
  (user as UserWithRolesAndTenants)?.tenants?.[0]?.tenant

const tenantIdFromUser = (user: unknown): number | string | null => {
  const tenant = firstTenantValue(user)
  if (tenant === undefined || tenant === null) return null
  return typeof tenant === 'object' ? tenant.id ?? null : tenant
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

const getCachedTenant = async ({ req }: AccessArgs): Promise<TenantDoc | null> => {
  if ('gatingTenant' in req.context) {
    return req.context.gatingTenant as TenantDoc | null
  }

  const tenantId = tenantIdFromUser(req.user)
  if (tenantId === null) {
    req.context.gatingTenant = null
    return null
  }

  const tenant = (await req.payload.findByID({
    collection: 'tenants',
    id: tenantId,
    depth: 0,
    overrideAccess: true,
  })) as TenantDoc

  req.context.gatingTenant = tenant
  return tenant
}

const passesExistingAccess = async (
  existing: AccessFn | undefined,
  args: AccessArgs,
): Promise<AccessResult> => {
  if (!existing) return true
  return existing(args)
}

const composeWriteAccess =
  (slug: string, existing: AccessFn | undefined): AccessFn =>
  async (args) => {
    const existingResult = await passesExistingAccess(existing, args)
    if (existingResult === false) return false

    if (isSuperAdmin(args.req.user)) return existingResult

    const tenant = await getCachedTenant(args)
    if (!isCollectionEnabledForWrite(tenant, slug)) return false

    return existingResult
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

    const tenant = firstTenantValue(args.user)
    if (tenant === undefined || tenant === null || typeof tenant !== 'object') return false

    return !isCollectionVisible(tenant, config.slug)
  }

  return {
    ...config,
    admin: {
      ...config.admin,
      hidden: gatedHidden,
    },
    access: {
      ...config.access,
      create: composeWriteAccess(config.slug, config.access?.create),
      update: composeWriteAccess(config.slug, config.access?.update),
      delete: composeWriteAccess(config.slug, config.access?.delete),
    },
  }
}
