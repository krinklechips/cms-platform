import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ValidationError, type Field, type FieldHook } from 'payload'
import { withMediaValidation } from '../src/lib/with-media-validation'
import { loadPayloadConfig } from './helpers/load-payload-config'

process.env.PAYLOAD_SECRET = 'backend-media-validation-config-only'
process.env.DATABASE_URI = 'file:/tmp/backend-media-validation-config-unused.db'
process.env.R2_PUBLIC_BASE_URL = 'https://configured-assets.example.test'
const config = await loadPayloadConfig()
const editor = { id: 7, roles: ['editor'], tenants: [{ tenant: 1 }, { tenant: 2 }] }
const roomchang = 'https://pub-2b835c19d8644293b271deaeb97352b1.r2.dev'
const rejectsMedia = (error: unknown) => error instanceof ValidationError && /image|tenant|media|URL|src|caption|JSON/i.test(JSON.stringify(error.data.errors))

function fieldAt(collection: string, path: string) {
  let fields = config.collections.find(c => c.slug === collection)!.fields
  let field: Field | undefined
  for (const part of path.split('.')) {
    const flatten = (values: Field[]): Field[] => values.flatMap(f => f.type === 'tabs'
      ? f.tabs.flatMap(tab => 'name' in tab && tab.name ? [tab as unknown as Field] : flatten(tab.fields))
      : f.type === 'row' || f.type === 'collapsible' ? flatten(f.fields) : [f])
    field = flatten(fields).find(f => 'name' in f && f.name === part)
    assert.ok(field, `${collection}.${path}: field must exist`)
    fields = 'fields' in field ? field.fields : []
  }
  assert.ok(field)
  return field
}

const request = (media: Record<string, unknown> = { id: 4, tenant: 1, mimeType: 'image/png', url: `${roomchang}/image.png` }, user: unknown = editor) => ({
  user, locale: 'en', context: {},
  payload: { findByID: async ({ collection, id }: { collection: string; id: unknown }) => collection === 'tenants'
    ? { id, slug: Number(id) === 1 ? 'roomchang' : 'other-site' } : media },
})

async function guard(collection: string, path: string, value: unknown, extra: Record<string, unknown> = {}) {
  const field = fieldAt(collection, path)
  assert.ok('hooks' in field && field.hooks?.beforeChange?.length, 'Targeted media fields need draft-safe beforeChange guards')
  let current = value
  for (const hook of field.hooks.beforeChange) current = await hook({
    value: current, field, path: path.split('.'), req: request(), data: { tenant: 1 },
    operation: 'update', originalDoc: { id: 9, tenant: 1 }, ...extra,
  } as unknown as Parameters<FieldHook>[0])
  return current
}

test('changed native refs resolve authoritative tenant, MIME and URL, never submitted populated metadata', async () => {
  assert.equal(await guard('homepage', 'slides.image', 4), 4)
  for (const media of [
    { id: 4, tenant: 2, mimeType: 'image/png', url: `${roomchang}/a.png` },
    { id: 4, tenant: 1, mimeType: 'video/mp4', url: `${roomchang}/a.png` },
    { id: 4, tenant: 1, mimeType: 'image/png', url: 'https://foreign.example/a.png' },
    { id: 4, tenant: 1, mimeType: 'image/png', url: '//foreign.example/a.png' },
    { id: 4, tenant: 1, mimeType: 'image/png', url: '/api/media/file/local-only.png' },
  ]) {
    await assert.rejects(() => guard('homepage', 'slides.image', { id: 4, tenant: 1, mimeType: 'image/png', url: `${roomchang}/safe.png` },
      { req: request(media) }), /image|tenant|media|URL/i)
  }
})

test('changed image refs fail closed on missing ownership, unauthorized tenants and unresolved documents', async () => {
  await assert.rejects(() => guard('homepage', 'slides.image', 4, { data: { tenant: null } }), rejectsMedia)
  await assert.rejects(() => guard('homepage', 'slides.image', 4, { req: request(undefined, { ...editor, tenants: [{ tenant: 2 }] }) }), rejectsMedia)
  const req = request()
  req.payload.findByID = async () => { throw new Error('unavailable') }
  await assert.rejects(() => guard('homepage', 'slides.image', 4, { req }), /tenant|media|image/i)
})

test('unchanged legacy IDs and URLs skip new restrictions but ownership changes force a recheck', async () => {
  const req = request()
  req.payload.findByID = async () => { throw new Error('Must not query untouched values') }
  const populated = { id: 8 }
  assert.equal(await guard('homepage', 'slides.image', populated, { previousValue: 8, req }), populated)
  assert.equal(await guard('homepage', 'slides.image', 8, { previousValue: populated, req }), 8)
  assert.equal(await guard('doctors', 'photoUrl', 'http://legacy.invalid/a.png', { previousValue: 'http://legacy.invalid/a.png', req }), 'http://legacy.invalid/a.png')
  await assert.rejects(() => guard('homepage', 'slides.image', 8, { previousValue: 8, data: { tenant: 2 } }), /tenant|image|media/i)
})

