import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { handleStaleDataCheck } from '@payloadcms/ui/utilities/handleStaleDataCheck'
import { buildConfig, createLocalReq, getPayload } from 'payload'

test('locale publishing does not make an unchanged editor stale after preview reads; another save still does', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cms-staleness-'))
  const payload = await getPayload({ key: randomUUID(), config: buildConfig({
    secret: 'isolated-document-staleness-fixture-only', telemetry: false,
    typescript: { autoGenerate: false },
    db: sqliteAdapter({ client: { url: 'file:' + path.join(dir, 'fixture.db') } }),
    localization: { locales: ['en', 'kh', 'cn'], defaultLocale: 'en', fallback: false },
    collections: [{ slug: 'pages', versions: { drafts: true, maxPerDoc: 100 },
      access: { read: () => true, create: () => true, update: () => true, readVersions: () => true },
      fields: [{ name: 'title', type: 'text', localized: true }] }],
    globals: [{ slug: 'settings', versions: { drafts: true, max: 100 },
      access: { read: () => true, update: () => true, readVersions: () => true },
      fields: [{ name: 'title', type: 'text', localized: true }] }],
  }) })
  try {
    // Fixture globals are intentionally absent from this app's generated production types.
    const settingsSlug = 'settings' as never
    const page = await payload.create({ collection: 'pages', locale: 'en', data: { title: 'English published', _status: 'published' } as never })
    await payload.updateGlobal({ slug: settingsSlug, locale: 'en', data: { title: 'English published', _status: 'published' } as never })
    for (const target of ['collection', 'global'] as const) {
      const write = (locale: 'en' | 'kh' | 'cn', title: string, draft: boolean) => target === 'collection'
        ? payload.update({ collection: 'pages', id: page.id, locale, draft, publishSpecificLocale: draft ? undefined : locale,
          publishAllLocales: false, data: { title, _status: draft ? 'draft' : 'published' } as never })
        : payload.updateGlobal({ slug: settingsSlug, locale, draft, publishSpecificLocale: draft ? undefined : locale,
          publishAllLocales: false, data: { title, _status: draft ? 'draft' : 'published' } as never })
      const read = (locale: 'en' | 'kh' | 'cn', draft: boolean) => target === 'collection'
        ? payload.findByID({ collection: 'pages', id: page.id, locale, draft, fallbackLocale: false })
        : payload.findGlobal({ slug: settingsSlug, locale, draft, fallbackLocale: false })
      const history = async () => target === 'collection'
        ? (await payload.findVersions({ collection: 'pages', where: { parent: { equals: page.id } }, locale: 'all', pagination: false })).docs
        : (await payload.findGlobalVersions({ slug: settingsSlug, locale: 'all', pagination: false })).docs
      for (const locale of ['en', 'kh', 'cn'] as const) {
        const ownDraft = await write(locale, locale + ' saved draft', true)
        const priorVersions = await history()
        const otherLocales = (['en', 'kh', 'cn'] as const).filter(code => code !== locale)
        const otherContent = await Promise.all(otherLocales.map(async code => ({ code,
          published: (await read(code, false)).title, draft: (await read(code, true)).title })))
        // Native timestamps have millisecond precision; make a distinct next save deterministic.
        while (Date.now() <= Date.parse(String(ownDraft.updatedAt))) await new Promise(resolve => setTimeout(resolve, 1))
        const saved = await write(locale, locale + ' published', false)
        const req = await createLocalReq({ locale, fallbackLocale: false }, payload)
        const check = (stamp: string) => handleStaleDataCheck({
          ...(target === 'collection' ? { collectionSlug: 'pages', id: page.id } : { globalSlug: 'settings' }),
          originalUpdatedAt: stamp, req,
        })
        // Opening/refreshing a demo or preview tab performs reads, not another editorial save.
        for (const readerLocale of ['en', 'kh', 'cn'] as const) {
          await read(readerLocale, false)
          await read(readerLocale, true)
        }
        assert.equal((await check(String(saved.updatedAt))).isStale, false,
          `${target}/${locale}: own locale publish plus preview must not trigger the reload warning`)
        assert.equal((await read(locale, false)).title, locale + ' published')
        assert.equal((await read(locale, true)).title, locale + ' published', 'The active locale keeps its own saved content')
        for (const other of otherContent) {
          assert.equal((await read(other.code, false)).title, other.published, 'Another locale must not be published or changed')
          assert.equal((await read(other.code, true)).title, other.draft, 'Keep every other locale draft')
        }
        const after = await history()
        for (const old of priorVersions) assert.deepEqual(after.find(v => v.id === old.id)?.version, old.version,
          'Never rewrite an existing published or draft version to fix the timestamp')
        assert.equal(after.length, priorVersions.length + 2, 'Append the native published version and snapshot only')
        while (Date.now() <= Date.parse(String(saved.updatedAt))) await new Promise(resolve => setTimeout(resolve, 1))
        const otherSave = await write(locale, locale + ' another editor draft', true)
        assert.equal((await check(String(saved.updatedAt))).isStale, true, 'A genuine intervening save must still warn')
        assert.equal((await check(String(otherSave.updatedAt))).isStale, false, 'A freshly loaded revision is not stale')
      }
    }
  } finally {
    await payload.destroy()
    await rm(dir, { recursive: true, force: true })
  }
})
