import { APIError, parseCookies, type PayloadRequest } from 'payload'
import { getHostTenant } from './host-scope'
import { mediaID, resolveMediaTenant } from './media-validation'
import { buildMediaFolders, createMediaFolderPath, type MediaFolderCatalog } from './media-folders'

export function assertFolderWriteOrigin(req: PayloadRequest): void {
  const origin = req.headers.get('origin')
  if (!origin) return // Authenticated API-key/server callers do not use browser cookies.
  if (!req.url) throw new APIError('Could not verify the CMS request origin.', 403)
  const url = new URL(req.url)
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || url.host
  const protocol = req.headers.get('x-forwarded-proto') || url.protocol.replace(':', '')
  if (origin !== url.origin && origin !== `${protocol}://${host}`) throw new APIError('Create folders from this CMS workspace.', 403)
}

export async function mediaFolderTenant(req: PayloadRequest, explicit?: unknown) {
  if (!req.user) throw new APIError('Sign in to browse media folders.', 401)
  const requested = req.searchParams?.get('tenant')
  const host = await getHostTenant(req)
  const memberships = (req.user as { tenants?: { tenant?: unknown }[] }).tenants ?? []
  const selected = explicit ?? (requested || host?.id || parseCookies(req.headers).get('payload-tenant') ||
    (memberships.length === 1 ? mediaID(memberships[0].tenant) : null))
  let tenant
  try { tenant = await resolveMediaTenant(selected, req) }
  catch { throw new APIError('Choose an authorised tenant to browse its media folders.', 403) }
  if (host && String(host.id) !== String(tenant.id)) throw new APIError('Choose media from this workspace.', 403)
  return tenant
}

export async function mediaFolderCatalog(req: PayloadRequest): Promise<MediaFolderCatalog> {
  const tenant = await mediaFolderTenant(req)

  const counts = new Map<string | null, number>()
  let page = 1
  while (true) {
    const result = await req.payload.find({ collection: 'media', where: { tenant: { equals: tenant.id } },
      select: { prefix: true }, depth: 0, sort: 'id', limit: 500, page,
      overrideAccess: false, req: { ...req, query: {} } })
    for (const doc of result.docs) {
      const prefix = typeof doc.prefix === 'string' ? doc.prefix : null
      counts.set(prefix, (counts.get(prefix) ?? 0) + 1)
    }
    if (!result.hasNextPage) break
    page++
  }
  const registered = await req.payload.find({ collection: 'media-directories', where: { tenant: { equals: tenant.id } },
    select: { path: true }, depth: 0, pagination: false, overrideAccess: false, req: { ...req, query: {} } })
  return { tenant, folders: buildMediaFolders(tenant.slug, [...counts].map(([prefix, count]) => ({ prefix, count })), registered.docs.map(doc => doc.path)) }
}

export async function createMediaFolder(req: PayloadRequest) {
  assertFolderWriteOrigin(req)
  const tenant = await mediaFolderTenant(req)
  const body = req.data ?? await req.json?.()
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new APIError('Enter a folder name.', 400)
  let path
  try { path = createMediaFolderPath(body.parent ?? '', body.name) }
  catch (error) { throw new APIError(error instanceof Error ? error.message : 'Enter a valid folder name.', 400) }
  const catalog = await mediaFolderCatalog(req)
  if (body.parent && !catalog.folders.some(folder => folder.path === body.parent && folder.uploadable)) {
    throw new APIError('Choose an existing parent folder in this workspace.', 400)
  }
  if (catalog.folders.some(folder => folder.path === path)) return { path, created: false, catalog }
  try {
    await req.payload.create({ collection: 'media-directories', data: { tenant: Number(tenant.id), path }, overrideAccess: false, req })
  } catch (error) {
    // A retry or concurrent editor may already have created this exact path. Never update it.
    const existing = await req.payload.find({ collection: 'media-directories', where: { and: [{ tenant: { equals: tenant.id } }, { path: { equals: path } }] },
      depth: 0, limit: 1, overrideAccess: false, req: { ...req, query: {} } })
    if (!existing.docs.length) throw error
    return { path, created: false, catalog: await mediaFolderCatalog(req) }
  }
  return { path, created: true, catalog: await mediaFolderCatalog(req) }
}
