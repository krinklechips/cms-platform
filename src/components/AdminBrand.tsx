'use client'

import React, { useEffect, useState } from 'react'

/**
 * Host-aware admin branding — CLIENT component, deliberately.
 *
 * The previous attempt (BrandLogo.tsx) resolved the tenant server-side with
 * getPayload() inside admin graphics.Logo and WHITE-SCREENED the whole admin
 * (async server component in that slot breaks the importMap render). This
 * version does zero server work: the brand is picked from
 * window.location.hostname after mount, so the login screen itself shows the
 * tenant's identity on their domain:
 *
 *   roomchang.*  → Roomchang Dental Hospital logo
 *   anything else → Serviette Labs logo
 *
 * SSR renders a fixed-size placeholder (no hydration mismatch); the logo pops
 * in on mount. Add new tenants to BRANDS when their domain goes live.
 */

type Brand = { src: string; alt: string }

const SERVIETTE: Brand = { src: '/serviette-logo.png', alt: 'Serviette Labs' }

const BRANDS: { hostPrefix: string; brand: Brand }[] = [
  {
    hostPrefix: 'roomchang.',
    brand: { src: '/roomchang-logo.png', alt: 'Roomchang Dental Hospital' },
  },
]

function useBrand(): Brand | null {
  const [brand, setBrand] = useState<Brand | null>(null)
  useEffect(() => {
    const host = window.location.hostname
    const match = BRANDS.find((b) => host.startsWith(b.hostPrefix))
    setBrand(match ? match.brand : SERVIETTE)
  }, [])
  return brand
}

/** Login screen / large logo slot */
export const AdminLogo: React.FC = () => {
  const brand = useBrand()
  if (!brand) return <div style={{ height: 80 }} aria-hidden="true" />
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={brand.src}
      alt={brand.alt}
      style={{ maxWidth: 280, maxHeight: 80, objectFit: 'contain' }}
    />
  )
}

/** Nav header / small icon slot */
export const AdminIcon: React.FC = () => {
  const brand = useBrand()
  if (!brand) return <div style={{ height: 26, width: 26 }} aria-hidden="true" />
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={brand.src}
      alt={brand.alt}
      style={{ maxHeight: 26, maxWidth: 110, objectFit: 'contain' }}
    />
  )
}
