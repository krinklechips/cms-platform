import { randomUUID } from 'node:crypto'
import { APIError, type CollectionConfig } from 'payload'
import { getHostTenant } from '../lib/host-scope'

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
  disableDuplicate: true,
  admin: {
    group: 'Media Library',
    description: 'Public website files. Upload a new file to replace an image, then select it on the page. Existing files are kept to protect published pages. Do not upload private patient records.',
    defaultColumns: ['filename', 'alt', 'prefix', 'updatedAt'],
    // NOTE: not hidden — hidden:true blocks the route itself. The super-admin
    // sidebar is slimmed by the custom PlatformNav component instead.
  },
  access: {
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: () => false,
    // Anon reads on a TENANT host are scoped to that tenant's files (Bar-A
    // audit: read () => true exposed every tenant's media, including
    // unpublished uploads, to any caller). PLATFORM HOST CLOSED 2026-08-31 —
    // every anonymous consumer now reads a tenant host; localhost dev keeps
    // open reads (it maps to no tenant).
    read: async ({ req }) => {
      if (req.user) return true // plugin + admin handle authed scoping
      const hostTenant = await getHostTenant(req)
      if (hostTenant) return { tenant: { equals: hostTenant.id } }
      return process.env.NODE_ENV !== 'production'
    },
  },
  hooks: {
    beforeOperation: [
      ({ operation, req, args }) => {
        if (operation === 'delete' && req.context.mediaMaintenance !== true) {
          throw new APIError('Existing files are protected. Deletion requires a reviewed maintenance operation.', 409)
        }
        if (operation === 'update') {
          const edits = req.query?.uploadEdits
          if (req.file || (edits && typeof edits === 'object' && Object.keys(edits).length > 0)) {
            throw new APIError('Upload a new file and select it on the page instead of replacing or editing this file.', 409)
          }
          if ('data' in args && args.data) {
            // Refocal changes cause Payload to fetch and rewrite the file before validation.
            delete args.data.focalX
            delete args.data.focalY
          }
        }
        if (operation === 'create') {
          if ('duplicateFromID' in args && args.duplicateFromID) {
            throw new APIError('Upload a new file instead of duplicating an existing file.', 409)
          }
          if (req.file) req.file.name = `${randomUUID()}-${req.file.name}`
          if ('overwriteExistingFiles' in args) args.overwriteExistingFiles = false
        }
        return args
      },
    ],
    beforeValidate: [
      async ({ data, req, operation, originalDoc }) => {
        if (!data) return data

        if (operation === 'update' && originalDoc) {
          // Metadata updates must never change the identity of a shared storage object.
          for (const field of ['tenant', 'prefix', 'filename', 'url', 'mimeType', 'filesize', 'width', 'height', 'sizes', 'focalX', 'focalY']) {
            if (Object.hasOwn(originalDoc, field)) data[field] = originalDoc[field]
            else delete data[field]
          }
          return data
        }

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
            req.payload.logger.warn('media prefix hook: could not resolve tenant')
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
          if (!slug) throw new APIError('The upload tenant folder could not be resolved. Please retry.', 503)
          data.prefix = slug
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
  upload: { hideRemoveFile: true },
}
