import React from 'react'
import type { Payload } from 'payload'
import { OpenTenantContent } from './OpenTenantContent'

/**
 * Serviette Labs HQ — the platform-owner cockpit.
 *
 * Rendered via admin.components.beforeDashboard, the slot verified to support
 * an async RSC receiving `payload` + `user` as serverProps inside the
 * auth-protected Dashboard (unlike graphics.Logo, which white-screened).
 * Renders ONLY for super-admins; tenant users see nothing extra.
 */

type Props = {
  payload?: Payload
  user?: { roles?: string[] } | null
}

const fmtUSD = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

const S: Record<string, React.CSSProperties> = {
  wrap: {
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: 8,
    padding: '20px 24px',
    marginBottom: 28,
    background: 'var(--theme-elevation-50)',
  },
  h2: { margin: '0 0 4px', fontSize: 18, fontWeight: 650 },
  sub: { margin: '0 0 16px', fontSize: 13, color: 'var(--theme-elevation-500)' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: {
    textAlign: 'left' as const,
    padding: '6px 10px',
    borderBottom: '1px solid var(--theme-elevation-150)',
    color: 'var(--theme-elevation-500)',
    fontWeight: 500,
  },
  td: { padding: '8px 10px', borderBottom: '1px solid var(--theme-elevation-100)', verticalAlign: 'top' as const },
  badge: {
    display: 'inline-block',
    padding: '1px 8px',
    borderRadius: 10,
    fontSize: 11,
    background: 'var(--theme-elevation-100)',
    marginRight: 4,
    marginBottom: 2,
  },
  totals: { marginTop: 12, fontSize: 13, color: 'var(--theme-elevation-600)' },
  link: { color: 'inherit' },
}

export const PlatformDashboard: React.FC<Props> = async ({ payload, user }) => {
  if (!payload || !user?.roles?.includes('super-admin')) return null

  try {
    const [tenants, modules, invoices] = await Promise.all([
      payload.find({ collection: 'tenants', limit: 100, depth: 0, overrideAccess: true }),
      payload.find({ collection: 'modules', limit: 100, depth: 0, overrideAccess: true }),
      payload.find({ collection: 'invoices', limit: 500, depth: 0, overrideAccess: true }),
    ])

    const modById = new Map(
      modules.docs.map((m) => [String(m.id), m as { name?: string; defaultMonthlyPrice?: number }]),
    )

    const rows = tenants.docs.map((t) => {
      const tenant = t as {
        id: number | string
        name: string
        slug: string
        domains?: { domain: string }[]
        subscriptions?: { module?: number | string | { id: number | string }; monthlyPrice?: number | null; active?: boolean | null }[]
        enabledCollections?: unknown
      }
      const subs = (tenant.subscriptions ?? []).filter((s) => s.active !== false && s.module)
      const moduleNames: string[] = []
      let mrr = 0
      for (const s of subs) {
        const id = typeof s.module === 'object' && s.module !== null ? s.module.id : s.module
        const mod = id !== undefined && id !== null ? modById.get(String(id)) : undefined
        moduleNames.push(mod?.name ?? String(id))
        mrr += s.monthlyPrice ?? mod?.defaultMonthlyPrice ?? 0
      }
      const tInvoices = invoices.docs.filter((inv) => {
        const tid = (inv as { tenant?: number | string | { id: number | string } }).tenant
        return (typeof tid === 'object' && tid !== null ? tid.id : tid) === tenant.id
      })
      const byStatus = (s: string) => tInvoices.filter((i) => (i as { status?: string }).status === s).length
      return {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        domains: (tenant.domains ?? []).map((d) => d.domain),
        enabledCollections: Array.isArray(tenant.enabledCollections)
          ? (tenant.enabledCollections as string[])
          : [],
        moduleNames,
        mrr,
        draft: byStatus('draft'),
        sent: byStatus('sent'),
        paid: byStatus('paid'),
      }
    })

    const totalMRR = rows.reduce((sum, r) => sum + r.mrr, 0)

    return (
      <div style={S.wrap}>
        <h2 style={S.h2}>Serviette Labs — HQ</h2>
        <p style={S.sub}>
          {rows.length} tenant{rows.length === 1 ? '' : 's'} · {fmtUSD(totalMRR)}/mo subscribed · platform view
          (only super-admins see this)
        </p>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Tenant</th>
              <th style={S.th}>Domains</th>
              <th style={S.th}>Modules</th>
              <th style={S.th}>MRR</th>
              <th style={S.th}>Invoices (draft / sent / paid)</th>
              <th style={S.th}>Content</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={String(r.id)}>
                <td style={S.td}>
                  <a href={`/admin/collections/tenants/${r.id}`} style={S.link}>
                    <strong>{r.name}</strong>
                  </a>
                  <div style={{ color: 'var(--theme-elevation-450)', fontSize: 11 }}>{r.slug}</div>
                </td>
                <td style={S.td}>{r.domains.length ? r.domains.join(', ') : '—'}</td>
                <td style={S.td}>
                  {r.moduleNames.length ? (
                    r.moduleNames.map((m, i) => (
                      <span key={i} style={S.badge}>
                        {m}
                      </span>
                    ))
                  ) : (
                    '—'
                  )}
                </td>
                <td style={S.td}>{fmtUSD(r.mrr)}</td>
                <td style={S.td}>
                  {r.draft} / {r.sent} / {r.paid}
                </td>
                <td style={S.td}>
                  <OpenTenantContent tenantId={r.id} collections={r.enabledCollections} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={S.totals}>
          Manage: <a href="/admin/collections/tenants" style={S.link}>Tenants</a> ·{' '}
          <a href="/admin/collections/modules" style={S.link}>Modules</a> ·{' '}
          <a href="/admin/collections/invoices" style={S.link}>Invoices</a> ·{' '}
          <a href="/admin/collections/users" style={S.link}>Users</a>
        </div>
      </div>
    )
  } catch (e) {
    // Fail loud but small: never take the dashboard down with us.
    return (
      <div style={S.wrap}>
        <h2 style={S.h2}>Serviette Labs — HQ</h2>
        <p style={S.sub}>Cockpit failed to load: {(e as Error).message}</p>
      </div>
    )
  }
}