test('Roomchang accepts only its exact HTTPS website origins or safe root-relative paths', async () => {
  for (const value of [`${roomchang}/a%20b.png`, 'https://roomchang.com/a.png', '/images/a.png']) {
    assert.equal(await guard('doctors', 'photoUrl', value), value)
  }
  for (const value of ['https://configured-assets.example.test/a.png', 'https://www.roomchang.com/a.png', 'http://roomchang.com/a.png', 'https://roomchang.com:444/a.png',
    'https://foreign.example/a.png', 'https://roomchang.com.evil.test/a.png', 'https://user@roomchang.com/a.png',
    '//roomchang.com/a.png', '/\\evil.test/a.png', '/%2fevil.test/a.png', '/%255cevil.test/a.png', '/a\nb.png', '/%zz.png', 'data:image/png,a',
    '/api/media/file/local-only.png', '/api/%6dedia/file/local-only.png', 'https://cms.serviettelab.com/api/media/file/local-only.png']) {
    await assert.rejects(() => guard('doctors', 'photoUrl', value), /URL|image|website/i, value)
  }
})

test('Roomchang origin restrictions are not imposed on other tenants', async () => {
  const value = 'https://other-tenant-assets.example.test/a.png'
  assert.equal(await guard('doctors', 'photoUrl', value, { data: { tenant: 2 }, originalDoc: { id: 9, tenant: 2 } }), value)
})

test('clinical image JSON checks existing src/caption shape without dropping extra metadata', async () => {
  for (const value of [undefined, null, '', []]) assert.equal(await guard('clinical-cases', 'images', value), value)
  const images = [{ src: `${roomchang}/case.png`, caption: 'Before', patientSafeMetadata: { crop: [1, 2] } }]
  assert.equal(await guard('clinical-cases', 'images', images), images)
  for (const images of [{ src: '/a.png' }, ['https://roomchang.com/a.png'], [null], [{ url: '/a.png' }], [{ src: '/a.png', caption: 4 }], [{ src: 'https://foreign.example/a.png' }]]) {
    await assert.rejects(() => guard('clinical-cases', 'images', images), /image|src|caption|JSON|URL/i)
  }
  const legacy = { old: ['legacy-import'] }
  assert.equal(await guard('clinical-cases', 'images', legacy, { previousValue: structuredClone(legacy) }), legacy)
})

test('native media controls filter by the actual document tenant and image MIME', async () => {
  const field = fieldAt('homepage', 'slides.image')
  assert.ok('filterOptions' in field && typeof field.filterOptions === 'function')
  assert.deepEqual(await field.filterOptions({ data: { tenant: 2 }, req: request(), user: editor } as never), {
    and: [{ tenant: { equals: 2 } }, { mimeType: { like: 'image/%' } }],
  })
  assert.equal(await field.filterOptions({ data: {}, req: request(), user: editor } as never), false)
})

test('the schema wrapper is nonmutating and composes original hooks, validation and selection filters', async () => {
  const nativeFilter = { filename: { not_equals: 'blocked.png' } }
  const nativeHook: FieldHook = ({ value }) => value
  let validated = false
  const field = { name: 'image', type: 'upload' as const, relationTo: 'media' as const,
    hooks: { beforeChange: [nativeHook] }, filterOptions: nativeFilter,
    validate: (value: unknown, options: { filterOptions?: unknown }) => {
      validated = true
      assert.equal(options.filterOptions, nativeFilter, 'Native validation must retain its original filter contract')
      return value === 44 ? 'Native error' : true
    },
  }
  const input = { slug: 'homepage' as const, fields: [{ name: 'slides', type: 'array' as const, fields: [field] }] }
  const wrapped = withMediaValidation(input)
  assert.equal(field.hooks.beforeChange.length, 1)
  assert.equal(field.filterOptions, nativeFilter)
  assert.notEqual(wrapped.fields, input.fields)
  const slides = wrapped.fields[0]
  assert.ok(slides.type === 'array')
  const scoped = slides.fields[0]
  assert.ok(scoped.type === 'upload')
  assert.equal(scoped.hooks?.beforeChange?.[0], nativeHook)
  assert.equal(scoped.hooks?.beforeChange?.length, 2)
  assert.equal(await scoped.validate!(44 as never, {} as never), 'Native error')
  assert.equal(validated, true)
  assert.ok(typeof scoped.filterOptions === 'function')
  assert.deepEqual(await scoped.filterOptions({ data: { tenant: 2 }, req: request(), user: editor } as never), {
    and: [{ tenant: { equals: 2 } }, { mimeType: { like: 'image/%' } }, nativeFilter],
  })
  const tenants = { slug: 'tenants' as const, fields: [field] }
  assert.equal((withMediaValidation(tenants).fields[0] as typeof field).hooks, field.hooks)
})
