import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { s3Storage } from '@payloadcms/storage-s3'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Tenants } from './collections/Tenants'
import { Services } from './collections/Services'
import { Doctors } from './collections/Doctors'
import { Technology } from './collections/Technology'
import { Testimonials } from './collections/Testimonials'
import { Homepage } from './collections/Homepage'
import { Pages } from './collections/Pages'
import { Branches } from './collections/Branches'
import { SiteStats } from './collections/SiteStats'
import { FeatureCards } from './collections/FeatureCards'
import { BrandLogos } from './collections/BrandLogos'
import { PricingCategories } from './collections/PricingCategories'
import { PricingItems } from './collections/PricingItems'
import { PricingComparisonSets } from './collections/PricingComparisonSets'
import { PricingComparisonRows } from './collections/PricingComparisonRows'
import { ClinicalCases } from './collections/ClinicalCases'
import { PartnerCategories } from './collections/PartnerCategories'
import { Partners } from './collections/Partners'
import { FaqItems } from './collections/FaqItems'
import { TimelineEvents } from './collections/TimelineEvents'
import { InternationalTreatments } from './collections/InternationalTreatments'
import { InternationalSteps } from './collections/InternationalSteps'
import { InternationalWhyItems } from './collections/InternationalWhyItems'
import { NewsArticles } from './collections/NewsArticles'
import { CommunityArticles } from './collections/CommunityArticles'
import { Publications } from './collections/Publications'
import { Videos } from './collections/Videos'
import { CareerPositions } from './collections/CareerPositions'
import { Enquiries } from './collections/Enquiries'
import { BookingSlots } from './collections/BookingSlots'
import { Modules } from './collections/Modules'
import { Invoices } from './collections/Invoices'
import { getTenantByHost, normalizeHost } from './lib/get-tenant-by-host'
import { withModuleGating } from './lib/module-gating'
import { withHostScope } from './lib/host-scope'
import { withHumanLabels } from './lib/collection-labels'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * Serviette Labs CMS — multi-tenant Payload instance.
 *
 * Structure (per Enoch):
 *   LIVE SITE (roomchang.com, reads Supabase — source of truth, untouched)
 *     └─sync──▶ THIS CMS (editing layer; Roomchang = tenant #1)
 *                 └─renders──▶ DUMMY SITE (mirror fed by this CMS)
 *
 * DB: sqlite for the POC. To move onto the Supabase Postgres later, swap
 * `sqliteAdapter` for `postgresAdapter({ pool: { connectionString:
 * process.env.DATABASE_URL } })` from @payloadcms/db-postgres (already
 * installed) and set DATABASE_URL in .env.
 */
export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    // NOTE: host-aware branding lives on the public landing page (page.tsx),
    // NOT the admin chrome. A custom admin graphics.Logo as an async server
    // component (DB lookup per render) white-screens the admin, so the admin
    // keeps Payload's default mark. Revisit as a CLIENT component that takes
    // the logo URL as a prop if we want the login screen branded per tenant.
    //
    components: {
      // Full Dashboard override (not beforeDashboard): super-admins see ONLY
      // the Serviette HQ cockpit; tenant users get Payload's DefaultDashboard.
      // Removes the confusing "cockpit + default collection cards" stack.
      views: {
        dashboard: { Component: '/components/PlatformDashboardView#PlatformDashboardView' },
      },
      // Super-admin gets a slim Platform-only sidebar; tenant users get the
      // DefaultNav (their gated page groups). Nav override because admin.hidden
      // would 404 the collection routes.
      Nav: '/components/PlatformNav#PlatformNav',
      // These render INSIDE the sidebar. The Nav override itself must return a
      // single element (a fragment there breaks the admin layout), so the
      // tenant banner and the back-to-platform link live in these slots.
      beforeNavLinks: ['/components/TenantNavBanner#TenantNavBanner'],
      afterNavLinks: ['/components/PlatformBackLink#PlatformBackLink'],
      // De-Payload the chrome: host-aware CLIENT components (login screen shows
      // the tenant's own logo on their domain). MUST stay client components —
      // an async server component in graphics.Logo white-screens the admin.
      graphics: {
        Logo: '/components/AdminBrand#AdminLogo',
        Icon: '/components/AdminBrand#AdminIcon',
      },
    },
    meta: {
      titleSuffix: ' · Serviette CMS',
    },
    // Live Preview: edit a service and watch the REAL site render update
    // beside the form — the dummy roomchang instance (CONTENT_SOURCE=payload,
    // :3200) refreshes on save. Locale codes ARE the site's URL segments
    // (en/kh/cn), so no mapping needed.
    livePreview: {
      // Eye icon → the REAL page on the dummy site (roomchang-sandbox on
      // Vercel, CONTENT_SOURCE=payload), refreshed on save. Each collection
      // maps to the page it renders on.
      url: ({ data, locale, collectionConfig }) => {
        const dummy = process.env.DUMMY_SITE_URL || 'http://localhost:3200'
        const loc = locale?.code ?? 'en'
        const slug = (data as { slug?: string })?.slug ?? ''
        const pageFor: Record<string, string> = {
          services: slug ? `/services/${slug}` : '/services',
          pages: slug ? `/${slug}` : '',
          doctors: '/team',
          technology: '/technology',
          homepage: '',
          'site-stats': '',
          'feature-cards': '',
          'brand-logos': '',
          testimonials: '',
          'pricing-categories': '/pricing',
          'pricing-items': '/pricing',
          'pricing-comparison-sets': '/pricing',
          'pricing-comparison-rows': '/pricing',
          'international-treatments': '/international',
          'international-steps': '/international',
          'international-why-items': '/international',
          'timeline-events': '/about',
          branches: '/contact',
          'clinical-cases': '/clinical-results',
          'news-articles': slug ? `/about/news/${slug}` : '/about/news',
          'community-articles': slug ? `/about/community/${slug}` : '/about/community',
        }
        const page = pageFor[collectionConfig?.slug ?? ''] ?? ''
        return `${dummy}/${loc}${page}`
      },
      collections: [
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
      ],
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 390, height: 844 },
        { label: 'Desktop', name: 'desktop', width: 1280, height: 900 },
      ],
    },
  },
  collections: [
    // Order defines nav-group order: site pages first, platform tools last.
    // withHostScope: on a tenant's own domain the admin lists only that
    // tenant's rows (see lib/host-scope.ts). No-op on serviettelab.com.
    withHumanLabels(withHostScope(withModuleGating(Homepage))),
    withHumanLabels(withHostScope(withModuleGating(BrandLogos))),
    withHumanLabels(withHostScope(withModuleGating(SiteStats))),
    withHumanLabels(withHostScope(withModuleGating(FeatureCards))),
    withHumanLabels(withHostScope(withModuleGating(Testimonials))),
    withHumanLabels(withHostScope(withModuleGating(Pages))),
    withHumanLabels(withHostScope(withModuleGating(Services))),
    withHumanLabels(withHostScope(withModuleGating(Doctors))),
    withHumanLabels(withHostScope(withModuleGating(Technology))),
    withHumanLabels(withHostScope(withModuleGating(PricingCategories))),
    withHumanLabels(withHostScope(withModuleGating(PricingItems))),
    withHumanLabels(withHostScope(withModuleGating(PricingComparisonSets))),
    withHumanLabels(withHostScope(withModuleGating(PricingComparisonRows))),
    withHumanLabels(withHostScope(withModuleGating(InternationalWhyItems))),
    withHumanLabels(withHostScope(withModuleGating(InternationalTreatments))),
    withHumanLabels(withHostScope(withModuleGating(InternationalSteps))),
    withHumanLabels(withHostScope(withModuleGating(TimelineEvents))),
    withHumanLabels(withHostScope(withModuleGating(Branches))),
    withHumanLabels(withHostScope(withModuleGating(ClinicalCases))),
    withHumanLabels(withHostScope(withModuleGating(Partners))),
    withHumanLabels(withHostScope(withModuleGating(PartnerCategories))),
    withHumanLabels(withHostScope(withModuleGating(FaqItems))),
    withHumanLabels(withHostScope(withModuleGating(NewsArticles))),
    withHumanLabels(withHostScope(withModuleGating(CommunityArticles))),
    withHumanLabels(withHostScope(withModuleGating(Publications))),
    withHumanLabels(withHostScope(withModuleGating(Videos))),
    withHumanLabels(withHostScope(withModuleGating(CareerPositions))),
    withHumanLabels(withHostScope(withModuleGating(Enquiries))),
    withHumanLabels(withHostScope(withModuleGating(BookingSlots))),
    withHumanLabels(withHostScope(Media)),
    withHumanLabels(Users),
    withHumanLabels(Tenants),
    withHumanLabels(Modules),
    withHumanLabels(Invoices),
  ],
  endpoints: [
    // Public feature flags for the tenants' websites (e.g. the AI chatbot
    // only renders when its module is active). Hardened per Codex review:
    // exact host match, active modules only, returns ONLY module keys —
    // no prices, ids, names, or inactive modules.
    {
      path: '/feature-flags',
      method: 'get',
      handler: async (req) => {
        const domain =
          req.searchParams?.get('domain') ?? req.headers.get('x-forwarded-host') ?? req.headers.get('host')
        const tenant = await getTenantByHost(req.payload, normalizeHost(domain))
        return Response.json(
          { modules: tenant?.moduleKeys ?? [] },
          { headers: { 'Cache-Control': 'public, max-age=300' } },
        )
      },
    },
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Adapter follows DATABASE_URI: postgres:// in production (the CMS's OWN
  // Supabase project — never the live roomchang one), sqlite file in dev.
  //
  // Postgres schema is managed by versioned migrations (src/migrations),
  // applied on deploy via `payload migrate` (see start script). `push` is
  // dev-only — ignored under NODE_ENV=production — which is why the empty
  // prod DB never got its tables. Migrations are the correct production fix.
  db: process.env.DATABASE_URI?.startsWith('postgres')
    ? postgresAdapter({
        pool: { connectionString: process.env.DATABASE_URI },
        // Never dev-push against Postgres (that's always prod or prod-like):
        // schema changes go through migrations ONLY. Prevents local scripts
        // from silently mutating the production schema (bit us once already
        // — the posrestg incident).
        push: false,
      })
    : sqliteAdapter({
        client: {
          url: process.env.DATABASE_URI || 'file:./serviette-cms.db',
        },
      }),
  sharp,
  // First-class locales — no more content_translations overlay / workbooks.
  // Codes follow the site's country-style URL segments (per Enoch): KH / CN
  // (not ISO km/zh) — matches roomchang.com/kh and /cn.
  localization: {
    // Labels WITHOUT the code suffix — the admin locale selector appends the
    // code itself, so 'ខ្មែរ (KH)' rendered as a doubled "…(KH) KH".
    locales: [
      { label: 'English', code: 'en' },
      { label: 'ខ្មែរ', code: 'kh' },
      { label: '中文', code: 'cn' },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
  plugins: [
    multiTenantPlugin({
      // Tenant-scoped collections. Roomchang is tenant #1; future customers
      // get their own tenant and see only their own content.
      collections: {
        pages: {},
        services: {},
        doctors: {},
        technology: {},
        testimonials: {},
        // NOT isGlobal: the plugin's global-doc lookup runs during Payload
        // init — which executes inside `payload migrate` BEFORE the migration
        // creates the table, crashing clean deploys (the chicken-and-egg that
        // forced hand-applied SQL). Homepage is a normal tenant-scoped
        // collection with a one-doc-per-tenant convention; the cockpit /
        // "Open content" links deep-link straight to that doc.
        homepage: {},
        branches: {},
        'site-stats': {},
        'feature-cards': {},
        'brand-logos': {},
        'pricing-categories': {},
        'pricing-items': {},
        'pricing-comparison-sets': {},
        'pricing-comparison-rows': {},
        'clinical-cases': {},
        'partner-categories': {},
        partners: {},
        'faq-items': {},
        'timeline-events': {},
        'international-treatments': {},
        'international-steps': {},
        'international-why-items': {},
        'news-articles': {},
        'community-articles': {},
        publications: {},
        videos: {},
        'career-positions': {},
        enquiries: {},
        'booking-slots': {},
        media: {},
      },
      tenantsSlug: 'tenants',
      // Lock tenant membership: only super-admins may set/change which tenant a
      // user belongs to. Without this the plugin-injected `tenants` array has no
      // field access, so a tenant editor could PATCH their own user record to
      // grant themselves another tenant's data (privilege escalation). Field
      // access silently prevents the field from changing for non-super-admins,
      // so it never blocks a legitimate self-update (e.g. editing your name).
      tenantsArrayField: {
        includeDefaultField: true,
        arrayFieldAccess: {
          create: ({ req }) =>
            Boolean((req.user as { roles?: string[] } | null)?.roles?.includes('super-admin')),
          update: ({ req }) =>
            Boolean((req.user as { roles?: string[] } | null)?.roles?.includes('super-admin')),
        },
      },
      // Serviette Labs staff (super-admin) can see/manage every tenant.
      userHasAccessToAllTenants: (user) =>
        Boolean((user as { roles?: string[] })?.roles?.includes('super-admin')),
    }),
    // Media uploads → Cloudflare R2 (cms-platform bucket). Env var names match
    // what already exists on the Render service from the old platform.
    //
    // ALWAYS registered (with `enabled` gating runtime behavior) — a
    // conditionally-registered plugin makes the generated importMap depend on
    // local env vars, which shipped an importMap missing
    // S3ClientUploadHandler and white-screened the production admin.
    s3Storage({
      enabled: Boolean(process.env.R2_ACCESS_KEY_ID),
      collections: {
        media: {
          prefix: 'serviette-media',
          generateFileURL: ({ filename, prefix }) =>
            `${process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, '')}/${prefix}/${filename}`,
        },
      },
      bucket: process.env.R2_BUCKET_NAME || '',
      config: {
        endpoint: `https://${process.env.R2_ACCOUNT_ID ?? 'unset'}.r2.cloudflarestorage.com`,
        region: 'auto',
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
        forcePathStyle: true,
      },
    }),
  ],
})
