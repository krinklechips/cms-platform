import React from 'react'
import { DefaultNav } from '@payloadcms/next/rsc'

/**
 * Custom admin Nav:
 *  - super-admins get a slim Serviette Labs sidebar (Platform only — content
 *    is opened from the HQ cockpit's per-tenant dropdowns, which keeps
 *    collection routes fully functional, unlike admin.hidden which 404s them)
 *  - tenant users get Payload's DefaultNav (their module-gated page groups)
 */

type PopulatedTenant = { name?: string; slug?: string } | number | null

type NavServerProps = React.ComponentProps<typeof DefaultNav> & {
  user?: {
    roles?: string[]
    tenants?: { tenant?: PopulatedTenant }[] | null
  } | null
}

/** Human tenant name from the user's (depth-populated) tenant membership */
function tenantNameOf(user: NavServerProps['user']): string | null {
  const t = user?.tenants?.[0]?.tenant
  if (t && typeof t === 'object') return t.name ?? t.slug ?? null
  return null
}

const S: Record<string, React.CSSProperties> = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 2, padding: '24px 16px' },
  brand: {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--theme-elevation-500)',
    margin: '0 8px 12px',
  },
  link: {
    display: 'block',
    padding: '8px 10px',
    borderRadius: 6,
    color: 'var(--theme-text)',
    textDecoration: 'none',
    fontSize: 14,
  },
  divider: { height: 1, background: 'var(--theme-elevation-100)', margin: '12px 0' },
  hint: { fontSize: 11, color: 'var(--theme-elevation-400)', margin: '8px 10px 0', lineHeight: 1.5 },
  // Tenant workspace banner — unmistakable "whose CMS am I in" marker at the
  // top of the sidebar for tenant users.
  tenantBanner: {
    margin: '16px 12px 4px',
    padding: '10px 12px',
    borderRadius: 8,
    background: 'var(--theme-elevation-50)',
    border: '1px solid var(--theme-elevation-150)',
  },
  tenantLabel: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--theme-elevation-450)',
    margin: 0,
  },
  tenantName: {
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--theme-text)',
    margin: '2px 0 0',
    lineHeight: 1.3,
  },
}

const LINKS: [string, string][] = [
  ['Dashboard', '/admin'],
  ['Tenants', '/admin/collections/tenants'],
  ['Modules', '/admin/collections/modules'],
  ['Invoices', '/admin/collections/invoices'],
  ['Users', '/admin/collections/users'],
]

export const PlatformNav: React.FC<NavServerProps> = async (props) => {
  const isSuperAdmin = Boolean(props.user?.roles?.includes('super-admin'))
  if (!isSuperAdmin) {
    const tenantName = tenantNameOf(props.user)
    return (
      <>
        {tenantName && (
          <div style={S.tenantBanner}>
            <p style={S.tenantLabel}>Tenant workspace</p>
            <p style={S.tenantName}>{tenantName}</p>
          </div>
        )}
        <DefaultNav {...props} />
      </>
    )
  }

  return (
    <nav style={S.wrap}>
      <div style={S.brand}>Serviette Labs</div>
      {LINKS.map(([label, href]) => (
        <a key={href} href={href} style={S.link}>
          {label}
        </a>
      ))}
      <div style={S.divider} />
      <div style={S.hint}>
        Tenant content: open it from the Dashboard — each tenant row has an “Open content” selector.
      </div>
      <div style={S.divider} />
      <a href="/admin/logout" style={S.link}>
        Log out
      </a>
    </nav>
  )
}
