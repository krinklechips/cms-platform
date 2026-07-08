import type { CollectionConfig } from 'payload'

/**
 * PricingComparisonRows — mirrors the live site's `pricing_comparison_rows` table (Supabase).
 * Nothing is localized in the source table.
 */
export const PricingComparisonRows: CollectionConfig = {
  slug: 'pricing-comparison-rows',
  admin: {
    group: 'Pricing',
    useAsTitle: 'treatment',
    defaultColumns: ['treatment', 'set', 'roomchangPrice', 'order'],
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
        description: 'Supabase pricing_comparison_rows.id — used by the sync for idempotent upserts.',
        readOnly: true,
      },
    },
    {
      name: 'set',
      type: 'relationship',
      relationTo: 'pricing-comparison-sets',
      admin: { position: 'sidebar' },
    },
    {
      name: 'sourceSetId',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'ada',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'treatment',
      type: 'text',
      required: true,
    },
    {
      name: 'roomchangPrice',
      type: 'text',
    },
    {
      name: 'australiaPrice',
      type: 'text',
    },
    {
      name: 'singaporePrice',
      type: 'text',
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
  ],
}
