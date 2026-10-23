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
      label: 'Author photo URL (All languages)',
      type: 'text',
      admin: {
        components: { afterInput: ['/components/ImageUrlPreview#ImageUrlPreview'], Cell: '/components/ImageCell#ImageCell' },
        description: 'Shared by all languages. Author photo for the homepage quote carousel and Patient Testimonials quote cards; video cards are edited in Videos.',
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
      admin: { position: 'sidebar', description: 'Shared by all languages. The homepage shows explicitly featured quotes when any exist; otherwise it shows all published quotes. The full Patient Testimonials quote wall always includes all published quotes.' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Shared by all languages. Sets quote sequence; video testimonial order is managed separately in Videos.' },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
}
