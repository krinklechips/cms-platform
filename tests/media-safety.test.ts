import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { AccessArgs } from 'payload'
import { Media } from '../src/collections/Media'

const editor = { id: 7, roles: ['editor'], tenants: [{ tenant: 1 }] }
const req = (user: unknown = editor) => ({
  user, context: {}, query: {},
  payload: { findByID: async () => ({ id: 1, slug: 'roomchang' }), logger: { warn() {} } },
})
const validate = async (data: Record<string, unknown>, originalDoc?: Record<string, unknown>, user: unknown = editor) => {
  const hook = Media.hooks!.beforeValidate![0]!
  return hook({ data, originalDoc, operation: originalDoc ? 'update' : 'create', req: req(user) } as unknown as Parameters<typeof hook>[0])
}
const operate = async (operation: string, request: Record<string, unknown>, data: Record<string, unknown> = {}) => {
  const hook = Media.hooks?.beforeOperation?.[0]
  assert.ok(hook, 'file operations must be guarded before file processing')
  return hook({ operation, req: request, args: { data } } as unknown as Parameters<typeof hook>[0])
}

test('alt-only edits preserve imported object identity, including localized metadata edits', async () => {
  const original = { id: 4, tenant: 1, prefix: 'roomchang/doctors', filename: 'doctor.png', url: 'https://assets.example/roomchang/doctors/doctor.png', width: 800 }
  const data = await validate({ alt: 'New alt', prefix: 'other', filename: 'changed.png', width: 1 }, original)
  assert.equal(data!.prefix, original.prefix)
  assert.equal(data!.filename, original.filename)
  assert.equal(data!.width, original.width)
  assert.equal(data!.alt, 'New alt')
})

test('super-admin metadata edits also preserve the stored object identity', async () => {
  const data = await validate({ alt: 'New alt', prefix: 'other' }, { id: 4, tenant: 1, prefix: 'roomchang/brand-logos', filename: 'logo.png' }, { roles: ['super-admin'] })
  assert.equal(data!.prefix, 'roomchang/brand-logos')
})

test('metadata edits cannot replace the storage object key or add one to legacy files', async () => {
  for (const object of [{ _objectKey: 'stored-object' }, {}]) {
    const original = { id: 4, tenant: 1, prefix: 'roomchang', filename: 'image.png', ...object }
    const data = await validate({ alt: 'Metadata only', _objectKey: 'different-object' }, original)
    assert.equal(data!._objectKey, '_objectKey' in object ? object._objectKey : undefined)
  }
})

test('new tenant uploads ignore a supplied other-tenant prefix', async () => {
  const data = await validate({ tenant: 1, prefix: 'other-tenant', alt: 'A new image' })
  assert.equal(data!.prefix, 'roomchang')
})

test('new uploads fail closed when their tenant cannot be resolved', async () => {
  const hook = Media.hooks!.beforeValidate![0]!
  const request = req()
  request.payload.findByID = async () => { throw new Error('unavailable') }
  await assert.rejects(() => hook({ data: { tenant: 1 }, operation: 'create', req: request } as unknown as Parameters<typeof hook>[0]), /tenant|folder/i)
})

test('normal APIs do not allow anonymous creation or media deletion', async () => {
  assert.ok(Media.access?.create)
  assert.equal(await Media.access.create({ req: req(null) } as unknown as AccessArgs), false)
  assert.ok(Media.access?.delete)
  assert.equal(await Media.access.delete({ req: req() } as unknown as AccessArgs), false)
})

test('in-place file replacement is rejected before storage can process it', async () => {
  await assert.rejects(() => operate('update', { ...req(), file: { name: 'replacement.png' } }), /new.*(upload|file)|upload.*new/i)
})

test('crop/reprocess operations cannot mutate a shared image', async () => {
  await assert.rejects(() => operate('update', { ...req(), query: { uploadEdits: { crop: { x: 0, y: 0 } } } }), /new.*(upload|file)|upload.*new/i)
})

test('trusted cleanup requires an explicit maintenance context', async () => {
  await assert.rejects(() => operate('delete', req()), /protect|maintenance|delete/i)
  await operate('delete', { ...req(null), context: { mediaMaintenance: true } })
})

test('new uploaded files have unique names rather than overwriting cached objects', async () => {
  const a = { ...req(), file: { name: 'logo.png' } }
  const b = { ...req(), file: { name: 'logo.png' } }
  await operate('create', a)
  await operate('create', b)
  assert.notEqual(a.file.name, 'logo.png')
  assert.notEqual(a.file.name, b.file.name)
  assert.match(a.file.name, /\.png$/)
})
