import type { CollectionConfig, Field } from 'payload'

/**
 * Drafts & preview-before-publish for every editorial collection.
 *
 * Model (Payload versions, verified in 3.85 source): saving a DRAFT writes only
 * a version row — the parent document keeps the last PUBLISHED content, so the
 * public API (and the sandbox site) keep serving what was published until the
 * editor presses Publish. A never-published document's parent carries
 * `_status: 'draft'`, and the anonymous access layer (module-gating) filters
 * those out. Draft content is visible to the site only in draft-preview mode
 * (authenticated API-key fetch with draft=true).
 *
 * The legacy `published` checkbox stays in the schema (its column was
 * backfilled into `_status`) but is hidden — one publish concept, not two.
 * Dropping the column is a later, deliberate migration.
 */
const hideLegacyPublished = (fields: Field[]): Field[] =>
  fields.map((f) =>
    'name' in f && f.name === 'published' && f.type === 'checkbox'
      ? { ...f, admin: { ...f.admin, hidden: true, position: undefined } }
      : f,
  )

export const withDrafts = (config: CollectionConfig): CollectionConfig => {
  const columns = (config.admin?.defaultColumns ?? []).map((c) =>
    c === 'published' ? '_status' : c,
  )
  if (columns.length > 0 && !columns.includes('_status')) columns.push('_status')
  return {
    ...config,
    versions: { drafts: true, maxPerDoc: 20 },
    admin: {
      ...config.admin,
      hideAPIURL: config.admin?.hideAPIURL ?? true,
      ...(columns.length > 0 ? { defaultColumns: columns } : {}),
      components: {
        ...config.admin?.components,
        edit: {
          ...config.admin?.components?.edit,
          beforeDocumentControls: [
            ...(config.admin?.components?.edit?.beforeDocumentControls ?? []),
            '/components/PublishingStatus#PublishingStatus',
          ],
          PublishButton: config.admin?.components?.edit?.PublishButton ??
            '/components/PreviewPublishButton#PreviewPublishButton',
        },
      },
    },
    fields: hideLegacyPublished(config.fields),
  }
}
