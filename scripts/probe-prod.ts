import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'

const dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(dirname, '../.env') })

async function run() {
  const uri = process.env.DATABASE_URI || ''
  console.log('adapter target host:', uri.replace(/^.*@/, '').split(':')[0], '| driver:', uri.split(':')[0])
  const { default: config } = await import('../src/payload.config')
  const payload = await getPayload({ config })

  const tenants = await payload.find({ collection: 'tenants', limit: 10 })
  console.log('payload sees tenants:', tenants.totalDocs, tenants.docs.map((t) => `${t.id}:${t.slug}`))

  const svc = await payload.find({ collection: 'services', limit: 3 })
  console.log('payload sees services:', svc.totalDocs)

  // raw SQL through payload's own drizzle connection — same pool, no ambiguity
  const db = (payload.db as unknown as { drizzle: { execute: (q: string) => Promise<unknown> } }).drizzle
  const raw = (await db.execute(
    `select current_database() as db, current_user as usr, inet_server_addr()::text as server, (select count(*) from services) as services, (select count(*) from tenants) as tenants`,
  )) as { rows?: unknown[] }
  console.log('raw via same connection:', JSON.stringify(raw.rows ?? raw))
  process.exit(0)
}
run().catch((e) => { console.error(e.message); process.exit(1) })
