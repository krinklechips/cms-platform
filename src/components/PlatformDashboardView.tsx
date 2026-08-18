import React from 'react'
// Public, supported subpath export (not a dist/ deep import).
import { DefaultDashboard } from '@payloadcms/next/views'
import { headers as nextHeaders } from 'next/headers'
import type { Payload } from 'payload'
import { PlatformDashboard } from './PlatformDashboard'
import { SitePagesIndex } from './SitePagesIndex'
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

  if (user?.roles?.includes('super-admin')) {
    return (
      <>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <PlatformDashboard payload={payload as any} user={user} hostTenant={hostTenant} />
        {hostTenant && (
          <SitePagesIndex tenantName={hostTenant.name} siteUrl={siteUrlFor(hostTenant)} />
        )}
      </>
    )
  }

  return (
    <>
      <SitePagesIndex tenantName={hostTenant?.name ?? null} siteUrl={siteUrlFor(hostTenant)} />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <DefaultDashboard {...(props as any)} />
    </>
  )
}
