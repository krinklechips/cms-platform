import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { fieldSchemasToFormState } from '@payloadcms/ui/forms/fieldSchemasToFormState'
import { buildConfig, createLocalReq, getPayload, type PayloadRequest } from 'payload'
import { reduceFieldsToValues } from 'payload/shared'
import { serializeEditorialUpdate } from '../src/lib/editorial-lock'
import { prepareLocaleRestore } from '../src/lib/locale-restore'
import { withDrafts } from '../src/lib/with-drafts'

type Locale = 'en' | 'kh' | 'cn'
type Localized<T> = Record<Locale, T>
type Page = {
  id: number
  title: string
  seoTitle: string | null
  seoDescription: string | null
  details: { caption: string | null }
  tenant: string
  rank: number
}
type RawPage = Omit<Page, 'title' | 'seoTitle' | 'seoDescription' | 'details'> & {
  title: Localized<string>
  seoTitle: Localized<string | null>
  seoDescription: Localized<string | null>
  details: { caption: Localized<string | null> }
}

test('editorial write responses keep raw locale values through native SQLite saves and publishes', { timeout: 120000 }, async t => {
  // Never import the application config or .env: every record belongs to this disposable database.
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cms-editorial-write-fallback-'))
  const originals: { locale: string | undefined; doc: Record<string, unknown> }[] = []
  const pages = withDrafts({
    slug: 'pages',
    access: { read: () => true },
    hooks: { beforeChange: [({ operation, originalDoc, req }) => {
      if (operation === 'update') originals.push({ locale: req.locale, doc: structuredClone(originalDoc) })
    }] },
    fields: [
      { name: 'tenant', type: 'text' },
      { name: 'rank', type: 'number' },
      { name: 'title', type: 'text', localized: true },
      { type: 'tabs', tabs: [
        { label: 'Content', fields: [{ name: 'details', type: 'group', fields: [
          { name: 'caption', type: 'text', localized: true },
        ] }] },
        { label: 'SEO', fields: [
          { name: 'seoTitle', type: 'text', localized: true },
          { name: 'seoDescription', type: 'textarea', localized: true },
        ] },
      ] },
    ],
  })
  const payload = await getPayload({ key: randomUUID(), config: buildConfig({
    secret: 'isolated-editorial-write-fallback-fixture-only', telemetry: false,
    typescript: { autoGenerate: false },
    db: sqliteAdapter({ client: { url: `file:${path.join(dir, 'fixture.db')}` } }),
    localization: { locales: ['en', 'kh', 'cn'], defaultLocale: 'en', fallback: true },
    collections: [pages],
  }) })
  const raw = async (id: number, draft = false) => await payload.findByID({
    collection: 'pages', id, locale: 'all', fallbackLocale: false, depth: 0, draft,
  }) as unknown as RawPage
  const read = async (id: number, locale: Locale, draft = false) => await payload.findByID({
    collection: 'pages', id, locale, fallbackLocale: false, depth: 0, draft,
  }) as unknown as Page
  const write = async (id: number, locale: Locale, data: Record<string, unknown>, draft: boolean, fallbackLocale?: false | 'en') =>
    await payload.update({ collection: 'pages', id, locale, depth: 0, draft, fallbackLocale,
      publishSpecificLocale: draft ? undefined : locale, publishAllLocales: false,
      data: { ...data, _status: draft ? 'draft' : 'published' } as never,
    }) as unknown as Page
  // Payload supports all-locale creates at runtime, outside this app's generated create-locale type.
  const seed = async () => await payload.create({ collection: 'pages', locale: 'all' as never, depth: 0,
    data: { tenant: 'fixture-tenant', rank: 7, _status: 'published',
      title: { en: 'Published English', kh: 'Published Khmer', cn: 'Published Chinese' },
      seoTitle: { en: 'English SEO', kh: null, cn: null },
      seoDescription: { en: 'English description', kh: null, cn: null },
      details: { caption: { en: 'English caption', kh: null, cn: null } },
    } as never,
  }) as unknown as RawPage
  const history = async (id: number) => (await payload.findVersions({ collection: 'pages',
    where: { parent: { equals: id } }, locale: 'all', fallbackLocale: false, depth: 0, pagination: false,
  })).docs
  const formData = async (doc: Page, locale: Locale) => reduceFieldsToValues(await fieldSchemasToFormState({
    collectionSlug: 'pages', schemaPath: 'pages', data: structuredClone(doc),
    fields: payload.collections.pages.config.fields, fieldSchemaMap: undefined,
    operation: 'update', permissions: {}, preferences: { fields: {} },
    req: await createLocalReq({ locale, fallbackLocale: false }, payload),
    renderAllFields: false, skipValidation: true,
  }), true)
  const assertRaw = (doc: Page, expected: string | null = null) => {
    assert.equal(doc.seoTitle, expected, 'Write responses must not replace the active locale with English')
    assert.equal(doc.seoDescription, null, 'Untouched textarea must stay raw')
    assert.equal(doc.details.caption, null, 'Untouched nested localized fields must stay raw')
    assert.equal(doc.tenant, 'fixture-tenant')
    assert.equal(doc.rank, 7)
  }
  try {
    for (const locale of ['kh', 'cn'] as const) {
      for (const draft of [true, false]) {
        await t.test(`${locale} ${draft ? 'draft' : 'published'} update returns raw fields even with explicit English fallback`, async () => {
          const page = await seed()
          assertRaw(await write(page.id, locale, { title: 'Title only' }, draft, 'en'))
          assert.equal((await raw(page.id, draft)).seoTitle[locale], null)
          const original = originals.at(-1)!
          assert.equal(original.locale, locale)
          assert.equal(original.doc.seoTitle, null, 'The beforeChange original document remains raw')
          assert.equal((await raw(page.id, draft)).seoTitle.en, 'English SEO')
        })

        await t.test(`${locale} ${draft ? 'draft' : 'published'} create returns raw fields when duplicating an English-populated document`, async () => {
          const source = await seed()
          const before = await raw(source.id)
          const created = await payload.create({ collection: 'pages', locale, draft, depth: 0,
            duplicateFromID: source.id, data: { title: 'New localized page', seoTitle: null,
              _status: draft ? 'draft' : 'published' } as never,
          }) as unknown as Page
          assertRaw(created)
          const stored = await raw(created.id, draft)
          assert.equal(stored.seoTitle.en, 'English SEO', 'Create must retain the other locale, not erase fallback content')
          assert.equal(stored.seoTitle[locale], null)
          assert.deepEqual(await raw(source.id), before, 'Duplication must not change its source')
          const fresh = await payload.create({ collection: 'pages', locale, draft, depth: 0,
            data: { tenant: 'fixture-tenant', rank: 7, title: 'Brand new page', seoTitle: null,
              seoDescription: null, details: { caption: null }, _status: draft ? 'draft' : 'published' } as never,
          }) as unknown as Page
          assertRaw(fresh)
        })
      }

      for (const [name, steps] of [
        ['two consecutive draft saves', [true, true]],
        ['draft, unchanged publish, then direct unsaved publish', [true, false, false]],
        ['two consecutive direct unsaved publishes', [false, false]],
      ] as const) {
        await t.test(`${locale}: ${name} reuse response form data without promoting fallback or other locale drafts`, async () => {
          const page = await seed()
          const others = (['en', 'kh', 'cn'] as const).filter(code => code !== locale)
          for (const other of others) await write(page.id, other, { title: `${other} pending draft` }, true, false)
          const published = await raw(page.id)
          const pending = await raw(page.id, true)
          const versions = await history(page.id)
          let data = await formData(await read(page.id, locale, true), locale)
          for (const [index, draft] of steps.entries()) {
            // The middle publish is unchanged; the final direct publish restores only the title.
            const title = index === 0 ? `${locale} UI-CHECK` : steps.length === 3 && index === 1
              ? `${locale} UI-CHECK` : published.title[locale]
            const saved = await write(page.id, locale, { ...data, title }, draft,
              steps.length === 3 && draft ? false : undefined)
            const current = await raw(page.id, true)
            assert.equal(current.seoTitle[locale], null, 'A later submit must not persist a prior response fallback')
            assert.deepEqual(current.seoTitle, pending.seoTitle)
            assert.deepEqual(current.seoDescription, pending.seoDescription)
            assert.deepEqual(current.details, pending.details)
            assert.equal(current.tenant, pending.tenant)
            assert.equal(current.rank, pending.rank)
            const live = await raw(page.id)
            assert.deepEqual(live.seoTitle, published.seoTitle)
            assert.deepEqual(live.seoDescription, published.seoDescription)
            assert.deepEqual(live.details, published.details)
            assert.equal(live.title[locale], draft ? published.title[locale] : title)
            for (const other of others) {
              assert.equal(live.title[other], published.title[other], 'Do not publish another locale draft')
              assert.equal(current.title[other], pending.title[other], 'Do not discard another locale draft')
            }
            data = await formData(saved, locale)
          }
          assert.equal(data.seoTitle, null, 'The final form must also remain safe for another save')
          const after = await history(page.id)
          for (const old of versions) assert.deepEqual(after.find(version => version.id === old.id)?.version, old.version,
            'Never rewrite an existing draft or published version')
        })
      }

      for (const draft of [true, false]) {
        await t.test(`${locale} ${draft ? 'draft' : 'published'} writes retain deliberate English-equal translations and explicit clears`, async () => {
          const page = await seed()
          let saved = await write(page.id, locale, { seoTitle: 'English SEO' }, draft)
          assertRaw(saved, 'English SEO')
          saved = await write(page.id, locale, { ...await formData(saved, locale), title: 'Title only' }, draft)
          assertRaw(saved, 'English SEO')
          assert.equal((await raw(page.id, draft)).seoTitle[locale], 'English SEO')
          for (const clear of [null, '']) {
            saved = await write(page.id, locale, { seoTitle: clear }, draft)
            assertRaw(saved, clear)
            saved = await write(page.id, locale, { ...await formData(saved, locale), title: 'After clear' }, draft)
            assertRaw(saved, clear)
            assert.equal((await raw(page.id, draft)).seoTitle[locale], clear)
            assert.equal((await raw(page.id, draft)).seoTitle.en, 'English SEO')
          }
        })
      }

      await t.test(`${locale} public reads still fall back to English after writes; raw GET remains raw`, async () => {
        const page = await seed()
        await write(page.id, locale, { title: 'Published title only' }, false)
        await write(page.id, locale, { title: 'Private draft title' }, true)
        const versions = await history(page.id)
        for (const draft of [false, true]) {
          const doc = await payload.findByID({ collection: 'pages', id: page.id, locale, depth: 0, draft,
            overrideAccess: false }) as unknown as Page
          assert.equal(doc.seoTitle, 'English SEO')
          assert.equal(doc.seoDescription, 'English description')
          assert.equal(doc.details.caption, 'English caption')
          assertRaw(await read(page.id, locale, draft))
        }
        assert.deepEqual(await history(page.id), versions, 'Fallback reads cannot rewrite version content')
        assert.equal((await raw(page.id)).seoTitle[locale], null)
      })
    }
  } finally {
    await payload.destroy()
    await rm(dir, { recursive: true, force: true })
  }
})

