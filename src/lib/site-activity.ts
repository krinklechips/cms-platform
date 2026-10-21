import type { CollectionSlug, Payload, TypedUser } from 'payload'
import { CONTENT_COLLECTION_SLUGS } from './content-collections'
import { COLLECTION_LABELS } from './collection-labels'
import { getStatLabel, getStatPageSummary } from './stat-pages'

export type RecentDoc = {
  collection: string
  id: string | number
  title: string
  label: string
  updatedAt: string
  agoText: string
}

export type UnpublishedDoc = Omit<RecentDoc, 'agoText'>

type LooseDoc = { id: string | number; updatedAt?: string } & Record<string, unknown>

const agoText = (iso: string): string => {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60_000))
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return days < 30 ? `${days} day${days === 1 ? '' : 's'} ago` : iso.slice(0, 10)
}

export const gatherActivity = async (payload: Payload, tenantId: number | string, user: TypedUser | null) => {
  if (!user) return { recent: [] as RecentDoc[], unpublished: [] as UnpublishedDoc[], unpublishedTotal: 0, incomplete: true }
  const slugs = CONTENT_COLLECTION_SLUGS.filter((slug) =>
    Boolean(payload.collections[slug as CollectionSlug]?.config.versions?.drafts),
  )
  let incomplete = false
  const rows = await Promise.all(slugs.map(async (slug) => {
    const query = async (draftsOnly: boolean) => {
      try {
        return await payload.find({
          collection: slug as CollectionSlug,
          // Published parents do not include edits saved only to version rows.
          draft: true,
          where: draftsOnly
            ? { and: [{ tenant: { equals: tenantId } }, { _status: { equals: 'draft' } }] }
            : { tenant: { equals: tenantId } },
          sort: '-updatedAt',
          limit: draftsOnly ? 8 : 6,
          depth: 0,
          overrideAccess: false,
          user,
        })
      } catch {
        incomplete = true
        return { docs: [], totalDocs: 0 }
      }
    }
    const [recent, drafts] = await Promise.all([query(false), query(true)])
    const asRow = (doc: LooseDoc): RecentDoc => {
      const titleField = payload.collections[slug as CollectionSlug]?.config.admin.useAsTitle
      const title = slug === 'site-stats' && typeof doc.key === 'string'
        ? `${getStatLabel(doc.key)} (${getStatPageSummary(doc.key)})`
        : (titleField ? doc[titleField] : undefined) ?? doc.title ?? doc.name
      const updatedAt = typeof doc.updatedAt === 'string' ? doc.updatedAt : ''
      return {
        collection: slug,
        id: doc.id,
        title: typeof title === 'string' && title.trim() ? title : `#${doc.id}`,
        label: COLLECTION_LABELS[slug]?.singular ?? slug,
        updatedAt,
        agoText: updatedAt ? agoText(updatedAt) : '',
      }
    }
    return {
      recent: (recent.docs as LooseDoc[]).map(asRow),
      drafts: (drafts.docs as LooseDoc[]).map(asRow),
      total: drafts.totalDocs,
    }
  }))
  const newestFirst = (a: RecentDoc, b: RecentDoc) => b.updatedAt.localeCompare(a.updatedAt)
  return {
    recent: rows.flatMap((row) => row.recent).sort(newestFirst).slice(0, 6),
    unpublished: rows.flatMap((row) => row.drafts).sort(newestFirst).slice(0, 8),
    unpublishedTotal: rows.reduce((total, row) => total + row.total, 0),
    incomplete,
  }
}
