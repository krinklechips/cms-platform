import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { Field, FieldHook } from 'payload'
import { withMediaValidation } from '../src/lib/with-media-validation'

const r2 = 'https://pub-2b835c19d8644293b271deaeb97352b1.r2.dev'
const req = { locale: 'en', context: {}, payload: { findByID: async () => ({ id: 1, slug: 'roomchang' }) } }
const schemas = {
  branches: { slug: 'branches', fields: [{ name: 'photos', type: 'json' }] },
  videos: { slug: 'videos', fields: [{ name: 'thumbnail', type: 'text' }] },
} as const
async function guard(slug: keyof typeof schemas, value: unknown, previousValue?: unknown) {
  const config = withMediaValidation(schemas[slug] as never)
  const field = config.fields[0] as Field & { hooks?: { beforeChange?: FieldHook[] } }
  assert.ok(field.hooks?.beforeChange?.length, 'New public media surfaces need changed-value guards before drafts and publication')
  let result = value
  for (const hook of field.hooks.beforeChange) result = await hook({
    value: result, previousValue, operation: 'update', req, data: { tenant: 1 }, originalDoc: { id: 1, tenant: 1 },
    field, path: [slug === 'branches' ? 'photos' : 'thumbnail'],
  } as never)
  return result
}

test('branch gallery accepts its supported persisted shapes without rewriting metadata', async () => {
  const value = [`${r2}/one.png`, { src: '/two.png', alt: 'Supplied alt', caption: 'Supplied caption', extra: { original: true } }, { url: 'https://roomchang.com/three.png' }]
  const before = structuredClone(value)
  assert.equal(await guard('branches', value), value)
  assert.deepEqual(value, before)
  assert.deepEqual(await guard('branches', []), [])
})
test('branch photos reject unsupported changed JSON and foreign/unsafe URLs', async () => {
  for (const value of [{ src: '/one.png' }, [null], [4], [{ src: '/one.png', caption: 4 }], ['javascript:alert(1)'], ['https://foreign.example/photo.png'], [{ url: 'http://roomchang.com/photo.png' }]]) {
    await assert.rejects(() => guard('branches', value), /photo|gallery|image|URL|caption|JSON|src/i)
  }
})
test('a video thumbnail uses the same exact website/R2 image policy', async () => {
  for (const value of [undefined, null, '', '/poster.png', `${r2}/poster.png`, 'https://roomchang.com/poster.png']) assert.equal(await guard('videos', value), value)
  for (const value of ['javascript:alert(1)', '//roomchang.com/poster.png', 'https://foreign.example/poster.png', 'https://roomchang.com.evil.test/poster.png']) {
    await assert.rejects(() => guard('videos', value), /thumbnail/i)
  }
})
test('unrelated saves never rewrite or reject an untouched legacy gallery or thumbnail', async () => {
  const photos = { legacy: ['http://old.example/photo.png'] }
  assert.equal(await guard('branches', photos, structuredClone(photos)), photos)
  const thumbnail = 'http://old.example/poster.png'
  assert.equal(await guard('videos', thumbnail, thumbnail), thumbnail)
})
