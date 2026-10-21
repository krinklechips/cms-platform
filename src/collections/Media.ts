import { randomUUID } from 'node:crypto'
import { APIError, type CollectionConfig } from 'payload'
import { getHostTenant } from '../lib/host-scope'
import { resolveMediaTenant } from '../lib/media-validation'

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
          for (const field of ['tenant', 'prefix', '_objectKey', 'filename', 'url', 'mimeType', 'filesize', 'width', 'height', 'sizes', 'focalX', 'focalY']) {
            if (Object.hasOwn(originalDoc, field)) data[field] = originalDoc[field]
            else delete data[field]
          }
          return data
        }

        const roles = (req.user as { roles?: string[] } | null)?.roles
        const isSuperAdmin = Boolean(roles?.includes('super-admin'))
        const isRegularTenantUser = Boolean(req.user) && !isSuperAdmin
        try {
          const { slug } = await resolveMediaTenant(data.tenant, req)
          if (isRegularTenantUser || !data.prefix || data.prefix === 'serviette-media') data.prefix = slug
          else if (typeof data.prefix !== 'string' ||
            !(data.prefix === slug || data.prefix.startsWith(`${slug}/`)) ||
            !data.prefix.split('/').every((part: string) => /^[a-zA-Z0-9_-][a-zA-Z0-9._-]*$/.test(part) && part !== '..')) {
            throw new Error('The explicit upload prefix must remain inside the document tenant folder.')
          }
        } catch (error) {
          throw new APIError(error instanceof Error ? error.message : 'The upload tenant folder could not be resolved.', 400)
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
    // Exact Payload 3.91 generated definitions: keep the existing DB columns when focal editing is disabled.
    ...['focalX', 'focalY'].map(name => ({
      name, type: 'number' as const,
      admin: { disableGroupBy: true, disableListColumn: true, disableListFilter: true, hidden: true },
    })),
  ],
  upload: { hideRemoveFile: true, crop: false, focalPoint: false },
}
