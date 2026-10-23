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
      admin: { position: 'sidebar', description: 'Shared by all languages. Use full-comparison for International Price Comparison or implants-comparison for Dental Implants Price Comparison. Rows connect through their Set relationship; other slugs have no website preview.' },
    },
    {
      name: 'exchangeRate',
      type: 'number',
      admin: { position: 'sidebar', description: 'Shared by all languages. Displayed on this set\'s comparison page; full-comparison and implants-comparison each use their own exchange rate.' },
    },
    {
      name: 'sourceNote',
      type: 'text',
      localized: true,
      admin: { description: 'Source note in the selected language, displayed on both full-comparison and implants-comparison pages.' },
    },
    {
      name: 'lastUpdated',
      type: 'date',
      admin: { position: 'sidebar', description: 'Shared by all languages. Last-updated date displayed on both full-comparison and implants-comparison pages.' },
    },
  ],
}
