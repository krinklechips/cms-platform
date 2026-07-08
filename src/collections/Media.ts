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
    // Platform view: super-admins reach Media via a tenant's "Manage content"
    // links, not the global nav (same rule as the content collections).
    hidden: ({ user }) =>
      Boolean((user as { roles?: string[] } | null)?.roles?.includes('super-admin')),
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeValidate: [
      async ({ data, req }) => {
        if (!data) return data
        // Explicit prefix (e.g. from the R2 import) wins; otherwise derive
        // the folder from the owning tenant's slug.
        if (!data.prefix || data.prefix === 'serviette-media') {
          const tenantId =
            typeof data.tenant === 'object' && data.tenant !== null
              ? (data.tenant as { id: number | string }).id
              : data.tenant
          if (tenantId) {
            try {
              const tenant = (await req.payload.findByID({
                collection: 'tenants',
                id: tenantId as number | string,
                depth: 0,
                overrideAccess: true,
              })) as { slug?: string }
              if (tenant?.slug) data.prefix = tenant.slug
            } catch {
              // fail-open: keep default prefix rather than blocking the upload
              req.payload.logger.warn('media prefix hook: could not resolve tenant — using default prefix')
            }
          }
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
