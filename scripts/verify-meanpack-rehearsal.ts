import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import pg from 'pg'
import { getPayload } from 'payload'

const uri = process.env.DATABASE_URI!
if (!uri || !['localhost', '127.0.0.1'].includes(new URL(uri).hostname) || new URL(uri).pathname !== '/meanpack_rehearsal' || new URL(uri).port !== '55462') throw new Error('Only the explicitly named disposable local rehearsal is allowed')
const baseline = new pg.Client({ connectionString: uri.replace('/meanpack_rehearsal', '/meanpack_baseline') })
const current = new pg.Client({ connectionString: uri })
await baseline.connect(); await current.connect()
const tables = (await baseline.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name")).rows
let preservedRows = 0
const quote = (s: string) => `"${s.replaceAll('"', '""')}"`
for (const { table_name: table } of tables) {
  const columns = (await baseline.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position", [table])).rows.map(r => quote(r.column_name)).join(',')
  const sql = `SELECT to_jsonb(t) AS row FROM (SELECT ${columns} FROM ${quote(table)}) t`
  const before = (await baseline.query(sql)).rows.map(r => JSON.stringify(r.row))
  const after = new Set((await current.query(sql)).rows.map(r => JSON.stringify(r.row)))
  for (const row of before) assert.ok(after.has(row), `Existing row changed in ${table}`)
  preservedRows += before.length
}
const rls = (await current.query("SELECT count(*)::int AS n FROM pg_tables t JOIN pg_class c ON c.relname=t.tablename WHERE t.schemaname='public' AND (t.tablename LIKE 'meanpack_websites%' OR t.tablename LIKE '_meanpack_websites%') AND c.relrowsecurity")).rows[0].n
assert.equal(rls, 40)

const { default: config } = await import('../src/payload.config')
const payload = await getPayload({ config })
const tenant = (await payload.find({ collection: 'tenants', where: { slug: { equals: 'meanpack' } }, limit: 1, depth: 0, overrideAccess: true })).docs[0]
const staffDoc = (await payload.find({ collection: 'users', where: { email: { equals: 'enoch.phan@gmail.com' } }, limit: 1, overrideAccess: true })).docs[0]
const staff = { ...staffDoc, collection: 'users' as const }
const account = async (label: string, owner: number) => ({ ...await payload.create({ collection: 'users', user: staff, overrideAccess: true,
  data: { email: `meanpack-${label}-${Date.now()}@example.invalid`, name: 'Disposable local verification', roles: ['editor'], tenants: [{ tenant: owner }], password: randomBytes(24).toString('base64url') } }), collection: 'users' as const })
const own = await account('own', tenant.id)
const other = await account('other', 1)
const ownRows = await payload.find({ collection: 'meanpack-websites', user: own, overrideAccess: false, draft: true, locale: 'en', depth: 0 })
assert.equal(ownRows.totalDocs, 1)
assert.equal((await payload.find({ collection: 'meanpack-websites', user: other, overrideAccess: false, draft: true, locale: 'en', depth: 0 })).totalDocs, 0)
const original = ownRows.docs[0]
await payload.update({ collection: 'meanpack-websites', id: original.id, user: own, overrideAccess: false, locale: 'en', draft: true,
  data: { copy: { homeTitle: 'Disposable local draft verification' }, _editorialRevision: original._editorialRevision } })
const published = await payload.findByID({ collection: 'meanpack-websites', id: original.id, locale: 'en', draft: false, overrideAccess: true })
assert.equal(published.copy?.homeTitle, original.copy?.homeTitle)
const draft = await payload.findByID({ collection: 'meanpack-websites', id: original.id, user: own, overrideAccess: false, locale: 'en', draft: true })
assert.equal(draft.copy?.homeTitle, 'Disposable local draft verification')
await assert.rejects(() => payload.findByID({ collection: 'meanpack-websites', id: original.id, user: other, overrideAccess: false, locale: 'en', draft: true }))
await payload.update({ collection: 'meanpack-websites', id: original.id, user: own, overrideAccess: false, locale: 'en', draft: false,
  data: { copy: { homeTitle: original.copy?.homeTitle }, _status: 'published', _editorialRevision: draft._editorialRevision } })
assert.equal((await payload.findByID({ collection: 'meanpack-websites', id: original.id, locale: 'en', draft: false, overrideAccess: true })).copy?.homeTitle, original.copy?.homeTitle)
console.log(JSON.stringify({ predecessorTables: tables.length, predecessorRowsPreserved: preservedRows, newTablesWithRLS: rls, ownTenantRead: true, crossTenantReadDenied: true, draftKeptOffPublishedContent: true, publicationVerified: true }))
await baseline.end(); await current.end()
await Promise.race([payload.destroy(), new Promise(resolve => setTimeout(resolve, 2000))])
process.exit(0)
