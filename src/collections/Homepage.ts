import type { CollectionConfig } from 'payload'

/**
 * Homepage — ONE document per tenant (isGlobal via the multi-tenant plugin):
 * clicking "Homepage" in the nav opens THE editor directly. The whole hero
 * lives here — slides (visual image picker, position/crop, drag-to-reorder,
 * add/delete), the trust pill, and the CTA buttons — with Live Preview of
 * the real home page beside it. Replaces the old hero-slides collection
 * (per Enoch: rows-in-a-table was the wrong shape for a hero).
 */
export const Homepage: CollectionConfig = {
  slug: 'homepage',
  labels: { singular: 'Homepage', plural: 'Homepage' },
  admin: {
    group: 'Home Page',
    useAsTitle: 'heroPill',
    description: 'The home page hero: slides, trust pill, and call-to-action buttons.',
    components: {
      views: {
        // ONE doc per tenant: skip the pointless one-row list ("ID: 1",
        // Search by ID, a Create New that would make a second homepage) and
        // open THE editor directly. Super-admin on the platform host still
        // gets the normal list across tenants.
        list: { Component: '/components/HomepageSingleRedirect#HomepageSingleRedirect' },
      },
    },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'heroPill',
      type: 'text',
      localized: true,
      label: 'Trust pill',
      admin: {
        description: 'The small rounded badge at the top-left of the hero (e.g. “Trusted Since 1996”).',
      },
    },
    {
      name: 'showCaptions',
      type: 'checkbox',
      localized: true,
      label: 'Show captions (Selected language)',
      // Application-only default: adding the nullable DB columns must not fill existing rows.
      defaultValue: () => false,
      admin: {
        description: 'Optional and off by default. Enables slide captions and per-slide CTA buttons only in the selected language; the trust pill and main CTA buttons are separate.',
      },
    },
    {
      name: 'heroButtons',
      type: 'array',
      label: 'CTA buttons',
      maxRows: 4,
      admin: {
        description: 'The main action buttons over the hero (first one is the highlighted primary). Labels use the selected language; button membership, order and URLs are shared by all languages. Independent of Show captions.',
      },
      fields: [
        // NOT required — same lesson as slide.title: the doc shipped with
        // empty EN labels, and a required localized field on pre-existing
        // invalid data silently blocks EVERY save of the whole document
        // (validation fails on fields the editor never touched). The site
        // falls back to its bundled strings when a label is empty.
        { name: 'label', type: 'text', localized: true },
        {
          name: 'url',
          type: 'text',
          required: true,
          admin: { description: 'Shared by all languages. Site-relative (e.g. /contact) or full URL.' },
        },
      ],
    },
    {
      name: 'slides',
      type: 'array',
      label: 'Hero slides',
      admin: {
        description: 'Drag to reorder - the carousel plays top to bottom. Slide membership, images, order and CTA URLs are shared by all languages; caption text uses the selected language and appears only with Show captions enabled.',
      },
      fields: [
        {
          name: 'image',
          label: 'Image (All languages)',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Pick from the Media Library (preferred) — or paste a URL below.',
          },
        },
        {
          name: 'imageUrl',
          label: 'Fallback image URL (All languages)',
          type: 'text',
          admin: {
            description: 'Fallback image URL (used only when no Media image is selected).',
            components: { afterInput: ['/components/ImageUrlPreview#HeroImageUrlPreview'] },
          },
        },
        {
          name: 'imagePosition',
          label: 'Image position (All languages)',
          type: 'text',
          admin: {
            description: 'Where the image anchors, e.g. “center center”, “center top”, “bottom center”.',
          },
        },
        {
          name: 'imageSize',
          label: 'Legacy image size (unused; All languages)',
          type: 'text',
          admin: {
            readOnly: true,
            description: 'Not used by the current website. Existing values are retained; use Image position and Preserve full image for the supported image controls.',
          },
        },
        {
          name: 'preserveFullImage',
          label: 'Preserve full image (All languages)',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Show the whole image without cropping (panoramas).' },
        },
        { name: 'eyebrow', type: 'text', localized: true, admin: { description: 'Caption eyebrow in the selected language. Visible only when Show captions is enabled for that language.' } },
        // Not required: hero slides have no KH/CN translations, so per-locale
        // writes (pill/buttons) would fail a required localized title. EN
        // titles fall back to KH/CN via localization.fallback.
        { name: 'title', type: 'text', localized: true, admin: { description: 'Caption headline in the selected language. Visible only when Show captions is enabled for that language.' } },
        { name: 'subtitle', type: 'text', localized: true, admin: { description: 'Caption subtitle in the selected language. Visible only when Show captions is enabled for that language.' } },
        { name: 'description', type: 'textarea', localized: true, admin: { description: 'Caption paragraph in the selected language. Visible only when Show captions is enabled for that language.' } },
        { name: 'ctaText', type: 'text', localized: true, admin: { description: 'Per-slide CTA label in the selected language. Requires a supported CTA URL and Show captions enabled for that language.' } },
        { name: 'ctaUrl', label: 'Slide CTA URL (All languages)', type: 'text', admin: { description: 'Shared by all languages. Per-slide destination; shown only with a CTA label and Show captions enabled in the selected language. Use a supported site-relative path or full URL.' } },
      ],
    },
  ],
}
