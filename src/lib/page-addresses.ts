import { sql, type PostgresAdapter } from '@payloadcms/db-postgres'
import { APIError, ValidationError, type CollectionBeforeValidateHook, type PayloadRequest } from 'payload'

const slugify = (raw: string): string => raw.toLowerCase().normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9\s-]/g, '')
  .trim().replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')

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

export const allocatePageAddress: CollectionBeforeValidateHook = async ({ data, req, originalDoc }) => {
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
    if (await occupied(existing)) throw new ValidationError({ collection: 'pages', errors: [
      { path: 'slug', message: 'This web address is already used by another page in this tenant.' },
    ] }, req.t)
    data.slug = existing
    return data
  }
  const base = slugify(String(data.title ?? '')) || 'page'
  let candidate = base
  for (let suffix = 2; await occupied(candidate); suffix++) candidate = `${base}-${suffix}`
  data.slug = candidate
  return data
}
