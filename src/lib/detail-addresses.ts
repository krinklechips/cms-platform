import { sql, type PostgresAdapter } from '@payloadcms/db-postgres'
import { APIError, ValidationError, type CollectionBeforeValidateHook } from 'payload'
import { canonicalEditorialID } from './editorial-lock'

/** Detail URLs are shared across languages. Reserve both current published and
 * latest draft addresses, without renaming any existing editorial document. */
export const protectDetailAddress: CollectionBeforeValidateHook = async ({ collection, data, originalDoc, req, operation }) => {
  if (!data) return data
  const owner = data.tenant ?? originalDoc?.tenant
  const id = owner && typeof owner === 'object' ? owner.id : owner
  if (typeof id !== 'number' && typeof id !== 'string') throw new APIError('Web addresses require a tenant.', 400)
  const tenant = canonicalEditorialID(req, 'tenants', id)
  const db = req.payload.db as unknown as PostgresAdapter
  if (db.name === 'postgres') {
    const transaction = await req.transactionID
    const session = transaction == null ? undefined : db.sessions?.[transaction]
    if (!session?.db || !('execute' in session.db) || typeof session.db.execute !== 'function') {
      throw new APIError('Web addresses require an active PostgreSQL transaction session.', 503)
    }
    await session.db.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${`detail-addresses:${collection.slug}`}), hashtext(${tenant}))`)
  }
  const slug = data.slug ?? originalDoc?.slug
  const reject = (message: string): never => { throw new ValidationError({ collection: collection.slug, errors: [{ path: 'slug', message }] }, req.t) }
  if (typeof slug !== 'string' || !slug) reject('A web address is required.')
  if ((operation !== 'update' || slug !== originalDoc?.slug) && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    reject('Web addresses must be one path segment using lowercase letters, numbers and hyphens.')
  }
  for (const draft of [false, true]) {
    const occupied = await req.payload.find({ collection: collection.slug, req, draft, depth: 0, overrideAccess: true, limit: 1,
      where: { and: [{ tenant: { equals: tenant } }, { slug: { equals: slug } },
        ...(originalDoc?.id == null ? [] : [{ id: { not_equals: originalDoc.id } }]),
      ] },
    })
    if (occupied.totalDocs > 0) reject('This web address is already used by another document in this site.')
  }
  data.slug = slug
  return data
}
