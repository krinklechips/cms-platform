import type { CollectionConfig } from 'payload'

/**
 * Services — mirrors the live site's `services` table (Supabase).
 * Localized fields replace the old content_translations overlay: editors
 * switch locale (EN / KM / ZH) in the admin bar and edit per-language.
 *
 * `content` carries the detail-page sections JSON losslessly (same shape
 * ServiceDetailContent renders: callout/text/cards/steps/image/pricing…).
 * Upgrade path: convert to Payload blocks for structured editing later.
 */
export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'published', 'order'],
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
        description: 'Supabase services.id — used by the sync for idempotent upserts.',
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
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'features',
      type: 'array',
      localized: true,
      admin: {
        description: 'Feature bullets shown on cards / detail page.',
      },
      fields: [
        {
          name: 'feature',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'imageUrl',
      type: 'text',
      admin: {
        description: 'R2 image URL (carried from the live site).',
      },
    },
    {
      name: 'content',
      type: 'json',
      localized: true,
      admin: {
        description:
          'Detail-page sections JSON ({ sections: [...] }) — same shape the live site renders.',
      },
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
