import { createHash } from 'node:crypto'
import { APIError, type CollectionBeforeOperationHook, type CollectionConfig, type PayloadRequest } from 'payload'
import { lockEditorialDocument } from './editorial-lock'

const REVISION = '_editorialRevision'
const asObject = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value)
  ? value as Record<string, unknown> : {}
/** Every protected write advances this stamp under the record lock, including other-language saves.
 * Use snapshot metadata, never fallback text, populated relationships, or a later read. */
export const editorialRevision = (config: CollectionConfig, doc: Record<string, unknown>, locale: string): string => {
  const snapshot = { collection: config.slug, id: String(doc.id), locale, updatedAt: doc.updatedAt }
  return `sha256:${createHash('sha256').update(JSON.stringify(snapshot)).digest('hex')}`
}

const readRevision = (args: Record<string, unknown>, req: PayloadRequest): string | undefined => {
  const body = asObject(args.data)
  const header = req.headers?.get('if-match')?.replace(/^"|"$/g, '')
  const expected = body[REVISION] ?? header
  if (body[REVISION] !== undefined && header && body[REVISION] !== header) {
    throw new APIError('Conflicting document revisions were submitted. Reload the document.', 400)
  }
  if (typeof expected !== 'string' || !/^sha256:[a-f0-9]{64}$/.test(expected)) return undefined
  return expected
}

export const protectEditorialWrite: CollectionBeforeOperationHook = async ({ args, collection, operation, req }) => {
  if (operation !== 'update' && operation !== 'restoreVersion') return
  if (!args) throw new APIError('Missing editorial operation arguments.', 400)
  const parent = operation === 'restoreVersion'
    ? asObject(req.context.localeScopedRestore).parentID : 'id' in args ? args.id : undefined
  if (typeof parent !== 'number' && typeof parent !== 'string') {
    throw new APIError('Protected editorial writes require one document ID.', 400)
  }
  const localization = req.payload.config.localization
  const locale = req.locale
  if (localization && (typeof locale !== 'string' || !localization.localeCodes.includes(locale))) {
    throw new APIError('Select one content language before saving.', 400)
  }
  const write = args as unknown as { data?: Record<string, unknown>; draft?: boolean; publishAllLocales?: boolean; publishSpecificLocale?: string; unpublishAllLocales?: boolean }
  if (write.publishSpecificLocale && write.publishSpecificLocale !== locale) {
    throw new APIError('The publication language must match the document language you opened.', 400)
  }
  if (operation === 'update' && req.user && collection.versions && collection.versions.drafts && !write.draft
    && !['published', 'draft'].includes(String(write.data?._status))
    && write.publishAllLocales !== true && write.unpublishAllLocales !== true) {
    throw new APIError('Choose Save Draft or Publish explicitly before saving versioned content.', 400)
  }
  await lockEditorialDocument(req, collection.slug, parent)
  const expected = readRevision(args as unknown as Record<string, unknown>, req)
  if (req.user && !expected) throw new APIError('Reload this document before saving. A saved revision is required to protect newer edits.', 428)
  const readReq = Object.assign(Object.create(req), req, { context: { ...req.context }, fallbackLocale: false })
  const current = await req.payload.findByID({ collection: collection.slug, id: parent,
    locale: locale as 'en' | 'kh' | 'cn', fallbackLocale: false, depth: 0, draft: true,
    overrideAccess: !req.user, user: req.user, req: readReq }) as unknown as Record<string, unknown>
  if (expected && expected !== editorialRevision(collection, current, String(locale))) {
    throw new APIError('A newer saved version is available. Your changes have not been saved or discarded. Review the latest version before trying again.', 409)
  }
  // Millisecond clocks can repeat during fast writes. Keep new version stamps monotonic without rewriting any old row.
  req.context.editorialWriteTimestamp = new Date(Math.max(Date.now(), (Date.parse(String(current.updatedAt)) || 0) + 1)).toISOString()
  if (write.data) delete write.data[REVISION]
  if (operation === 'update' && write.data?._status === 'published') {
    if (write.publishAllLocales === true && write.publishSpecificLocale) throw new APIError('Choose either one language or all languages, not both.', 400)
    if (write.publishAllLocales !== true) {
      write.publishAllLocales = false
      write.publishSpecificLocale = String(locale)
    }
  }
}

export const withEditorialConcurrency = (config: CollectionConfig): CollectionConfig => {
  if (!(config.versions && typeof config.versions === 'object' && config.versions.drafts) && config.slug !== 'media') return config
  return { ...config,
    disableBulkEdit: true,
    custom: { ...config.custom, editorialConcurrency: true },
    admin: { ...config.admin, custom: { ...config.admin?.custom, editorialConcurrency: true } },
    forceSelect: { ...config.forceSelect, updatedAt: true },
    fields: [...config.fields, { name: REVISION, type: 'text', virtual: true, admin: { hidden: true },
      access: { read: ({ req }) => Boolean(req.user) } }],
    hooks: { ...config.hooks,
      beforeOperation: [...(config.hooks?.beforeOperation ?? []), protectEditorialWrite],
      afterRead: [...(config.hooks?.afterRead ?? []), ({ doc, req, collection }) => {
        const localization = req.payload.config.localization
        if (req.user && doc.id != null && doc.updatedAt && (!localization || typeof req.locale === 'string' && localization.localeCodes.includes(req.locale))) {
          doc[REVISION] = editorialRevision(collection, doc, String(req.locale))
        } else delete doc[REVISION]
        return doc
      }],
    },
  }
}
