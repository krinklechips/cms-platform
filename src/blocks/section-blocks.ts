import type { Block } from 'payload'

/**
 * SECTION BLOCKS — the structured replacement for the raw `content` JSON on
 * Services and Technology.
 *
 * One block per section type the live site renders (src/lib/data.ts on the
 * roomchang side: ServiceSection | TechSection). Block slugs EQUAL the legacy
 * `type` strings, so the site-side mapper is a mechanical rename
 * (blockType -> type) and the converter script a mechanical wrap.
 *
 * NOTE: nothing is `required` — the legacy JSON contains sections without
 * headings/rows, and required flags on pre-existing data block BOTH the
 * converter AND every future editor save of the doc (the homepage-labels
 * lesson). The renderer tolerates missing fields.
 *
 * Shape rules the site relies on:
 *  - list.items: string[]            -> here array of { item }
 *  - gallery.images: string[]        -> here array of { url }
 *  - twocol.left/right: ONE section  -> here a blocks field with maxRows 1
 *    (leaf blocks only — the site never nests twocol inside twocol)
 */

const text: Block = {
  slug: 'text',
  labels: { singular: 'Text section', plural: 'Text sections' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'body', type: 'textarea' },
    {
      name: 'card',
      type: 'checkbox',
      admin: { description: 'Render inside a soft card background.' },
    },
  ],
}

const callout: Block = {
  slug: 'callout',
  labels: { singular: 'Callout', plural: 'Callouts' },
  fields: [
    { name: 'title', type: 'text' },
    { name: 'body', type: 'textarea' },
    { name: 'icon', type: 'text', admin: { description: 'Phosphor icon name (optional).' } },
    {
      name: 'stats',
      type: 'array',
      admin: { description: 'Optional stat chips shown under the callout.' },
      fields: [
        { name: 'value', type: 'text' },
        { name: 'label', type: 'text' },
      ],
    },
  ],
}

const list: Block = {
  slug: 'list',
  labels: { singular: 'Bullet list', plural: 'Bullet lists' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'items',
      type: 'array',
      fields: [{ name: 'item', type: 'text' }],
    },
  ],
}

const cards: Block = {
  slug: 'cards',
  labels: { singular: 'Card grid', plural: 'Card grids' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'subheading', type: 'text' },
    { name: 'numbered', type: 'checkbox' },
    { name: 'columns', type: 'number', admin: { description: '2, 3 or 4 (optional).' } },
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'body', type: 'textarea' },
        { name: 'tag', type: 'text' },
        { name: 'icon', type: 'text' },
        { name: 'badge', type: 'text' },
        { name: 'spec', type: 'text' },
        { name: 'link', type: 'text' },
      ],
    },
  ],
}

const steps: Block = {
  slug: 'steps',
  labels: { singular: 'Step list', plural: 'Step lists' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'subheading', type: 'text' },
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'step', type: 'text' },
        { name: 'detail', type: 'textarea' },
      ],
    },
  ],
}

const priceRows = [
  { name: 'heading', type: 'text' as const },
  { name: 'subheading', type: 'text' as const },
  {
    name: 'rows',
    type: 'array' as const,
    fields: [
      { name: 'treatment', type: 'text' as const },
      { name: 'price', type: 'text' as const },
    ],
  },
]

const pricing: Block = {
  slug: 'pricing',
  labels: { singular: 'Price list', plural: 'Price lists' },
  fields: priceRows,
}

const pricetable: Block = {
  slug: 'pricetable',
  labels: { singular: 'Price table', plural: 'Price tables' },
  fields: priceRows,
}

const gallery: Block = {
  slug: 'gallery',
  labels: { singular: 'Image gallery', plural: 'Image galleries' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'subheading', type: 'text' },
    {
      name: 'images',
      type: 'array',
      fields: [{ name: 'url', type: 'text' }],
    },
  ],
}

const image: Block = {
  slug: 'image',
  labels: { singular: 'Image', plural: 'Images' },
  fields: [
    { name: 'src', type: 'text' },
    { name: 'alt', type: 'text' },
    { name: 'heading', type: 'text' },
    { name: 'subheading', type: 'text' },
    { name: 'caption', type: 'text' },
    {
      name: 'size',
      type: 'select',
      options: ['small', 'medium', 'large', 'full'],
    },
    { name: 'width', type: 'number' },
    { name: 'height', type: 'number' },
  ],
}

const video: Block = {
  slug: 'video',
  labels: { singular: 'YouTube video', plural: 'YouTube videos' },
  fields: [
    { name: 'videoId', type: 'text', admin: { description: 'YouTube video id.' } },
    { name: 'heading', type: 'text' },
    { name: 'subheading', type: 'text' },
  ],
}

const selfVideo: Block = {
  slug: 'self_video',
  labels: { singular: 'Hosted video', plural: 'Hosted videos' },
  fields: [
    { name: 'src', type: 'text' },
    { name: 'heading', type: 'text' },
    { name: 'caption', type: 'text' },
  ],
}

const imagePairSide = (name: 'left' | 'right') => ({
  name,
  type: 'group' as const,
  fields: [
    { name: 'src', type: 'text' as const },
    { name: 'alt', type: 'text' as const },
    { name: 'caption', type: 'text' as const },
  ],
})

const imagePair: Block = {
  slug: 'image_pair',
  labels: { singular: 'Image pair', plural: 'Image pairs' },
  fields: [imagePairSide('left'), imagePairSide('right')],
}

/** Every block that can appear inside a two-column split. */
const LEAF_BLOCKS: Block[] = [
  text,
  callout,
  list,
  cards,
  steps,
  pricing,
  pricetable,
  gallery,
  image,
  video,
  selfVideo,
  imagePair,
]

const twocol: Block = {
  slug: 'twocol',
  labels: { singular: 'Two columns', plural: 'Two columns' },
  fields: [
    {
      name: 'left',
      type: 'blocks',
      blocks: LEAF_BLOCKS,
      maxRows: 1,
      admin: { description: 'Exactly one section for the left column.' },
    },
    {
      name: 'right',
      type: 'blocks',
      blocks: LEAF_BLOCKS,
      maxRows: 1,
      admin: { description: 'Exactly one section for the right column.' },
    },
  ],
}

export const SECTION_BLOCKS: Block[] = [...LEAF_BLOCKS, twocol]
