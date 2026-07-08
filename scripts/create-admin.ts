import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'

const dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(dirname, '../.env') })

async function run() {
  const { default: config } = await import('../src/payload.config')
  const payload = await getPayload({ config })
  const email = 'enoch@serviettelab.com'
  const existing = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
  if (existing.docs.length) { console.log('admin already exists:', email); process.exit(0) }
  const password = process.env.ADMIN_DEMO_PASSWORD!
  await payload.create({ collection: 'users', data: { email, password, name: 'Enoch', roles: ['super-admin'] } })
  console.log('✓ created super-admin:', email)
  process.exit(0)
}
run().catch((e) => { console.error(e); process.exit(1) })
