import type { CollectionConfig, PayloadRequest } from 'payload'
import { getTenantByHost, type TenantBranding } from './get-tenant-by-host'

/**
 * HOST SCOPING — "which customer's content am I looking at?"
 *
 * The CMS is served on both the platform host (serviettelab.com) and each
 * tenant's own host (roomchang.serviettelab.com). A super-admin has access to
 * every tenant, so without this the admin list views show ALL tenants' rows on
 * BOTH hosts — which is why Oriental Bank showed up while logged in on the
 * Roomchang domain.
 *
 * This sets `admin.baseFilter`, which the multi-tenant plugin AND-combines with
 * its own filter (node_modules/@payloadcms/plugin-multi-tenant/dist/utilities/
 * combineFilters.js), so it can only ever NARROW what is listed, never widen it.
 *
 * Scope of effect: the ADMIN LIST VIEWS only. It does not touch the public REST
 * API (the sandbox site reads that anonymously and must keep working), and it is
 * not an access boundary — a super-admin who types another tenant's document URL
 * can still open it (withTenantAccess.js skips its constraint for users with
 * access to all tenants). It is the right level for "show me the right things",
 * not for isolation.
 *
 * On the platform host getTenantByHost returns null => baseFilter returns null
 * => behaviour is byte-identical to before.
 */

type BaseFilter = NonNullable<NonNullable<CollectionConfig['admin']>['baseFilter']>

const HOST_TENANT_CTX = 'hostTenant'

/**
 * Resolve (and cache per request) the tenant that owns the requested host.
 * Cached on req.context so N collections + the Nav don't each hit the DB —
 * same pattern as getCachedTenant in module-gating.ts.
 */
export const getHostTenant = async (req: PayloadRequest): Promise<TenantBranding | null> => {
  // Everything here is defensive: this runs on every admin list render, and a
  // throw would blank the whole view.
  try {
    const ctx = req?.context as Record<string, unknown> | undefined
    if (ctx && HOST_TENANT_CTX in ctx) {
      return ctx[HOST_TENANT_CTX] as TenantBranding | null
    }
    const host = req?.headers?.get('x-forwarded-host') ?? req?.headers?.get('host')
    const tenant = req?.payload ? await getTenantByHost(req.payload, host) : null
    if (ctx) ctx[HOST_TENANT_CTX] = tenant
    return tenant
  } catch {
    // Unresolvable host => no host scoping (i.e. the platform view).
    return null
  }
}

/**
 * Wrap a tenant-scoped collection so its admin lists are limited to the tenant
 * that owns the current host. Composes with any baseFilter already defined.
 */
export const withHostScope = (config: CollectionConfig): CollectionConfig => {
  const existing = config.admin?.baseFilter

  const scoped: BaseFilter = async (args) => {
    const existingResult = existing ? await existing(args) : null
    const tenant = await getHostTenant(args.req)
    if (!tenant) return existingResult ?? null

    const hostFilter = { tenant: { in: [tenant.id] } }
    if (!existingResult) return hostFilter
    return { and: [existingResult, hostFilter] }
  }

  return {
    ...config,
    admin: {
      ...config.admin,
      baseFilter: scoped,
    },
  }
}
