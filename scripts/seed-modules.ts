import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'

const dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(dirname, '../.env') })

/**
 * Seeds the module catalog and Roomchang's initial subscriptions.
 * Idempotent: modules upsert by key; tenant subscriptions/domains are only
 * filled when empty/missing (never clobbers super-admin edits or prices).
 */
const CATALOG = [
  {
    key: 'website-content',
    name: 'Website Content',
    description: 'Services, doctors, and page content management with EN/KH/CN localization.',
    defaultMonthlyPrice: 0,
  },
  {
    key: 'media-library',
    name: 'Media Library',
    description: 'Image and file uploads backed by cloud storage (Cloudflare R2).',
    defaultMonthlyPrice: 0,
  },
  {
    key: 'ai-chatbot',
    name: 'AI Chatbot',
    description: 'The website AI assistant (e.g. Roomy). Toggle per tenant; billed monthly.',
    defaultMonthlyPrice: 0,
  },
]

const CMS_DOMAIN = 'roomchang.serviettelab.com'

async function run() {
  const { default: config } = await import('../src/payload.config')
  const payload = await getPayload({ config })

  const moduleIds: Record<string, number | string> = {}
  for (const mod of CATALOG) {
    const existing = (
      await payload.find({ collection: 'modules', where: { key: { equals: mod.key } }, limit: 1 })
    ).docs[0]
    if (existing) {
      moduleIds[mod.key] = existing.id
      console.log(`= module exists: ${mod.key}`)
    } else {
      const created = await payload.create({ collection: 'modules', data: mod })
      moduleIds[mod.key] = created.id
      console.log(`✓ module created: ${mod.key}`)
    }
  }

  const tenant = (
    await payload.find({ collection: 'tenants', where: { slug: { equals: 'roomchang' } }, limit: 1, depth: 0 })
  ).docs[0] as {
    id: number | string
    domains?: { domain: string }[]
    subscriptions?: unknown[]
  }
  if (!tenant) throw new Error('roomchang tenant not found')

  const update: Record<string, unknown> = {}

  const domains = tenant.domains ?? []
  if (!domains.some((d) => d.domain === CMS_DOMAIN)) {
    update.domains = [...domains.map((d) => ({ domain: d.domain })), { domain: CMS_DOMAIN }]
  }

  if (!tenant.subscriptions?.length) {
    update.subscriptions = CATALOG.map((mod) => ({
      module: moduleIds[mod.key],
      active: true,
      startedAt: '2026-07-08',
    }))
  }

  if (Object.keys(update).length) {
    await payload.update({ collection: 'tenants', id: tenant.id, data: update })
    console.log('✓ tenant updated:', Object.keys(update).join(', '))
  } else {
    console.log('= tenant already configured')
  }
  process.exit(0)
}
run().catch((e) => {
  console.error(e)
  process.exit(1)
})
