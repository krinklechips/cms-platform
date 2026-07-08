import type { CollectionConfig } from 'payload'

/**
 * Publications — mirrors the live site's `publications` table (Supabase).
 */
export const Publications: CollectionConfig = {
  slug: 'publications',
  admin: {
    group: 'Education & News',
    useAsTitle: 'title',
    defaultColumns: ['title', 'journal', 'year', 'published', 'order'],
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
        description: 'Supabase publications.id — used by the sync for idempotent upserts.',
        readOnly: true,
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'authors',
      type: 'text',
    },
    {
      name: 'journal',
      type: 'text',
    },
    {
      name: 'year',
      type: 'number',
      admin: { position: 'sidebar' },
    },
    {
      name: 'doi',
      type: 'text',
    },
    {
      name: 'url',
      type: 'text',
    },
    {
      name: 'abstract',
      type: 'textarea',
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
