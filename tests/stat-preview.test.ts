import assert from 'node:assert/strict'
import { test } from 'node:test'
import { loadPayloadConfig } from './helpers/load-payload-config'

const config = loadPayloadConfig()

test('stat preview opens Clinical Results for clinical experience, in the selected language', async () => {
  const resolved = await config
  const url = resolved.admin.livePreview?.url
  assert.equal(typeof url, 'function')
  if (typeof url !== 'function') return
  const result = await url({ data: { key: 'clinical_experience' }, locale: { code: 'kh' }, collectionConfig: { slug: 'site-stats' } } as unknown as Parameters<typeof url>[0])
  const parsed = new URL(result!)
  assert.equal(parsed.searchParams.get('redirect') ?? parsed.pathname, '/kh/clinical-results')
})

test('stat preview opens facilities for building statistics and home for homepage statistics', async () => {
  const resolved = await config
  const url = resolved.admin.livePreview?.url
  assert.equal(typeof url, 'function')
  if (typeof url !== 'function') return
  for (const [key, expected] of [['building_storeys', '/cn/about/facilities'], ['years_experience', '/cn']] as const) {
    const result: string | null | undefined = await url({ data: { key }, locale: { code: 'cn' }, collectionConfig: { slug: 'site-stats' } } as unknown as Parameters<typeof url>[0])
    const parsed: URL = new URL(result!)
    assert.equal(parsed.searchParams.get('redirect') ?? parsed.pathname, expected)
  }
})

test('unknown and inherited object keys do not offer a misleading homepage preview', async () => {
  const resolved = await config
  const url = resolved.admin.livePreview?.url
  if (typeof url !== 'function') throw new Error('Missing preview function')
  for (const key of ['constructor', '__proto__', 'countries_served']) {
    assert.equal(await url({ data: { key }, locale: { code: 'en' }, collectionConfig: { slug: 'site-stats' } } as unknown as Parameters<typeof url>[0]), null)
  }
})
