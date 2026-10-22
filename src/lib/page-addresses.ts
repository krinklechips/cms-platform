import { sql, type PostgresAdapter } from '@payloadcms/db-postgres'
import { APIError, ValidationError, type CollectionBeforeValidateHook, type PayloadRequest } from 'payload'

const slugify = (raw: string): string => raw.toLowerCase().normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9\s-]/g, '')
  .trim().replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')

// Roomchang origin/cms-sandbox (85cdcd7): explicit and nested route roots,
// middleware/rewrite namespaces, public asset directories, and locale prefixes.
// Custom Pages are served only by /[locale]/[slug], never nested paths.
const reservedAddresses = new Set([
  'about', 'admin', 'api', 'autodiscover', 'blog', 'booking-cancellation-policy',
  'brand', 'brands', 'chatbot', 'clinical-results', 'contact', 'cookie-policy',
  'disclaimer', 'docs', 'doctors', 'fonts', 'hero', 'icons', 'international',
  'intl', 'preview', 'pricing', 'privacy-policy', 'services', 'team', 'technology',
  'terms-of-service', 'webmail', 'en', 'kh', 'cn', 'km', 'zh',
])
// The current middleware uses startsWith, not a path-segment boundary, for auth.
const protectedAddressPrefix = (slug: string): boolean => slug.startsWith('admin') || slug.startsWith('preview')

const tenantID = (value: unknown, req: PayloadRequest): string | number => {
  const id = value && typeof value === 'object' && 'id' in value ? value.id : value
  if ((typeof id !== 'string' && typeof id !== 'number') || String(id).trim() === '') {
    throw new APIError('Page addresses require a tenant.', 400)
  }
  const db = req.payload.db as unknown as PostgresAdapter
  if ((req.payload.collections.tenants?.customIDType ?? db.defaultIDType) === 'number') {
    const number = Number(id)
    if (!Number.isSafeInteger(number)) throw new APIError('Page addresses require a valid tenant.', 400)
    return number
  }
  return db.idType === 'uuid' || db.idType === 'uuidv7' ? String(id).toLowerCase() : id
}

/** The lookup and write must share the transaction holding this tenant lock. */
const lockTenantAddresses = async (req: PayloadRequest, tenant: string | number): Promise<void> => {
  if (req.payload.db.name !== 'postgres') return
  const transactionID = await req.transactionID
  const db = req.payload.db as unknown as PostgresAdapter
  const session = transactionID == null ? undefined : db.sessions?.[transactionID]
  if (!session?.db || !('execute' in session.db) || typeof session.db.execute !== 'function') {
    throw new APIError('Page addresses require an active PostgreSQL transaction session.', 503)
  }
  await session.db.execute(sql`SELECT pg_advisory_xact_lock(hashtext('page-addresses:pages'), hashtext(${String(tenant)}))`)
}

export const allocatePageAddress: CollectionBeforeValidateHook = async ({ data, req, originalDoc, operation }) => {
  if (!data) return data
  const tenant = tenantID(data.tenant ?? originalDoc?.tenant, req)
  await lockTenantAddresses(req, tenant)
  const occupied = async (slug: string): Promise<boolean> => {
    // Draft-only saves do not update the parent. Reserve both published addresses
    // and latest draft addresses, but not historical versions of the same page.
    for (const draft of [false, true]) {
      const result = await req.payload.find({
        collection: 'pages', req, draft, depth: 0, overrideAccess: true, limit: 1,
        where: { and: [
          { tenant: { equals: tenant } }, { slug: { equals: slug } },
          ...(originalDoc?.id == null ? [] : [{ id: { not_equals: originalDoc.id } }]),
        ] },
      })
      if (result.totalDocs > 0) return true
    }
    return false
  }
  const existing = data.slug || originalDoc?.slug
  if (existing) {
    // Grandfather unchanged addresses, including saved legacy drafts. Never
    // rename them or block unrelated edits because routing rules changed.
    if (operation !== 'update' || existing !== originalDoc?.slug) {
      const message = typeof existing !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(existing)
        ? 'Web addresses must be one path segment using lowercase letters, numbers and hyphens.'
        : reservedAddresses.has(existing) || protectedAddressPrefix(existing)
          ? 'This web address is reserved by the website. Choose another address.' : undefined
      if (message) throw new ValidationError({ collection: 'pages', errors: [{ path: 'slug', message }] }, req.t)
    }
    if (await occupied(existing)) throw new ValidationError({ collection: 'pages', errors: [
      { path: 'slug', message: 'This web address is already used by another page in this tenant.' },
    ] }, req.t)
    data.slug = existing
    return data
  }
  const titleAddress = slugify(String(data.title ?? '')) || 'page'
  const base = protectedAddressPrefix(titleAddress) ? `page-${titleAddress}` : titleAddress
  let candidate = base
  for (let suffix = 2; reservedAddresses.has(candidate) || await occupied(candidate); suffix++) candidate = `${base}-${suffix}`
  data.slug = candidate
  return data
}
