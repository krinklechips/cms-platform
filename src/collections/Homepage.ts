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
    description: 'The home page hero: slides, trust pill, and call-to-action buttons.',
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
      name: 'heroButtons',
      type: 'array',
      label: 'CTA buttons',
      maxRows: 4,
      admin: {
        description: 'The action buttons over the hero (first one is the highlighted primary).',
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
          admin: { description: 'Site-relative (e.g. /contact) or full URL.' },
        },
      ],
    },
    {
      name: 'slides',
      type: 'array',
      label: 'Hero slides',
      admin: {
        description: 'Drag to reorder — the carousel plays top to bottom. Add or remove freely.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Pick from the Media Library (preferred) — or paste a URL below.',
          },
        },
        {
          name: 'imageUrl',
          type: 'text',
          admin: {
            description: 'Fallback image URL (used only when no Media image is selected).',
            components: { afterInput: ['/components/ImageUrlPreview#ImageUrlPreview'] },
          },
        },
        {
          name: 'imagePosition',
          type: 'text',
          admin: {
            description: 'Where the image anchors, e.g. “center center”, “center top”, “bottom center”.',
          },
        },
        {
          name: 'imageSize',
          type: 'text',
          admin: { description: 'CSS background-size, e.g. “cover” or “100% auto”.' },
        },
        {
          name: 'preserveFullImage',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Show the whole image without cropping (panoramas).' },
        },
        { name: 'eyebrow', type: 'text', localized: true },
        // Not required: hero slides have no KH/CN translations, so per-locale
        // writes (pill/buttons) would fail a required localized title. EN
        // titles fall back to KH/CN via localization.fallback.
        { name: 'title', type: 'text', localized: true },
        { name: 'subtitle', type: 'text', localized: true },
        { name: 'description', type: 'textarea', localized: true },
        { name: 'ctaText', type: 'text', localized: true },
        { name: 'ctaUrl', type: 'text' },
      ],
    },
  ],
}
