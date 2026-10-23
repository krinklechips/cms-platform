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
      name: 'displayTitle',
      type: 'text',
      localized: true,
      admin: { description: 'Display title in the selected language; the shared publication title is used when this is empty.' },
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
      admin: { position: 'sidebar', description: 'Shared by all languages. Groups publications by year, newest year first.' },
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
      localized: true,
      admin: { description: 'Optional abstract shown with this publication in the selected language.' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Shared by all languages. Sorts publications within the same year; years remain newest first.' },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
}
