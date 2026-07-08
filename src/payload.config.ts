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
  },
  collections: [Users, Media, Tenants, Services, Doctors],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./serviette-cms.db',
    },
  }),
  sharp,
  // First-class locales — no more content_translations overlay / workbooks.
  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: 'ខ្មែរ (Khmer)', code: 'km' },
      { label: '中文 (Chinese)', code: 'zh' },
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
