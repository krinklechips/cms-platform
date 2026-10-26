import type { CollectionConfig } from 'payload'
import { SECTION_BLOCKS } from '../blocks/section-blocks'
import { protectDetailAddress } from '../lib/detail-addresses'

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
  indexes: [{ fields: ['tenant', 'slug'], unique: true }],
  hooks: { beforeValidate: [protectDetailAddress] },
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
            // A 13-section service opened as a wall of expanded forms —
            // collapsed rows read as a tidy table of contents (UX audit).
            initCollapsed: true,
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
      admin: { position: 'sidebar', description: 'Shared by all languages. Identifies the detail-page URL; the website navigation hierarchy and overview subservice exclusions remain defined in website code.' },
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
      // The website never reads this column: the services grid assigns icons
      // by slug in code, and its only textual consumer is the retired legacy
      // renderer. Editors saw a typo-fragile mystery box (UX audit) — keep it
      // for sync fidelity, super-admin-only.
      name: 'icon',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Not shown on the website — kept for the data sync.',
        condition: (_data, _sibling, ctx) =>
          Boolean((ctx?.user as { roles?: string[] } | null)?.roles?.includes('super-admin')),
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', readOnly: true, description: 'Unsupported by the current website: this flag does not feature or reorder service cards. Existing values are retained.' },
    },
    {
      name: 'features',
      type: 'array',
      localized: true,
      label: 'Overview-card tags',
      admin: {
        initCollapsed: true,
        description:
          'The small tags on this service\'s card on the Services overview (/services), not on its detail page. Hidden subservices such as implant-bridges and all-on-4 have no overview card, so their tags are not displayed. Detail-page Live Preview does not show tag edits.',
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
      label: 'Image URL (All languages)',
      type: 'text',
      admin: {
        components: { afterInput: ['/components/ImageUrlPreview#ImageUrlPreview'], Cell: '/components/ImageCell#ImageCell' },
        description: 'Shared by all languages. Service image URL; the website can fall back to a bundled image when empty.',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Shared by all languages. Sets the sequence of visible overview cards; does not change the website navigation hierarchy or make hidden subservices visible.' },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
}
