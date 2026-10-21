export const mediaTenantID = (value: unknown): number | string | null => {
  const id = typeof value === 'object' && value !== null ? (value as { id?: unknown }).id : value
  if (typeof id === 'number' && Number.isFinite(id)) return id
  if (typeof id === 'string' && id.trim() !== '') return id
  return null
}

// This is a client-side protocol check, not the server's media-origin policy.
export const isSafeImageUrl = (value: unknown): value is string => {
  if (typeof value !== 'string' || !value || /[\s\\\u0000-\u001f\u007f]/.test(value)) return false
  if (value.startsWith('/')) {
    return !/^\/(?:\/|%2f|%5c)/i.test(value)
  }
  if (!/^https:\/\//i.test(value)) return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password
  } catch {
    return false
  }
}

export const imageUrlFromMedia = (doc: unknown, tenantID: number | string | null): string | null => {
  if (!doc || typeof doc !== 'object' || tenantID === null) return null
  const media = doc as { tenant?: unknown; mimeType?: unknown; url?: unknown }
  const owner = mediaTenantID(media.tenant)
  if (owner === null || String(owner) !== String(tenantID)) return null
  if (typeof media.mimeType !== 'string' || !media.mimeType.startsWith('image/')) return null
  return isSafeImageUrl(media.url) ? media.url : null
}
