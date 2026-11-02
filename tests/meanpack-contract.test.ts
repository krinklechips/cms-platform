import assert from 'node:assert/strict'
import test from 'node:test'
import type { Field, FieldHook } from 'payload'
import { MeanpackWebsites } from '../src/collections/MeanpackWebsites'
import { withMediaValidation } from '../src/lib/with-media-validation'

const config = withMediaValidation(MeanpackWebsites)
function fieldAt(path: string): Field {
  const parts = path.split('.')
  function find(fields: Field[], index: number): Field | undefined {
    for (const f of fields) {
      if (f.type === 'tabs') { for (const tab of f.tabs) { const found = find(tab.fields, index); if (found) return found } }
      else if ('name' in f && f.name === parts[index]) {
        if (index === parts.length - 1) return f
        if ('fields' in f) { const found = find(f.fields, index + 1); if (found) return found }
      } else if ('fields' in f && !('name' in f)) { const found = find(f.fields, index); if (found) return found }
    }
  }
  const result = find(config.fields, 0)
  assert.ok(result, path)
  return result
}
const reqFor = (tenant: number, mimeType: string) => ({ user: { roles: ['editor'], tenants: [{ tenant: 3 }] }, context: {},
  payload: { findByID: async ({ collection, id }: { collection: string; id: number }) => collection === 'tenants'
    ? { id, slug: 'meanpack' } : { id, tenant, mimeType, url: 'https://media.example/meanpack/file' } } })

test('all renderer-required content and scene fields are required for publication', () => {
  for (const path of ['contact.phone', 'contact.email', 'contact.address', 'contact.facebook', 'contact.googleMaps', 'logo', 'scenes.heroFilm', 'scenes.qualityClose', 'copy.homeTitle']) {
    const field = fieldAt(path)
    assert.equal('required' in field && field.required, true, path)
  }
  const phases = fieldAt('phases')
  assert.equal(phases.type === 'array' && phases.minRows, 5)
  assert.equal((fieldAt('phases.slug').admin as { readOnly?: boolean })?.readOnly, true)
})

test('custom validators preserve required links and native phase count validation', async () => {
  const link = fieldAt('contact.facebook')
  assert.ok('validate' in link && typeof link.validate === 'function')
  for (const value of ['', null, undefined]) assert.notEqual(await link.validate(value as never, {} as never), true)
  assert.equal(await link.validate('https://www.facebook.com/profile.php?id=61595621691510' as never, {} as never), true)
  const phases = fieldAt('phases')
  assert.ok(phases.type === 'array' && typeof phases.validate === 'function')
  const options = { minRows: 5, maxRows: 5, required: true, req: { t: (key: string) => key } }
  assert.notEqual(await phases.validate([] as never, options as never), true)
})

test('Mean Pack references enforce owner and media kind, including same-ID gallery kind changes', async () => {
  async function guard(path: string, mime: string, owner = 3, kind = 'photo') {
    const field = fieldAt(path)
    assert.ok('hooks' in field && field.hooks?.beforeChange?.length)
    let value: unknown = 7
    for (const hook of field.hooks.beforeChange) value = await hook({ field, value, previousValue: 7, siblingData: { kind },
      data: { tenant: 3 }, originalDoc: { tenant: 3 }, operation: path === 'media.file' ? 'update' : 'create', req: reqFor(owner, mime), path: path.split('.') } as unknown as Parameters<FieldHook>[0])
    return value
  }
  assert.equal(await guard('scenes.heroFilm', 'video/mp4'), 7)
  assert.equal(await guard('products.image', 'image/webp'), 7)
  await assert.rejects(() => guard('products.image', 'video/mp4'), /invalid/i)
  await assert.rejects(() => guard('scenes.heroFilm', 'image/png'), /invalid/i)
  await assert.rejects(() => guard('media.file', 'image/webp', 9), /invalid/i)
  await assert.rejects(() => guard('media.file', 'image/webp', 3, 'video'), /invalid/i)
  assert.equal(await guard('media.file', 'video/mp4', 3, 'video'), 7)
})
