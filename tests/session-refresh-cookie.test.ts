import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { getPayload, handleEndpoints } from 'payload'
import { loadPayloadConfig } from './helpers/load-payload-config'

for (const targetLocale of ['en', 'kh', 'cn'] as const) test(`${targetLocale} tenant-editor refresh stays browser-sized and preserves batch publishing beyond the original two-hour cookie`, { timeout: 120000 }, async t => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cms-session-cookie-'))
  Object.assign(process.env, { NODE_ENV: 'test', DATABASE_URI: `file:${path.join(dir, 'fixture.db')}`,
    PAYLOAD_SECRET: randomUUID(), PAYLOAD_FORCE_DRIZZLE_PUSH: 'true' })
  const original = await loadPayloadConfig()
  const key = randomUUID()
  const cms = await getPayload({ key, config: { ...original, telemetry: false,
    db: sqliteAdapter({ client: { url: process.env.DATABASE_URI! }, transactionOptions: {} }) as typeof original.db,
    typescript: { ...original.typescript, autoGenerate: false },
    admin: { ...original.admin, importMap: { ...original.admin.importMap, autoGenerate: false } },
  } })
  try {
    const modules = []
    for (let i = 0; i < 8; i++) modules.push(await cms.create({ collection: 'modules', data: {
      name: `Ordinary platform module ${i}`, key: randomUUID(), defaultMonthlyPrice: i,
      description: 'Synthetic module information. '.repeat(24), contentCollections: ['services'],
    } }))
    const tenant = await cms.create({ collection: 'tenants', data: { name: 'Disposable Roomchang', slug: 'roomchang',
      domains: [{ domain: 'roomchang.serviettelab.com' }], subscriptions: modules.map(module => ({ module: module.id, active: true })) } })
    const password = randomUUID()
    const editor = { ...await cms.create({ collection: 'users', data: { email: 'session-editor@example.invalid', password,
      roles: ['editor'], tenants: [{ tenant: tenant.id }] } }), collection: 'users' as const }
    const service = await cms.create({ collection: 'services', locale: 'en', user: editor, overrideAccess: false,
      data: { tenant: tenant.id, slug: 'sleep-apnea-fixture', name: 'en original', _status: 'published', sections: [
        { blockType: 'cards', numbered: true, columns: 3, items: [0, 1, 2].map(i => ({ title: `original ${i}`, body: `original body ${i}` })) },
      ] } })
    const read = (locale: 'en' | 'kh' | 'cn', draft = true) => cms.findByID({ collection: 'services', id: service.id,
      locale, draft, fallbackLocale: false, depth: 0, user: editor, overrideAccess: false })
    for (const locale of ['kh', 'cn'] as const) await cms.update({ collection: 'services', id: service.id, locale,
      user: editor, overrideAccess: false, publishSpecificLocale: locale, data: { name: `${locale} original`,
        _status: 'published', _editorialRevision: (await read(locale))._editorialRevision } })
    for (const locale of ['en', 'kh', 'cn'] as const) await cms.update({ collection: 'services', id: service.id, locale,
      user: editor, overrideAccess: false, draft: true, data: { name: `${locale} private draft`,
        _status: 'draft', _editorialRevision: (await read(locale))._editorialRevision } })
    const invoke = (route: string, init: RequestInit = {}) => handleEndpoints({ config: cms.config, payloadInstanceCacheKey: key,
      request: new Request(`https://roomchang.serviettelab.com/api/${route}`, init) })
    const origin = 'https://roomchang.serviettelab.com'
    t.mock.timers.enable({ apis: ['Date'], now: Date.now() })
    const login = await invoke('users/login', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: editor.email, password }) })
    assert.equal(login.status, 200)
    const initialCookie = login.headers.get('set-cookie')!.split(';')[0]
    t.mock.timers.tick(118 * 60_000)
    const refresh = await invoke('users/refresh-token', { method: 'POST', headers: { Origin: origin, Cookie: initialCookie } })
    assert.equal(refresh.status, 200)
    const refreshedCookie = refresh.headers.get('set-cookie')!.split(';')[0]
    const cookieBytes = Buffer.byteLength(refreshedCookie)
    console.log(JSON.stringify({ initialCookieBytes: Buffer.byteLength(initialCookie), refreshedCookieBytes: cookieBytes,
      tokenLifetimeSeconds: (cms.collections.users.config.auth as { tokenExpiration: number }).tokenExpiration }))
    assert.ok(cookieBytes <= 4096, `Refresh must fit Chrome's cookie limit; got ${cookieBytes} bytes`)
    const claims = JSON.parse(Buffer.from(refreshedCookie.slice(refreshedCookie.indexOf('=') + 1).split('.')[1], 'base64url').toString())
    assert.equal(claims.exp - claims.iat, 7200)
    assert.equal(claims.tenants, undefined, 'Populated tenant documents must not be copied into JWT cookies')
    t.mock.timers.tick(3 * 60_000)
    const headers = { Origin: origin, Cookie: `${refreshedCookie};payload-tenant=${tenant.id}`, 'Content-Type': 'application/json' }
    const me = await invoke('users/me', { headers })
    const account = await me.json()
    assert.equal(account.user.id, editor.id)
    assert.equal(account.user.tenants[0].tenant.id, tenant.id, 'Populated navigation and server-side memberships must remain available')
    const opened = await read(targetLocale)
    const unchangedLocales = await Promise.all((['en', 'kh', 'cn'] as const).filter(locale => locale !== targetLocale).map(async locale => ({
      locale, published: await read(locale, false), draft: await read(locale),
    })))
    const response = await invoke(`services/${service.id}?locale=${targetLocale}&publishSpecificLocale=${targetLocale}`, { method: 'PATCH', headers,
      body: JSON.stringify({ ...opened, _status: 'published', name: `${targetLocale} batch heading`, description: `${targetLocale} batch summary`,
        eyebrow: `${targetLocale} batch eyebrow`, heroDescription: `${targetLocale} batch hero`, sections: [{ blockType: 'cards', numbered: true, columns: 3,
          heading: `${targetLocale} cards heading`, subheading: `${targetLocale} cards summary`,
          items: [0, 1, 2].map(i => ({ title: `${targetLocale} updated title ${i}`, body: `${targetLocale} updated body ${i}` })),
        }],
      }),
    })
    assert.equal(response.status, 200, 'A valid refreshed session must publish all twelve edited text fields in one request')
    const published = await read(targetLocale, false)
    assert.equal(published.name, `${targetLocale} batch heading`)
    assert.equal(published.description, `${targetLocale} batch summary`)
    assert.equal(published.eyebrow, `${targetLocale} batch eyebrow`)
    assert.equal(published.heroDescription, `${targetLocale} batch hero`)
    const cards = published.sections?.[0]
    assert.ok(cards?.blockType === 'cards')
    assert.equal(cards.heading, `${targetLocale} cards heading`)
    assert.equal(cards.subheading, `${targetLocale} cards summary`)
    assert.deepEqual(cards.items?.map(({ title, body }) => ({ title, body })), [0, 1, 2].map(i => ({
      title: `${targetLocale} updated title ${i}`, body: `${targetLocale} updated body ${i}`,
    })))
    for (const { locale, published: previousPublished, draft: previousDraft } of unchangedLocales) {
      for (const [current, previous] of [[await read(locale, false), previousPublished], [await read(locale), previousDraft]]) {
        for (const field of ['name', 'description', 'eyebrow', 'heroDescription', 'sections'] as const) {
          assert.deepEqual(current[field], previous[field], `${locale} ${field} must remain unchanged`)
        }
      }
    }
    const expired = await invoke('users/me', { headers: { Origin: origin, Cookie: initialCookie } })
    assert.equal((await expired.json()).user, null, 'The original idle session token must still expire after two hours')
    const apiKey = randomUUID()
    await cms.update({ collection: 'users', id: editor.id, data: { enableAPIKey: true, apiKey } })
    const apiHeaders = { Authorization: `users API-Key ${apiKey}` }
    const apiRead = await invoke(`services/${service.id}?locale=${targetLocale}`, { headers: apiHeaders })
    assert.equal(apiRead.status, 200, 'Header-authenticated clients must retain tenant access without cookie claims')
    const other = await cms.create({ collection: 'tenants', data: { name: 'Other isolated tenant', slug: 'other', subscriptions: [{ module: modules[0].id, active: true }] } })
    await cms.update({ collection: 'users', id: editor.id, data: { tenants: [{ tenant: other.id }] } })
    const changedMembership = await invoke('users/me', { headers })
    assert.equal((await changedMembership.json()).user.tenants[0].tenant.id, other.id)
    const blocked = await invoke(`services/${service.id}?locale=${targetLocale}&draft=true`, { headers })
    assert.equal(blocked.status, 404, 'Refreshed tokens must use current database memberships, not stale token claims')
    const deniedWrite = await invoke(`services/${service.id}?locale=${targetLocale}&publishSpecificLocale=${targetLocale}`, {
      method: 'PATCH', headers, body: JSON.stringify({ _status: 'published', name: 'Must not be written',
        _editorialRevision: published._editorialRevision }),
    })
    assert.equal(deniedWrite.status, 404, 'Removing tenant membership must also prevent publishing with an existing token')
    const deniedApiRead = await invoke(`services/${service.id}?locale=${targetLocale}`, { headers: apiHeaders })
    assert.equal(deniedApiRead.status, 404, 'API-key clients must also use current database tenant memberships')
  } finally {
    t.mock.timers.reset()
    await cms.destroy()
    await rm(dir, { recursive: true, force: true })
  }
})
