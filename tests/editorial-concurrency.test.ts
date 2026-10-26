import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { fieldSchemasToFormState } from '@payloadcms/ui/forms/fieldSchemasToFormState'
import { buildConfig, createLocalReq, getPayload, type CollectionConfig } from 'payload'
import { reduceFieldsToValues } from 'payload/shared'
import { withDrafts } from '../src/lib/with-drafts'
import { withEditorialConcurrency } from '../src/lib/with-editorial-concurrency'

test('protected draft collections disable bulk writes without replacing their admin settings', () => {
  const config: CollectionConfig = { slug: 'pages', fields: [], versions: { drafts: true },
    disableBulkEdit: false, admin: { group: 'Website', defaultColumns: ['title'] } }
  const protectedConfig = withEditorialConcurrency(config)
  assert.equal(protectedConfig.disableBulkEdit, true)
  assert.equal(protectedConfig.admin?.group, 'Website')
  assert.deepEqual(protectedConfig.admin?.defaultColumns, ['title'])
  assert.equal(config.disableBulkEdit, false)
})

test('protected media disables bulk writes while retaining native Bulk Upload', () => {
  const config: CollectionConfig = { slug: 'media', fields: [], upload: { bulkUpload: true, crop: false },
    admin: { components: { beforeListTable: ['/components/MediaFolders#MediaFolderBrowser'] } } }
  const protectedConfig = withEditorialConcurrency(config)
  assert.equal(protectedConfig.disableBulkEdit, true)
  assert.deepEqual(protectedConfig.upload, { bulkUpload: true, crop: false })
  assert.deepEqual(protectedConfig.admin?.components, config.admin?.components)
})

test('unprotected collections retain their existing bulk-action settings', () => {
  for (const versions of [undefined, { drafts: false }, true]) {
    const config: CollectionConfig = { slug: 'tenants', fields: [], versions, disableBulkEdit: false }
    assert.equal(withEditorialConcurrency(config), config)
  }
})

