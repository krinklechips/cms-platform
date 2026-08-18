import React from 'react'
import { SITE_PAGES, UNMODELED_PAGES } from '@/lib/site-pages'
import { COLLECTION_LABELS } from '@/lib/collection-labels'

/**
 * "Where do I click to edit this page?" — the dashboard answer.
 *
 * The admin sidebar groups collections by page, but a single page is fed by up
 * to five collections, and the slugs read like database tables. This lists the
 * real website page-by-page and, under each, the exact things that edit it,
 * linked straight to their list view.
 *
 * Also lists the pages that are NOT in the CMS yet, so nobody hunts for a
 * screen that does not exist.
 */

type Props = {
  /** Which tenant's workspace this is (shown in the heading). */
  tenantName?: string | null
  /** Public site origin, so "view page" links go somewhere real. */
  siteUrl?: string
}

const S: Record<string, React.CSSProperties> = {
  wrap: { padding: '24px 0 8px' },
  h2: { fontSize: 20, margin: '0 0 4px' },
  sub: { fontSize: 13, color: 'var(--theme-elevation-600)', margin: '0 0 20px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: 16,
  },
  card: {
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: 10,
    padding: '14px 16px',
    background: 'var(--theme-elevation-0)',
  },
  cardHead: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
  pageName: { fontSize: 15, fontWeight: 700, margin: 0 },
  path: { fontSize: 11, color: 'var(--theme-elevation-450)', margin: 0, fontFamily: 'monospace' },
  partList: { listStyle: 'none', padding: 0, margin: '10px 0 0' },
  partItem: { padding: '7px 0', borderTop: '1px solid var(--theme-elevation-100)' },
  partLink: { fontSize: 13, fontWeight: 600, color: 'var(--theme-text)', textDecoration: 'none' },
  partWhat: { fontSize: 12, color: 'var(--theme-elevation-600)', margin: '2px 0 0', lineHeight: 1.45 },
  viewLink: { fontSize: 11, color: 'var(--theme-elevation-500)', textDecoration: 'none' },
  gapWrap: { marginTop: 28 },
  gapNote: { fontSize: 12, color: 'var(--theme-elevation-600)', margin: '0 0 10px', lineHeight: 1.5 },
  gapList: { display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', padding: 0, margin: 0 },
  gapItem: {
    fontSize: 11,
    fontFamily: 'monospace',
    padding: '3px 8px',
    borderRadius: 10,
    background: 'var(--theme-elevation-50)',
    border: '1px solid var(--theme-elevation-100)',
    color: 'var(--theme-elevation-600)',
  },
}

const labelFor = (slug: string): string => COLLECTION_LABELS[slug]?.plural ?? slug

export const SitePagesIndex: React.FC<Props> = ({ tenantName, siteUrl }) => (
  <div style={S.wrap}>
    <h2 style={S.h2}>Your website, page by page</h2>
    <p style={S.sub}>
      {tenantName ? `${tenantName} — ` : ''}pick the page you want to change, then the part of it.
      Each link opens the editor for that piece.
    </p>

    <div style={S.grid}>
      {SITE_PAGES.map((p) => (
        <section key={p.path} style={S.card}>
          <div style={S.cardHead}>
            <h3 style={S.pageName}>{p.page}</h3>
            {siteUrl && (
              <a style={S.viewLink} href={`${siteUrl}${p.path}`} target="_blank" rel="noreferrer">
                view ↗
              </a>
            )}
          </div>
          <p style={S.path}>{p.path}</p>
          <ul style={S.partList}>
            {p.parts.map((part) => (
              <li key={`${p.path}-${part.collection}`} style={S.partItem}>
                <a style={S.partLink} href={`/admin/collections/${part.collection}`}>
                  {labelFor(part.collection)} →
                </a>
                <p style={S.partWhat}>{part.controls}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>

    {UNMODELED_PAGES.length > 0 && (
      <div style={S.gapWrap}>
        <h3 style={{ ...S.pageName, fontSize: 14 }}>Not editable here yet</h3>
        <p style={S.gapNote}>
          These pages exist on the website but are not in the CMS — their text still lives in the
          site code or the clinic database. Listed so you are not looking for a screen that is not
          there.
        </p>
        <ul style={S.gapList}>
          {UNMODELED_PAGES.map((u) => (
            <li key={u.path} style={S.gapItem} title={`${u.whatsThere} — currently: ${u.source}`}>
              {u.path}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
)
