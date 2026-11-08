import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { getPayload } from 'payload'
import { loadPayloadConfig } from './helpers/load-payload-config'

test('native Service spacing drafts and publications preserve wording, IDs, media and other-language drafts', { timeout: 120000 }, async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'service-layout-native-'))
  Object.assign(process.env, { PAYLOAD_SECRET: randomUUID(), DATABASE_URI: `file:${path.join(dir, 'unused.db')}`, PAYLOAD_FORCE_DRIZZLE_PUSH: 'true' })
  const config = await loadPayloadConfig()
  const cms = await getPayload({ key: randomUUID(), config: {
    ...config, telemetry: false, typescript: { ...config.typescript, autoGenerate: false },
    admin: { ...config.admin, importMap: { ...config.admin.importMap, autoGenerate: false } },
    db: sqliteAdapter({ client: { url: `file:${path.join(dir, 'fixture.db')}` }, transactionOptions: {} }) as typeof config.db,
  } })
  try {
    const tenant = await cms.db.create({ collection: 'tenants', data: { name: 'Layout fixture', slug: 'layout-fixture', enabledCollections: ['services'] } })
    const user = { id: 1, collection: 'users', roles: ['editor'], tenants: [{ tenant: tenant.id }] } as never
    const locales = ['en', 'kh', 'cn'] as const
    const media = await cms.db.create({ collection: 'media', data: { tenant: tenant.id, alt: 'Owned non-patient fixture image', filename: 'fixture.png', mimeType: 'image/png' } })
    const service = await cms.create({ collection: 'services', locale: 'en', user, overrideAccess: false, data: {
      tenant: tenant.id, slug: 'layout-fixture', name: 'en original', imageUrl: '/services/fixture.jpg', _status: 'published',
      sections: [{ blockType: 'text', heading: 'en heading', body: 'en supplied wording' },
        { blockType: 'cards', heading: 'en cards', items: [{ title: 'en card', body: 'en card wording' }] },
        { blockType: 'image', media: media.id, alt: 'en supplied image description' }],
    } })
    const read = (locale: typeof locales[number], draft = false) => cms.findByID({ collection: 'services', id: service.id,
      locale, draft, fallbackLocale: false, user, overrideAccess: false, depth: 0 })
    const save = async (locale: typeof locales[number], draft: boolean, data: Record<string, unknown>) => cms.update({
      collection: 'services', id: service.id, locale, user, overrideAccess: false, draft,
      publishSpecificLocale: draft ? undefined : locale, publishAllLocales: false,
      data: { ...data, _status: draft ? 'draft' : 'published', _editorialRevision: (await read(locale, true))._editorialRevision } as never,
    })
    for (const locale of ['kh', 'cn'] as const) await save(locale, false, { name: `${locale} supplied title`,
      sections: [{ blockType: 'text', heading: `${locale} heading`, body: `${locale} supplied wording` },
        { blockType: 'cards', heading: `${locale} cards`, items: [{ title: `${locale} card`, body: `${locale} card wording` }] },
        { blockType: 'image', media: media.id, alt: `${locale} supplied image description` }],
    })
    for (const locale of locales) await save(locale, true, { name: `${locale} private draft` })
    const content = (doc: Awaited<ReturnType<typeof read>>) => ({ name: doc.name, eyebrow: doc.eyebrow,
      description: doc.description, heroDescription: doc.heroDescription, imageUrl: doc.imageUrl, sections: doc.sections })
    const withoutSpacing = (doc: Awaited<ReturnType<typeof read>>) => ({ ...content(doc),
      sections: doc.sections?.map(({ sectionSpacing: _spacing, ...section }) => section) })
    for (const [index, locale] of locales.entries()) {
      const beforePublished = content(await read(locale))
      const beforeDraft = await read(locale, true)
      const otherLocales = await Promise.all(locales.filter(other => other !== locale).map(async other => ({
        other, published: content(await read(other)), draft: content(await read(other, true)),
      })))
      const spacing = ['compact', 'none', 'default'][index]
      await save(locale, true, { sections: beforeDraft.sections?.map((section, i) => i === 0 ? { ...section, sectionSpacing: spacing } : section) })
      assert.deepEqual(content(await read(locale)), beforePublished, 'Spacing draft must remain private')
      const current = await read(locale, true)
      assert.equal(current.sections?.[0].sectionSpacing, spacing)
      assert.deepEqual(withoutSpacing(current), withoutSpacing(beforeDraft), 'A spacing edit must not rewrite submitted wording or row IDs')
      await assert.rejects(() => cms.update({ collection: 'services', id: service.id, locale, user, overrideAccess: false, draft: true,
        data: { _editorialRevision: beforeDraft._editorialRevision, name: 'Stale text must not win' } }),
      (error: { status?: number }) => error.status === 409)
      await save(locale, false, { sections: current.sections })
      assert.equal((await read(locale)).sections?.[0].sectionSpacing, spacing)
      assert.deepEqual(withoutSpacing(await read(locale)), withoutSpacing(current))
      for (const state of otherLocales) {
        assert.deepEqual(content(await read(state.other)), state.published)
        assert.deepEqual(content(await read(state.other, true)), state.draft)
      }
    }
    const current = await read('kh', true)
    await assert.rejects(() => save('kh', false, { sections: current.sections?.map(section => ({ ...section, sectionSpacing: 'p-96' })) }), /invalid|valid choice|following field/i)
    const versions = await cms.findVersions({ collection: 'services', where: { parent: { equals: service.id } }, pagination: false })
    assert.ok(versions.docs.length >= 12, 'Existing and new versions remain available')
    const otherTenant = await cms.db.create({ collection: 'tenants', data: { name: 'Other layout tenant', slug: 'other-layout' } })
    const outsider = { id: 2, collection: 'users', roles: ['editor'], tenants: [{ tenant: otherTenant.id }] } as never
    await assert.rejects(() => cms.update({ collection: 'services', id: service.id, locale: 'kh', user: outsider, overrideAccess: false, draft: true,
      data: { _status: 'draft', name: 'Cross-tenant text must not win', _editorialRevision: current._editorialRevision } }),
    (error: { status?: number }) => error.status === 403 || error.status === 404)
  } finally { await cms.destroy(); await rm(dir, { recursive: true, force: true }) }
})
