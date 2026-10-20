import type { CollectionConfig } from 'payload'

/**
 * PricingComparisonSets — mirrors the live site's `pricing_comparison_sets` table (Supabase).
 * Source notes are localized; comparison keys and rates remain shared.
 */
export const PricingComparisonSets: CollectionConfig = {
  slug: 'pricing-comparison-sets',
  admin: {
    group: 'Pricing Page',
    useAsTitle: 'slug',
    defaultColumns: ['slug', 'exchangeRate', 'lastUpdated'],
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
        description: 'Supabase pricing_comparison_sets.id — used by the sync for idempotent upserts.',
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
      name: 'exchangeRate',
      type: 'number',
      admin: { position: 'sidebar' },
    },
    {
      name: 'sourceNote',
      type: 'text',
      localized: true,
    },
    {
      name: 'lastUpdated',
      type: 'date',
      admin: { position: 'sidebar' },
    },
  ],
}
