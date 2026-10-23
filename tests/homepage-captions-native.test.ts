import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { getPayload } from 'payload'
import { loadPayloadConfig } from './helpers/load-payload-config'

process.env.PAYLOAD_SECRET = 'homepage-caption-native-disposable-fixture-only'
process.env.DATABASE_URI = 'file:/tmp/homepage-caption-native-config-unused.db'
process.env.PAYLOAD_FORCE_DRIZZLE_PUSH = 'true'
const locales = ['en', 'kh', 'cn'] as const
type Locale = typeof locales[number]

test('native homepage checkbox drafts and locale-only publication preserve other languages and shared slide identities', { timeout: 120000 }, async () => {
  const config = await loadPayloadConfig()
  const dir = await mkdtemp(path.join(os.tmpdir(), 'homepage-caption-native-'))
  const payload = await getPayload({ key: randomUUID(), config: {
    ...config, telemetry: false, typescript: { ...config.typescript, autoGenerate: false },
    admin: { ...config.admin, importMap: { ...config.admin.importMap, autoGenerate: false } },
    db: sqliteAdapter({ client: { url: `file:${path.join(dir, 'fixture.db')}` }, transactionOptions: {} }) as typeof config.db,
  } })
  try {
    const tenant = await payload.db.create({ collection: 'tenants', data: { name: 'Caption fixture', slug: 'caption-fixture' } })
    const user = { id: 1, collection: 'users', roles: ['super-admin'], tenants: [{ tenant: tenant.id }] } as never
    const created = await payload.create({ collection: 'homepage', locale: 'en', user,
      data: { tenant: tenant.id, heroPill: 'New fixture', _status: 'published' } })
    assert.equal(created.showCaptions, false, 'New homepages start with captions off')
    // A raw legacy fixture deliberately has no caption column values or translations to backfill.
    const home = await payload.db.create({ collection: 'homepage', data: {
      tenant: tenant.id, _status: 'published', heroPill: { en: 'English pill', kh: 'Khmer pill', cn: 'Chinese pill' },
      heroButtons: [{ id: '111111111111111111111111', url: '/contact', label: { en: 'English CTA', kh: 'Khmer CTA', cn: 'Chinese CTA' } }],
      slides: [{ id: '222222222222222222222222', imageUrl: '/hero/retained.jpg', imageSize: 'legacy-retained',
        title: { en: 'English title', kh: 'Khmer title', cn: 'Chinese title' } }],
    } })
    const read = (locale: Locale, draft = false) => payload.findByID({ collection: 'homepage', id: home.id,
      locale, draft, fallbackLocale: false, depth: 0, user })
    const update = async (locale: Locale, showCaptions: boolean, draft: boolean, extra: Record<string, unknown> = {}) => payload.update({
      collection: 'homepage', id: home.id, locale, user, draft, overrideLock: true,
      publishSpecificLocale: draft ? undefined : locale, publishAllLocales: false,
      data: { ...extra, showCaptions, _status: draft ? 'draft' : 'published', _editorialRevision: (await read(locale, true))._editorialRevision } as never,
    })
    const values = (doc: Awaited<ReturnType<typeof read>>) => {
      const { _editorialRevision: _revision, updatedAt: _updatedAt, ...value } = doc
      return value
    }
    const before = Object.fromEntries(await Promise.all(locales.map(async locale => [locale, values(await read(locale))])))
    const stored = await payload.db.findOne({ collection: 'homepage', where: { id: { equals: home.id } } })
    assert.ok(stored)
    assert.deepEqual((stored as Record<string, unknown>).showCaptions, { en: null, kh: null, cn: null })
    await payload.db.createVersion({ collectionSlug: 'homepage', parent: home.id, versionData: stored,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), autosave: false })
    await update('en', true, true, { heroPill: 'Private English pill' })
    await update('cn', true, true, { heroPill: 'Private Chinese pill' })
    const privateDrafts = { en: values(await read('en', true)), cn: values(await read('cn', true)) }
    await update('kh', true, false)
    const published = await read('kh')
    assert.equal(published.showCaptions, true)
    for (const locale of ['en', 'cn'] as const) {
      assert.deepEqual(values(await read(locale)), before[locale], `${locale} published values must remain untouched`)
      assert.deepEqual(values(await read(locale, true)), privateDrafts[locale], `${locale} saved drafts must remain private`)
    }
    await update('kh', false, false)
    assert.equal((await read('kh')).showCaptions, false, 'Explicit false must not be replaced by a true fallback')
    for (const locale of locales) {
      const current = await read(locale)
      assert.deepEqual(current.slides, (before[locale] as typeof current).slides)
      assert.deepEqual(current.heroButtons, (before[locale] as typeof current).heroButtons)
    }
    for (const locale of ['en', 'cn'] as const) assert.deepEqual(values(await read(locale, true)), privateDrafts[locale])
  } finally {
    await payload.destroy()
    await rm(dir, { recursive: true, force: true })
  }
})
