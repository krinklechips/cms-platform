/**
 * The single registry of tenant-facing CONTENT collection slugs — the ones a
 * module can unlock. Modules.contentCollections and the module-gating layer
 * both validate against this, so a typo fails loud instead of silently
 * hiding a collection from a paying tenant.
 *
 * Platform collections (users, tenants, modules, invoices) and media are NOT
 * here — they are never gated by a module subscription.
 */
export const CONTENT_COLLECTION_SLUGS = [
  'homepage',
  'site-stats',
  'feature-cards',
  'brand-logos',
  'testimonials',
  'pages',
  'services',
  'doctors',
  'technology',
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
  'partners',
  'partner-categories',
  'faq-items',
  'news-articles',
  'community-articles',
  'publications',
  'videos',
  'career-positions',
  'enquiries',
  'booking-slots',
] as const

export type ContentCollectionSlug = (typeof CONTENT_COLLECTION_SLUGS)[number]

export const isKnownContentSlug = (slug: unknown): slug is ContentCollectionSlug =>
  typeof slug === 'string' && (CONTENT_COLLECTION_SLUGS as readonly string[]).includes(slug)

/** Validate an array of slugs; returns the unknown ones (empty = all valid). */
export const unknownSlugs = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value.filter((s) => !isKnownContentSlug(s)).map(String)
}
