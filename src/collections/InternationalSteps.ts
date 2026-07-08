import type { CollectionConfig } from 'payload'

/**
 * InternationalSteps — mirrors the live site's `international_steps` table (Supabase).
 * Title and description are localized from content_translations.
 */
export const InternationalSteps: CollectionConfig = {
  slug: 'international-steps',
  admin: {
    group: 'International Page',
    useAsTitle: 'title',
    defaultColumns: ['stepLabel', 'title', 'order'],
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
        description: 'Supabase international_steps.id — used by the sync for idempotent upserts.',
        readOnly: true,
      },
    },
    {
      name: 'stepLabel',
      type: 'text',
      admin: { position: 'sidebar' },
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
