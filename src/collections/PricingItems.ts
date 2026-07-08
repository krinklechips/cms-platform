import type { CollectionConfig } from 'payload'

/**
 * PricingItems — mirrors the live site's `pricing_items` table (Supabase).
 * Name and note are localized from content_translations.
 */
export const PricingItems: CollectionConfig = {
  slug: 'pricing-items',
  admin: {
    group: 'Pricing Page',
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'category', 'order'],
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
        description: 'Supabase pricing_items.id — used by the sync for idempotent upserts.',
        readOnly: true,
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'price',
      type: 'text',
    },
    {
      name: 'ada',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'aus',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'note',
      type: 'text',
      localized: true,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'pricing-categories',
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
