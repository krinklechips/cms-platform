import React from 'react'
import Link from 'next/link'
import { headers as nextHeaders } from 'next/headers'
import type { Payload } from 'payload'
import { getTenantByHost } from '@/lib/get-tenant-by-host'

/**
 * Tenant identity for the shared workspace header. Resolve branding here,
 * never inside Payload's graphics slot, which must remain synchronous.
 */

type ServerProps = {
  payload?: Payload
  user?: { roles?: string[]; tenants?: { tenant?: unknown }[] | null } | null
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
  let logoUrl: string | null = null
  let isRoomchang = false

  try {
    const h = await nextHeaders()
    const host = h.get('x-forwarded-host') ?? h.get('host')
    if (payload) {
      const hostTenant = await getTenantByHost(payload, host)
      if (hostTenant) {
        name = hostTenant.name
        logoUrl = hostTenant.logoUrl
        isRoomchang = hostTenant.slug === 'roomchang'
      }
    }
  } catch {
    // fall through to the user's own tenant
  }

  if (!name) name = ownTenantName(user)
  if (!name) return null

  return (
    <>
      <div className="tenant-identity">
        <Link href="/admin" prefetch={false} aria-label={`${name} dashboard`}>
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={isRoomchang ? 'tenant-identity__wordmark' : 'tenant-identity__logo'} src={logoUrl} alt={isRoomchang ? 'Roomchang Dental Hospital' : name} width={isRoomchang ? 144 : 180} height={isRoomchang ? 75 : 72} />
          )}
          <span className={isRoomchang ? 'tenant-identity__dark' : logoUrl ? 'tenant-identity__name' : ''}>
            {isRoomchang && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/roomchang-mark.png" alt="" width={28} height={28} />
            )}
            <strong>{isRoomchang ? 'Roomchang' : name}</strong>
          </span>
        </Link>
        <span className="tenant-identity__environment" title="CMS publishing updates the preview website, not roomchang.com.">Preview workspace</span>
      </div>
    </>
  )
}
