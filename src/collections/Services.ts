import type { CollectionConfig } from 'payload'
import { SECTION_BLOCKS } from '../blocks/section-blocks'

/**
 * Services — mirrors the live site's `services` table (Supabase).
 * Localized fields replace the old content_translations overlay: editors
 * switch locale (EN / KM / ZH) in the admin bar and edit per-language.
 *
 * `content` carries the detail-page sections JSON losslessly (same shape
 * ServiceDetailContent renders: callout/text/cards/steps/image/pricing…).
 * Upgrade path: convert to Payload blocks for structured editing later.
 */
export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    group: 'Main Pages',
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'published', 'order'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      // Layout-only tabs (unnamed => no schema change): the structured
      // editor up front, the legacy raw JSON tucked away in Advanced —
      // having both stacked on one page read as clutter (Enoch review).
      type: 'tabs',
      tabs: [
        {
          label: 'Page sections',
          fields: [
        {
          name: 'sections',
          type: 'blocks',
          localized: true,
          blocks: SECTION_BLOCKS,
          admin: {
            description:
              'The detail page, section by section — add, reorder and edit with real forms. When any section exists here, the site uses THIS and ignores the legacy JSON below.',
          },
        },
          ],
        },
        {
          label: 'Advanced (legacy JSON)',
          description: 'The old raw-JSON body. Ignored by the site once Page sections has any content.',
          fields: [
        {
          name: 'content',
          type: 'json',
          localized: true,
          admin: {
            description:
              'Detail-page sections JSON ({ sections: [...] }) — same shape the live site renders.',
          },
        },
          ],
        },
      ],
    },
    {
      name: 'sourceId',
      type: 'text',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Supabase services.id — used by the sync for idempotent upserts.',
        readOnly: true,
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      admin: { description: 'Small uppercase label above the hero title.' },
    },
    {
      name: 'heroDescription',
      type: 'textarea',
      localized: true,
      admin: { description: 'Longer hero paragraph (falls back to description).' },
    },
    {
      name: 'category',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'icon',
      type: 'text',
      admin: { position: 'sidebar', description: 'Icon name used on service cards.' },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'features',
      type: 'array',
      localized: true,
      label: 'Overview-card tags',
      admin: {
        initCollapsed: true,
        description:
          'The small pink tags on this service’s card on the "Services" overview page (/services) — a quick "what’s included" summary. NOT shown on this detail page, so the Live Preview won’t change when you edit these.',
      },
      fields: [
        {
          name: 'feature',
          type: 'text',
          required: true,
        },
      ],
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
