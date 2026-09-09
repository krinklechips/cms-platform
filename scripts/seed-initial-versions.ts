import { getPayload } from 'payload'
import { sql } from '@payloadcms/db-postgres'
import config from '../src/payload.config'

/**
 * One-time after enabling drafts: Payload serves draft-mode reads (draft=true,
 * i.e. the sandbox's preview) from the VERSIONS tables, so documents that
 * predate drafts are invisible there until they have a version. Creates one
 * version per existing document, keeping its state (published stays
 * published, drafts stay drafts) and restoring each row's original updatedAt
 * so "recent edits" on the dashboard stay truthful.
 */
async function main() {
  const payload = await getPayload({ config })
  const db = payload.db as unknown as { drizzle: { execute: (q: unknown) => Promise<unknown> } }
  let created = 0
  for (const col of payload.config.collections) {
    if (!col.versions?.drafts) continue
    const table = col.slug.replace(/-/g, '_')
    let page = 1
    for (;;) {
      const res = await payload.find({ collection: col.slug as never, limit: 100, page, depth: 0, overrideAccess: true, locale: 'en' })
      for (const doc of res.docs as { id: number; _status?: string; updatedAt?: string }[]) {
        const existing = await payload.countVersions({ collection: col.slug as never, where: { parent: { equals: doc.id } }, overrideAccess: true })
        if (existing.totalDocs > 0) continue
        const isDraft = doc._status === 'draft'
        await payload.update({ collection: col.slug as never, id: doc.id, data: {} as never, draft: isDraft, overrideAccess: true, locale: 'en' })
        if (doc.updatedAt) {
          await db.drizzle.execute(sql.raw(`UPDATE "${table}" SET updated_at = '${doc.updatedAt}' WHERE id = ${doc.id}`))
        }
        created++
      }
      if (!res.hasNextPage) break
      page++
    }
    console.log(`${col.slug}: done`)
  }
  console.log(`✓ seeded ${created} initial versions`)
  process.exit(0)
}
main().catch((e) => { console.error('SEED FAILED:', e.message); process.exit(1) })
