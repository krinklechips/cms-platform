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

const isCollectionEnabled = (tenant: TenantDoc | null | undefined, slug: string): boolean => {
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
    if (!isCollectionEnabled(tenant, slug)) return false

    return existingResult
  }

export const withModuleGating = (config: CollectionConfig): CollectionConfig => {
  const existingHidden = config.admin?.hidden
  const gatedHidden: NonNullable<NonNullable<CollectionConfig['admin']>['hidden']> = (args) => {
    const existingResult =
      typeof existingHidden === 'function' ? existingHidden(args) : Boolean(existingHidden)

    // Platform view (per Enoch): the super-admin's own nav shows ONLY the
    // Platform group — content collections are reached through each Tenant's
    // "Manage content" links (hidden only removes nav/dashboard entries; the
    // list/edit views stay reachable by URL, and super-admin access is never
    // restricted).
    if (isSuperAdmin(args.user)) return true
    if (existingResult) return true

    const tenant = firstTenantValue(args.user)
    if (tenant === undefined || tenant === null || typeof tenant !== 'object') return false

    return !isCollectionEnabled(tenant, config.slug)
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
