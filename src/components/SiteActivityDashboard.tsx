import React from 'react'
import { UNMODELED_PAGES } from '@/lib/site-pages'

/**
 * The dashboard, take three — and this time it is NOT navigation.
 *
 * History: the first dashboard duplicated the sidebar; the second added a
 * page-by-page map — then we reorganized the sidebar itself into page groups
 * and gave every list view a plain-English description, which made the map a
 * duplicate too ("I still don't get the purpose of the dashboard" — Enoch).
 *
 * So this screen now only says things the sidebar cannot:
 *   - what was edited most recently (jump straight back in)
 *   - what is still unpublished (drafts waiting to go live)
 *   - one-click "add new" for the things editors add most
 * Navigation lives in the sidebar; explanations live on each list view.
 */

export type RecentDoc = {
  collection: string
  id: string | number
  title: string
  label: string
  updatedAt: string
  agoText: string
}

export type UnpublishedDoc = {
  collection: string
  id: string | number
  title: string
  label: string
}

type Props = {
  tenantName?: string | null
  siteUrl?: string
  recent: RecentDoc[]
  unpublished: UnpublishedDoc[]
}

const QUICK_ADD: { collection: string; label: string }[] = [
  { collection: 'pages', label: 'Custom page' },
  { collection: 'doctors', label: 'Doctor' },
  { collection: 'testimonials', label: 'Patient testimonial' },
  { collection: 'news-articles', label: 'News article' },
]

const S: Record<string, React.CSSProperties> = {
  wrap: { padding: '24px 0 8px' },
  h2: { fontSize: 20, margin: '0 0 4px' },
  sub: { fontSize: 13, color: 'var(--theme-elevation-600)', margin: '0 0 20px' },
  subLink: { color: 'var(--theme-text)', textDecoration: 'underline' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 16,
    alignItems: 'start',
  },
  panel: {
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: 10,
    padding: '14px 16px',
    background: 'var(--theme-elevation-0)',
  },
  panelTitle: { fontSize: 13, fontWeight: 700, margin: 0, letterSpacing: 0.2 },
  list: { listStyle: 'none', padding: 0, margin: '8px 0 0' },
  row: { padding: '8px 0', borderTop: '1px solid var(--theme-elevation-100)' },
  rowLink: { fontSize: 13, fontWeight: 600, color: 'var(--theme-text)', textDecoration: 'none' },
  rowMeta: { fontSize: 11, color: 'var(--theme-elevation-500)', margin: '2px 0 0' },
  empty: { fontSize: 12, color: 'var(--theme-elevation-500)', margin: '10px 0 2px' },
  allLive: { fontSize: 12, color: 'var(--theme-success-600, #15803d)', margin: '10px 0 2px' },
  addBtn: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--theme-text)',
    textDecoration: 'none',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: 8,
    padding: '9px 12px',
    marginTop: 8,
  },
  gapWrap: { marginTop: 28 },
  gapTitle: { fontSize: 13, fontWeight: 700, margin: '0 0 6px' },
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

const docHref = (d: { collection: string; id: string | number }): string =>
  `/admin/collections/${d.collection}/${d.id}`

export const SiteActivityDashboard: React.FC<Props> = ({
  tenantName,
  siteUrl,
  recent,
  unpublished,
}) => (
  <div style={S.wrap}>
    <h2 style={S.h2}>{tenantName ?? 'Your website'}</h2>
    <p style={S.sub}>
      Pages and sections are in the menu on the left — each one explains itself when opened.
      {siteUrl && (
        <>
          {' '}
          <a style={S.subLink} href={siteUrl} target="_blank" rel="noreferrer">
            Open the live website ↗
          </a>
        </>
      )}
    </p>

    <div style={S.grid}>
      <section style={S.panel}>
        <h3 style={S.panelTitle}>Pick up where you left off</h3>
        {recent.length === 0 ? (
          <p style={S.empty}>Nothing edited yet — changes will show up here.</p>
        ) : (
          <ul style={S.list}>
            {recent.map((d) => (
              <li key={`${d.collection}-${d.id}`} style={S.row}>
                <a style={S.rowLink} href={docHref(d)}>
                  {d.title} →
                </a>
                <p style={S.rowMeta}>
                  {d.label} · {d.agoText}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={S.panel}>
        <h3 style={S.panelTitle}>Not on the website yet</h3>
        {unpublished.length === 0 ? (
          <p style={S.allLive}>Everything is published and live.</p>
        ) : (
          <ul style={S.list}>
            {unpublished.map((d) => (
              <li key={`${d.collection}-${d.id}`} style={S.row}>
                <a style={S.rowLink} href={docHref(d)}>
                  {d.title} →
                </a>
                <p style={S.rowMeta}>{d.label} — open it and tick Published to put it live</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={S.panel}>
        <h3 style={S.panelTitle}>Add something new</h3>
        {QUICK_ADD.map((q) => (
          <a key={q.collection} style={S.addBtn} href={`/admin/collections/${q.collection}/create`}>
            + {q.label}
          </a>
        ))}
      </section>
    </div>

    {UNMODELED_PAGES.length > 0 && (
      <div style={S.gapWrap}>
        <h3 style={S.gapTitle}>Not editable in the CMS yet</h3>
        <p style={S.gapNote}>
          These parts of the website still live in the site code or the clinic database — listed so
          you are not hunting for a screen that does not exist.
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
