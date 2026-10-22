import { APIError, parseCookies, type PayloadRequest } from 'payload'
import { getHostTenant } from './host-scope'
import { mediaID, resolveMediaTenant } from './media-validation'
import { buildMediaFolders, type MediaFolderCatalog } from './media-folders'

export async function mediaFolderCatalog(req: PayloadRequest): Promise<MediaFolderCatalog> {
  if (!req.user) throw new APIError('Sign in to browse media folders.', 401)
  const requested = req.searchParams?.get('tenant')
  const host = await getHostTenant(req)
  const memberships = (req.user as { tenants?: { tenant?: unknown }[] }).tenants ?? []
  const selected = requested || host?.id || parseCookies(req.headers).get('payload-tenant') ||
    (memberships.length === 1 ? mediaID(memberships[0].tenant) : null)
  let tenant
  try { tenant = await resolveMediaTenant(selected, req) }
  catch { throw new APIError('Choose an authorised tenant to browse its media folders.', 403) }
  if (host && String(host.id) !== String(tenant.id)) throw new APIError('Choose media from this workspace.', 403)

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
  return { tenant, folders: buildMediaFolders(tenant.slug, [...counts].map(([prefix, count]) => ({ prefix, count }))) }
}
