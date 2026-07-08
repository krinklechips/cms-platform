import type { CollectionConfig } from 'payload'

/**
 * Technology — mirrors the live site's `technology` table (Supabase).
 * Localized fields carry the translated text/content from content_translations.
 */
export const Technology: CollectionConfig = {
  slug: 'technology',
  admin: {
    group: 'Technology Page',
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'category', 'published', 'order'],
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
        description: 'Supabase technology.id — used by the sync for idempotent upserts.',
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
      name: 'category',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'highlights',
      type: 'array',
      localized: true,
      fields: [{ name: 'value', type: 'text', required: true }],
    },
    {
      name: 'imageUrl',
      type: 'text',
      admin: {
        components: { afterInput: ['/components/ImageUrlPreview#ImageUrlPreview'] },
        description: 'R2 image URL (carried from the live site).',
      },
    },
    {
      name: 'content',
      type: 'json',
      localized: true,
      admin: {
        description: 'Detail-page content JSON — carried from the live site losslessly.',
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
