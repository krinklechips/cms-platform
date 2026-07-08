import type { CollectionConfig } from 'payload'

/**
 * Branches — mirrors the live site's `branches` table (Supabase).
 * Address, badge, description, and hours are localized from translations.
 */
export const Branches: CollectionConfig = {
  slug: 'branches',
  admin: {
    group: 'Contact & Branches',
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'phone', 'published', 'order'],
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
        description: 'Supabase branches.id — used by the sync for idempotent upserts.',
        readOnly: true,
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Optional — the live branches table has no slugs; the sync derives one from the name.',
      },
    },
    {
      name: 'shortName',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'badge',
      type: 'text',
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'address',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'phone',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'mobile',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'email',
      type: 'email',
      admin: { position: 'sidebar' },
    },
    {
      name: 'hours',
      type: 'textarea',
      localized: true,
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
      name: 'mapQuery',
      type: 'text',
    },
    {
      name: 'mapUrl',
      type: 'text',
    },
    {
      name: 'mapPlaceUrl',
      type: 'text',
    },
    {
      name: 'photos',
      type: 'json',
      admin: {
        description: 'Branch photos JSON — carried from the live site losslessly.',
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
