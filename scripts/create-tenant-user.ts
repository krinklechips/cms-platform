import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'

const dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(dirname, '../.env') })

/** Creates the Roomchang tenant-admin demo account (local dev). */
async function run() {
  const { default: config } = await import('../src/payload.config')
  const payload = await getPayload({ config })
  const email = 'team@roomchang.com'
  const existing = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
  if (existing.docs.length) {
    console.log('tenant user already exists:', email)
    process.exit(0)
  }
  const tenant = (
    await payload.find({ collection: 'tenants', where: { slug: { equals: 'roomchang' } }, limit: 1 })
  ).docs[0]
  if (!tenant) {
    console.error('✗ roomchang tenant not found — run sync first')
    process.exit(1)
  }
  const password = process.env.TENANT_DEMO_PASSWORD!
  await payload.create({
    collection: 'users',
    data: {
      email,
      password,
      name: 'Roomchang Team',
      roles: ['tenant-admin'],
      tenants: [{ tenant: tenant.id }],
    } as never,
  })
  console.log('✓ created tenant-admin:', email, '(scoped to tenant: roomchang)')
  process.exit(0)
}
run().catch((e) => {
  console.error(e)
  process.exit(1)
})
