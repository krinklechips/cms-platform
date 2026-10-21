import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { sqliteAdapter, type SQLiteAdapter } from '@payloadcms/db-sqlite'
import { buildConfig, getPayload, ValidationError, type CollectionConfig } from 'payload'
import { Media } from '../src/collections/Media'

process.env.PAYLOAD_SECRET = 'native-media-validation-disposable-fixture-only'
process.env.DATABASE_URI = 'file:/tmp/native-media-validation-config-unused.db'
process.env.PAYLOAD_FORCE_DRIZZLE_PUSH = 'true'
delete process.env.R2_ACCESS_KEY_ID
const config = await (await import('../src/payload.config')).default
const rejectsMedia = (error: unknown) => error instanceof ValidationError && /image|tenant|media|URL|src|caption|JSON/i.test(JSON.stringify(error.data.errors))

test('native SQLite draft/publish guards preserve existing values, drafts, locale data and stable row identities', { timeout: 120000 }, async t => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cms-media-native-'))
  const payload = await getPayload({ key: randomUUID(), config: {
    ...config, telemetry: false, typescript: { ...config.typescript, autoGenerate: false },
    db: sqliteAdapter({ client: { url: `file:${path.join(dir, 'fixture.db')}` } }) as typeof config.db,
  } })
  try {
    const tenant = await payload.db.create({ collection: 'tenants', data: { name: 'Roomchang', slug: 'roomchang' } })
    const other = await payload.db.create({ collection: 'tenants', data: { name: 'Other', slug: 'other-site' } })
    const user = { id: 1, collection: 'users', roles: ['super-admin'], tenants: [{ tenant: tenant.id }, { tenant: other.id }] } as never
    const legacy = 'http://legacy.invalid/image.png'
    const page = await payload.db.create({ collection: 'pages', data: {
      tenant: tenant.id, slug: 'native-fixture', title: { en: 'Published English', kh: 'Published Khmer', cn: 'Published Chinese' }, _status: 'published',
      sections: { en: [{ id: 'aaaaaaaaaaaaaaaaaaaaaaaa', blockType: 'image', src: legacy }],
        kh: [{ id: 'bbbbbbbbbbbbbbbbbbbbbbbb', blockType: 'image', src: 'http://legacy.invalid/kh.png' }],
        cn: [{ id: 'cccccccccccccccccccccccc', blockType: 'image', src: 'http://legacy.invalid/cn.png' }] },
    } })
    const snapshotPage = async () => {
      const data = await payload.db.findOne({ collection: 'pages', where: { id: { equals: page.id } } })
      assert.ok(data)
      await payload.db.createVersion({ collectionSlug: 'pages', parent: page.id, versionData: data,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), autosave: false })
    }
    await snapshotPage()
    const read = (locale: 'en' | 'kh' | 'cn', draft = false) => payload.findByID({ collection: 'pages', id: page.id, locale, draft, fallbackLocale: false, depth: 0 })
    const update = (data: Record<string, unknown>, draft: boolean, locale: 'en' | 'kh' | 'cn' = 'en') => payload.update({
      collection: 'pages', id: page.id, data: data as never, draft, locale, user, overrideLock: true,
      publishSpecificLocale: draft ? undefined : locale, publishAllLocales: false,
    })

    await t.test('new malformed image URLs reject both native drafts and publication', async () => {
      for (const draft of [true, false]) {
        await assert.rejects(() => update({ sections: [{ id: 'aaaaaaaaaaaaaaaaaaaaaaaa', blockType: 'image', src: 'https://foreign.invalid/new.png' }] }, draft), rejectsMedia)
      }
      for (const draft of [true, false]) {
        await assert.rejects(() => payload.create({ collection: 'pages', user, draft, data: {
          tenant: tenant.id, slug: 'new-bad-image', sections: [{ blockType: 'image', src: 'javascript:alert(1)' }],
        } as never }), rejectsMedia)
      }
    })

    await t.test('unrelated saves preserve legacy invalid images in the same document and other locale drafts', async () => {
      await update({ title: 'Private Khmer draft' }, true, 'kh')
      const khDraft = await read('kh', true)
      const cnPublished = await read('cn')
      await update({ title: 'Private English draft' }, true)
      assert.equal((await read('en')).title, 'Published English')
      assert.equal((await read('en', true)).title, 'Private English draft')
      const draftSection = (await read('en', true)).sections?.[0]
      assert.equal(draftSection?.blockType === 'image' && draftSection.src, legacy)
      await update({ title: 'Published revised English' }, false)
      const publishedSection = (await read('en')).sections?.[0]
      assert.equal(publishedSection?.blockType === 'image' && publishedSection.src, legacy)
      assert.deepEqual((await read('kh', true)).sections, khDraft.sections)
      assert.equal((await read('kh', true)).title, khDraft.title)
      assert.deepEqual((await read('cn')).sections, cnPublished.sections)
      assert.equal((await read('cn')).title, cnPublished.title)
    })

    await t.test('array and nested block reorder compare IDs rather than indexed paths', async () => {
      const gallery = { id: 'dddddddddddddddddddddddd', blockType: 'gallery', images: [
        { id: '111111111111111111111111', url: 'http://legacy.invalid/first.png' },
        { id: '222222222222222222222222', url: 'http://legacy.invalid/second.png' },
      ] }
      const split = { id: 'eeeeeeeeeeeeeeeeeeeeeeee', blockType: 'twocol', left: [{ id: 'ffffffffffffffffffffffff', blockType: 'image', src: legacy }], right: [] }
      await payload.db.updateOne({ collection: 'pages', id: page.id, data: { sections: { en: [gallery, split] } } })
      await snapshotPage()
      const current = await read('en')
      const currentGallery = current.sections![0]
      assert.ok(currentGallery.blockType === 'gallery')
      const sections = [current.sections![1], { ...currentGallery, images: [...currentGallery.images!].reverse() }]
      await update({ sections }, false)
      assert.deepEqual((await read('en')).sections?.map(row => row.id), [split.id, gallery.id])
      await assert.rejects(() => update({ sections: [{ ...sections[1], images: [{ id: '333333333333333333333333', url: 'http://legacy.invalid/first.png' }] }] }, true), rejectsMedia)
    })

    await t.test('changing ownership rechecks native image refs in untouched localized blocks', async () => {
      const image = await payload.db.create({ collection: 'media', data: { tenant: tenant.id, filename: 'owned.png', mimeType: 'image/png' } })
      const localized = await payload.db.create({ collection: 'pages', data: { tenant: tenant.id, slug: 'ownership-locales', _status: 'published',
        sections: { en: [{ id: '123456789012345678901234', blockType: 'image', src: '/images/english.png' }],
          kh: [{ id: '234567890123456789012345', blockType: 'image', media: image.id }] } } })
      await assert.rejects(() => payload.update({ collection: 'pages', id: localized.id, draft: true, locale: 'en', user, overrideLock: true,
        data: { tenant: other.id, title: 'Owner changed' } as never }), rejectsMedia)
    })

    await t.test('native refs reject cross-tenant images for drafts and retain unchanged legacy refs on unrelated publish', async () => {
      const foreign = await payload.db.create({ collection: 'media', data: { tenant: other.id, filename: 'foreign.png', url: 'http://invalid.example/foreign.png', mimeType: 'image/png' } })
      for (const draft of [true, false]) {
        await assert.rejects(() => payload.create({ collection: 'homepage', draft, user, data: { tenant: tenant.id, slides: [{ image: foreign.id }] } as never }), rejectsMedia)
      }
      const homepage = await payload.db.create({ collection: 'homepage', data: { tenant: tenant.id, _status: 'published', slides: [{ id: '999999999999999999999999', image: foreign.id }] } })
      await payload.update({ collection: 'homepage', id: homepage.id, user, data: { heroPill: 'Unrelated metadata' }, overrideLock: true })
      assert.equal((await payload.findByID({ collection: 'homepage', id: homepage.id, depth: 0 })).slides?.[0]?.image, foreign.id)
      await payload.update({ collection: 'homepage', id: homepage.id, user, draft: true, data: { tenant: other.id }, overrideLock: true })
      await assert.rejects(() => payload.update({ collection: 'homepage', id: homepage.id, user, draft: true,
        data: { tenant: tenant.id }, overrideLock: true }), rejectsMedia)
    })
  } finally {
    await payload.destroy()
    await rm(dir, { recursive: true, force: true })
  }
})

