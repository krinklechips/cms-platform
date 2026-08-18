import type { CollectionConfig } from 'payload'

/**
 * TimelineEvents — mirrors the live site's `timeline_events` table (Supabase).
 * Localized fields are EN-only on initial sync but editable per locale later.
 */
export const TimelineEvents: CollectionConfig = {
  slug: 'timeline-events',
  admin: {
    group: 'About Pages',
    useAsTitle: 'heading',
    defaultColumns: ['year', 'heading', 'published', 'order'],
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
        description: 'Supabase timeline_events.id — used by the sync for idempotent upserts.',
        readOnly: true,
      },
    },
    {
      name: 'year',
      type: 'text',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'caption',
      type: 'text',
      localized: true,
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'body',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'imageUrl',
      type: 'text',
      admin: {
        components: { afterInput: ['/components/ImageUrlPreview#ImageUrlPreview'], Cell: '/components/ImageCell#ImageCell' },
        description: 'R2 image URL (carried from timeline_events.imageSrc).',
      },
    },
    {
      name: 'imageAlt',
      type: 'text',
    },
    {
      name: 'imagePosition',
      type: 'text',
      admin: { position: 'sidebar' },
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
