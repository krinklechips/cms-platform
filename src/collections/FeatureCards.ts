import type { CollectionConfig } from 'payload'

/**
 * FeatureCards — mirrors the live site's `homepage_feature_cards` table (Supabase).
 * Localized fields carry the translated homepage card copy.
 */
export const FeatureCards: CollectionConfig = {
  slug: 'feature-cards',
  admin: {
    group: 'Home Page',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'href', 'order'],
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
        description: 'Supabase homepage_feature_cards.id — used by the sync for idempotent upserts.',
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
        components: { afterInput: ['/components/ImageUrlPreview#ImageUrlPreview'], Cell: '/components/ImageCell#ImageCell' },
        description: 'R2 image URL (carried from the live site).',
      },
    },
    {
      name: 'imageAlt',
      type: 'text',
      localized: true,
    },
    {
      name: 'href',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'cta',
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
