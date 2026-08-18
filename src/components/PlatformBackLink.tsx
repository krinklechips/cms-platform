import React from 'react'
import { headers as nextHeaders } from 'next/headers'
import type { Payload } from 'payload'
import { getTenantByHost } from '@/lib/get-tenant-by-host'

/**
 * "← Serviette Labs platform" — rendered in the `afterNavLinks` slot (INSIDE
 * the sidebar, under the page groups) so a super-admin working on a tenant's
 * domain can get back to the all-customers view.
 *
 * Only shown to super-admins, and only on a tenant host.
 */

type ServerProps = {
  payload?: Payload
  user?: { roles?: string[] } | null
}

const S: Record<string, React.CSSProperties> = {
  wrap: { marginTop: 18, paddingTop: 12, borderTop: '1px solid var(--theme-elevation-100)' },
  link: {
    fontSize: 12,
    color: 'var(--theme-elevation-500)',
    textDecoration: 'none',
    lineHeight: 1.5,
  },
}

export const PlatformBackLink: React.FC<ServerProps> = async ({ payload, user }) => {
  if (!user?.roles?.includes('super-admin')) return null

  try {
    const h = await nextHeaders()
    const host = h.get('x-forwarded-host') ?? h.get('host')
    if (!payload) return null
    const hostTenant = await getTenantByHost(payload, host)
    if (!hostTenant) return null // already on the platform host
  } catch {
    return null
  }

  return (
    <div style={S.wrap}>
      <a href="https://serviettelab.com/admin" style={S.link}>
        ← Serviette Labs platform (all customers)
      </a>
    </div>
  )
}
