import type { Payload } from 'payload'

export type TenantBranding = {
  id: number | string
  name: string
  slug: string
  logoUrl: string | null
  moduleKeys: string[]
}

/** Lowercase, strip port — exact match against tenants.domains[].domain. */
export const normalizeHost = (raw: string | null | undefined): string =>
  (raw ?? '').split(':')[0].trim().toLowerCase()

/**
 * Resolve the tenant whose `domains` contains this host (host-based routing —
 * the successor to the old cms-platform's cms_domain). Returns null on the
 * platform's own domains (serviettelab.com) or unknown hosts.
 */
export async function getTenantByHost(payload: Payload, rawHost: string | null | undefined): Promise<TenantBranding | null> {
  const host = normalizeHost(rawHost)
  if (!host) return null
  const tenant = (
    await payload.find({
      collection: 'tenants',
      where: { 'domains.domain': { equals: host } },
      depth: 1, // populates logo + subscription modules
      limit: 1,
      overrideAccess: true,
    })
  ).docs[0] as
    | {
        id: number | string
        name: string
        slug: string
        logo?: { url?: string | null } | number | null
        subscriptions?: { module?: { key?: string } | number | null; active?: boolean | null }[]
      }
    | undefined
  if (!tenant) return null

  const logoUrl =
    typeof tenant.logo === 'object' && tenant.logo?.url
      ? tenant.logo.url
      : // static fallback until the tenant uploads a logo via Media
        tenant.slug === 'roomchang'
        ? '/roomchang-logo.png'
        : null

  const moduleKeys = (tenant.subscriptions ?? [])
    .filter((s) => s.active !== false && typeof s.module === 'object' && s.module?.key)
    .map((s) => (s.module as { key: string }).key)

  return { id: tenant.id, name: tenant.name, slug: tenant.slug, logoUrl, moduleKeys }
}
