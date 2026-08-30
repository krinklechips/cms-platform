import dotenv from 'dotenv'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'

const dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(dirname, '../.env') })

/**
 * Tenant onboarding — provisions a sellable customer in one command:
 *
 *   DATABASE_URI="$DATABASE_URI_PROD" npx tsx scripts/create-tenant.ts \
 *     --name "Oriental Clinic" --slug oriental --domain oriental.serviettelab.com \
 *     --admin-email owner@oriental.example [--admin-name "Owner Name"] [--modules all]
 *
 * Creates: the tenant (domains + subscriptions to every active module —
 * enabledCollections is computed by the Tenants beforeChange hook), and a
 * tenant-admin login with a generated password printed ONCE.
 *
 * It does NOT: point DNS at Render, add the domain to the Render service,
 * or add a logo entry in AdminBrand.tsx — those are listed at the end.
 */

const arg = (name: string): string | undefined => {
  const i = process.argv.indexOf(`--${name}`)
  return i > -1 ? process.argv[i + 1] : undefined
}

async function run() {
  const name = arg('name')
  const slug = arg('slug')
  const domain = arg('domain')
  const adminEmail = arg('admin-email')
  const adminName = arg('admin-name') ?? name
  if (!name || !slug || !domain || !adminEmail) {
    console.error(
      'Usage: npx tsx scripts/create-tenant.ts --name <n> --slug <s> --domain <d> --admin-email <e> [--admin-name <n>]',
    )
    process.exit(1)
  }

  const { default: config } = await import('../src/payload.config')
  const payload = await getPayload({ config })

  const dupTenant = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  })
  if (dupTenant.docs.length) {
    console.error(`✗ tenant slug "${slug}" already exists (id ${dupTenant.docs[0].id}) — aborting.`)
    process.exit(1)
  }
  const dupUser = await payload.find({
    collection: 'users',
    where: { email: { equals: adminEmail } },
    limit: 1,
    overrideAccess: true,
  })
  if (dupUser.docs.length) {
    console.error(`✗ user "${adminEmail}" already exists — aborting.`)
    process.exit(1)
  }

  const modules = await payload.find({
    collection: 'modules',
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })
  const subscriptions = modules.docs.map((m) => ({ module: m.id, active: true }))

  const tenant = await payload.create({
    collection: 'tenants',
    data: {
      name,
      slug,
      domains: [{ domain }],
      subscriptions,
    } as never,
    overrideAccess: true,
  })

  const password = crypto.randomBytes(18).toString('base64url')
  await payload.create({
    collection: 'users',
    data: {
      email: adminEmail,
      password,
      name: adminName,
      roles: ['tenant-admin'],
      tenants: [{ tenant: tenant.id }],
    } as never,
    overrideAccess: true,
  })

  const enabled = (tenant as { enabledCollections?: string[] }).enabledCollections ?? []
  console.log('✓ tenant created:', name, `(id ${tenant.id}, slug ${slug})`)
  console.log('  domain:', domain)
  console.log('  modules subscribed:', modules.docs.length, '→ collections:', enabled.length)
  console.log('✓ tenant-admin:', adminEmail)
  console.log('  PASSWORD (shown once, share over a secure channel):', password)
  console.log('\nManual follow-ups:')
  console.log(`  1. Render → cms-platform service → add custom domain "${domain}" (+ DNS CNAME).`)
  console.log('  2. src/components/AdminBrand.tsx → add a BRANDS entry for their logo (optional).')
  console.log('  3. Seed content (their own sync or the admin UI); nothing renders until published.')
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
