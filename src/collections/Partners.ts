import type { CollectionConfig } from 'payload'

/**
 * Partners — mirrors the live site's `partners` table (Supabase).
 * Nothing is localized in the source table.
 */
export const Partners: CollectionConfig = {
  slug: 'partners',
  admin: {
    group: 'Partnerships',
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'website', 'order'],
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
        description: 'Supabase partners.id — used by the sync for idempotent upserts.',
        readOnly: true,
      },
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
        description: 'R2 logo URL (carried from partners.logo_src).',
      },
    },
    {
      name: 'website',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'partner-categories',
      admin: { position: 'sidebar' },
    },
    {
      name: 'sourceCategoryId',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
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
