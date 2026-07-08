import React from 'react'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getTenantByHost } from '@/lib/get-tenant-by-host'

/**
 * Host-aware admin branding: the login screen / nav shows the TENANT's logo
 * on their domain (roomchang.serviettelab.com → Roomchang) and the Serviette
 * Labs logo on the platform domain. Server components — resolved per request.
 */

async function resolveBranding(): Promise<{ src: string; alt: string }> {
  try {
    const h = await nextHeaders()
    const host = h.get('x-forwarded-host') ?? h.get('host')
    const payload = await getPayload({ config })
    const tenant = await getTenantByHost(payload, host)
    if (tenant?.logoUrl) return { src: tenant.logoUrl, alt: tenant.name }
  } catch {
    // fall through to platform branding
  }
  return { src: '/serviette-logo.png', alt: 'Serviette Labs' }
}

export const BrandLogo: React.FC = async () => {
  const { src, alt } = await resolveBranding()
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} style={{ maxWidth: 260, maxHeight: 80, objectFit: 'contain' }} />
}

export const BrandIcon: React.FC = async () => {
  const { src, alt } = await resolveBranding()
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} style={{ maxWidth: 120, maxHeight: 32, objectFit: 'contain' }} />
}
