import type { CollectionConfig } from 'payload'

/**
 * PricingCategories — mirrors the live site's `pricing_categories` table (Supabase).
 * Title is localized from content_translations.
 */
export const PricingCategories: CollectionConfig = {
  slug: 'pricing-categories',
  admin: {
    group: 'Pricing Page',
    useAsTitle: 'title',
    defaultColumns: ['title', 'icon', 'order'],
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
        description: 'Supabase pricing_categories.id — used by the sync for idempotent upserts.',
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
      name: 'icon',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
  ],
}
