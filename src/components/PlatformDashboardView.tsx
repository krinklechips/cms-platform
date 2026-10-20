import React from 'react'
import { headers as nextHeaders } from 'next/headers'
import type { Payload, TypedUser } from 'payload'
import { PlatformDashboard } from './PlatformDashboard'
import {
  SiteActivityDashboard,
} from './SiteActivityDashboard'
import { gatherActivity } from '@/lib/site-activity'
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
      user?: TypedUser | null
      payload?: unknown
    }
  }
  // Payload also spreads serverProps at the TOP level of view overrides (the
  // HomepageSingleRedirect lesson). The cockpit silently vanished because we
  // only read initPageResult — accept both shapes.
  user?: TypedUser | null
  payload?: unknown
}

/** Public site for the "open the live website" link. */
const siteUrlFor = (tenant: TenantBranding | null): string | undefined => {
  if (!tenant) return undefined
  return tenant.slug === 'roomchang' ? 'https://www.roomchang.com' : undefined
}

export const PlatformDashboardView: React.FC<ViewProps> = async (props) => {
  const user = props?.initPageResult?.req?.user ?? props?.user ?? null
  const payload = props?.initPageResult?.req?.payload ?? props?.payload

  let hostTenant: TenantBranding | null = null
  try {
    const h = await nextHeaders()
    const host = h.get('x-forwarded-host') ?? h.get('host')
    hostTenant = await getTenantByHost(payload as Payload, host)
  } catch {
    // Host resolution is best-effort; fall back to the platform view.
  }

  let activity: Awaited<ReturnType<typeof gatherActivity>> = {
    recent: [], unpublished: [], unpublishedTotal: 0, incomplete: true,
  }
  if (payload && hostTenant) {
    try {
      activity = await gatherActivity(payload as Payload, hostTenant.id, user)
    } catch {
      // Best-effort: the board still renders without activity data.
    }
  }

  const board = hostTenant ? (
    <SiteActivityDashboard
      tenantName={hostTenant.name}
      siteUrl={siteUrlFor(hostTenant)}
      previewUrl={process.env.DUMMY_SITE_URL || 'http://localhost:3200'}
      {...activity}
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
  return board ?? <SiteActivityDashboard previewUrl={process.env.DUMMY_SITE_URL || 'http://localhost:3200'} {...activity} />
}
