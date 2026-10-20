import type { CollectionConfig } from 'payload'

/**
 * SiteStats — mirrors the live site's `site_stats` table (Supabase).
 * The source table has no id column; sourceId is the source `key`.
 */
export const SiteStats: CollectionConfig = {
  slug: 'site-stats',
  admin: {
    group: 'Home Page',
    useAsTitle: 'key',
    defaultColumns: ['key', 'displayValue', 'label', 'published', 'order'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'statUsage',
      type: 'ui',
      admin: { components: { Field: '/components/StatUsage#StatUsage' } },
    },
    {
      name: 'sourceId',
      type: 'text',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Supabase site_stats.key — used by the sync for idempotent upserts.',
        readOnly: true,
      },
    },
    {
      name: 'key',
      type: 'text',
      required: true,
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'displayValue',
      type: 'text',
      localized: true,
    },
    {
      name: 'originalDisplayValue',
      type: 'text',
      localized: true,
      admin: { hidden: true },
      access: { create: () => false, update: () => false },
    },
    {
      name: 'numericValue',
      label: 'Number (all languages)',
      type: 'number',
      admin: { position: 'sidebar' },
    },
    {
      name: 'suffix',
      type: 'text',
      localized: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'label',
      type: 'text',
      localized: true,
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
