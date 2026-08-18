import React from 'react'
// Public, supported subpath export (not a dist/ deep import).
import { DefaultDashboard } from '@payloadcms/next/views'
import { headers as nextHeaders } from 'next/headers'
import type { Payload } from 'payload'
import { PlatformDashboard } from './PlatformDashboard'
import { getTenantByHost } from '@/lib/get-tenant-by-host'

/**
 * Dashboard VIEW override (admin.components.views.dashboard.Component).
 *
 * Fixes the "two mental models" confusion (Codex + Oak): a super-admin used to
 * see the cockpit AND Payload's default collection-group cards stacked below.
 * Now:
 *   - super-admin  → ONLY the Serviette HQ cockpit (no default cards)
 *   - tenant users → Payload's normal DefaultDashboard (their gated groups)
 *
 * HOST-AWARE SCOPING (Enoch, 2026-08-18): logging in on a TENANT's domain
 * (roomchang.serviettelab.com) must not surface other tenants — even for the
 * owner. When the request host resolves to a tenant, the cockpit is filtered
 * to that tenant only; the full platform view lives on serviettelab.com.
 * (This slot is the PROVEN-safe place for async server work — unlike
 * graphics.Logo, which white-screens on async components.)
 */
type ViewProps = {
  initPageResult?: {
    req?: {
      user?: { roles?: string[] } | null
      payload?: unknown
    }
  }
}

export const PlatformDashboardView: React.FC<ViewProps> = async (props) => {
  const user = props?.initPageResult?.req?.user ?? null
  const payload = props?.initPageResult?.req?.payload

  if (user?.roles?.includes('super-admin')) {
    let hostTenant: { id: number | string; name: string } | null = null
    try {
      const h = await nextHeaders()
      const host = h.get('x-forwarded-host') ?? h.get('host')
      hostTenant = await getTenantByHost(payload as Payload, host)
    } catch {
      // Host resolution is best-effort; fall back to the full platform view.
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <PlatformDashboard payload={payload as any} user={user} hostTenant={hostTenant} />
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <DefaultDashboard {...(props as any)} />
}
