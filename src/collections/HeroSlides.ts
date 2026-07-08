import type { CollectionConfig } from 'payload'

/**
 * HeroSlides — mirrors the live site's `hero_slides` table (Supabase).
 * Localized fields are EN-only on initial sync but editable per locale later.
 */
export const HeroSlides: CollectionConfig = {
  slug: 'hero-slides',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'imagePosition', 'published', 'order'],
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
        description: 'Supabase hero_slides.id — used by the sync for idempotent upserts.',
        readOnly: true,
      },
    },
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'subtitle',
      type: 'text',
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
        description: 'R2 image URL (carried from the live site).',
      },
    },
    {
      name: 'imageAlt',
      type: 'text',
      localized: true,
    },
    {
      name: 'imagePosition',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'imageSize',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'preserveFullImage',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'ctaText',
      type: 'text',
      localized: true,
    },
    {
      name: 'ctaUrl',
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
