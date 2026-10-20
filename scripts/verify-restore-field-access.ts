import assert from 'node:assert/strict'
import { Socket } from 'node:net'
import { isAbsolute } from 'node:path'
import { mock, test } from 'node:test'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { BasePayload, buildConfig, type Access, type Payload, type PayloadRequest } from 'payload'
import { withDrafts } from '../src/lib/with-drafts'

// No app config, env files, disk database, generated files, or outbound connections.
const databaseURL = 'file::memory:'
assert.equal(databaseURL, 'file::memory:')
const outboundAttempts: string[] = []
const refuseNetwork = (transport: string): never => {
  outboundAttempts.push(transport)
  throw new Error(`Network is forbidden in the restore field-access fixture: ${transport}`)
}
const fetchGuard = mock.method(globalThis, 'fetch', () => refuseNetwork('fetch'))
const originalConnect = Socket.prototype.connect
const socketGuard = mock.method(Socket.prototype, 'connect', function (this: Socket, ...args: unknown[]) {
  // net.createConnection passes normalized [options, callback]; tsx reporters use a local IPC path.
  const target: unknown = Array.isArray(args[0]) ? args[0][0] : args[0]
  const ipcPath = typeof target === 'string' && Number.isNaN(Number(target)) ? target
    : target !== null && typeof target === 'object' && 'path' in target ? target.path : undefined
  if (typeof ipcPath === 'string' && isAbsolute(ipcPath)) {
    return Reflect.apply(originalConnect, this, args)
  }
  return refuseNetwork('TCP socket')
})

type Locale = 'en' | 'kh' | 'cn'
type FixtureDoc = {
  title: Record<Locale, string | null>
  privateTitle: Record<Locale, string | null>
  protectedTitle: Record<Locale, string | null>
  price: number | null
  _status: string
}
const locales: Locale[] = ['en', 'kh', 'cn']
const authenticated: Access = ({ req }) => Boolean(req.user)
let payload: Payload | undefined

try {
  // Skip getPayload's development HMR WebSocket; this standalone instance needs no cache or HMR.
  payload = await new BasePayload().init({ config: buildConfig({
    secret: 'disposable-memory-fixture-only',
    telemetry: false,
    typescript: { autoGenerate: false },
    admin: { importMap: { autoGenerate: false } },
    db: sqliteAdapter({ client: { url: databaseURL }, push: true }),
    localization: { locales, defaultLocale: 'en', fallback: false },
    collections: [
      { slug: 'users', auth: true, fields: [] },
      withDrafts({ slug: 'pages', access: {
        create: authenticated, read: authenticated, update: authenticated, readVersions: authenticated,
      }, fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'privateTitle', type: 'text', localized: true, access: { read: () => false } },
        { name: 'price', type: 'number', access: { update: () => false } },
        { name: 'protectedTitle', type: 'text', localized: true, access: { update: () => false } },
      ] }),
    ],
  }) })
  const cms = payload
  const editor = await cms.create({ collection: 'users', data: {
    email: 'restore-field-access@example.test', password: 'Memory-fixture-only-2026!',
  } as never })
  const user = { ...editor, collection: 'users' } as PayloadRequest['user']
  const content = (locale: Locale, phase: string, price: number) => ({
    title: `${locale}-${phase}`,
    privateTitle: `${locale}-private-${phase}`,
    protectedTitle: `${locale}-protected-${phase}`,
    price,
  })
  const page = await cms.create({ collection: 'pages', locale: 'en', overrideAccess: true,
    data: { ...content('en', 'old', 1), _status: 'published' } as never })
  // Privileged setup deliberately gives protected fields different historical and current values.
  const write = (locale: Locale, phase: string, price: number, draft = false) => cms.update({
    collection: 'pages', id: page.id, locale, draft, overrideAccess: true,
    data: { ...content(locale, phase, price), _status: draft ? 'draft' : 'published' } as never,
  })
  for (const locale of ['kh', 'cn'] as const) await write(locale, 'old', 1)
  const versions = () => cms.findVersions({ collection: 'pages', locale: 'all', fallbackLocale: false,
    where: { parent: { equals: page.id } }, sort: '-updatedAt', pagination: false,
    depth: 0, overrideAccess: true })
  const historical = (await versions()).docs[0]
  assert.ok(historical, 'Setup must produce a historical version')
  for (const locale of locales) await write(locale, 'live', 50)
  for (const locale of locales) await write(locale, 'draft', 99, true)
  // Privileged reads inspect persistence, not the editor response's permission-filtered projection.
  const read = async (draft: boolean) => cms.findByID({ collection: 'pages', id: page.id,
    draft, locale: 'all', fallbackLocale: false, depth: 0, overrideAccess: true })
  const published = await read(false)
  const current = await read(true) as unknown as FixtureDoc
  assert.equal(current.price, 99)
  assert.deepEqual(current.privateTitle, {
    en: 'en-private-draft', kh: 'kh-private-draft', cn: 'cn-private-draft',
  })
  assert.deepEqual(current.protectedTitle, {
    en: 'en-protected-draft', kh: 'kh-protected-draft', cn: 'cn-protected-draft',
  })
  const editorView = await cms.findByID({ collection: 'pages', id: page.id, draft: true,
    locale: 'all', fallbackLocale: false, depth: 0, overrideAccess: false, user })
  assert.equal('privateTitle' in editorView, false, 'The fixture editor cannot read privateTitle')
  const before = await versions()
  const response = await cms.restoreVersion({ collection: 'pages', id: String(historical.id),
    locale: 'cn', req: { query: { locale: 'cn' } }, overrideAccess: false, user })
  const restored = await read(true) as unknown as FixtureDoc

  await test('CN restore remains a new draft, preserves published content, and honors read access', async () => {
    assert.equal(restored._status, 'draft')
    assert.deepEqual(restored.title, { en: 'en-draft', kh: 'kh-draft', cn: 'cn-old' })
    assert.deepEqual(await read(false), published, 'Restore cannot change any published content')
    assert.equal((await versions()).totalDocs, before.totalDocs + 1)
    assert.equal('privateTitle' in response, false, 'Restore cannot expose a read-denied field')
  })
  await test('read-denied localized fields retain other-locale drafts after CN restore', () => {
    assert.equal(restored.privateTitle.en, 'en-private-draft', 'Preserve hidden EN draft')
    assert.equal(restored.privateTitle.kh, 'kh-private-draft', 'Preserve hidden KH draft')
    assert.equal(restored.privateTitle.cn, 'cn-private-old', 'CN is restorable because update is allowed')
  })
  await test('update-denied shared price retains its current value after CN restore', () => {
    assert.equal(restored.price, 99, 'Keep the current shared price; do not clear it or restore historical 1')
  })
  await test('update-denied localized field keeps current CN, not historical CN or null', () => {
    assert.equal(restored.protectedTitle.cn, 'cn-protected-draft',
      'Denied CN updates must preserve current CN, not restore cn-protected-old or clear it')
    assert.deepEqual(restored.protectedTitle, {
      en: 'en-protected-draft', kh: 'kh-protected-draft', cn: 'cn-protected-draft',
    }, 'All locales of the update-protected field must remain unchanged')
  })
} finally {
  try {
    if (payload) await payload.destroy()
  } finally {
    fetchGuard.mock.restore()
    socketGuard.mock.restore()
    assert.deepEqual(outboundAttempts, [], 'The fixture must never attempt outbound TCP or fetch')
  }
}
