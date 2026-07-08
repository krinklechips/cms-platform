import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import { getTenantByHost } from '@/lib/get-tenant-by-host'

/**
 * Host-aware landing page:
 *  - roomchang.serviettelab.com (any tenant domain) → tenant-branded portal
 *  - serviettelab.com (platform)                    → Serviette Labs
 * Same clean design language as the Payload admin.
 */

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    background: '#fff',
    color: '#111',
    padding: 32,
    textAlign: 'center',
  },
  logo: { maxWidth: 320, maxHeight: 110, objectFit: 'contain' },
  h1: { fontSize: 30, fontWeight: 650, margin: 0, letterSpacing: '-0.02em' },
  sub: { color: '#666', fontSize: 15, lineHeight: 1.6, maxWidth: 460, margin: 0 },
  cta: {
    display: 'inline-block',
    background: '#111',
    color: '#fff',
    borderRadius: 8,
    padding: '12px 28px',
    fontSize: 15,
    fontWeight: 600,
    textDecoration: 'none',
  },
  footer: { position: 'absolute' as const, bottom: 20, color: '#aaa', fontSize: 12 },
}

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const host = headers.get('x-forwarded-host') ?? headers.get('host')
  const tenant = await getTenantByHost(payload, host)

  if (tenant) {
    return (
      <div style={S.page}>
        {tenant.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tenant.logoUrl} alt={tenant.name} style={S.logo} />
        )}
        <h1 style={S.h1}>{tenant.name}</h1>
        <p style={S.sub}>Content portal — manage your website’s services, team, and media.</p>
        <a href="/admin" style={S.cta}>
          Staff sign in
        </a>
        <div style={S.footer}>Powered by Serviette Labs</div>
      </div>
    )
  }

  return (
    <div style={S.page}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/serviette-logo.png" alt="Serviette Labs" style={S.logo} />
      <h1 style={S.h1}>Serviette Labs</h1>
      <p style={S.sub}>
        The content platform behind beautiful healthcare websites — multilingual, multi-tenant,
        managed for you.
      </p>
      <a href="/admin" style={S.cta}>
        Sign in
      </a>
      <div style={S.footer}>© Serviette Labs</div>
    </div>
  )
}
