import type { CollectionConfig } from 'payload'

/**
 * CommunityArticles — mirrors the live site's `community_articles` table (Supabase).
 * Title, description, and body are localized from content_translations.
 */
export const CommunityArticles: CollectionConfig = {
  slug: 'community-articles',
  admin: {
    group: 'Education & News',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'date', 'published', 'order'],
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
          'Supabase community_articles.id — used by the sync for idempotent upserts.',
        readOnly: true,
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
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
      name: 'imageUrl',
      type: 'text',
      admin: {
        components: { afterInput: ['/components/ImageUrlPreview#ImageUrlPreview'] },
        description: 'R2 image URL (carried from community_articles.image).',
      },
    },
    {
      name: 'imageAlt',
      type: 'text',
    },
    {
      name: 'href',
      type: 'text',
    },
    {
      name: 'date',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'body',
      type: 'array',
      localized: true,
      fields: [{ name: 'paragraph', type: 'text', required: true }],
    },
    {
      name: 'images',
      type: 'array',
      fields: [{ name: 'url', type: 'text', required: true }],
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
