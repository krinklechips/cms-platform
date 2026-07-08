'use client'

import React from 'react'
import { useLivePreview } from '@payloadcms/live-preview-react'

/**
 * Subscribes to the Payload admin via postMessage — form edits stream in on
 * every keystroke (no save needed). Renders the service detail sections in
 * Roomchang's design language (brand pink, soft cards).
 */

type Section = {
  type?: string
  title?: string
  heading?: string
  subheading?: string
  body?: string
  icon?: string
  card?: boolean
  numbered?: boolean
  columns?: number
  items?: { title?: string; body?: string; step?: string; detail?: string }[]
  rows?: { treatment?: string; price?: string }[]
  src?: string
  alt?: string
  caption?: string
}

type ServiceDoc = {
  name?: string | null
  description?: string | null
  features?: ({ feature?: string | null } | null)[] | null
  imageUrl?: string | null
  /** Payload types `json` fields loosely — normalized where used. */
  content?: unknown
}

const BRAND = '#cc3771'
const DEEP = '#7e2f66'
const SOFT = '#f7d6e2'
const TEXT = '#2c1a28'
const MUTED = '#705569'

const S: Record<string, React.CSSProperties> = {
  page: { fontFamily: "'Manrope', system-ui, sans-serif", color: TEXT, background: '#fdf7f9', minHeight: '100vh' },
  hero: { background: '#fff', borderBottom: `1px solid ${SOFT}`, padding: '48px 32px' },
  eyebrow: { fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: BRAND },
  h1: { fontSize: 44, margin: '10px 0 14px', fontWeight: 600 },
  desc: { maxWidth: 640, lineHeight: 1.7, color: MUTED },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 },
  chip: { background: SOFT, color: DEEP, borderRadius: 999, padding: '5px 14px', fontSize: 12, fontWeight: 600 },
  main: { maxWidth: 980, margin: '0 auto', padding: '40px 32px', display: 'flex', flexDirection: 'column', gap: 40 },
  h2: { fontSize: 26, margin: '0 0 12px', fontWeight: 600 },
  sub: { color: MUTED, fontSize: 14, lineHeight: 1.7, margin: '0 0 16px' },
  callout: { background: SOFT, borderRadius: 20, padding: 24 },
  cardGrid: { display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))' },
  card: { background: '#fff', border: `1px solid ${SOFT}`, borderRadius: 16, padding: 18 },
  cardTitle: { fontWeight: 700, marginBottom: 6, color: TEXT },
  body: { fontSize: 14, lineHeight: 1.7, color: MUTED, whiteSpace: 'pre-line' as const },
  stepNum: { background: BRAND, color: '#fff', borderRadius: 999, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 },
  table: { width: '100%', borderCollapse: 'collapse' as const, background: '#fff', borderRadius: 16, overflow: 'hidden' },
}

function SectionBlock({ s }: { s: Section }) {
  const heading = s.heading || s.title
  switch (s.type) {
    case 'callout':
      return (
        <div style={S.callout}>
          {heading && <div style={{ fontWeight: 700, color: DEEP, marginBottom: 6 }}>{heading}</div>}
          {s.body && <div style={S.body}>{s.body}</div>}
        </div>
      )
    case 'cards':
      return (
        <div>
          {heading && <h2 style={S.h2}>{heading}</h2>}
          {s.subheading && <p style={S.sub}>{s.subheading}</p>}
          <div style={S.cardGrid}>
            {(s.items ?? []).map((it, i) => (
              <div key={i} style={S.card}>
                {s.numbered && <div style={{ ...S.stepNum, marginBottom: 10 }}>{i + 1}</div>}
                <div style={S.cardTitle}>{it.title}</div>
                <div style={S.body}>{it.body}</div>
              </div>
            ))}
          </div>
        </div>
      )
    case 'steps':
      return (
        <div>
          {heading && <h2 style={S.h2}>{heading}</h2>}
          {s.subheading && <p style={S.sub}>{s.subheading}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(s.items ?? []).map((it, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={S.stepNum}>{i + 1}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{it.step}</div>
                  <div style={S.body}>{it.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    case 'pricing':
      return (
        <div>
          {heading && <h2 style={S.h2}>{heading}</h2>}
          {s.subheading && <p style={S.sub}>{s.subheading}</p>}
          <table style={S.table}>
            <tbody>
              {(s.rows ?? []).map((r, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${SOFT}` }}>
                  <td style={{ padding: '12px 16px', fontSize: 14 }}>{r.treatment}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: DEEP, textAlign: 'right' }}>{r.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'image':
      return (
        <div>
          {heading && <h2 style={S.h2}>{heading}</h2>}
          {s.subheading && <p style={S.sub}>{s.subheading}</p>}
          {s.src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.src} alt={s.alt ?? ''} style={{ maxWidth: '100%', borderRadius: 16 }} />
          )}
          {s.caption && <div style={{ ...S.sub, marginTop: 8, fontSize: 12 }}>{s.caption}</div>}
        </div>
      )
    case 'text':
    default:
      return (
        <div style={s.card ? { ...S.card, padding: 24 } : undefined}>
          {heading && <h2 style={S.h2}>{heading}</h2>}
          {s.body && <div style={S.body}>{s.body}</div>}
        </div>
      )
  }
}

export function ServicePreviewClient({
  initialData,
  locale,
}: {
  initialData: ServiceDoc
  locale: string
}) {
  const { data } = useLivePreview<ServiceDoc>({
    initialData,
    serverURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3100',
    depth: 1,
  })

  const sections =
    (data.content as { sections?: Section[] | null } | null | undefined)?.sections ?? []

  return (
    <div style={S.page} lang={locale}>
      <div style={S.hero}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={S.eyebrow}>Roomchang Dental Hospital · live preview ({locale})</div>
          <h1 style={S.h1}>{data.name}</h1>
          {data.description && <p style={S.desc}>{data.description}</p>}
          {!!data.features?.length && (
            <div style={S.chips}>
              {data.features.map((f, i) => (
                <span key={i} style={S.chip}>
                  {f?.feature}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={S.main}>
        {sections.map((s, i) => (
          <SectionBlock key={i} s={s} />
        ))}
      </div>
    </div>
  )
}
