import type { CollectionConfig } from 'payload'

/**
 * Testimonials — mirrors the live site's `testimonials` table (Supabase).
 * Author title and quote are localized; author identity stays shared.
 */
export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    group: 'Home Page',
    useAsTitle: 'authorName',
    defaultColumns: ['authorName', 'authorTitle', 'isFeatured', 'published', 'order'],
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
        description: 'Supabase testimonials.id — used by the sync for idempotent upserts.',
        readOnly: true,
      },
    },
    {
      name: 'authorName',
      type: 'text',
      required: true,
    },
    {
      name: 'authorTitle',
      type: 'text',
      localized: true,
    },
    {
      name: 'authorPhotoUrl',
      type: 'text',
      admin: {
        components: { afterInput: ['/components/ImageUrlPreview#ImageUrlPreview'], Cell: '/components/ImageCell#ImageCell' },
        description: 'Author photo URL (carried from the live site).',
      },
    },
    {
      name: 'quote',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'rating',
      type: 'number',
      min: 0,
      max: 5,
      defaultValue: 5,
      admin: { position: 'sidebar' },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
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
