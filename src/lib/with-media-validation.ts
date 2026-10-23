import { ValidationError, validations, type CollectionBeforeChangeHook, type CollectionConfig, type CollectionSlug, type Field, type FieldHook, type UploadField } from 'payload'
import { assertMediaValue, canUseMediaTenant, mediaID, resolveMediaTenant, sameMediaID, unchangedMediaValue, type MediaValueKind } from './media-validation'

const urlFields: Record<string, readonly string[]> = {
  homepage: ['slides.imageUrl'], doctors: ['photoUrl'], services: ['imageUrl'], technology: ['imageUrl'],
  testimonials: ['authorPhotoUrl'], branches: ['imageUrl'], 'feature-cards': ['imageUrl'], 'brand-logos': ['logoUrl'],
  partners: ['logoUrl'], 'timeline-events': ['imageUrl'], 'clinical-cases': ['imageUrl'], videos: ['thumbnail'],
  'news-articles': ['imageUrl'], 'community-articles': ['imageUrl', 'images.url'], pages: ['seoImage'],
}
const sectionCollections = new Set(['pages', 'services', 'technology'])

function targetKind(slug: string, path: string, field: Field): MediaValueKind | null {
  if (slug === 'clinical-cases' && path === 'images' && field.type === 'json') return 'clinical'
  if (slug === 'branches' && path === 'photos' && field.type === 'json') return 'branch'
  if (urlFields[slug]?.includes(path) && field.type === 'text') return 'url'
  if (slug === 'homepage' && path === 'slides.image') {
    return field.type === 'upload' && field.relationTo === 'media' ? 'reference' : null
  }
  if (sectionCollections.has(slug) && /^sections\.(?:twocol\.(?:left|right)\.)?(?:image\.(?:media|src)|gallery\.images\.(?:media|url)|image_pair\.(?:left|right)\.(?:media|src))$/.test(path)) {
    if (field.type === 'upload' && field.relationTo === 'media') return 'reference'
    if (field.type === 'text') return 'url'
  }
  return null
}

const owner = (slug: string, data: Record<string, unknown> | undefined, originalDoc?: Record<string, unknown>) =>
  data && Object.hasOwn(data, 'tenant') ? data.tenant : originalDoc?.tenant

function mediaGuard(slug: string, kind: MediaValueKind): FieldHook {
  return async args => {
    const tenant = owner(slug, args.data, args.originalDoc)
    // Payload supplies previousValue by stable row/block ID, not by the current array index.
    if (args.operation === 'update' && sameMediaID(tenant, owner(slug, args.originalDoc)) && unchangedMediaValue(kind, args.value, args.previousValue)) return args.value
    if (args.value === undefined || args.value === null || args.value === '') return args.value
    try {
      await assertMediaValue(kind, args.value, await resolveMediaTenant(tenant, args.req), args.req)
    } catch (error) {
      throw new ValidationError({ collection: slug, errors: [{ path: args.path.join('.'),
        message: error instanceof Error ? error.message : 'The image could not be validated.' }] })
    }
    return args.value
  }
}

function scopeUpload(field: UploadField, slug: string): UploadField {
  const originalFilter = field.filterOptions
  const originalValidate = field.validate ?? validations.upload
  return {
    ...field,
    filterOptions: async args => {
      const tenant = mediaID(owner(slug, args.data))
      if (tenant === null || !canUseMediaTenant(tenant, args.user ?? args.req.user)) return false
      const existing = typeof originalFilter === 'function' ? await originalFilter(args) : originalFilter
      if (existing === false) return false
      return { and: [{ tenant: { equals: tenant } }, { mimeType: { like: 'image/%' } },
        ...(existing && existing !== true ? [existing] : [])] }
    },
    // Keep native validation (and its original filters) intact for legacy refs. The
    // added picker filter limits new choices; beforeChange enforces changed values even in drafts.
    validate: (value, options) => originalValidate(value as never, { ...options, filterOptions: originalFilter } as never),
  }
}

