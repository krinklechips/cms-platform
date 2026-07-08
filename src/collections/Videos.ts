import type { CollectionConfig } from 'payload'

/**
 * Videos — mirrors the live site's `videos` table (Supabase).
 * Localized fields sync EN only initially and remain editable per locale.
 */
export const Videos: CollectionConfig = {
  slug: 'videos',
  admin: {
    group: 'Education & News',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'doctor', 'published', 'order'],
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
        description: 'Supabase videos.id — used by the sync for idempotent upserts.',
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
      name: 'url',
      type: 'text',
      required: true,
    },
    {
      name: 'thumbnail',
      type: 'text',
      admin: { components: { afterInput: ['/components/ImageUrlPreview#ImageUrlPreview'] } },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'category',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'doctor',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'topic',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'treatment',
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
