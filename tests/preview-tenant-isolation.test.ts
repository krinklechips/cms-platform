import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { createLocalReq, getPayload } from 'payload'
import { loadPayloadConfig } from './helpers/load-payload-config'
import { getPreviewUrl } from '../src/lib/preview-routes'
import type { Page, User } from '../src/payload-types'

test('actual tenant editors only receive previews for the configured tenant and saved document owner', { timeout: 120000 }, async t => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cms-preview-isolation-'))
  const keys = ['DATABASE_URI', 'PAYLOAD_SECRET', 'DUMMY_SITE_URL', 'DUMMY_SITE_TENANT_ID', 'PREVIEW_SECRET'] as const
  const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]))
  Object.assign(process.env, { DATABASE_URI: `file:${path.join(dir, 'fixture.db')}`, PAYLOAD_SECRET: 'isolated-preview-test-only',
    DUMMY_SITE_URL: 'https://preview.example.test', PREVIEW_SECRET: 'synthetic-local-preview-secret-only' })
  const original = await loadPayloadConfig()
  const cms = await getPayload({ key: randomUUID(), config: { ...original, telemetry: false,
    db: sqliteAdapter({ client: { url: process.env.DATABASE_URI! }, transactionOptions: {} }) as typeof original.db,
    typescript: { ...original.typescript, autoGenerate: false },
  } })
  try {
    const tenants: { id: number | string }[] = []
    const editors: (User & { collection: 'users' })[] = []
    const pages: Page[] = []
    for (let index = 0; index < 2; index++) {
      const tenant = await cms.db.create({ collection: 'tenants', data: { name: `Tenant ${index}`, slug: `preview-fixture-${index}`, enabledCollections: ['pages'] } })
      tenants.push(tenant)
      const editor = { ...await cms.create({ collection: 'users', data: { email: `preview-${index}@example.invalid`, password: 'isolated-preview-password-1234',
        roles: ['editor'], tenants: [{ tenant: tenant.id }] } as never }), collection: 'users' as const }
      editors.push(editor)
      pages.push(await cms.create({ collection: 'pages', user: editor, overrideAccess: false, locale: 'en',
        data: { tenant: tenant.id, title: `Private page ${index}`, _status: 'draft' } as never }))
    }
    const owner = { ...await cms.create({ collection: 'users', data: { email: 'preview-owner@example.invalid', password: 'isolated-preview-password-1234', roles: ['super-admin'] } as never }), collection: 'users' as const }
    process.env.DUMMY_SITE_TENANT_ID = String(tenants[0].id)
    const preview = async (user: typeof owner | null, data: Page | Record<string, unknown>, code = 'en') => getPreviewUrl({
      data, locale: { code }, collectionConfig: cms.collections.pages.config,
      req: await createLocalReq({ user: user ?? undefined, locale: code as 'en' | 'kh' | 'cn' }, cms),
    } as Parameters<typeof getPreviewUrl>[0])

    await t.test('another tenant cannot obtain a Roomchang grant by supplying their own or forged tenant data', async () => {
      for (const code of ['en', 'kh', 'cn']) {
        assert.equal(await preview(editors[1], pages[1], code), null)
        assert.equal(await preview(editors[1], { ...pages[1], tenant: tenants[0].id }, code), null)
        assert.equal(await preview(editors[1], pages[0], code), null)
      }
    })
    await t.test('both authorized staff and platform owner preview the actual saved page in all locales', async () => {
      for (const user of [editors[0], owner]) for (const code of ['en', 'kh', 'cn']) {
        const url = new URL((await preview(user, pages[0], code))!)
        assert.equal(url.origin, 'https://preview.example.test')
        assert.equal(url.searchParams.get('secret'), process.env.PREVIEW_SECRET)
        assert.equal(url.searchParams.get('redirect'), `/${code}/${pages[0].slug}`)
      }
    })
    await t.test('platform privileges or forged form ownership cannot turn a foreign saved page into a configured-tenant preview', async () => {
      assert.equal(await preview(owner, { ...pages[1], tenant: tenants[0].id }), null)
      assert.equal(await preview(editors[0], { ...pages[1], tenant: tenants[0].id }), null)
      assert.equal(await preview(null, pages[0]), null)
      assert.equal(await preview(editors[0], { tenant: tenants[0].id, slug: 'unsaved-page' }), null)
      assert.equal(await preview(editors[0], { ...pages[0], id: 99999999 }), null)
    })
    await t.test('missing server-side tenant configuration never emits a global preview credential', async () => {
      delete process.env.DUMMY_SITE_TENANT_ID
      assert.equal(await preview(owner, pages[0]), null)
    })
  } finally {
    await cms.destroy()
    await rm(dir, { recursive: true, force: true })
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key]
      else process.env[key] = previous[key]
    }
  }
})
