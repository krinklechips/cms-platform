import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
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
    // Live Preview: edit a service and watch the REAL site render update
    // beside the form — the dummy roomchang instance (CONTENT_SOURCE=payload,
    // :3200) refreshes on save. Locale codes ARE the site's URL segments
    // (en/kh/cn), so no mapping needed.
    livePreview: {
      url: ({ data, locale }) => {
        const dummy = process.env.DUMMY_SITE_URL || 'http://localhost:3200'
        return `${dummy}/${locale?.code ?? 'en'}/services/${(data as { slug?: string })?.slug ?? ''}`
      },
      collections: ['services'],
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 390, height: 844 },
        { label: 'Desktop', name: 'desktop', width: 1280, height: 900 },
      ],
    },
  },
  collections: [Users, Media, Tenants, Services, Doctors],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Adapter follows DATABASE_URI: postgres:// in production (the CMS's OWN
  // Supabase project — never the live roomchang one), sqlite file in dev.
  db: process.env.DATABASE_URI?.startsWith('postgres')
    ? postgresAdapter({
        pool: { connectionString: process.env.DATABASE_URI },
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
    locales: [
      { label: 'English (EN)', code: 'en' },
      { label: 'ខ្មែរ (KH)', code: 'kh' },
      { label: '中文 (CN)', code: 'cn' },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
  plugins: [
    multiTenantPlugin({
      // Tenant-scoped collections. Roomchang is tenant #1; future customers
      // get their own tenant and see only their own content.
      collections: {
        services: {},
        doctors: {},
        media: {},
      },
      tenantsSlug: 'tenants',
      // Serviette Labs staff (super-admin) can see/manage every tenant.
      userHasAccessToAllTenants: (user) =>
        Boolean((user as { roles?: string[] })?.roles?.includes('super-admin')),
    }),
  ],
})
