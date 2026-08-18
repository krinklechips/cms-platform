import type { CollectionConfig } from 'payload'
import { SECTION_BLOCKS } from '../blocks/section-blocks'

/**
 * Technology — mirrors the live site's `technology` table (Supabase).
 * Localized fields carry the translated text/content from content_translations.
 */
export const Technology: CollectionConfig = {
  slug: 'technology',
  admin: {
    group: 'Main Pages',
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'category', 'published', 'order'],
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
            description: 'LEGACY raw JSON — superseded by the Sections editor above when it has any section.',
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
        description: 'Supabase technology.id — used by the sync for idempotent upserts.',
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
      name: 'category',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'highlights',
      type: 'array',
      localized: true,
      fields: [{ name: 'value', type: 'text', required: true }],
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
