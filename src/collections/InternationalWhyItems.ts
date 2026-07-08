import type { CollectionConfig } from 'payload'

/**
 * InternationalWhyItems — mirrors the live site's `international_why_items` table (Supabase).
 * Title and description are localized from content_translations.
 */
export const InternationalWhyItems: CollectionConfig = {
  slug: 'international-why-items',
  admin: {
    group: 'International Page',
    useAsTitle: 'title',
    defaultColumns: ['title', 'order'],
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
        description: 'Supabase international_why_items.id — used by the sync for idempotent upserts.',
        readOnly: true,
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
  ],
}
