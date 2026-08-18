import type { CollectionConfig } from 'payload'

/**
 * PartnerCategories — mirrors the live site's `partner_categories` table (Supabase).
 * Nothing is localized in the source table.
 */
export const PartnerCategories: CollectionConfig = {
  slug: 'partner-categories',
  admin: {
    group: 'About Pages',
    useAsTitle: 'name',
    defaultColumns: ['name', 'order'],
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
        description: 'Supabase partner_categories.id — used by the sync for idempotent upserts.',
        readOnly: true,
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
  ],
}
