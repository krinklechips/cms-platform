import React from 'react'
import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
// Public, supported subpath export (same pattern as DefaultDashboard).
import { ListView } from '@payloadcms/next/views'
import type { Payload } from 'payload'
import { getTenantByHost } from '@/lib/get-tenant-by-host'

/**
 * Homepage is ONE document per tenant, but Payload renders every collection as
 * a LIST first — so editors saw a data table with a single meaningless
 * "ID: 1" row, a "Search by ID" box and a "Create New" button that would have
 * created a SECOND homepage (the site only ever reads the first). Bad UX
 * called out by Enoch (2026-08-19).
 *
 * This list-view override sends the editor straight to THE document:
 *   - tenant host (roomchang.serviettelab.com) → that tenant's homepage doc
 *   - tenant user anywhere                     → their own tenant's doc
 *   - super-admin on the platform host         → the normal list (all tenants)
 *
 * NOTE: redirect() works by throwing NEXT_REDIRECT — keep it OUTSIDE any
 * try/catch or the redirect silently dies.
 */

type ViewProps = {
  initPageResult?: {
    req?: {
      user?: {
        roles?: string[]
        tenants?: { tenant?: { id?: number | string } | number | string | null }[] | null
      } | null
      payload?: unknown
    }
  }
}

const ownTenantId = (user: NonNullable<ViewProps['initPageResult']>['req'] extends infer R
  ? R extends { user?: infer U }
    ? U
    : never
  : never): number | string | null => {
  const t = (user as { tenants?: { tenant?: { id?: number | string } | number | string | null }[] } | null)
    ?.tenants?.[0]?.tenant
  if (t == null) return null
  return typeof t === 'object' ? (t.id ?? null) : t
}

export const HomepageSingleRedirect: React.FC<ViewProps> = async (props) => {
  const req = props?.initPageResult?.req
  const payload = req?.payload as Payload | undefined
  const user = req?.user ?? null

  // 1) which tenant's homepage? Host wins; a tenant user's own tenant otherwise.
  let tenantId: number | string | null = null
  try {
    const h = await nextHeaders()
    const host = h.get('x-forwarded-host') ?? h.get('host')
    if (payload) {
      const hostTenant = await getTenantByHost(payload, host)
      if (hostTenant) tenantId = hostTenant.id
    }
  } catch {
    // fall through
  }
  if (tenantId === null && !user?.roles?.includes('super-admin')) {
    tenantId = ownTenantId(user)
  }

  // 2) resolve the doc id (outside try/catch — redirect() throws on purpose).
  let target: string | null = null
  if (payload && tenantId !== null) {
    try {
      const res = await payload.find({
        collection: 'homepage',
        where: { tenant: { equals: tenantId } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      const doc = res.docs[0] as { id?: number | string } | undefined
      target = doc?.id != null
        ? `/admin/collections/homepage/${doc.id}`
        : `/admin/collections/homepage/create`
    } catch {
      target = null // fall back to the list rather than break the route
    }
  }
  if (target) redirect(target)

  // 3) super-admin on the platform host (or resolution failed): standard list.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <ListView {...(props as any)} />
}
