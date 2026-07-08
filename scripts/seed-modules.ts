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
    contentCollections: [
      'services',
      'doctors',
      'technology',
      'testimonials',
      'clinical-cases',
      'faq-items',
      'timeline-events',
      'branches',
    ],
  },
  {
    key: 'media-library',
    name: 'Media Library',
    description: 'Image and file uploads backed by cloud storage (Cloudflare R2).',
    defaultMonthlyPrice: 0,
    contentCollections: [],
  },
  {
    key: 'ai-chatbot',
    name: 'AI Chatbot',
    description: 'The website AI assistant (e.g. Roomy). Toggle per tenant; billed monthly.',
    defaultMonthlyPrice: 0,
    contentCollections: [],
  },
  {
    key: 'homepage',
    name: 'Homepage',
    description: 'Homepage hero, stats, feature cards, and brand logo content.',
    defaultMonthlyPrice: 0,
    contentCollections: ['hero-slides', 'site-stats', 'feature-cards', 'brand-logos'],
  },
  {
    key: 'pricing',
    name: 'Pricing',
    description: 'Pricing tables, categories, comparison sets, and comparison rows.',
    defaultMonthlyPrice: 0,
    contentCollections: [
      'pricing-categories',
      'pricing-items',
      'pricing-comparison-sets',
      'pricing-comparison-rows',
    ],
  },
  {
    key: 'international-patients',
    name: 'International Patients',
    description: 'International patient treatments, steps, and why-choose-us content.',
    defaultMonthlyPrice: 0,
    contentCollections: [
      'international-treatments',
      'international-steps',
      'international-why-items',
    ],
  },
  {
    key: 'partners',
    name: 'Partners',
    description: 'Partner logos and partner category management.',
    defaultMonthlyPrice: 0,
    contentCollections: ['partners', 'partner-categories'],
  },
  {
    key: 'publishing',
    name: 'Education & News',
    description: 'News, community articles, publications, and videos.',
    defaultMonthlyPrice: 0,
    contentCollections: ['news-articles', 'community-articles', 'publications', 'videos'],
  },
  {
    key: 'careers',
    name: 'Careers',
    description: 'Career position listings and hiring content.',
    defaultMonthlyPrice: 0,
    contentCollections: ['career-positions'],
  },
  {
    key: 'enquiries-inbox',
    name: 'Enquiries Inbox',
    description: 'Operational enquiry and booking slot snapshots.',
    defaultMonthlyPrice: 0,
    contentCollections: ['enquiries', 'booking-slots'],
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
      await payload.update({
        collection: 'modules',
        id: existing.id,
        data: { contentCollections: mod.contentCollections } as Record<string, unknown>,
      })
      console.log(`✓ module updated: ${mod.key}`)
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
    subscriptions?: {
      active?: boolean | null
      module?: number | string | { id?: number | string | null } | null
      monthlyPrice?: number | null
      startedAt?: string | null
    }[]
  }
  if (!tenant) throw new Error('roomchang tenant not found')

  const update: Record<string, unknown> = {}

  const domains = tenant.domains ?? []
  if (!domains.some((d) => d.domain === CMS_DOMAIN)) {
    update.domains = [...domains.map((d) => ({ domain: d.domain })), { domain: CMS_DOMAIN }]
  }

  const subscriptions = tenant.subscriptions ?? []
  const subscribedModuleIds = new Set(
    subscriptions
      .map((sub) => (typeof sub.module === 'object' && sub.module !== null ? sub.module.id : sub.module))
      .filter((id): id is number | string => id !== undefined && id !== null)
      .map(String),
  )
  const missingSubscriptions = CATALOG.filter(
    (mod) => !subscribedModuleIds.has(String(moduleIds[mod.key])),
  ).map((mod) => ({
    module: moduleIds[mod.key],
    active: true,
    startedAt: '2026-07-08',
  }))

  if (missingSubscriptions.length) {
    update.subscriptions = [
      ...subscriptions.map((sub) => ({
        ...sub,
        module:
          typeof sub.module === 'object' && sub.module !== null ? sub.module.id ?? sub.module : sub.module,
      })),
      ...missingSubscriptions,
    ]
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
