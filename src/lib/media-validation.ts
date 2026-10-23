import { isDeepStrictEqual } from 'node:util'
import type { PayloadRequest } from 'payload'

export type MediaValueKind = 'reference' | 'url' | 'clinical' | 'branch'
export type MediaTenant = { id: number | string; slug: string }

export function mediaID(value: unknown): number | string | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) value = (value as { id?: unknown }).id
  return typeof value === 'string' && value.trim() === value && value.length > 0
    ? value : typeof value === 'number' && Number.isFinite(value) ? value : null
}

export const sameMediaID = (left: unknown, right: unknown): boolean => {
  const a = mediaID(left)
  const b = mediaID(right)
  return a !== null && b !== null && String(a) === String(b)
}

export function canUseMediaTenant(value: unknown, user: Partial<NonNullable<PayloadRequest['user']>> | null | undefined): boolean {
  const id = mediaID(value)
  if (id === null) return false
  // No-user Local API calls are trusted server operations; HTTP access remains collection-owned.
  if (!user || (user as { roles?: string[] }).roles?.includes('super-admin')) return true
  return Boolean((user as { tenants?: { tenant?: unknown }[] }).tenants?.some(row => sameMediaID(row.tenant, id)))
}

export async function resolveMediaTenant(value: unknown, req: PayloadRequest): Promise<MediaTenant> {
  const id = mediaID(value)
  if (id === null || !canUseMediaTenant(id, req.user)) throw new Error('The document tenant must be explicit and authorized.')
  try {
    const tenant = await req.payload.findByID({ collection: 'tenants', id, depth: 0, overrideAccess: true,
      req: { ...req, query: { ...req.query } } })
    if (!sameMediaID(tenant.id, id) || typeof tenant.slug !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(tenant.slug)) {
      throw new Error('Invalid tenant')
    }
    return { id, slug: tenant.slug }
  } catch {
    throw new Error('The document tenant folder could not be resolved.')
  }
}

export function unchangedMediaValue(kind: MediaValueKind, value: unknown, previousValue: unknown): boolean {
  return kind === 'reference' && mediaID(value) !== null && mediaID(previousValue) !== null
    ? sameMediaID(value, previousValue) : isDeepStrictEqual(value, previousValue)
}

function safeImageURL(value: unknown): URL | null {
  if (typeof value !== 'string' || !value || /[\s\u0000-\u001f\u007f\\]/u.test(value)) return null
  try {
    let decoded = value
    // Disallow ambiguous encoded delimiters/control bytes, including double encoding.
    for (let i = 0; i < 5; i++) {
      const next = decodeURIComponent(decoded)
      if (/[\u0000-\u001f\u007f\\]/u.test(next) || /%2f|%5c/i.test(decoded)) return null
      if (next === decoded) break
      decoded = next
      if (i === 4) return null
    }
    if (value.startsWith('/')) {
      if (decoded.startsWith('//') || decoded.split(/[?#]/, 1)[0].split('/').some(part => part === '.' || part === '..')) return null
      return new URL(decoded, 'https://website-relative.invalid')
    }
    if (!value.startsWith('https://')) return null
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password && Boolean(url.hostname) ? url : null
  } catch {
    return null
  }
}

export function isWebsiteImageURL(value: unknown, tenant: MediaTenant): boolean {
  const url = safeImageURL(value)
  if (!url) return false
  const relative = typeof value === 'string' && value.startsWith('/')
  if (tenant.slug !== 'roomchang') return true
  // CMS upload routes do not exist on the separate Roomchang website origin.
  if (relative) return !/^\/api\/media\/file(?:\/|$)/i.test(url.pathname)
  // Keep this aligned with Roomchang's Next image remotePatterns. Storage
  // configuration alone must not enable a host the consuming website rejects.
  const origins = new Set(['https://pub-2b835c19d8644293b271deaeb97352b1.r2.dev', 'https://roomchang.com'])
  return origins.has(url.origin)
}

export async function assertMediaValue(kind: MediaValueKind, value: unknown, tenant: MediaTenant, req: PayloadRequest): Promise<void> {
  if (value === undefined || value === null || value === '') return
  if (kind === 'reference') {
    const id = mediaID(value)
    if (id === null) throw new Error('Select an image from the document tenant Media Library.')
    let media
    try {
      media = await req.payload.findByID({ collection: 'media', id, depth: 0, overrideAccess: true,
        req: { ...req, query: { ...req.query } } })
    } catch {
      throw new Error('The selected media image could not be resolved.')
    }
    if (!sameMediaID(media.id, id) || !sameMediaID(media.tenant, tenant.id) || !/^image\/[a-z0-9.+-]+$/i.test(media.mimeType ?? '')) {
      throw new Error('Select an image belonging to the document tenant.')
    }
    if (!isWebsiteImageURL(media.url, tenant)) throw new Error('The selected image URL is not compatible with this tenant website.')
    return
  }
  if (kind === 'branch') {
    if (!Array.isArray(value)) throw new Error('Branch photos must be a JSON array of image URLs or { src, alt?, caption? } objects.')
    for (const photo of value) {
      const object = photo && typeof photo === 'object' && !Array.isArray(photo) ? photo as Record<string, unknown> : null
      const src = typeof photo === 'string' ? photo : object?.src ?? object?.url
      if (typeof src !== 'string' || (object && (('alt' in object && typeof object.alt !== 'string') ||
          ('caption' in object && typeof object.caption !== 'string')))) {
        throw new Error('Each branch photo must have an image URL and optional text alt and caption.')
      }
      if (!isWebsiteImageURL(src, tenant)) throw new Error('Branch photo src must be a compatible website image URL.')
    }
    return
  }
  if (kind === 'clinical') {
    let images = value
    if (typeof images === 'string') {
      try { images = JSON.parse(images) } catch { throw new Error('Clinical images must be a JSON array of { src, caption? } objects.') }
    }
    if (!Array.isArray(images)) throw new Error('Clinical images must be a JSON array of { src, caption? } objects.')
    for (const image of images) {
      if (!image || typeof image !== 'object' || Array.isArray(image) || typeof image.src !== 'string' ||
          ('caption' in image && typeof image.caption !== 'string')) {
        throw new Error('Each clinical image must have a src and an optional text caption.')
      }
      if (!isWebsiteImageURL(image.src, tenant)) throw new Error('Clinical image src must be a compatible website image URL.')
    }
    return
  }
  if (!isWebsiteImageURL(value, tenant)) throw new Error('Use a compatible website image URL or a safe website-relative image path.')
}
