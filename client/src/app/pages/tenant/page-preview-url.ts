interface PagePathItem {
  id: number
  slug: string
  parentId: number | null
}

type TenantWithPublicSiteUrl = {
  branding?: {
    publicSiteUrl?: string | null
    public_site_url?: string | null
  } | null
  publicSiteUrl?: string | null
  public_site_url?: string | null
} | null | undefined

const PUBLIC_ROUTE_OVERRIDES: Record<string, string> = {
  home: '/',
  'about-community': '/about/community',
}

function cleanPath(value: string): string {
  return value
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .replace(/\/{2,}/g, '/')
}

function normalizeSiteUrl(siteUrl: string): string {
  const trimmed = siteUrl.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function getTenantPublicSiteUrl(tenant: TenantWithPublicSiteUrl): string | null {
  return (
    tenant?.branding?.publicSiteUrl ??
    tenant?.branding?.public_site_url ??
    tenant?.publicSiteUrl ??
    tenant?.public_site_url ??
    null
  )
}

export function buildPagePath(
  pages: PagePathItem[],
  currentSlug: string,
  parentId: number | null,
): string {
  const slug = cleanPath(currentSlug)
  if (!slug) return '/'
  if (PUBLIC_ROUTE_OVERRIDES[slug]) return PUBLIC_ROUTE_OVERRIDES[slug]

  const pageMap = new Map(pages.map((page) => [page.id, page]))
  const parentParts: string[] = []
  const visited = new Set<number>()
  let currentParentId = parentId

  while (currentParentId && !visited.has(currentParentId)) {
    visited.add(currentParentId)
    const parent = pageMap.get(currentParentId)
    if (!parent) break
    const parentSlug = cleanPath(parent.slug)
    if (parentSlug) parentParts.unshift(parentSlug)
    currentParentId = parent.parentId ?? null
  }

  const parentPath = cleanPath(parentParts.join('/'))
  if (!parentPath || slug === parentPath || slug.startsWith(`${parentPath}/`)) {
    return `/${slug}`
  }

  return `/${parentPath}/${slug}`
}

export function buildSitePreviewUrl(
  siteUrl: string | null | undefined,
  path: string,
  revision?: number,
): string | null {
  if (!siteUrl) return null

  const normalizedPath = path === '/' ? '/' : `/${cleanPath(path)}`
  const normalizedSiteUrl = normalizeSiteUrl(siteUrl)
  const url = new URL(normalizedPath, normalizedSiteUrl.endsWith('/') ? normalizedSiteUrl : `${normalizedSiteUrl}/`)

  if (revision !== undefined) {
    url.searchParams.set('cmsPreview', String(revision))
  }

  return url.toString()
}