test('withDrafts preserves hook ordering and afterRead identity, and limits raw responses to single-locale writes', async () => {
  const existing = () => undefined
  const afterRead = ({ doc }: { doc: Record<string, unknown> }) => doc
  const config = withDrafts({ slug: 'pages', fields: [], hooks: { beforeOperation: [existing], afterRead: [afterRead] } })
  const hooks = config.hooks!.beforeOperation!
  assert.equal(hooks[0], serializeEditorialUpdate)
  assert.ok(hooks.indexOf(existing) < hooks.indexOf(prepareLocaleRestore))
  assert.deepEqual(config.hooks!.afterRead, [afterRead], 'Do not flatten or clean up documents in afterRead')
  for (const operation of ['create', 'update', 'read', 'delete'] as const) {
    for (const locale of ['en', 'kh', 'cn', 'all']) {
      const req = { locale, fallbackLocale: 'en', context: {}, query: { locale },
        payload: { db: { name: 'sqlite' }, config: { localization: { localeCodes: ['en', 'kh', 'cn'] } } },
      } as unknown as PayloadRequest
      const data = { seoTitle: null }
      const args = { req, data }
      for (const hook of hooks) await hook({ args, collection: config, operation, req, context: req.context } as unknown as Parameters<typeof hook>[0])
      assert.equal(req.fallbackLocale, (operation === 'create' || operation === 'update') && locale !== 'all' ? false : 'en')
      assert.deepEqual(data, { seoTitle: null })
      assert.deepEqual(req.query, { locale })
    }
  }
})
