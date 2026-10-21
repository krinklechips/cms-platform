import assert from 'node:assert/strict'
import { test } from 'node:test'
import { imageUrlFromMedia, isSafeImageUrl, mediaTenantID } from '../src/components/MediaPicker'

test('image URL validation accepts HTTPS and root-relative URLs without normalizing them', () => {
  for (const value of [
    'https://media.example.test/a%20b.jpg?width=200#image',
    '/api/media/file/photo.jpg',
    '/images/logo.png',
  ]) {
    assert.equal(isSafeImageUrl(value), true, value)
    assert.equal(imageUrlFromMedia({ tenant: { id: 1 }, mimeType: 'image/png', url: value }, '1'), value)
  }
})

test('image URL validation rejects active content, credentials, ambiguous hosts, and malformed paths', () => {
  for (const value of [
    null,
    undefined,
    12,
    '',
    ' https://example.test/a.jpg',
    'https://example.test/a.jpg\n',
    'http://example.test/a.jpg',
    'javascript:alert(1)',
    'data:image/png;base64,123',
    'blob:https://example.test/123',
    '//example.test/a.jpg',
    '/\\example.test/a.jpg',
    '/%5cexample.test/a.jpg',
    '/%2fexample.test/a.jpg',
    '/a\nb.jpg',
    'https://user:pass@example.test/a.jpg',
    'https://',
    'photo.jpg',
  ]) {
    assert.equal(isSafeImageUrl(value), false, String(value))
  }
})

test('media selection requires an image document with a matching explicit tenant', () => {
  const doc = { tenant: 1, mimeType: 'image/jpeg', url: '/api/media/file/photo.jpg' }
  assert.equal(imageUrlFromMedia(doc, 1), '/api/media/file/photo.jpg')
  for (const invalid of [
    null,
    {},
    { ...doc, tenant: 2 },
    { ...doc, tenant: null },
    { ...doc, mimeType: 'video/mp4' },
    { ...doc, mimeType: undefined },
    { ...doc, url: 'http://example.test/a.jpg' },
  ]) {
    assert.equal(imageUrlFromMedia(invalid, 1), null)
  }
  assert.equal(imageUrlFromMedia(doc, null), null)
})

test('tenant IDs support populated relationships and fail closed for invalid values', () => {
  assert.equal(mediaTenantID({ id: 1 }), 1)
  assert.equal(mediaTenantID('tenant-a'), 'tenant-a')
  for (const invalid of [null, undefined, '', {}, { id: null }, false, [], NaN]) {
    assert.equal(mediaTenantID(invalid), null)
  }
})
