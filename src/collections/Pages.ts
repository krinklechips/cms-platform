import type { CollectionConfig } from 'payload'
import { SECTION_BLOCKS } from '../blocks/section-blocks'

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

const slugify = (raw: string): string =>
  raw
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .replace(/[^a-z0-9\s-]/g, '') // drop anything not url-safe (incl. Khmer/Chinese)
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Custom Pages' },
  admin: {
    group: 'Main Pages',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'published', 'updatedAt'],
    description:
      'Extra website pages. Give it a title, build it from sections, tick Published — it goes live at the web address shown.',
  },
  access: {
    read: () => true, // withModuleGating narrows anon to published + host tenant
  },
  hooks: {
    beforeValidate: [
      async ({ data, req, operation, originalDoc }) => {
        if (!data) return data
        // Only ever GENERATE a missing address — never rewrite an existing one
        // (URL stability beats title fidelity).
        if (operation === 'create' || !(originalDoc as { slug?: string } | undefined)?.slug) {
          if (!data.slug) {
            const base = slugify(String(data.title ?? '')) || 'page'
            let candidate = base
            for (let n = 2; n <= 50; n++) {
              const clash = await req.payload.find({
                collection: 'pages',
                where: {
                  and: [
                    { slug: { equals: candidate } },
                    ...(data.tenant ? [{ tenant: { equals: data.tenant } }] : []),
                  ],
                },
                limit: 1,
                depth: 0,
                overrideAccess: true,
              })
              if (clash.totalDocs === 0) break
              candidate = `${base}-${n}`
            }
            data.slug = candidate
          }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      admin: { description: 'The page heading. The web address is created from this automatically.' },
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Web address',
      index: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description:
          'Created automatically from the title, e.g. “Smile Makeover” → roomchang.com/en/smile-makeover. Stays the same even if the title changes.',
      },
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
              type: 'text',
              admin: { description: 'Image URL used when the page is shared (Facebook/Telegram).' },
            },
          ],
        },
      ],
    },
  ],
}
