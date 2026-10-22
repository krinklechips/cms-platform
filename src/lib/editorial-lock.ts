import { sql, type PostgresAdapter } from '@payloadcms/db-postgres'
import { APIError, type CollectionBeforeOperationHook, type CollectionSlug, type PayloadRequest } from 'payload'

export const canonicalEditorialID = (req: PayloadRequest, collection: string, id: string | number): string => {
  const customType = req.payload.collections?.[collection as CollectionSlug]?.customIDType
  const db = req.payload.db as unknown as PostgresAdapter
  if ((customType ?? db.defaultIDType) === 'number') {
    const number = Number(id)
    if (String(id).trim() === '' || !Number.isSafeInteger(number)) throw new APIError('Invalid numeric document ID.', 400)
    return String(number)
  }
  if (!customType && (db.idType === 'uuid' || db.idType === 'uuidv7')) return String(id).toLowerCase()
  return String(id)
}

/** Hold the record lock until Payload commits/rolls back the operation's existing transaction. */
export const lockEditorialDocument = async (req: PayloadRequest, collection: string, id: string | number): Promise<void> => {
  if (req.payload.db.name !== 'postgres') return
  const transactionID = await req.transactionID
  const session = transactionID == null ? undefined : (req.payload.db as unknown as PostgresAdapter).sessions?.[transactionID]
  if (!session?.db || !('execute' in session.db) || typeof session.db.execute !== 'function') {
    throw new APIError('Editorial writes require an active PostgreSQL transaction session.', 503)
  }
  // Never use the pool: transaction-scoped locks must share the writer's connection.
  await session.db.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${`editorial:${collection}`}), hashtext(${canonicalEditorialID(req, collection, id)}))`)
}

export const serializeEditorialUpdate: CollectionBeforeOperationHook = async ({ args, collection, operation, req }) => {
  if (!['update', 'delete'].includes(operation) || req.payload.db.name !== 'postgres') return
  if (!('id' in args) || (typeof args.id !== 'string' && typeof args.id !== 'number')) {
    // Native bulk loops cannot guarantee a common lock order or a fixed set of matching rows.
    const action = operation === 'delete' ? 'deletes' : 'updates'
    throw new APIError(`Editorial PostgreSQL ${action} require a single document ID; bulk ${action} are not supported.`, 400)
  }
  await lockEditorialDocument(req, collection.slug, args.id)
}
