import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { buildConfig, getPayload, type CollectionSlug } from 'payload'
import { localizedFieldFixtures, clinicalCaseFixture } from './lib/cms-localized-field-fixtures'

// No app config, dotenv, storage plugin, credentials, or external services.
const directory = await mkdtemp(path.join(tmpdir(), 'cms-mapping-sqlite-'))
const locales = ['en', 'kh', 'cn'] as const
const payload = await getPayload({ config: buildConfig({
  secret: 'local-only-cms-mapping-fixture',
  typescript: { autoGenerate: false },
  db: sqliteAdapter({ client: { url: `file:${directory}/fixture.db` } }),
  localization: { locales: [...locales], defaultLocale: 'en', fallback: true },
  collections: [...localizedFieldFixtures.map(({ config }) => config), clinicalCaseFixture].map((config) => ({
    ...config, versions: { drafts: true, maxPerDoc: 100 },
  })),
}) })

try {
  for (const fixture of localizedFieldFixtures) {
    const collection = fixture.config.slug as CollectionSlug
    const values = (locale: string) => Object.fromEntries(fixture.fields.map(([field]) => [field, `${locale}-${collection}-${field}`]))
    const translatedSeed = Object.fromEntries(Object.entries(fixture.seed).filter(([name]) => fixture.config.fields.some((field) => 'name' in field && field.name === name && 'localized' in field && field.localized)))
    const doc = await payload.create({ collection, locale: 'en', data: {
      ...fixture.seed, ...values('en'), _status: 'published',
    } as never })
    const read = (locale: typeof locales[number], draft = false, fallbackLocale: false | 'en' = false) =>
      payload.findByID({ collection, id: doc.id, locale, draft, depth: 0, fallbackLocale }) as Promise<unknown> as Promise<Record<string, unknown>>
    const english = await read('en')
    for (const locale of ['kh', 'cn'] as const) {
      const untranslated = await read(locale)
      for (const [field] of fixture.fields) {
        assert.ok(untranslated[field] == null, `${collection}.${field}: no ${locale} clones or shared storage`)
        assert.equal((await read(locale, false, 'en'))[field], english[field], 'English fallback remains available')
      }
      await payload.update({ collection, id: doc.id, locale, data: { ...translatedSeed, ...values(locale), _status: 'published' } as never })
    }
    const before = await Promise.all(locales.map((locale) => read(locale)))
    for (const [index, locale] of locales.entries()) {
      for (const [field] of fixture.fields) assert.equal(before[index][field], values(locale)[field])
    }
    await payload.update({ collection, id: doc.id, locale: 'kh', data: { ...values('kh-edit'), _status: 'published' } as never })
    for (const locale of ['en', 'cn'] as const) {
      const after = await read(locale)
      for (const [field] of fixture.fields) assert.equal(after[field], before[locales.indexOf(locale)][field])
      for (const field of fixture.shared ?? []) assert.equal(after[field], english[field])
    }
    const historical = await payload.findVersions({ collection, locale: 'all', pagination: false, where: { parent: { equals: doc.id } } })
    await payload.update({ collection, id: doc.id, locale: 'en', draft: true, data: values('en-draft') as never })
    await payload.update({ collection, id: doc.id, locale: 'cn', draft: true, data: values('cn-draft') as never })
    const drafts = await Promise.all(locales.map((locale) => read(locale, true)))
    await payload.update({ collection, id: doc.id, locale: 'kh', draft: true, data: values('kh-draft') as never })
    for (const locale of ['en', 'cn'] as const) {
      for (const [field] of fixture.fields) assert.equal((await read(locale, true))[field], drafts[locales.indexOf(locale)][field])
      for (const [field] of fixture.fields) assert.equal((await read(locale))[field], before[locales.indexOf(locale)][field])
    }
    const afterVersions = await payload.findVersions({ collection, locale: 'all', pagination: false, where: { parent: { equals: doc.id } } })
    for (const old of historical.docs) assert.deepEqual(afterVersions.docs.find((row) => row.id === old.id)?.version, old.version)
    console.log(`PASS: ${collection} native locale writes, fallback, drafts, history, and shared fields`)
  }
  const clinical = await payload.create({ collection: 'clinical-cases', locale: 'en', data: {
    title: 'English case', slug: 'stable-case-slug', category: 'Full Mouth', categoryKey: 'full-mouth-reconstruction', _status: 'published',
  } as never })
  await payload.update({ collection: 'clinical-cases', id: clinical.id, locale: 'kh', data: { title: 'Khmer title', category: 'Khmer case label', _status: 'published' } })
  for (const locale of locales) {
    const doc = await payload.findByID({ collection: 'clinical-cases', id: clinical.id, locale, fallbackLocale: false })
    assert.equal((doc as unknown as Record<string, unknown>).categoryKey, 'full-mouth-reconstruction')
    assert.equal(doc.slug, 'stable-case-slug')
  }
  await assert.rejects(payload.update({ collection: 'clinical-cases', id: clinical.id, data: { categoryKey: 'not-canonical' } as never }))
  console.log('PASS: clinical labels localize without changing shared canonical key or case slug; invalid key rejected')
} finally {
  await payload.destroy()
  await rm(directory, { recursive: true, force: true })
}
