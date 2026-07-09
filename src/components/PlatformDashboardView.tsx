import React from 'react'
// Public, supported subpath export (not a dist/ deep import).
import { DefaultDashboard } from '@payloadcms/next/views'
import { PlatformDashboard } from './PlatformDashboard'

/**
 * Dashboard VIEW override (admin.components.views.dashboard.Component).
 *
 * Fixes the "two mental models" confusion (Codex + Oak): a super-admin used to
 * see the cockpit AND Payload's default collection-group cards stacked below.
 * Now:
 *   - super-admin  → ONLY the Serviette HQ cockpit (no default cards)
 *   - tenant users → Payload's normal DefaultDashboard (their gated groups)
 */
type ViewProps = {
  initPageResult?: {
    req?: {
      user?: { roles?: string[] } | null
      payload?: unknown
    }
  }
}

export const PlatformDashboardView: React.FC<ViewProps> = (props) => {
  const user = props?.initPageResult?.req?.user ?? null
  const payload = props?.initPageResult?.req?.payload

  if (user?.roles?.includes('super-admin')) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <PlatformDashboard payload={payload as any} user={user} />
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <DefaultDashboard {...(props as any)} />
}
