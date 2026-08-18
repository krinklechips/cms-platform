import type { Block, Field } from 'payload'

/**
 * SECTION BLOCKS — the structured replacement for the raw `content` JSON on
 * Services and Technology.
 *
 * One block per section type the live site renders (src/lib/data.ts on the
 * roomchang side: ServiceSection | TechSection). Block slugs EQUAL the legacy
 * `type` strings, so the site-side mapper is a mechanical rename
 * (blockType -> type) and the converter script a mechanical wrap.
 *
 * UX rules (Enoch's sellable-CMS review, 2026-08-19):
 *  - disableBlockName everywhere — the optional per-block nickname rendered a
 *    pointless "Untitled" chip on every accordion.
 *  - arrays start collapsed (initCollapsed) so a section reads as a tidy list.
 *  - icons are a PICKER limited to the names the site's ICON_MAP actually
 *    renders (ServiceDetailContent/TechnologyDetailContent) — free-text icon
 *    names silently rendered nothing.
 *  - nothing is `required` — legacy data has heading-less sections, and
 *    required-on-existing-data blocks every future save (homepage lesson).
 *
 * Shape rules the site relies on:
 *  - list.items: string[]            -> here array of { item }
 *  - gallery.images: string[]        -> here array of { url }
 *  - twocol.left/right: ONE section  -> here a blocks field with maxRows 1
 */

const NO_NAME = { disableBlockName: true }

/** Icon names the site's renderers actually map to Phosphor icons. */
const ICON_OPTIONS = [
  { label: 'Tooth', value: 'Tooth' },
  { label: 'Smile', value: 'Smile' },
  { label: 'Heart', value: 'Heart' },
  { label: 'Star', value: 'Star' },
  { label: 'Sparkles', value: 'Sparkles' },
  { label: 'Check', value: 'Check' },
  { label: 'Shield', value: 'Shield' },
  { label: 'Clock', value: 'Clock' },
  { label: 'Dollar (cost)', value: 'DollarSign' },
  { label: 'Bone', value: 'Bone' },
  { label: 'Strength (dumbbell)', value: 'Dumbbell' },
  { label: 'Target (circle dot)', value: 'CircleDot' },
  { label: 'Lightning (zap)', value: 'Zap' },
  { label: 'Eye', value: 'Eye' },
  { label: 'First-aid kit', value: 'FirstAidKit' },
  { label: 'Rotate (redo)', value: 'RotateCcw' },
  { label: 'Arrow right', value: 'ArrowRight' },
]

const iconField = (): Field => ({
  name: 'icon',
  type: 'select',
  options: ICON_OPTIONS,
  admin: { description: 'Optional — shown as a duotone icon next to the text.' },
})

const text: Block = {
  slug: 'text',
  labels: { singular: 'Text section', plural: 'Text sections' },
  admin: NO_NAME,
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
  admin: NO_NAME,
  fields: [
    { name: 'title', type: 'text' },
    { name: 'body', type: 'textarea' },
    iconField(),
    {
      name: 'stats',
      type: 'array',
      admin: { description: 'Optional stat chips shown under the callout.', initCollapsed: true },
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
  admin: NO_NAME,
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'items',
      type: 'array',
      admin: { initCollapsed: true },
      fields: [{ name: 'item', type: 'text' }],
    },
  ],
}

const cards: Block = {
  slug: 'cards',
  labels: { singular: 'Card grid', plural: 'Card grids' },
  admin: NO_NAME,
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'subheading', type: 'text' },
    { name: 'numbered', type: 'checkbox' },
    { name: 'columns', type: 'number', admin: { description: '2, 3 or 4 (optional).' } },
    {
      name: 'items',
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        { name: 'title', type: 'text' },
        { name: 'body', type: 'textarea' },
        iconField(),
        { name: 'tag', type: 'text' },
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
  admin: NO_NAME,
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'subheading', type: 'text' },
    {
      name: 'items',
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        { name: 'step', type: 'text' },
        { name: 'detail', type: 'textarea' },
      ],
    },
  ],
}

const priceRows: Field[] = [
  { name: 'heading', type: 'text' },
  { name: 'subheading', type: 'text' },
  {
    name: 'rows',
    type: 'array',
    admin: { initCollapsed: true },
    fields: [
      { name: 'treatment', type: 'text' },
      { name: 'price', type: 'text' },
    ],
  },
]

const pricing: Block = {
  slug: 'pricing',
  labels: { singular: 'Price list', plural: 'Price lists' },
  admin: NO_NAME,
  fields: priceRows,
}

const pricetable: Block = {
  slug: 'pricetable',
  labels: { singular: 'Price table', plural: 'Price tables' },
  admin: NO_NAME,
  fields: priceRows,
}

const gallery: Block = {
  slug: 'gallery',
  labels: { singular: 'Image gallery', plural: 'Image galleries' },
  admin: NO_NAME,
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'subheading', type: 'text' },
    {
      name: 'images',
      type: 'array',
      admin: { initCollapsed: true },
      fields: [{ name: 'url', type: 'text' }],
    },
  ],
}

const image: Block = {
  slug: 'image',
  labels: { singular: 'Image', plural: 'Images' },
  admin: NO_NAME,
  fields: [
    { name: 'src', type: 'text' },
    { name: 'alt', type: 'text' },
    { name: 'heading', type: 'text' },
    { name: 'subheading', type: 'text' },
    { name: 'caption', type: 'text' },
    { name: 'size', type: 'select', options: ['small', 'medium', 'large', 'full'] },
    { name: 'width', type: 'number' },
    { name: 'height', type: 'number' },
  ],
}

const video: Block = {
  slug: 'video',
  labels: { singular: 'YouTube video', plural: 'YouTube videos' },
  admin: NO_NAME,
  fields: [
    { name: 'videoId', type: 'text', admin: { description: 'YouTube video id.' } },
    { name: 'heading', type: 'text' },
    { name: 'subheading', type: 'text' },
  ],
}

const selfVideo: Block = {
  slug: 'self_video',
  labels: { singular: 'Hosted video', plural: 'Hosted videos' },
  admin: NO_NAME,
  fields: [
    { name: 'src', type: 'text' },
    { name: 'heading', type: 'text' },
    { name: 'caption', type: 'text' },
  ],
}

const imagePairSide = (name: 'left' | 'right'): Field => ({
  name,
  type: 'group',
  fields: [
    { name: 'src', type: 'text' },
    { name: 'alt', type: 'text' },
    { name: 'caption', type: 'text' },
  ],
})

const imagePair: Block = {
  slug: 'image_pair',
  labels: { singular: 'Image pair', plural: 'Image pairs' },
  admin: NO_NAME,
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
  admin: NO_NAME,
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
