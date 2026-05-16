interface PagePathItem {
  id: number
  slug: string
  parentId: number | null
}

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
  const url = new URL(normalizedPath, siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`)

  if (revision !== undefined) {
    url.searchParams.set('cmsPreview', String(revision))
  }

  return url.toString()
}
