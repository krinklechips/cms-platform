import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import type { Access, PayloadRequest } from 'payload'
import config from '../src/payload.config'

const previous = { site: process.env.DUMMY_SITE_URL, secret: process.env.PREVIEW_SECRET }
process.env.DUMMY_SITE_URL = 'https://preview.example.test'
delete process.env.PREVIEW_SECRET
after(() => {
  for (const [key, value] of [['DUMMY_SITE_URL', previous.site], ['PREVIEW_SECRET', previous.secret]] as const) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
})

async function preview(collection: string, data: Record<string, unknown> = {}, locale = 'en', req?: unknown) {
  const resolved = await config
  const url = resolved.admin.livePreview?.url
  assert.equal(typeof url, 'function')
  if (typeof url !== 'function') throw new Error('Missing live preview URL resolver')
  return url({ data, locale: { code: locale }, collectionConfig: { slug: collection }, req } as unknown as Parameters<typeof url>[0])
}

async function target(collection: string, data: Record<string, unknown>, locale: string, req?: unknown) {
  const result = await preview(collection, data, locale, req)
  if (!result) return null
  const url = new URL(result)
  assert.equal(url.origin, 'https://preview.example.test')
  return url.searchParams.get('redirect') ?? url.pathname
}

const routes: [string, Record<string, unknown>, string][] = [
  ['pages', { slug: 'welcome-to-roomchang' }, '/welcome-to-roomchang'],
  ['services', { slug: 'dental-implants' }, '/services/dental-implants'],
  ['technology', { slug: 'cad-cam' }, '/technology/cad-cam'],
  ['branches', { slug: 'bkk' }, '/about/branches/bkk'],
  ['clinical-cases', { slug: 'smile-restoration' }, '/clinical-results/smile-restoration'],
  ['news-articles', { slug: 'clinic-update' }, '/about/news/clinic-update'],
  ['community-articles', { slug: 'school-visit' }, '/about/community/school-visit'],
  ['career-positions', { slug: 'dental-assistant' }, '/about/careers/dental-assistant'],
  ['partners', {}, '/about/partnerships'],
  ['partner-categories', {}, '/about/partnerships'],
  ['faq-items', {}, '/blog/faq'],
  ['publications', {}, '/blog/publications'],
  ['videos', { category: 'dentist-talk' }, '/blog/dentist-talks'],
  ['pricing-comparison-sets', { slug: 'implants-comparison' }, '/pricing/implants-comparison'],
  ['pricing-comparison-sets', { slug: 'full-comparison' }, '/international/price-comparison'],
  ['pricing-comparison-rows', { set: { id: 12, slug: 'implants-comparison' } }, '/pricing/implants-comparison'],
  ['pricing-comparison-rows', { set: { id: 13, slug: 'full-comparison' } }, '/international/price-comparison'],
  ['doctors', {}, '/team'],
  ['homepage', {}, ''],
  ['feature-cards', {}, ''],
  ['brand-logos', {}, ''],
  ['testimonials', {}, ''],
  ['pricing-categories', {}, '/pricing'],
  ['pricing-items', {}, '/pricing'],
  ['international-treatments', {}, '/international'],
  ['international-steps', {}, '/international'],
  ['international-why-items', {}, '/international'],
  ['timeline-events', {}, '/about'],
  ['site-stats', { key: 'clinical_experience' }, '/clinical-results'],
]

test('all and only website-content editors share the default-open preview and publishing control', async () => {
  const resolved = await config
  assert.equal(resolved.admin.livePreview?.openByDefault, true)
  const expected = new Set(routes.map(([slug]) => slug))
  assert.equal(expected.size, 27)
  assert.deepEqual(new Set(resolved.admin.livePreview?.collections), expected)
  for (const collection of resolved.collections) {
    const controls = collection.admin?.components?.edit?.beforeDocumentControls ?? []
    if (expected.has(collection.slug)) {
      assert.ok(controls.includes('/components/PublishingStatus#PublishingStatus'), collection.slug)
    } else {
      assert.ok(!resolved.admin.livePreview?.collections?.includes(collection.slug), collection.slug)
    }
  }
})

test('videos without a connected page consumer do not offer a misleading Dentist Talks preview', async () => {
  for (const category of [undefined, '', 'testimonial', 'other']) {
    assert.equal(await preview('videos', { category }), null)
  }
})

for (const [collection, data, path] of routes) {
  test(`${collection} previews its actual page in every website locale (${path || 'home'})`, async () => {
    const resolved = await config
    assert.ok(resolved.admin.livePreview?.collections?.includes(collection), 'Preview must be enabled in the admin')
    for (const locale of ['en', 'kh', 'cn']) {
      assert.equal(await target(collection, data, locale), `/${locale}${path}`)
    }
  })
}

test('missing detail slugs use their listing, while a new custom page has no homepage preview', async () => {
  for (const [collection, path] of [
    ['services', '/services'], ['technology', '/technology'], ['branches', '/contact'],
    ['clinical-cases', '/clinical-results'], ['career-positions', '/about/careers'],
    ['news-articles', '/about/news'], ['community-articles', '/about/community'],
  ]) assert.equal(await target(collection, {}, 'kh'), `/kh${path}`)
  assert.equal(await preview('pages'), null)
})