function recheckOtherLocales(config: CollectionConfig): CollectionBeforeChangeHook {
  return async ({ data, originalDoc, req, operation }) => {
    if (operation !== 'update' || !originalDoc || sameMediaID(owner(config.slug, data, originalDoc), originalDoc.tenant)) return data
    const localization = req.payload.config.localization
    if (!localization) return data
    const tenant = await resolveMediaTenant(owner(config.slug, data, originalDoc), req)
    // A tenant change affects every language. Read without changing the active save's request locale.
    const saved = await req.payload.findByID({ collection: config.slug as CollectionSlug, id: originalDoc.id, locale: 'all', fallbackLocale: false,
      draft: true, depth: 0, overrideAccess: true, req: { ...req, query: { ...req.query } } })
    const visit = async (fields: Field[], sibling: Record<string, unknown>, locale: string, prefix = '', inheritedLocalized = false) => {
      for (const field of fields) {
        const path = 'name' in field ? [prefix, field.name].filter(Boolean).join('.') : prefix
        const localized = inheritedLocalized || ('localized' in field && Boolean(field.localized))
        let value = 'name' in field ? sibling[field.name] : sibling
        if ('localized' in field && field.localized && !inheritedLocalized && value && typeof value === 'object' && !Array.isArray(value)) {
          value = (value as Record<string, unknown>)[locale]
        }
        const kind = targetKind(config.slug, path, field)
        if (kind && localized) {
          try { await assertMediaValue(kind, value, tenant, req) } catch (error) {
            throw new ValidationError({ collection: config.slug, errors: [{ path,
              message: `${locale}: ${error instanceof Error ? error.message : 'The image could not be validated.'}` }] })
          }
        }
        if (field.type === 'tabs') {
          for (const tab of field.tabs) {
            const name = 'name' in tab ? tab.name : undefined
            const nested = name ? sibling[name] : sibling
            if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
              await visit(tab.fields, nested as Record<string, unknown>, locale, name ? [prefix, name].filter(Boolean).join('.') : prefix, localized)
            }
          }
        } else if (field.type === 'blocks' && Array.isArray(value)) {
          for (const row of value) {
            const block = field.blocks?.find(block => block.slug === row.blockType)
            if (block) await visit(block.fields, row, locale, `${path}.${block.slug}`, localized)
          }
        } else if (field.type === 'array' && Array.isArray(value)) {
          for (const row of value) await visit(field.fields, row, locale, path, localized)
        } else if ('fields' in field && value && typeof value === 'object' && !Array.isArray(value)) {
          await visit(field.fields, value as Record<string, unknown>, locale, path, localized)
        }
      }
    }
    for (const locale of localization.localeCodes) {
      if (locale !== req.locale) await visit(config.fields, saved as unknown as Record<string, unknown>, locale)
    }
    return data
  }
}

/** Decorate only known website image surfaces; shared field/block definitions stay untouched. */
export function withMediaValidation(config: CollectionConfig): CollectionConfig {
  const walk = (fields: Field[], prefix = ''): Field[] => fields.map(original => {
    const path = 'name' in original ? [prefix, original.name].filter(Boolean).join('.') : prefix
    let field = { ...original } as Field
    if ('fields' in field) field = { ...field, fields: walk(field.fields, path) }
    if (field.type === 'tabs') field = { ...field, tabs: field.tabs.map(tab => ({ ...tab,
      fields: walk(tab.fields, 'name' in tab && tab.name ? [prefix, tab.name].filter(Boolean).join('.') : prefix),
    })) }
    if (field.type === 'blocks') field = { ...field,
      blocks: field.blocks?.map(block => ({ ...block, fields: walk(block.fields, `${path}.${block.slug}`) })),
    }
    const kind = targetKind(config.slug, path, field)
    if (kind && (field.type === 'upload' || field.type === 'text' || field.type === 'json')) {
      if (field.type === 'upload') field = scopeUpload(field, config.slug)
      field = { ...field, hooks: { ...field.hooks, beforeChange: [...(field.hooks?.beforeChange ?? []), mediaGuard(config.slug, kind)] } } as Field
    }
    return field
  })
  return { ...config, fields: walk(config.fields),
    ...(sectionCollections.has(config.slug) ? { hooks: { ...config.hooks,
      beforeChange: [...(config.hooks?.beforeChange ?? []), recheckOtherLocales(config)],
    } } : {}),
  }
}
