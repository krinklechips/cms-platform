import type { CollectionConfig } from 'payload'

/**
 * CareerPositions — mirrors the live site's `career_positions` table (Supabase).
 * Title, description, requirements, and benefits are localized from translations.
 */
export const CareerPositions: CollectionConfig = {
  slug: 'career-positions',
  admin: {
    group: 'Careers',
    useAsTitle: 'title',
    defaultColumns: ['title', 'department', 'type', 'published', 'order'],
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
          'Supabase career_positions.id — used by the sync for idempotent upserts.',
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
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'department',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'type',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'location',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'requirements',
      type: 'array',
      localized: true,
      fields: [{ name: 'value', type: 'text', required: true }],
    },
    {
      name: 'benefits',
      type: 'array',
      localized: true,
      fields: [{ name: 'value', type: 'text', required: true }],
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
}