test('disabling crop/focal editing preserves every generated SQLite media column and default', { timeout: 120000 }, async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cms-media-schema-'))
  try {
    const schemas: Record<string, unknown>[][] = []
    for (const baseline of [true, false]) {
      const media: CollectionConfig = baseline ? {
        ...Media, fields: Media.fields.filter(field => !('name' in field && ['focalX', 'focalY'].includes(field.name))),
        upload: { hideRemoveFile: true },
      } : Media
      const payload = await getPayload({ key: randomUUID(), config: buildConfig({
        secret: 'media-schema-local-only', telemetry: false, typescript: { autoGenerate: false }, collections: [media],
        db: sqliteAdapter({ client: { url: `file:${path.join(dir, `${baseline}.db`)}` } }),
      }) })
      try {
        const result = await (payload.db as unknown as SQLiteAdapter).drizzle.run("PRAGMA table_info('media')")
        schemas.push(result.rows.map(({ cid: _cid, ...column }) => column).sort((a, b) => String(a.name).localeCompare(String(b.name))))
      } finally { await payload.destroy() }
    }
    assert.deepEqual(schemas[1], schemas[0])
    assert.ok(schemas[1].some(column => column.name === 'focal_x'))
    assert.ok(schemas[1].some(column => column.name === 'focal_y'))
  } finally { await rm(dir, { recursive: true, force: true }) }
})
