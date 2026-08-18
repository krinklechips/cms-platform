import React from 'react'
import { headers as nextHeaders } from 'next/headers'
import type { Payload } from 'payload'
import { getTenantByHost } from '@/lib/get-tenant-by-host'

/**
 * "Editing site: <tenant>" banner — rendered in the `beforeNavLinks` slot so it
 * sits INSIDE the sidebar, above the page groups.
 *
 * It must NOT be rendered as a sibling of <DefaultNav/> from the Nav override:
 * doing that puts it in the admin's nav *slot* alongside the real nav, which
 * renders as a second panel and covers Payload's nav-collapse chevron.
 */

type ServerProps = {
  payload?: Payload
  user?: { roles?: string[]; tenants?: { tenant?: unknown }[] | null } | null
}

const S: Record<string, React.CSSProperties> = {
  banner: {
    margin: '0 0 14px',
    padding: '10px 12px',
    borderRadius: 8,
    background: 'var(--theme-elevation-50)',
    border: '1px solid var(--theme-elevation-150)',
  },
  label: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--theme-elevation-450)',
    margin: 0,
  },
  name: {
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--theme-text)',
    margin: '2px 0 0',
    lineHeight: 1.3,
  },
}

/** Tenant name from a user's own membership (for tenant users on any host). */
const ownTenantName = (user: ServerProps['user']): string | null => {
  const t = user?.tenants?.[0]?.tenant
  if (t && typeof t === 'object') {
    const o = t as { name?: string; slug?: string }
    return o.name ?? o.slug ?? null
  }
  return null
}

export const TenantNavBanner: React.FC<ServerProps> = async ({ payload, user }) => {
  let name: string | null = null

  try {
    const h = await nextHeaders()
    const host = h.get('x-forwarded-host') ?? h.get('host')
    if (payload) {
      const hostTenant = await getTenantByHost(payload, host)
      if (hostTenant) name = hostTenant.name
    }
  } catch {
    // fall through to the user's own tenant
  }

  if (!name) name = ownTenantName(user)
  if (!name) return null

  return (
    <>
      {/* Safe here (inside the nav, not the layout slot): hide the plugin's
          "Filter by Tenant" selector on a pinned host. Leaving it visible lets
          you switch tenants while host scoping still pins the lists to this
          domain's tenant — banner, sidebar and rows would disagree. The
          platform host renders no banner, so it keeps its selector.

          Also a sidebar density pass ("make the menu cleaner" — Enoch):
          group headers become small muted caps so the ITEMS carry the visual
          weight, and link spacing tightens a notch. */}
      <style>{`
        .tenant-selector{display:none!important}
        .nav-group__toggle{font-size:11px;text-transform:uppercase;letter-spacing:.07em;color:var(--theme-elevation-500)}
        .nav__link{font-size:13px}
      `}</style>
      <div style={S.banner}>
        <p style={S.label}>Editing site</p>
        <p style={S.name}>{name}</p>
      </div>
    </>
  )
}
