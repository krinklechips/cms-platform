import { validations, type ArrayField, type CollectionConfig, type Field, type TextField, type UploadField } from 'payload'
import copyKeys from './meanpack-copy-keys.json'

const text = (name: string, localized = false): TextField => ({ name, type: 'text', localized })
const description: Field = { name: 'description', type: 'textarea', localized: true }
const image = (name: string, required = true): UploadField => ({ name, type: 'upload', relationTo: 'media', required })
const list = (name: string, fields: Field[]): ArrayField => ({ name, type: 'array', fields, admin: { initCollapsed: true },
  validate: async (value, options) => {
    const native = await validations.array(value, options)
    if (native !== true) return native
    if (!Array.isArray(value)) return true
    const slugs = value.map(row => (row as { slug?: unknown } | null)?.slug).filter(Boolean)
    return new Set(slugs).size === slugs.length || 'Each item needs a different web address or phase identifier.'
  } })
const title = text('title', true)
const slug: TextField = { name: 'slug', type: 'text', required: true, validate: (v: unknown) => typeof v === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v) || 'Use lowercase words separated by dashes.' }
const copyPrefixes = ['home', 'orchard', 'harvest', 'qualityStory', 'qualityNote', 'preparation', 'crops', 'shipment', 'products', 'services', 'facility', 'quality', 'about', 'gallery', 'partnerships', 'enquiry', 'privacy']
const remaining = new Set(copyKeys)
const copyFields: Field[] = copyPrefixes.map(prefix => {
  const keys = [...remaining].filter(key => key.startsWith(prefix))
  keys.forEach(key => remaining.delete(key))
  return {
    type: 'collapsible', label: prefix.replace(/([A-Z])/g, ' $1'), admin: { initCollapsed: true },
    fields: keys.map(name => ({ name, type: 'textarea', localized: true, required: true,
      label: name.slice(prefix.length).replace(/([A-Z])/g, ' $1').trim() || name })),
  }
})

/** A complete website document, scoped by the platform's normal tenant,
 * draft, entitlement, media-validation and editorial-audit wrappers. */
export const MeanpackWebsites: CollectionConfig = {
  slug: 'meanpack-websites',
  labels: { singular: 'Mean Pack website', plural: 'Mean Pack website' },
  indexes: [{ fields: ['tenant'], unique: true }],
  admin: { group: 'Website', useAsTitle: 'name', defaultColumns: ['name', '_status', 'updatedAt'],
    components: { edit: { PublishButton: '/components/PublishWebsiteButton#PublishWebsiteButton' } },
    description: 'Edit the Mean Pack website here. Save a draft to review changes; Publish makes them visible on the website within one minute.' },
  access: { read: () => true },
  hooks: { beforeValidate: [({ data, originalDoc }) => {
    const phases = data?.phases ?? originalDoc?.phases
    const stages = data?.processStages ?? originalDoc?.processStages
    if (Array.isArray(phases) && Array.isArray(stages)) {
      const ids = new Set(phases.map(row => row.slug))
      if (stages.some(row => !ids.has(row.phase))) throw new Error('Every process stage must belong to a phase on this website. Move its stages before removing a phase.')
    }
    return data
  }] },
  fields: [
    { name: 'name', type: 'text', required: true, defaultValue: 'Mean Pack website' },
    { type: 'tabs', tabs: [
      { label: 'Page text', fields: [{ name: 'copy', type: 'group', fields: copyFields }] },
      { label: 'Contact & identity', fields: [
        { name: 'contact', type: 'group', fields: [{ ...text('phone'), required: true }, { name: 'email', type: 'email', required: true },
          ...['whatsapp', 'telegram', 'facebook', 'googleMaps'].map(name => ({ name, type: 'text' as const, required: true,
            validate: (v: unknown) => typeof v === 'string' && /^https:\/\/[^\s]+$/.test(v) || 'Use a complete HTTPS link.' })),
          { name: 'address', type: 'textarea', localized: true, required: true }] },
        { name: 'identity', type: 'group', fields: ['legalName', 'legalNameKhmer', 'legalNameChinese', 'tagline', 'taglineKhmer', 'taglineChinese', 'location'].map(name => ({ ...text(name), required: true })) },
        image('logo'),
      ] },
      { label: 'Photos & films', fields: [
        list('media', [slug, { name: 'kind', type: 'select', required: true, options: ['photo', 'video'] },
          { name: 'category', type: 'select', required: true, options: ['orchard', 'visit', 'harvest', 'quality', 'films', 'library'] },
          { name: 'file', type: 'upload', relationTo: 'media', required: true }, image('poster', false), title, description,
          { name: 'published', label: 'Show in Gallery', type: 'checkbox', defaultValue: true }]),
        { name: 'scenes', type: 'group', fields: ['heroFilm', 'heroPoster', 'orchard', 'orchardPortrait', 'harvest', 'harvestDetail', 'qualityBunch', 'qualityClose', 'about'].map(name => image(name)) },
      ] },
      { label: 'Crops', fields: [list('products', [slug, text('name', true), text('summary', true), description,
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'featured', type: 'checkbox', defaultValue: false }, text('featuredNote', true),
        { name: 'published', type: 'checkbox', defaultValue: true }])] },
      { label: 'Process & quality', fields: [
        { ...list('phases', [{ ...slug, label: 'Phase identifier', admin: { readOnly: true, description: 'Fixed website phase. Edit its heading and description or reorder the phases.' },
          validate: (value: unknown) => typeof value === 'string' && ['receive', 'prepare', 'pack', 'protect', 'dispatch'].includes(value) || 'Choose an existing website phase.' }, title, description]), required: true, minRows: 5, maxRows: 5 } as Field,
        list('processStages', [slug, title, description,
          { name: 'phase', type: 'select', options: ['receive', 'prepare', 'pack', 'protect', 'dispatch'], required: true }, { ...text('icon_key'), admin: { hidden: true } }]),
        list('capabilities', [text('mark'), title, description]),
        list('qualityChecks', [title, description]),
        list('principles', [title, description]),
        list('galleryChapters', [slug, title, description]),
        list('routeSteps', [title]),
      ] },
    ] },
  ],
}
