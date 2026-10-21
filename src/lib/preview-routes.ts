import type { LivePreviewConfig, PayloadRequest } from 'payload'
import { getStatPages } from './stat-pages'

export const PREVIEW_COLLECTIONS = [
  'pages',
  'services',
  'doctors',
  'technology',
  'homepage',
  'site-stats',
  'feature-cards',
  'brand-logos',
  'testimonials',
  'pricing-categories',
  'pricing-items',
  'pricing-comparison-sets',
  'pricing-comparison-rows',
  'international-treatments',
  'international-steps',
  'international-why-items',
  'timeline-events',
  'branches',
  'clinical-cases',
  'news-articles',
  'community-articles',
  'partners',
  'partner-categories',
  'faq-items',
  'publications',
  'videos',
  'career-positions',
]

const comparisonPaths: Record<string, string> = {
  'implants-comparison': '/pricing/implants-comparison',
  'full-comparison': '/international/price-comparison',
}

const comparisonPath = (slug: unknown): string | null =>
  typeof slug === 'string' && Object.hasOwn(comparisonPaths, slug) ? comparisonPaths[slug] : null

// Keep aligned with the website's branches.ts SOURCE_BRANCH_SLUGS: its
// getBranchDetails() preserves these routes ahead of imported CMS slugs.
const branchSourceSlugs: Record<string, string> = {
  'fbc48bfa-9807-402f-aa7f-e0cf45d15272': 'sisowath-high-school',
  '7fcf8912-ccff-4add-8910-7c637e312473': 'rose-condo',
  'fa9eb854-e2e5-4086-b879-47d80d26200c': 'aeon-mall',
  '6da5da97-aec4-400b-a045-0df6311f78e3': 'ph-euro-park',
  '74b77631-3bd3-4bf4-bc0d-400bc4dab254': 'fun-mall',
}

function branchPath(data: Record<string, unknown>) {
  const sourceId = typeof data.sourceId === 'string'
    ? data.sourceId
    : typeof data.id === 'string' || typeof data.id === 'number' ? String(data.id) : ''
  const canonical = Object.hasOwn(branchSourceSlugs, sourceId) ? branchSourceSlugs[sourceId] : ''
  const slug = canonical || (typeof data.slug === 'string' ? data.slug.trim() : '') || sourceId
  return slug ? `/about/branches/${encodeURIComponent(slug)}` : '/contact'
}

async function comparisonRowPath(set: unknown, req: PayloadRequest | undefined, locale: 'en' | 'kh' | 'cn') {
  const relation = set && typeof set === 'object' ? set as { id?: unknown; slug?: unknown } : null
  if (typeof relation?.slug === 'string' && relation.slug) return comparisonPath(relation.slug)
  const id = relation ? relation.id : set
  if ((typeof id !== 'number' && typeof id !== 'string') || id === '' || !req?.payload) return null

  try {
    // Local API reads bypass access by default. Keep the editor's request and
    // enforce its tenant/read permissions when resolving an unpopulated set.
    const doc = await req.payload.findByID({
      collection: 'pricing-comparison-sets',
      id,
      req,
      overrideAccess: false,
      locale,
      draft: true,
      depth: 0,
      select: { slug: true },
    })
    return comparisonPath(doc?.slug)
  } catch {
    // Missing/deleted or inaccessible relationships must not preview another set.
    return null
  }
}

export const getPreviewUrl: Exclude<LivePreviewConfig['url'], string | null | undefined> = async ({ data, locale, collectionConfig, req }) => {
  const loc = locale?.code === 'kh' || locale?.code === 'cn' ? locale.code : 'en'
  const slug = typeof data?.slug === 'string' ? encodeURIComponent(data.slug.trim()) : ''
  const pages: Record<string, string | null> = {
    services: slug ? `/services/${slug}` : '/services',
    pages: slug ? `/${slug}` : null,
    doctors: '/team',
    technology: slug ? `/technology/${slug}` : '/technology',
    homepage: '',
    'site-stats': getStatPages(typeof data?.key === 'string' ? data.key : '')[0]?.path ?? null,
    'feature-cards': '',
    'brand-logos': '',
    testimonials: '',
    'pricing-categories': '/pricing',
    'pricing-items': '/pricing',
    'international-treatments': '/international',
    'international-steps': '/international',
    'international-why-items': '/international',
    'timeline-events': '/about',
    branches: branchPath(data ?? {}),
    'clinical-cases': slug ? `/clinical-results/${slug}` : '/clinical-results',
    'news-articles': slug ? `/about/news/${slug}` : '/about/news',
    'community-articles': slug ? `/about/community/${slug}` : '/about/community',
    partners: '/about/partnerships',
    'partner-categories': '/about/partnerships',
    'faq-items': '/blog/faq',
    publications: '/blog/publications',
    videos: data?.category === 'dentist-talk' ? '/blog/dentist-talks' : null,
    'career-positions': slug ? `/about/careers/${slug}` : '/about/careers',
  }
  const collection = collectionConfig?.slug ?? ''
  const page = collection === 'pricing-comparison-sets'
    ? comparisonPath(data?.slug)
    : collection === 'pricing-comparison-rows'
      ? await comparisonRowPath(data?.set, req, loc)
      : Object.hasOwn(pages, collection) ? pages[collection] : null
  if (page === null) return null

  const site = (process.env.DUMMY_SITE_URL || 'http://localhost:3200').replace(/\/+$/, '')
  const target = `/${loc}${page}`
  const secret = process.env.PREVIEW_SECRET
  return secret
    ? `${site}/api/preview?secret=${encodeURIComponent(secret)}&redirect=${encodeURIComponent(target)}`
    : `${site}${target}`
}
