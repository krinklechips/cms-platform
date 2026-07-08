import type { CollectionConfig } from 'payload'

/**
 * BrandLogos — mirrors the live site's `brand_logos` table (Supabase).
 * Nothing is localized in the source table.
 */
export const BrandLogos: CollectionConfig = {
  slug: 'brand-logos',
  admin: {
    group: 'Home Page',
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'order'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'sourceId',
      type: 'text',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Supabase brand_logos.id — used by the sync for idempotent upserts.',
        readOnly: true,
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'logoUrl',
      type: 'text',
      admin: {
        components: { afterInput: ['/components/ImageUrlPreview#ImageUrlPreview'] },
        description: 'R2 logo URL (carried from the live site).',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
  ],
}
