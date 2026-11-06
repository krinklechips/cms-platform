import assert from 'node:assert/strict'
import { test } from 'node:test'
import { loadPayloadConfig } from './helpers/load-payload-config'
import { withModuleGating } from '../src/lib/module-gating'
import type { Field } from 'payload'

const keys = ['eyebrow', 'heading', 'seeAll', 'implants', 'crowns', 'aligners', 'cosmetic', 'whitening', 'surgery']

test('Services Section has its own localized, versioned tenant document, not fields on the hero', async () => {
  const config = await loadPayloadConfig()
  const section = config.collections.find(c => c.slug === 'home-services')
  assert.ok(section, 'The homepage Services Section needs an editor')
  assert.equal(section.admin.group, 'Home Page')
  assert.equal(section.labels.plural, 'Services Section')
  assert.ok(section.versions?.drafts)
  assert.equal(section.versions.maxPerDoc, 100)
  assert.ok(section.indexes?.some(index => index.unique && index.fields.join() === 'tenant'))
  for (const key of keys) {
    const field: Field | undefined = section.fields.find(f => 'name' in f && f.name === key)
    assert.ok(field, key)
    assert.equal(field.type, 'text')
    assert.equal(field.localized, true)
  }
  assert.ok(section.fields.some(f => 'name' in f && f.name === '_editorialRevision'))
  assert.ok(!config.collections.find(c => c.slug === 'homepage')!.fields.some(f => 'name' in f && keys.includes(f.name) && f.name !== 'eyebrow'))
})

test('the existing Homepage entitlement permits Services Section without changing stored tenant settings', async () => {
  const section = withModuleGating({ slug: 'home-services', fields: [] })
  const tenant = { id: 1, enabledCollections: ['homepage'] }
  const user = { id: 7, roles: ['editor'], tenants: [{ tenant }] }
  const hidden = section.admin!.hidden
  assert.equal(typeof hidden, 'function')
  if (typeof hidden !== 'function') throw new Error('Expected an entitlement visibility function')
  assert.equal(hidden({ user } as never), false)
  const req = { user, context: {}, payload: { findByID: async () => tenant } }
  assert.notEqual(await section.access!.create!({ req, data: { tenant: 1 } } as never), false)
  assert.deepEqual(tenant.enabledCollections, ['homepage'])
  const denied = { ...req, context: {}, payload: { findByID: async () => ({ id: 1, enabledCollections: [] }) } }
  assert.equal(await section.access!.create!({ req: denied, data: { tenant: 1 } } as never), false)
})

test('all three Services Section previews select the homepage and its services anchor', async () => {
  const config = await loadPayloadConfig()
  const resolve = config.admin.livePreview!.url
  assert.equal(typeof resolve, 'function')
  if (typeof resolve !== 'function') return
  const old = process.env.DUMMY_SITE_TENANT_ID
  process.env.DUMMY_SITE_TENANT_ID = '1'
  try {
    for (const locale of ['en', 'kh', 'cn']) {
      const result: string | null | undefined = await resolve({ data: { id: 1 }, locale: { code: locale }, collectionConfig: { slug: 'home-services' }, req: {
        user: { roles: ['editor'], tenants: [{ tenant: 1 }] }, context: {},
        payload: { findByID: async () => ({ id: 1, tenant: 1 }) },
      } } as never)
      assert.ok(result)
      const url: URL = new URL(result)
      assert.equal(url.searchParams.get('redirect') || url.pathname + url.hash, `/${locale}#services`)
    }
  } finally {
    if (old === undefined) delete process.env.DUMMY_SITE_TENANT_ID
    else process.env.DUMMY_SITE_TENANT_ID = old
  }
})