test('imported branch identities use the website canonical route, not their derived CMS slug or translated name', async () => {
  for (const [sourceId, slug] of [
    ['fbc48bfa-9807-402f-aa7f-e0cf45d15272', 'sisowath-high-school'],
    ['7fcf8912-ccff-4add-8910-7c637e312473', 'rose-condo'],
    ['fa9eb854-e2e5-4086-b879-47d80d26200c', 'aeon-mall'],
    ['6da5da97-aec4-400b-a045-0df6311f78e3', 'ph-euro-park'],
    ['74b77631-3bd3-4bf4-bc0d-400bc4dab254', 'fun-mall'],
  ]) {
    for (const locale of ['en', 'kh', 'cn']) {
      assert.equal(await target('branches', { id: 42, sourceId, slug: 'imported-name-derived-slug', displayName: 'Localized name' }, locale), `/${locale}/about/branches/${slug}`)
    }
  }
  assert.equal(await target('branches', { id: 42, sourceId: 'new-branch-source-id' }, 'kh'), '/kh/about/branches/new-branch-source-id')
  assert.equal(await target('branches', { id: 42 }, 'cn'), '/cn/about/branches/42')
})

test('unknown collections and comparison sets never silently preview home or pricing', async () => {
  for (const collection of ['enquiries', 'booking-slots', 'unknown', 'constructor', '__proto__']) {
    assert.equal(await preview(collection), null)
  }
  for (const slug of ['', 'unknown', 'constructor', '__proto__']) {
    assert.equal(await preview('pricing-comparison-sets', { slug }), null)
    assert.equal(await preview('pricing-comparison-rows', { set: { slug } }), null)
  }
})

test('comparison row IDs resolve using the existing request with read access enforced', async () => {
  for (const [set, id] of [[12, 12], ['set-uuid', 'set-uuid'], [{ id: 12 }, 12]] as const) {
    const req = {
      user: { id: 7, roles: ['editor'], tenants: [{ tenant: 42 }] },
      payload: {
        findByID: async (args: Record<string, unknown>) => {
          assert.equal(args.collection, 'pricing-comparison-sets')
          assert.equal(args.id, id)
          assert.equal(args.overrideAccess, false)
          assert.equal(args.req, req)
          assert.equal(args.locale, 'kh')
          assert.equal(args.depth, 0)
          return { id, slug: 'full-comparison' }
        },
      },
    }
    assert.equal(await target('pricing-comparison-rows', { set }, 'kh', req), '/kh/international/price-comparison')
  }
})

test('populated comparison sets do not need another database read', async () => {
  const req = { payload: { findByID: async () => { assert.fail('Already have the set slug') } } }
  assert.equal(await target('pricing-comparison-rows', { set: { id: 12, slug: 'implants-comparison' } }, 'cn', req), '/cn/pricing/implants-comparison')
})

test('unresolved, inaccessible and deleted comparison sets offer no misleading preview', async () => {
  assert.equal(await preview('pricing-comparison-rows', {}), null)
  assert.equal(await preview('pricing-comparison-rows', { set: 12 }), null)
  for (const result of [null, { id: 12, slug: 'unsupported' }]) {
    const req = { payload: { findByID: async () => result } }
    assert.equal(await preview('pricing-comparison-rows', { set: 12 }, 'en', req), null)
  }
  const req = { payload: { findByID: async () => { throw new Error('Read denied') } } }
  assert.equal(await preview('pricing-comparison-rows', { set: 12 }, 'en', req), null)
})

test('preview URLs encode the draft redirect and retain the selected locale', async () => {
  process.env.PREVIEW_SECRET = 'synthetic-preview-fixture-only &?'
  try {
    const result = await preview('technology', { slug: 'cad-cam' }, 'cn')
    assert.ok(result)
    const url = new URL(result)
    assert.equal(url.pathname, '/api/preview')
    assert.equal(url.searchParams.get('redirect'), '/cn/technology/cad-cam')
    assert.equal(url.searchParams.get('secret'), process.env.PREVIEW_SECRET)
  } finally {
    delete process.env.PREVIEW_SECRET
  }
})

test('a trailing slash on the preview site URL does not create a double-slash route', async () => {
  process.env.DUMMY_SITE_URL = 'https://preview.example.test/'
  try {
    assert.equal(await target('services', { slug: 'dental-implants' }, 'kh'), '/kh/services/dental-implants')
  } finally {
    process.env.DUMMY_SITE_URL = 'https://preview.example.test'
  }
})

test('detail slugs cannot inject a query, fragment or extra path into the preview destination', async () => {
  assert.equal(await target('services', { slug: 'implant/a?b#c' }, 'en'), '/en/services/implant%2Fa%3Fb%23c')
  assert.equal(await target('services', { slug: 'implant' }, ''), '/en/services/implant')
})

for (const slug of ['enquiries', 'booking-slots']) {
  test(`${slug} is private and cannot be mutated through normal CMS access`, async () => {
    const collection = (await config).collections.find((entry) => entry.slug === slug)
    assert.ok(collection)
    for (const operation of ['create', 'update', 'delete'] as const) {
      const access: Access | undefined = collection.access[operation]
      assert.ok(access)
      for (const user of [null, { id: 7, roles: ['editor'] }, { id: 8, roles: ['super-admin'] }]) {
        const req = {
          user,
          context: { gatingTenant: { enabledCollections: [slug] } },
        } as unknown as PayloadRequest
        assert.equal(await access({ req }), false, `${slug}.${operation} must deny ordinary API writes`)
      }
    }
    const read = collection.access.read
    assert.ok(read)
    assert.equal(await read({ req: { user: null } as PayloadRequest }), false)
    assert.notEqual(await read({ req: { user: { id: 7, roles: ['editor'] } } as PayloadRequest }), false)
  })
}
