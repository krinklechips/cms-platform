import type { CollectionConfig } from 'payload'

/**
 * Media — tenant-scoped uploads stored in Cloudflare R2 (cms-platform bucket).
 *
 * PER-TENANT FOLDERS: each doc's `prefix` decides its folder in the bucket
 * (the storage plugin reads data.prefix per document). A beforeValidate hook
 * sets it to the owning tenant's slug — Roomchang uploads land in
 * `roomchang/…`, Oriental Bank in `orientalbank-plc/…`. Imports may pass an
 * explicit deeper prefix (e.g. `roomchang/doctors`) which is preserved.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Media Library',
    defaultColumns: ['filename', 'alt', 'prefix', 'updatedAt'],
    // NOTE: not hidden — hidden:true blocks the route itself. The super-admin
    // sidebar is slimmed by the custom PlatformNav component instead.
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeValidate: [
      async ({ data, req }) => {
        if (!data) return data

        const resolveSlug = async (tenantId: unknown): Promise<string | undefined> => {
          if (!tenantId) return undefined
          try {
            const tenant = (await req.payload.findByID({
              collection: 'tenants',
              id: tenantId as number | string,
              depth: 0,
              overrideAccess: true,
            })) as { slug?: string }
            return tenant?.slug
          } catch {
            req.payload.logger.warn('media prefix hook: could not resolve tenant — using default prefix')
            return undefined
          }
        }

        const roles = (req.user as { roles?: string[] } | null)?.roles
        const isSuperAdmin = Boolean(roles?.includes('super-admin'))
        const isRegularTenantUser = Boolean(req.user) && !isSuperAdmin

        if (isRegularTenantUser) {
          // SECURITY: a tenant user may ONLY upload into their own tenant's R2
          // folder. Ignore any client-supplied `prefix` (which could target
          // another tenant's namespace) and derive it from the user's tenant.
          const ownTenant = (req.user as { tenants?: { tenant?: unknown }[] } | null)?.tenants?.[0]?.tenant
          const ownTenantId =
            typeof ownTenant === 'object' && ownTenant !== null
              ? (ownTenant as { id?: number | string }).id
              : ownTenant
          const slug = await resolveSlug(ownTenantId)
          if (slug) data.prefix = slug
          return data
        }

        // Super-admin or server scripts (overrideAccess, no user): honor an
        // explicit prefix (e.g. the R2 import's `roomchang/doctors`); otherwise
        // derive the folder from the document's own tenant.
        if (!data.prefix || data.prefix === 'serviette-media') {
          const tenantId =
            typeof data.tenant === 'object' && data.tenant !== null
              ? (data.tenant as { id: number | string }).id
              : data.tenant
          const slug = await resolveSlug(tenantId)
          if (slug) data.prefix = slug
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
    },
  ],
  upload: true,
}
