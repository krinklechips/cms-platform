import type { CollectionConfig } from 'payload'
import { SECTION_BLOCKS } from '../blocks/section-blocks'
import { allocatePageAddress } from '../lib/page-addresses'

/**
 * Pages — create a brand-new website page from the CMS, no developer needed.
 *
 * UX contract (Enoch: "a normal user wouldn't know how to use slugs"):
 *  - The editor types a TITLE. The web address is generated automatically
 *    (lowercased, dashes), shown read-only as "Web address".
 *  - The address NEVER changes when the title is later edited — links and
 *    Google results stay stable. It also auto-dedupes within the tenant
 *    ("our-team", "our-team-2").
 *  - Body = the same Sections editor Services/Technology use.
 *
 * The site's catch-all route (/{locale}/{address}) renders any published page.
 */

export const Pages: CollectionConfig = {
  slug: 'pages',
  indexes: [{ fields: ['tenant', 'slug'], unique: true }],
  labels: { singular: 'Page', plural: 'Custom Pages' },
  admin: {
    group: 'Main Pages',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'published', 'updatedAt'],
    description:
      'Custom website pages and their saved drafts.',
  },
  access: {
    read: () => true, // withModuleGating narrows anon to published + host tenant
  },
  hooks: {
    beforeValidate: [allocatePageAddress],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      admin: { description: 'The page heading. The web address is created from this automatically.' },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: false,
      label: 'Published (visible on the website)',
      admin: { position: 'sidebar' },
    },
    {
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
                initCollapsed: true,
                description: 'Build the page top-to-bottom: add, reorder and edit sections.',
              },
            },
          ],
        },
        {
          label: 'Search & sharing (SEO)',
          description: 'Optional — how this page appears on Google and when shared.',
          fields: [
            {
              name: 'slug',
              type: 'text',
              label: 'Web address',
              index: true,
              admin: {
                readOnly: true,
                description: 'Created automatically from the title. Stays the same even if the title changes.',
              },
            },
            {
              name: 'seoTitle',
              type: 'text',
              localized: true,
              admin: { description: 'Title shown in Google results (defaults to the page title).' },
            },
            {
              name: 'seoDescription',
              type: 'textarea',
              localized: true,
              admin: { description: 'The short blurb under the title in Google results.' },
            },
            {
              name: 'seoImage',
              label: 'SEO image (All languages)',
              type: 'text',
              admin: {
                description: 'Image URL used when the page is shared (Facebook/Telegram).',
                components: { afterInput: ['/components/ImageUrlPreview#ImageUrlPreview'] },
              },
            },
          ],
        },
      ],
    },
  ],
}
