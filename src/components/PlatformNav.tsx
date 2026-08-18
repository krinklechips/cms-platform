import React from 'react'
import { DefaultNav } from '@payloadcms/next/rsc'
import type { Payload } from 'payload'
import { getTenantByHost, normalizeHost } from '@/lib/get-tenant-by-host'

/**
 * Custom admin Nav — three cases:
 *  - super-admin on a TENANT's domain (roomchang.serviettelab.com): the tenant's
 *    own page-grouped content sidebar ("Home Page", "Services Page", …) plus a
 *    link back to the platform. This is the fix for "I don't know where to click
 *    to edit what page" — the owner previously got platform links only and had
 *    to go through the dashboard's "Open content" dropdown.
 *  - super-admin on the PLATFORM domain (serviettelab.com): the slim Serviette
 *    Labs sidebar (unchanged).
 *  - tenant users: Payload's DefaultNav (their module-gated page groups).
 *
 * Nav is a PROVEN-SAFE slot for async server work (DefaultNav is itself async;
 * the dashboard view already resolves the host tenant this way). Do NOT move
 * this kind of lookup into admin.components.graphics — that white-screens.
 */

type PopulatedTenant = { name?: string; slug?: string } | number | null

type NavServerProps = React.ComponentProps<typeof DefaultNav> & {
  user?: {
    roles?: string[]
    tenants?: { tenant?: PopulatedTenant }[] | null
  } | null
  // serverProps handed to a server Nav by @payloadcms/next Default template
  payload?: Payload
  req?: { headers?: Headers }
  visibleEntities?: { collections?: string[]; globals?: string[] }
}

/** Platform-management collections — hidden from a tenant workspace sidebar. */
const PLATFORM_COLLECTIONS = new Set(['tenants', 'modules', 'invoices', 'users'])

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

  // Super-admin on a tenant's own domain → give them that tenant's workspace.
  if (isSuperAdmin) {
    let hostTenant: { name: string } | null = null
    try {
      const host = normalizeHost(
        props.req?.headers?.get('x-forwarded-host') ?? props.req?.headers?.get('host'),
      )
      if (props.payload && host) hostTenant = await getTenantByHost(props.payload, host)
    } catch {
      // Unresolvable host → fall through to the platform sidebar.
    }

    if (hostTenant) {
      // NEW object: props.visibleEntities is read-only under React 19 and
      // mutating it throws ("Cannot assign to read only property").
      const scopedProps = {
        ...props,
        visibleEntities: {
          collections: (props.visibleEntities?.collections ?? []).filter(
            (slug) => !PLATFORM_COLLECTIONS.has(slug),
          ),
          globals: props.visibleEntities?.globals ?? [],
        },
      } as NavServerProps

      // MUST return a SINGLE element. Returning a fragment here puts extra
      // children into the admin template's layout container, which renders a
      // second sidebar panel, covers the nav-collapse chevron, and pushes the
      // main content area out of view. The "Editing site" banner and the
      // back-to-platform link live in the beforeNavLinks / afterNavLinks slots
      // instead, which render INSIDE the nav.
      return <DefaultNav {...scopedProps} />
    }
  }

  if (!isSuperAdmin) {
    return <DefaultNav {...props} />
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