test('real staff share localized revisions and stale writes cannot replace a newer saved draft', { timeout: 120000 }, async t => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cms-editorial-concurrency-'))
  const payload = await getPayload({ key: randomUUID(), config: buildConfig({
    secret: 'isolated-editorial-concurrency-only', telemetry: false, typescript: { autoGenerate: false },
    db: sqliteAdapter({ client: { url: `file:${path.join(dir, 'fixture.db')}` } }),
    localization: { locales: ['en', 'kh', 'cn'], defaultLocale: 'en', fallback: true },
    collections: [
      { slug: 'users', auth: true, fields: [{ name: 'name', type: 'text' }] },
      { slug: 'tenants', fields: [{ name: 'name', type: 'text' }] },
      withEditorialConcurrency(withDrafts({ slug: 'pages',
        access: { read: ({ req }) => Boolean(req.user), update: ({ req }) => Boolean(req.user) },
        fields: [{ name: 'tenant', type: 'relationship', relationTo: 'tenants' },
          { name: 'title', type: 'text', localized: true },
          { name: 'shared', type: 'text' },
          { name: 'rows', type: 'array', localized: true, fields: [{ name: 'text', type: 'text' }] }],
      })),
    ],
  }) })
  try {
    const a = { ...await payload.create({ collection: 'users', data: { name: 'Owner', email: 'owner@example.invalid', password: 'isolated-test-password-123' } as never }), collection: 'users' as const }
    const b = { ...await payload.create({ collection: 'users', data: { name: 'Borin fixture', email: 'borin@example.invalid', password: 'isolated-test-password-456' } as never }), collection: 'users' as const }
    const tenant = await payload.create({ collection: 'tenants', data: { name: 'Fixture' } as never })
    const seed = async () => {
      const page = await payload.create({ collection: 'pages', locale: 'en',
        data: { tenant: tenant.id, shared: 'Shared original', title: 'EN original', rows: [{ text: 'EN row' }], _status: 'published' } as never })
      for (const locale of ['kh', 'cn'] as const) await payload.update({ collection: 'pages', id: page.id, locale,
        publishSpecificLocale: locale, publishAllLocales: false,
        data: { title: `${locale.toUpperCase()} original`, rows: [{ text: `${locale.toUpperCase()} row` }], _status: 'published' } as never })
      return page
    }
    const read = (id: number | string, locale: 'en' | 'kh' | 'cn', user = a, draft = true, depth = 0) => payload.findByID({
      collection: 'pages', id, locale, fallbackLocale: false, depth, draft, user, overrideAccess: false }) as Promise<any>
    const write = (doc: any, locale: 'en' | 'kh' | 'cn', title: string, user = a, draft = true) => payload.update({
      collection: 'pages', id: doc.id, locale, draft, user, overrideAccess: false,
      data: { title, _editorialRevision: doc._editorialRevision, _status: draft ? 'draft' : 'published' } as never }) as Promise<any>

    await t.test('all three languages give both accounts the same saved content and usable hidden revision', async () => {
      const page = await seed()
      for (const locale of ['en', 'kh', 'cn'] as const) {
        const owner = await read(page.id, locale)
        const borin = await read(page.id, locale, b)
        assert.match(owner._editorialRevision ?? '', /^sha256:[a-f0-9]{64}$/)
        assert.equal(owner._editorialRevision, borin._editorialRevision)
        assert.equal(owner.title, borin.title)
        const req = await createLocalReq({ locale, fallbackLocale: false, user: a }, payload)
        const state = await fieldSchemasToFormState({ collectionSlug: 'pages', schemaPath: 'pages', data: owner,
          fields: payload.collections.pages.config.fields, fieldSchemaMap: undefined, operation: 'update', permissions: {},
          preferences: { fields: {} }, req, renderAllFields: false, skipValidation: true })
        assert.equal(reduceFieldsToValues(state, true)._editorialRevision, owner._editorialRevision)
        const saved = await write(owner, locale, `${locale} owner saved`)
        assert.equal((await read(page.id, locale, b)).title, `${locale} owner saved`)
        assert.equal(saved._editorialRevision, (await read(page.id, locale))._editorialRevision)
      }
    })

    await t.test('rejects stale revisions and missing preconditions without appending or replacing versions', async () => {
      const page = await seed()
      const firstTab = await read(page.id, 'en')
      const secondTab = await read(page.id, 'en', b)
      const newer = await write(secondTab, 'en', 'Borin newer draft', b)
      const history = () => payload.findVersions({ collection: 'pages', where: { parent: { equals: page.id } }, locale: 'all', pagination: false })
      const before = await history()
      await assert.rejects(() => write(firstTab, 'en', 'Owner stale draft'), (error: any) => error.status === 409)
      await assert.rejects(() => payload.update({ collection: 'pages', id: page.id, locale: 'en', draft: true,
        user: a, overrideAccess: false, data: { title: 'Unconditional overwrite' } as never }), (error: any) => error.status === 428)
      assert.equal((await read(page.id, 'en')).title, 'Borin newer draft')
      assert.deepEqual((await history()).docs, before.docs)
      await write(newer, 'en', 'Borin next draft', b)
      assert.equal((await read(page.id, 'en')).title, 'Borin next draft')
    })

    await t.test('bulk updates stay rejected even with a valid single-document revision', async () => {
      const page = await seed()
      const opened = await read(page.id, 'en')
      const versions = await payload.findVersions({ collection: 'pages', where: { parent: { equals: page.id } }, pagination: false })
      const bulkUpdate = (overrideAccess: boolean) => payload.update({ collection: 'pages', where: { id: { in: [page.id] } },
        locale: 'en', draft: true, user: a, overrideAccess,
        data: { title: 'Bulk overwrite', _status: 'draft', _editorialRevision: opened._editorialRevision } as never })
      await assert.rejects(() => bulkUpdate(false), (error: any) => error.status === 403 && /disabled bulk edit/.test(error.message))
      await assert.rejects(() => bulkUpdate(true), (error: any) => error.status === 400 && /one document ID/.test(error.message))
      assert.equal((await read(page.id, 'en')).title, 'EN original')
      assert.deepEqual((await payload.findVersions({ collection: 'pages', where: { parent: { equals: page.id } }, pagination: false })).docs, versions.docs)
    })

    await t.test('stale or missing delete preconditions cannot erase another account draft or its versions', async () => {
      for (const locale of ['en', 'kh', 'cn'] as const) {
        const page = await seed()
        const opened = await read(page.id, locale)
        const otherLocale = locale === 'en' ? 'kh' : 'en'
        await write(await read(page.id, otherLocale, b), otherLocale, 'Borin newer draft before deletion', b)
        const history = () => payload.findVersions({ collection: 'pages', where: { parent: { equals: page.id } }, locale: 'all', pagination: false })
        const before = await history()
        const remove = async (revision?: string) => {
          const req = await createLocalReq({ locale, fallbackLocale: false, user: a }, payload)
          if (revision) req.headers.set('if-match', revision)
          return payload.delete({ collection: 'pages', id: page.id, locale, req, user: a, overrideAccess: false })
        }
        const hasStatus = (status: number) => (error: unknown) => error instanceof Error && 'status' in error && error.status === status
        await assert.rejects(() => remove(opened._editorialRevision), hasStatus(409))
        await assert.rejects(() => remove(), hasStatus(428))
        assert.equal((await read(page.id, otherLocale, b)).title, 'Borin newer draft before deletion')
        assert.equal((await read(page.id, otherLocale, b, false)).title, `${otherLocale.toUpperCase()} original`)
        assert.deepEqual((await history()).docs, before.docs)
        // Deliberate deletion is still available, but only after reopening the current record.
        await remove((await read(page.id, locale))._editorialRevision)
        await assert.rejects(() => read(page.id, locale), hasStatus(404))
      }
    })

    await t.test('a publish without a locale option publishes only the selected language and retains other drafts', async () => {
      const page = await seed()
      for (const locale of ['kh', 'cn'] as const) await write(await read(page.id, locale), locale, `${locale} private pending`)
      await write(await read(page.id, 'en'), 'en', 'EN published', a, false)
      assert.equal((await read(page.id, 'en', b, false)).title, 'EN published')
      for (const locale of ['kh', 'cn'] as const) {
        assert.equal((await read(page.id, locale, b, false)).title, `${locale.toUpperCase()} original`)
        assert.equal((await read(page.id, locale, b)).title, `${locale} private pending`)
      }
      const ownResponse = await write(await read(page.id, 'en'), 'en', 'EN published again', a, false)
      assert.equal(ownResponse._editorialRevision, (await read(page.id, 'en'))._editorialRevision)
      await write(ownResponse, 'en', 'EN next draft')
    })

    await t.test('normalized relationships do not make an unchanged populated editor stale', async () => {
      const page = await seed()
      const populated = await read(page.id, 'cn', a, true, 1)
      assert.equal(populated._editorialRevision, (await read(page.id, 'cn'))._editorialRevision)
      await write(populated, 'cn', 'CN accepted populated editor')
    })

    await t.test('equal clocks cannot hide another language save from an all-language publish precondition', async () => {
      t.mock.timers.enable({ apis: ['Date'], now: new Date('2030-01-01T00:00:00Z') })
      try {
        const page = await seed()
        const openedEnglish = await read(page.id, 'en')
        await write(await read(page.id, 'kh', b), 'kh', 'KH saved while EN editor was open', b)
        await assert.rejects(() => payload.update({ collection: 'pages', id: page.id, locale: 'en',
          publishAllLocales: true, user: a, overrideAccess: false,
          data: { title: openedEnglish.title, _status: 'published', _editorialRevision: openedEnglish._editorialRevision } as never }),
          (error: any) => error.status === 409)
        assert.equal((await read(page.id, 'kh', b, false)).title, 'KH original')
      } finally { t.mock.timers.reset() }
    })

    await t.test('version restore needs the revision seen when opening history and keeps the other languages', async () => {
      const page = await seed()
      const version = (await payload.findVersions({ collection: 'pages',
        where: { parent: { equals: page.id } }, sort: 'createdAt', limit: 1 })).docs[0]
      const opened = await read(page.id, 'en')
      await write(await read(page.id, 'cn', b), 'cn', 'CN pending while history was open', b)
      const history = () => payload.findVersions({ collection: 'pages', where: { parent: { equals: page.id } }, locale: 'all', pagination: false })
      const before = await history()
      const restore = async (revision?: string) => {
        const req = await createLocalReq({ locale: 'en', fallbackLocale: false, user: a }, payload)
        req.query = { ...req.query, locale: 'en' }
        if (revision) req.headers.set('if-match', revision)
        return payload.restoreVersion({ collection: 'pages', id: version.id, req, user: a, overrideAccess: false })
      }
      await assert.rejects(() => restore(), (error: any) => error.status === 428)
      await assert.rejects(() => restore(opened._editorialRevision), (error: any) => error.status === 409)
      assert.deepEqual((await history()).docs, before.docs)
      const current = await read(page.id, 'en')
      await restore(current._editorialRevision)
      assert.equal((await read(page.id, 'cn', b)).title, 'CN pending while history was open')
      assert.equal((await read(page.id, 'cn', b, false)).title, 'CN original')
      assert.equal((await read(page.id, 'kh', b)).title, 'KH original')
      assert.equal((await read(page.id, 'en'))._status, 'draft')
    })

    await t.test('frozen-clock locale publishing retains the later snapshot and other private drafts', async () => {
      t.mock.timers.enable({ apis: ['Date'], now: new Date('2031-01-01T00:00:00Z') })
      try {
        const page = await seed()
        await write(await read(page.id, 'kh'), 'kh', 'KH private stays private')
        await write(await read(page.id, 'cn'), 'cn', 'CN private stays private')
        const response = await write(await read(page.id, 'en'), 'en', 'EN published on frozen clock', a, false)
        assert.equal((await read(page.id, 'kh')).title, 'KH private stays private')
        assert.equal((await read(page.id, 'cn')).title, 'CN private stays private')
        assert.equal((await read(page.id, 'kh', a, false)).title, 'KH original')
        assert.equal(response._editorialRevision, (await read(page.id, 'en'))._editorialRevision)
        await write(response, 'en', 'EN next on frozen clock')
      } finally { t.mock.timers.reset() }
    })

    await t.test('published status with draft=true cannot publish the other pending languages', async () => {
      const page = await seed()
      await write(await read(page.id, 'kh'), 'kh', 'KH private')
      const en = await read(page.id, 'en')
      await payload.update({ collection: 'pages', id: page.id, locale: 'en', draft: true, user: a, overrideAccess: false,
        data: { title: 'EN intended publish', _status: 'published', _editorialRevision: en._editorialRevision } as never })
      assert.equal((await read(page.id, 'en', a, false)).title, 'EN intended publish')
      assert.equal((await read(page.id, 'kh', a, false)).title, 'KH original')
      assert.equal((await read(page.id, 'kh')).title, 'KH private')
    })

    await t.test('conflicting publish language is rejected before switching request locale', async () => {
      const page = await seed()
      const en = await read(page.id, 'en')
      await assert.rejects(() => payload.update({ collection: 'pages', id: page.id, locale: 'en', publishSpecificLocale: 'cn',
        user: a, overrideAccess: false, data: { title: 'Wrong language', _status: 'published', _editorialRevision: en._editorialRevision } as never }),
        (error: any) => error.status === 400)
    })

    await t.test('an ambiguous versioned write cannot implicitly publish or unpublish pending translations', async () => {
      const page = await seed()
      await write(await read(page.id, 'kh'), 'kh', 'KH private')
      const en = await read(page.id, 'en')
      await assert.rejects(() => payload.update({ collection: 'pages', id: page.id, locale: 'en',
        user: a, overrideAccess: false, data: { title: 'Ambiguous update', _editorialRevision: en._editorialRevision } as never }),
        (error: any) => error.status === 400)
      assert.equal((await read(page.id, 'kh', a, false)).title, 'KH original')
      assert.equal((await read(page.id, 'kh')).title, 'KH private')
    })

    await t.test('fallback and projected responses refer to the actual saved revision, not their presentation', async () => {
      const page = await payload.create({ collection: 'pages', locale: 'en', data: { title: 'Fallback English', tenant: tenant.id, _status: 'published' } as never })
      const expanded = await payload.findByID({ collection: 'pages', id: page.id, locale: 'cn', fallbackLocale: 'en', draft: true, user: a }) as any
      assert.equal(expanded.title, 'Fallback English')
      await write(expanded, 'cn', 'CN translated from fallback')
      const projected = await payload.findByID({ collection: 'pages', id: page.id, locale: 'en', draft: true, user: a,
        select: { title: true } as never }) as any
      assert.ok(projected._editorialRevision)
      await write(projected, 'en', 'EN saved from projection')
    })
  } finally { await payload.destroy(); await rm(dir, { recursive: true, force: true }) }
})
