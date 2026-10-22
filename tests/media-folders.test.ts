import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Media } from '../src/collections/Media'
import { buildMediaFolders, mediaFolderFilter, hasMediaFolderFilter, replaceMediaFolderFilter } from '../src/lib/media-folders'
import { mediaFolderCatalog } from '../src/lib/media-folder-catalog'

const editor = { id: 7, roles: ['editor'], tenants: [{ tenant: 1 }] }
const request = () => ({ user: editor, context: {}, query: {}, headers: new Headers(),
  payload: { findByID: async () => ({ id: 1, slug: 'roomchang' }) } })
const validate = (data: Record<string, unknown>, originalDoc?: Record<string, unknown>) => {
  const hook = Media.hooks!.beforeValidate![0]!
  return hook({ data, originalDoc, operation: originalDoc ? 'update' : 'create', req: request() } as never)
}

test('staff can choose a nested upload category without supplying a raw storage prefix', async () => {
  const result = await validate({ tenant: 1, alt: 'New logo', _uploadFolder: 'brands/logos' })
  assert.equal(result!.prefix, 'roomchang/brands/logos')
})

test('folder choices cannot escape or impersonate a tenant', async () => {
  for (const folder of ['../other-site', '/doctors', 'doctors//private', 'doctors/..', 'doctors%2fprivate', 'doctors\\private', ' other ', 'roomchang/../../other', {}, ['doctors']]) {
    await assert.rejects(() => validate({ tenant: 1, _uploadFolder: folder }), /folder/i)
  }
})

test('new folder controls cannot move an existing object or change its localized metadata', async () => {
  const original = { id: 4, tenant: 1, prefix: 'roomchang/doctors', _objectKey: null, filename: 'original.png',
    url: 'https://assets.example/roomchang/doctors/original.png', alt: { en: 'Doctor', kh: 'Original Khmer', cn: 'Original Chinese' } }
  const before = structuredClone(original)
  const result = await validate({ _uploadFolder: 'news', prefix: 'roomchang/news', alt: 'Updated English only' }, original)
  assert.equal(result!.prefix, original.prefix)
  assert.equal(result!.filename, original.filename)
  assert.equal(result!.url, original.url)
  assert.equal(result!._objectKey, null)
  assert.deepEqual(original, before)
})

test('folder selection is virtual so existing storage and content schemas need no backfill', () => {
  const field = Media.fields.find(field => 'name' in field && field.name === '_uploadFolder')
  assert.ok(field && 'virtual' in field && field.virtual)
  assert.ok(Media.admin?.components?.beforeListTable?.length, 'Use the same native list slot in the library and picker')
})

test('the hierarchy combines old and adapter-managed paths without rewriting either and retains legacy files', () => {
  const counts = [{ prefix: 'roomchang/doctors', count: 87 }, { prefix: 'serviette-media/roomchang/doctors', count: 1 },
    { prefix: 'roomchang/brands/logos', count: 40 }, { prefix: 'roomchang/services/dental-implants', count: 3 },
    { prefix: 'serviette-media', count: 1 }, { prefix: null, count: 1 }]
  const before = structuredClone(counts)
  const folders = buildMediaFolders('roomchang', counts)
  assert.equal(folders.find(folder => folder.path === '')?.count, 133)
  assert.equal(folders.find(folder => folder.path === 'doctors')?.count, 88)
  assert.deepEqual(mediaFolderFilter(folders.find(folder => folder.path === 'doctors')),
    { prefix: { in: ['roomchang/doctors', 'serviette-media/roomchang/doctors'] } })
  assert.deepEqual(mediaFolderFilter(folders.find(folder => folder.path === 'brands')),
    { prefix: { in: ['roomchang/brands/logos'] } })
  assert.equal(folders.find(folder => folder.path === 'brands/logos')?.parent, 'brands')
  assert.equal(folders.find(folder => folder.path === '@stored:serviette-media')?.uploadable, false)
  assert.deepEqual(mediaFolderFilter(folders.find(folder => folder.path === '@stored:')), { prefix: { exists: false } })
  assert.deepEqual(counts, before)
})

test('folder navigation keeps image, tenant, filename and other user filters and never matches sibling prefixes', () => {
  const image = { mimeType: { like: 'image/' } }, tenant = { tenant: { equals: 1 } }, filename = { filename: { contains: 'logo' } }
  const old = { prefix: { in: ['roomchang/services'] } }, next = { prefix: { in: ['roomchang/brands/logos'] } }
  const where = { and: [tenant, { and: [image, old] }, filename] }
  assert.equal(hasMediaFolderFilter(where, old), true)
  const replaced = replaceMediaFolderFilter(where, old, next)
  assert.equal(hasMediaFolderFilter(replaced, old), false)
  assert.equal(hasMediaFolderFilter(replaced, next), true)
  assert.deepEqual(replaced, { and: [tenant, { and: [image] }, filename, next] })
  const folder = buildMediaFolders('roomchang', [{ prefix: 'roomchang/services', count: 2 }, { prefix: 'roomchang/services-old', count: 4 }])
    .find(folder => folder.path === 'services')
  assert.deepEqual(mediaFolderFilter(folder), { prefix: { in: ['roomchang/services'] } })
  assert.deepEqual(replaceMediaFolderFilter({ and: [old] }, old, undefined), {})
})

test('folder catalogue rejects anonymous and unauthorized tenant queries before listing files', async () => {
  for (const input of [null, editor]) {
    const req = { ...request(), user: input, searchParams: new URLSearchParams('tenant=2') }
    await assert.rejects(() => mediaFolderCatalog(req as never), /sign in|authorised/i)
  }
})

test('folder catalogue paginates under actual collection access with a fixed tenant filter', async () => {
  const calls: unknown[] = []
  const req = { ...request(), searchParams: new URLSearchParams('tenant=1'), payload: {
    findByID: async () => ({ id: 1, slug: 'roomchang' }),
    find: async (args: any) => {
      calls.push({ where: args.where, overrideAccess: args.overrideAccess, select: args.select, page: args.page })
      return { docs: [{ prefix: args.page === 1 ? 'roomchang/doctors' : 'roomchang/brands/logos' }], hasNextPage: args.page === 1 }
    },
  } }
  const catalog = await mediaFolderCatalog(req as never)
  assert.deepEqual(calls, [1, 2].map(page => ({ where: { tenant: { equals: '1' } }, overrideAccess: false, select: { prefix: true }, page })))
  assert.equal(catalog.folders.find(folder => folder.path === '')?.count, 2)
})
