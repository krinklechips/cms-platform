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
 * tenant's identity on their domain.
 *
 * Asset rules (learned the hard way — "logos are broken", dark-mode round):
 *   - markSrc must be a SQUARE TRANSPARENT png. White-background JPEGs read
 *     as broken tiles on the dark theme, and a white "chip" behind them read
 *     as broken too.
 *   - Login = mark + tenant NAME AS TEXT (inherits --theme-text), so it is
 *     correct in both themes for any tenant without per-theme wordmark files.
 *   - wordmarkSrc is only for brands whose wordmark survives both themes
 *     (Serviette's blue-on-transparent does; Roomchang's near-black text
 *     does not).
 */

type Brand = {
  name: string
  /** Square transparent mark — breadcrumb icon + login identity. */
  markSrc?: string
  /** Full wordmark — only when transparent AND readable on light and dark. */
  wordmarkSrc?: string
}

const SERVIETTE: Brand = { name: 'Serviette Labs', wordmarkSrc: '/serviette-logo.png' }

const BRANDS: { hostPrefix: string; brand: Brand }[] = [
  {
    hostPrefix: 'roomchang.',
    brand: { name: 'Roomchang Dental Hospital', markSrc: '/roomchang-mark.png' },
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
  if (!brand) return <div style={{ height: 96 }} aria-hidden="true" />

  if (brand.markSrc) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={brand.markSrc} alt="" style={{ height: 56, width: 56, objectFit: 'contain' }} />
        <span
          style={{
            fontSize: 20,
            fontWeight: 650,
            letterSpacing: 0.2,
            color: 'var(--theme-text)',
            textAlign: 'center',
          }}
        >
          {brand.name}
        </span>
      </div>
    )
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={brand.wordmarkSrc}
      alt={brand.name}
      style={{ maxWidth: 280, maxHeight: 80, objectFit: 'contain' }}
    />
  )
}

/** Nav header / small icon slot */
export const AdminIcon: React.FC = () => {
  const brand = useBrand()
  if (!brand) return <div style={{ height: 30, width: 30 }} aria-hidden="true" />
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={brand.markSrc ?? brand.wordmarkSrc}
      alt={brand.name}
      style={{ height: 30, maxWidth: 120, objectFit: 'contain' }}
    />
  )
}
