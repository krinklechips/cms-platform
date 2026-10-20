import { APIError, type Block, type CollectionBeforeOperationHook, type Field } from 'payload'
import { lockEditorialDocument } from './editorial-lock'

type Doc = Record<string, unknown>
const isDoc = (value: unknown): value is Doc =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
const asDoc = (value: unknown): Doc => isDoc(value) ? value : {}

export const requireRestoreLocale = (locale: unknown, supported: readonly string[]): string => {
  if (typeof locale !== 'string' || !locale || locale === 'all' || locale === '*' || !supported.includes(locale)) {
    throw new APIError('Restore requires an explicit supported single locale.', 400)
  }
  return locale
}

/** Restore locale-owned data only. Shared containers always retain their current structure. */
export const copyLocalizedFields = ({ fields, current, selected, locale, blocks = [] }: {
  fields: Field[]
  current: Doc
  selected: Doc
  locale: string
  blocks?: Block[]
}): Doc => {
  const result = structuredClone(current)
  const copyLocale = (name: string, target: Doc, source: Doc) => {
    if (!(name in target) && !(name in source)) return
    const historical = asDoc(source[name])
    target[name] = { ...asDoc(target[name]),
      [locale]: structuredClone(historical[locale] ?? null) }
  }
  const rowID = (value: unknown) => {
    const id = asDoc(value).id
    return typeof id === 'string' || typeof id === 'number' ? String(id) : undefined
  }
  const visit = (schema: Field[], target: Doc, source: Doc) => {
    for (const field of schema) {
      if (field.type === 'tabs') {
        for (const tab of field.tabs) {
          if ('name' in tab && tab.name) {
            if (tab.localized) copyLocale(tab.name, target, source)
            else if (isDoc(target[tab.name])) visit(tab.fields, asDoc(target[tab.name]), asDoc(source[tab.name]))
          } else visit(tab.fields, target, source)
        }
        continue
      }
      if (!('name' in field) || !field.name) {
        if ('fields' in field) visit(field.fields, target, source)
        continue
      }
      const name = field.name
      if ('localized' in field && field.localized) {
        copyLocale(name, target, source)
      } else if (field.type === 'group') {
        if (isDoc(target[name])) visit(field.fields, asDoc(target[name]), asDoc(source[name]))
      } else if (field.type === 'array' || field.type === 'blocks') {
        const rows = target[name]
        const historicalRows = source[name]
        if (!Array.isArray(rows) || !Array.isArray(historicalRows)) continue
        const uniqueRows = new Map<string, Doc | undefined>()
        for (const row of historicalRows) {
          const id = rowID(row)
          if (id !== undefined) uniqueRows.set(id, uniqueRows.has(id) ? undefined : asDoc(row))
        }
        const counts = new Map<string | undefined, number>()
        for (const row of rows) counts.set(rowID(row), (counts.get(rowID(row)) ?? 0) + 1)
        for (const row of rows) {
          const id = rowID(row)
          const old = id === undefined ? undefined : uniqueRows.get(id)
          if (!isDoc(row) || !old || counts.get(id) !== 1) continue
          if (field.type === 'array') visit(field.fields, row, old)
          else if (row.blockType === old.blockType) {
            const block = (field.blockReferences ?? field.blocks)
              .map((entry) => typeof entry === 'string' ? blocks.find((b) => b.slug === entry) : entry)
              .find((b) => b?.slug === row.blockType)
            if (block) visit(block.fields, row, old)
          }
        }
      }
    }
  }
  visit(fields, result, selected)
  return result
}

export const prepareLocaleRestore: CollectionBeforeOperationHook = async ({ args, collection, operation, req }) => {
  if (operation !== 'restoreVersion') return
  delete req.context.localeScopedRestore
  const localization = req.payload.config.localization
  // req.locale alone is unsafe: Payload silently defaults omitted/invalid REST locales to English.
  // Local callers must likewise supply req.query.locale, in addition to their locale option.
  const locale = requireRestoreLocale(req.query?.locale ?? req.searchParams?.get('locale'),
    localization ? localization.localeCodes : [])
  if (req.locale !== locale) throw new APIError('Restore locale does not match the active request locale.', 400)
  if (!args.id) throw new APIError('Missing ID of version to restore.', 400)

  // Local API mutates its req locale. Clone it, retaining the transaction, user and access context.
  const readReq = () => Object.assign(Object.create(req), req, { context: { ...req.context } })
  const selected = await req.payload.findVersionByID({
    collection: collection.slug, id: String(args.id), locale: 'all', fallbackLocale: false,
    depth: 0, showHiddenFields: true, overrideAccess: false, user: req.user, req: readReq(),
  })
  const parent = isDoc(selected.parent) ? selected.parent.id : selected.parent
  if (typeof parent !== 'string' && typeof parent !== 'number') {
    throw new APIError('Version has no restorable parent document.', 400)
  }
  // Version history identifies the parent; no mutable draft state may be read until this lock is held.
  await lockEditorialDocument(req, collection.slug, parent)
  req.context.localeScopedRestore = {
    collection: collection.slug, versionID: String(args.id), parentID: String(parent), locale,
    // Native restore calls this only after its update policy authorizes the parent.
    // Its raw snapshots retain fields hidden by read access; filtered API responses cannot preserve them.
    prepareSnapshot: (current: Doc, historical: Doc) => ({
      ...copyLocalizedFields({ fields: collection.fields, current, selected: historical,
        locale, blocks: Object.values(req.payload.blocks) }), _status: 'draft',
    }),
  }
  args.draft = true
}
