import type { CollectionConfig } from 'payload'

/**
 * InternationalTreatments — mirrors the live site's `international_popular_treatments` table (Supabase).
 * Name and saving are localized from content_translations.
 */
export const InternationalTreatments: CollectionConfig = {
  slug: 'international-treatments',
  admin: {
    group: 'International',
    useAsTitle: 'name',
    defaultColumns: ['name', 'saving', 'order'],
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
        description:
          'Supabase international_popular_treatments.id — used by the sync for idempotent upserts.',
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
      name: 'saving',
      type: 'text',
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
