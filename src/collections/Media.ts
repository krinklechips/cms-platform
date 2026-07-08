import type { CollectionConfig } from 'payload'

/**
 * Media — tenant-scoped uploads. Local disk for the POC; swap to the
 * Cloudflare R2 bucket via @payloadcms/storage-s3 (already installed) once
 * R2 credentials are added to .env. Existing R2 image URLs from the live
 * site are carried as plain `imageUrl` text fields on content for now.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
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
