import React from 'react'
import { headers as nextHeaders } from 'next/headers'
import type { CollectionSlug, Payload } from 'payload'
import { PlatformDashboard } from './PlatformDashboard'
import {
  SiteActivityDashboard,
  type RecentDoc,
  type UnpublishedDoc,
} from './SiteActivityDashboard'
import { SITE_PAGES } from '@/lib/site-pages'
import { COLLECTION_LABELS } from '@/lib/collection-labels'
import { getTenantByHost, type TenantBranding } from '@/lib/get-tenant-by-host'

/**
 * Dashboard VIEW override (admin.components.views.dashboard.Component).
 *
 *   - super-admin on the PLATFORM host  → Serviette HQ cockpit (all tenants)
 *   - super-admin on a TENANT host      → tenant cockpit row + activity board
 *   - tenant users                      → the activity board alone
 *
 * The activity board (SiteActivityDashboard) only shows what the sidebar
 * cannot: recent edits, unpublished drafts, quick-add. Navigation is the
 * sidebar's job; per-collection explanations render on each list view.
 *
 * This slot is the PROVEN-safe place for async server work (unlike
 * graphics.Logo, which white-screens on async components).
 */
type ViewProps = {
  initPageResult?: {
    req?: {
      user?: { roles?: string[] } | null
      payload?: unknown
    }
  }
}

/** Public site for the "open the live website" link. */
const siteUrlFor = (tenant: TenantBranding | null): string | undefined => {
  if (!tenant) return undefined
  return 'https://www.roomchang.com'
}

/** Content collections worth surfacing. Enquiries/bookings are an inbox, not
 *  edits, so they stay out of "recent activity". */
const CONTENT_SLUGS = Array.from(
  new Set([...SITE_PAGES.flatMap((p) => p.parts.map((pt) => pt.collection)), 'pages']),
).filter((slug) => slug !== 'enquiries' && slug !== 'booking-slots')

const labelFor = (slug: string): string => COLLECTION_LABELS[slug]?.singular ?? slug

const agoText = (iso: string): string => {
  const ms = Date.now() - new Date(iso).getTime()
  const min = Math.floor(ms / 60_000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min} min ago`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d} day${d === 1 ? '' : 's'} ago`
  return iso.slice(0, 10)
}

type LooseDoc = { id: string | number; updatedAt?: string } & Record<string, unknown>

const titleOf = (payload: Payload, slug: string, doc: LooseDoc): string => {
  const useAsTitle = (
    payload.collections[slug as CollectionSlug]?.config?.admin as { useAsTitle?: string } | undefined
  )?.useAsTitle
  const candidate =
    (useAsTitle ? doc[useAsTitle] : undefined) ?? doc.title ?? doc.name ?? `#${doc.id}`
  return typeof candidate === 'string' && candidate.trim() !== '' ? candidate : `#${doc.id}`
}

const hasPublishedField = (payload: Payload, slug: string): boolean => {
  const cfg = payload.collections[slug as CollectionSlug]?.config as
    | { flattenedFields?: { name?: string }[]; fields?: { name?: string }[] }
    | undefined
  const fieldList = cfg?.flattenedFields ?? cfg?.fields ?? []
  return fieldList.some((f) => f?.name === 'published')
}

const gatherActivity = async (
  payload: Payload,
  tenantId: number | string,
): Promise<{ recent: RecentDoc[]; unpublished: UnpublishedDoc[] }> => {
  const tenantWhere = { tenant: { equals: tenantId } }

  const recentNested = await Promise.all(
    CONTENT_SLUGS.map(async (slug) => {
      try {
        const res = await payload.find({
          collection: slug as CollectionSlug,
          where: tenantWhere,
          sort: '-updatedAt',
          limit: 2,
          depth: 0,
          overrideAccess: true,
        })
        return (res.docs as unknown as LooseDoc[]).map((doc) => ({ slug, doc }))
      } catch {
        return []
      }
    }),
  )
  const recent = recentNested
    .flat()
    .filter((r) => typeof r.doc.updatedAt === 'string')
    .sort((a, b) => (b.doc.updatedAt as string).localeCompare(a.doc.updatedAt as string))
    .slice(0, 6)
    .map((r) => ({
      collection: r.slug,
      id: r.doc.id,
      title: titleOf(payload, r.slug, r.doc),
      label: labelFor(r.slug),
      updatedAt: r.doc.updatedAt as string,
      agoText: agoText(r.doc.updatedAt as string),
    }))

  const unpublishedNested = await Promise.all(
    CONTENT_SLUGS.filter((slug) => hasPublishedField(payload, slug)).map(async (slug) => {
      try {
        const res = await payload.find({
          collection: slug as CollectionSlug,
          where: { and: [tenantWhere, { published: { not_equals: true } }] },
          sort: '-updatedAt',
          limit: 3,
          depth: 0,
          overrideAccess: true,
        })
        return (res.docs as unknown as LooseDoc[]).map((doc) => ({ slug, doc }))
      } catch {
        return []
      }
    }),
  )
  const unpublished = unpublishedNested
    .flat()
    .slice(0, 8)
    .map((r) => ({
      collection: r.slug,
      id: r.doc.id,
      title: titleOf(payload, r.slug, r.doc),
      label: labelFor(r.slug),
    }))

  return { recent, unpublished }
}

export const PlatformDashboardView: React.FC<ViewProps> = async (props) => {
  const user = props?.initPageResult?.req?.user ?? null
  const payload = props?.initPageResult?.req?.payload

  let hostTenant: TenantBranding | null = null
  try {
    const h = await nextHeaders()
    const host = h.get('x-forwarded-host') ?? h.get('host')
    hostTenant = await getTenantByHost(payload as Payload, host)
  } catch {
    // Host resolution is best-effort; fall back to the platform view.
  }

  let recent: RecentDoc[] = []
  let unpublished: UnpublishedDoc[] = []
  if (payload && hostTenant) {
    try {
      ;({ recent, unpublished } = await gatherActivity(payload as Payload, hostTenant.id))
    } catch {
      // Best-effort: the board still renders without activity data.
    }
  }

  const board = hostTenant ? (
    <SiteActivityDashboard
      tenantName={hostTenant.name}
      siteUrl={siteUrlFor(hostTenant)}
      recent={recent}
      unpublished={unpublished}
    />
  ) : null

  if (user?.roles?.includes('super-admin')) {
    return (
      <>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <PlatformDashboard payload={payload as any} user={user} hostTenant={hostTenant} />
        {board}
      </>
    )
  }

  // Tenant staff get ONE coherent surface — no duplicated default dashboard.
  return board ?? <SiteActivityDashboard recent={[]} unpublished={[]} />
}
