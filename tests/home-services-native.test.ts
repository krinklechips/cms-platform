import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { getPayload } from 'payload'
import { loadPayloadConfig } from './helpers/load-payload-config'

process.env.PAYLOAD_SECRET = 'services-section-disposable-test-only'
process.env.DATABASE_URI = 'file:/tmp/services-section-config-unused.db'
process.env.PAYLOAD_FORCE_DRIZZLE_PUSH = 'true'
const locales = ['en', 'kh', 'cn'] as const
const keys = ['eyebrow', 'heading', 'seeAll', 'implants', 'crowns', 'aligners', 'cosmetic', 'whitening', 'surgery'] as const
type Locale = typeof locales[number]

test('native Services Section writes isolate languages, existing hero drafts and tenant owners', { timeout: 120000 }, async () => {
  const config = await loadPayloadConfig()
  const dir = await mkdtemp(path.join(os.tmpdir(), 'home-services-native-'))
  const payload = await getPayload({ key: randomUUID(), config: {
    ...config, telemetry: false, typescript: { ...config.typescript, autoGenerate: false },
    admin: { ...config.admin, importMap: { ...config.admin.importMap, autoGenerate: false } },
    db: sqliteAdapter({ client: { url: `file:${path.join(dir, 'fixture.db')}` }, transactionOptions: {} }) as typeof config.db,
  } })
  try {
    const tenant = await payload.db.create({ collection: 'tenants', data: { name: 'Services fixture', slug: 'services-fixture', enabledCollections: ['homepage'] } })
    const user = { id: 1, collection: 'users', roles: ['editor'], tenants: [{ tenant: tenant.id }] } as never
    const admin = { id: 2, collection: 'users', roles: ['super-admin'] } as never
    const hero = await payload.create({ collection: 'homepage', locale: 'en', user: admin, data: { tenant: tenant.id, heroPill: 'Existing published hero', _status: 'published' } })
    await payload.update({ collection: 'homepage', id: hero.id, locale: 'en', user: admin, draft: true, data: {
      heroPill: 'Borin private hero draft', _status: 'draft', _editorialRevision: hero._editorialRevision,
    } })
    const heroSnapshot = async () => ({
      parent: await payload.db.findOne({ collection: 'homepage', where: { id: { equals: hero.id } } }),
      versions: await payload.db.findVersions({ collection: 'homepage', pagination: false, sort: 'id', where: { parent: { equals: hero.id } } }),
    })
    const beforeHero = await heroSnapshot()
    const content = (locale: Locale) => Object.fromEntries(keys.map(key => [key, `${locale} original ${key}`]))
    const section = await payload.create({ collection: 'home-services', locale: 'en', user, overrideAccess: false,
      data: { tenant: tenant.id, ...content('en'), _status: 'published' } })
    const read = (locale: Locale, draft = false) => payload.findByID({ collection: 'home-services', id: section.id, locale,
      fallbackLocale: false, draft, user, overrideAccess: false, depth: 0 })
    const update = async (locale: Locale, draft: boolean, data: Record<string, unknown>) => payload.update({ collection: 'home-services', id: section.id,
      locale, user, overrideAccess: false, draft, publishSpecificLocale: draft ? undefined : locale, publishAllLocales: false,
      data: { ...data, _status: draft ? 'draft' : 'published', _editorialRevision: (await read(locale, true))._editorialRevision } as never })
    const text = (doc: Awaited<ReturnType<typeof read>>) => Object.fromEntries(keys.map(key => [key, doc[key]]))
    for (const locale of ['kh', 'cn'] as const) await update(locale, false, content(locale))
    for (const locale of locales) await update(locale, true, { heading: `${locale} private section draft` })
    for (const locale of locales) {
      const others = locales.filter(other => other !== locale)
      const before = await Promise.all(others.map(async other => ({ other, published: text(await read(other)), draft: text(await read(other, true)) })))
      assert.equal((await read(locale)).heading, `${locale} original heading`, 'Draft must remain private')
      await update(locale, false, { heading: `${locale} tested publication` })
      assert.equal((await read(locale)).heading, `${locale} tested publication`)
      for (const state of before) {
        assert.deepEqual(text(await read(state.other)), state.published)
        assert.deepEqual(text(await read(state.other, true)), state.draft)
      }
      await update(locale, false, content(locale))
      assert.deepEqual(text(await read(locale)), content(locale))
      assert.deepEqual(await heroSnapshot(), beforeHero, 'Existing hero and every saved hero version must remain untouched')
    }
    await assert.rejects(() => payload.create({ collection: 'home-services', locale: 'en', user, overrideAccess: false,
      data: { tenant: tenant.id, heading: 'Duplicate must fail', _status: 'draft' } }))
    const other = await payload.db.create({ collection: 'tenants', data: { name: 'Other tenant', slug: 'other-services', enabledCollections: ['homepage'] } })
    await assert.rejects(() => payload.create({ collection: 'home-services', locale: 'en', user, overrideAccess: false,
      data: { tenant: other.id, heading: 'Wrong owner must fail', _status: 'draft' } }))
    const audit = await payload.find({ collection: 'editorial-audit', overrideAccess: true, pagination: false,
      where: { docCollection: { equals: 'home-services' } } })
    assert.ok(audit.docs.length > 0, 'New section writes retain the existing audit log')
  } finally {
    await payload.destroy()
    await rm(dir, { recursive: true, force: true })
  }
})
