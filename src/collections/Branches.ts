import type { CollectionConfig } from 'payload'

/**
 * Branches — mirrors the live site's `branches` table (Supabase).
 * Address, badge, description, and hours are localized from translations.
 */
export const Branches: CollectionConfig = {
  slug: 'branches',
  admin: {
    group: 'Main Pages',
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
        description: 'Shared by all languages. Optional detail-page URL key. Known imported branches keep their canonical website routes even if this derived slug differs; other branches use the slug or source ID.',
      },
    },
    {
      name: 'shortName',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'displayName',
      type: 'text',
      localized: true,
    },
    {
      name: 'shortDisplayName',
      type: 'text',
      localized: true,
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
      label: 'Image URL (All languages)',
      type: 'text',
      admin: {
        components: { afterInput: ['/components/ImageUrlPreview#ImageUrlPreview'], Cell: '/components/ImageCell#ImageCell' },
        description: 'Shared by all languages. Main branch image; the branch photo gallery is managed separately in Photos.',
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
      label: 'Photos (All languages)',
      type: 'json',
      admin: {
        description: 'Shared by all languages. Photo gallery on this branch\'s detail page. Retains the existing branch photos JSON shape; this does not edit the general Facilities photo sections.',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Shared by all languages. Sets branch list order, not the website navigation hierarchy.' },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
}
