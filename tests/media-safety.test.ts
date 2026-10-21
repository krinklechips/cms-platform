import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { AccessArgs } from 'payload'
import { Media } from '../src/collections/Media'

const editor = { id: 7, roles: ['editor'], tenants: [{ tenant: 1 }] }
const req = (user: unknown = editor) => ({
  user, context: {}, query: {},
  payload: { findByID: async (_args: { id: unknown }) => ({ id: 1, slug: 'roomchang' }), logger: { warn() {} } },
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

test('multi-membership uploads use the authorized document tenant, never the first membership', async () => {
  const hook = Media.hooks!.beforeValidate![0]!
  const request = req({ ...editor, tenants: [{ tenant: 1 }, { tenant: { id: 2 } }] })
  request.payload.findByID = async ({ id }: { id: unknown }) => ({ id: Number(id), slug: Number(id) === 2 ? 'other-site' : 'roomchang' })
  const data = await hook({ data: { tenant: { id: 2 }, prefix: 'roomchang/private' }, operation: 'create', req: request } as never)
  assert.equal(data!.prefix, 'other-site')
})

test('upload ownership must be explicit and authorized even with a supplied prefix', async () => {
  for (const tenant of [undefined, null, 2, { id: 2, slug: 'roomchang' }]) {
    await assert.rejects(() => validate({ tenant, prefix: 'roomchang' }), /tenant|owner|folder/i)
  }
})

test('trusted uploads preserve explicit deeper prefixes only after resolving document ownership', async () => {
  for (const user of [null, { roles: ['super-admin'] }]) {
    assert.equal((await validate({ tenant: 1, prefix: 'roomchang/doctors' }, undefined, user))!.prefix, 'roomchang/doctors')
    await assert.rejects(() => validate({ prefix: 'roomchang/doctors' }, undefined, user), /tenant|owner|folder/i)
    await assert.rejects(() => validate({ tenant: 1, prefix: 'other-site/doctors' }, undefined, user), /tenant|prefix|folder/i)
  }
})

test('crop and focal controls are disabled without changing the generated focal field definitions', () => {
  assert.equal(typeof Media.upload === 'object' && Media.upload.crop, false)
  assert.equal(typeof Media.upload === 'object' && Media.upload.focalPoint, false)
  for (const name of ['focalX', 'focalY']) {
    assert.deepEqual(Media.fields.find(field => 'name' in field && field.name === name), {
      name, type: 'number', admin: { disableGroupBy: true, disableListColumn: true, disableListFilter: true, hidden: true },
    })
  }
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
