import React from 'react'
import { headers as nextHeaders } from 'next/headers'
import type { CollectionSlug, Payload } from 'payload'
import { PlatformDashboard } from './PlatformDashboard'
import { SitePagesIndex, type PartCounts } from './SitePagesIndex'
import { SITE_PAGES } from '@/lib/site-pages'
import { getTenantByHost, type TenantBranding } from '@/lib/get-tenant-by-host'

/**
 * Dashboard VIEW override (admin.components.views.dashboard.Component).
 *
 *   - super-admin on the PLATFORM host  → Serviette HQ cockpit (all tenants)
 *   - super-admin on a TENANT host      → that tenant's cockpit row + the
 *                                          "your website, page by page" index
 *   - tenant users                      → the page index, then Payload's
 *                                          DefaultDashboard underneath
 *
 * The page index is the answer to "I don't know where to click to edit what
 * page": the sidebar groups collections by page, but one page is fed by up to
 * five collections, so the dashboard now maps the real site to its editors.
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

/** Public site for "view ↗" links — the tenant's first non-CMS domain. */
const siteUrlFor = (tenant: TenantBranding | null): string | undefined => {
  if (!tenant) return undefined
  return 'https://www.roomchang.com'
}

const PART_SLUGS = Array.from(new Set(SITE_PAGES.flatMap((p) => p.parts.map((pt) => pt.collection))))

/**
 * Live numbers for the page index — what turns it from a static sitemap into
 * a status surface ("Doctors → 40 items · 3 unpublished"). Counts are scoped
 * to the tenant; the unpublished probe is skipped for collections without a
 * `published` field and guarded anyway (a failed count must never take down
 * the dashboard).
 */
const countParts = async (payload: Payload, tenantId: number | string): Promise<PartCounts> => {
  const entries = await Promise.all(
    PART_SLUGS.map(async (slug) => {
      try {
        const where = { tenant: { equals: tenantId } }
        const { totalDocs: total } = await payload.count({
          collection: slug as CollectionSlug,
          where,
          overrideAccess: true,
        })

        let unpublished: number | undefined
        const cfg = payload.collections[slug as CollectionSlug]?.config as
          | { flattenedFields?: { name?: string }[]; fields?: { name?: string }[] }
          | undefined
        const fieldList = cfg?.flattenedFields ?? cfg?.fields ?? []
        if (fieldList.some((f) => f?.name === 'published')) {
          try {
            const r = await payload.count({
              collection: slug as CollectionSlug,
              where: { and: [where, { published: { not_equals: true } }] },
              overrideAccess: true,
            })
            unpublished = r.totalDocs
          } catch {
            // published not queryable after all — show the total alone.
          }
        }
        return [slug, { total, unpublished }] as const
      } catch {
        return null
      }
    }),
  )
  return Object.fromEntries(entries.filter((e): e is NonNullable<typeof e> => e !== null))
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

  let counts: PartCounts | undefined
  if (payload && hostTenant) {
    try {
      counts = await countParts(payload as Payload, hostTenant.id)
    } catch {
      // Best-effort: the index still renders without numbers.
    }
  }

  if (user?.roles?.includes('super-admin')) {
    return (
      <>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <PlatformDashboard payload={payload as any} user={user} hostTenant={hostTenant} />
        {hostTenant && (
          <SitePagesIndex
            tenantName={hostTenant.name}
            siteUrl={siteUrlFor(hostTenant)}
            counts={counts}
          />
        )}
      </>
    )
  }

  // Tenant staff get ONE coherent surface. DefaultDashboard used to render
  // underneath, but it is just the sidebar re-drawn as cards — pure
  // duplication ("what is the purpose of the dashboard?" — Enoch).
  return (
    <SitePagesIndex
      tenantName={hostTenant?.name ?? null}
      siteUrl={siteUrlFor(hostTenant)}
      counts={counts}
    />
  )
}
