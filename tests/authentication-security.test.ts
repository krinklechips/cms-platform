import assert from 'node:assert/strict'
import { randomBytes, randomUUID } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { NextRequest } from 'next/server'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { getPayload, handleEndpoints } from 'payload'
import { loadPayloadConfig } from './helpers/load-payload-config'
import proxy, { config as proxyConfig } from '../src/proxy'

test('actual CMS cookie authentication rejects sibling origins while preserving staff and service workflows', { timeout: 120000 }, async t => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cms-auth-security-'))
  const previous = { NODE_ENV: process.env.NODE_ENV, DATABASE_URI: process.env.DATABASE_URI,
    PAYLOAD_SECRET: process.env.PAYLOAD_SECRET, PAYLOAD_FORCE_DRIZZLE_PUSH: process.env.PAYLOAD_FORCE_DRIZZLE_PUSH }
  Object.assign(process.env, { NODE_ENV: 'production', DATABASE_URI: `file:${path.join(dir, 'fixture.db')}`,
    PAYLOAD_SECRET: 'isolated-auth-security-only', PAYLOAD_FORCE_DRIZZLE_PUSH: 'true' })
  const original = await loadPayloadConfig()
  const key = randomUUID()
  // Preserve production auth settings, but push only this newly owned SQLite fixture.
  Object.assign(process.env, { NODE_ENV: 'test' })
  const cms = await getPayload({ key, config: { ...original, telemetry: false,
    db: sqliteAdapter({ client: { url: process.env.DATABASE_URI! }, transactionOptions: {} }) as typeof original.db,
    typescript: { ...original.typescript, autoGenerate: false },
    email: () => ({ name: 'no-delivery-fixture', defaultFromAddress: 'cms@example.invalid', defaultFromName: 'Fixture', sendEmail: async () => undefined }),
  } })
  Object.assign(process.env, { NODE_ENV: 'production' })
  try {
    const tenant = await cms.db.create({ collection: 'tenants', data: { name: 'Authentication fixture', slug: 'authentication-fixture', enabledCollections: ['pages'] } })
    const password = 'isolated-auth-fixture-password-1234'
    const staff = await cms.create({ collection: 'users', data: { email: 'auth-owner@example.invalid', password, roles: ['super-admin'] } as never })
    const invoke = async (pathname: string, init: RequestInit, throughProxy = true) => {
      const request = new Request(`https://roomchang.serviettelab.com/api/${pathname}`, init)
      if (throughProxy && proxyConfig.matcher.some(pattern => pattern.startsWith('/api'))) {
        const rejected = proxy(new NextRequest(request.clone()))
        if (rejected) return rejected
      }
      return handleEndpoints({ config: cms.config, payloadInstanceCacheKey: key, request })
    }
    const login = await invoke('users/login', { method: 'POST', headers: { Origin: 'https://roomchang.serviettelab.com', 'Content-Type': 'application/json', 'Sec-Fetch-Site': 'same-origin' },
      body: JSON.stringify({ email: staff.email, password }) })
    assert.equal(login.status, 200)
    const loggedIn = await login.json()
    const cookie = `${cms.config.cookiePrefix}-token=${loggedIn.token}`
    const ownHeaders = { Cookie: cookie, Origin: 'https://roomchang.serviettelab.com', 'Sec-Fetch-Site': 'same-origin' }
    const accountForm = () => {
      const form = new FormData()
      form.set('_payload', JSON.stringify({ email: `${randomUUID()}@example.invalid`, password, roles: ['super-admin'] }))
      return form
    }

    await t.test('native backend itself refuses the reproduced sibling-origin account creation', async () => {
      const response = await invoke('users', { method: 'POST', body: accountForm(),
        headers: { Cookie: cookie, Origin: 'https://untrusted-sibling.serviettelab.com', 'Sec-Fetch-Site': 'same-site' } }, false)
      assert.equal(response.status, 403)
    })
    await t.test('browser entry points reject sibling, null, cross-portal and originless same-site writes', async () => {
      const attempts: Record<string, string>[] = [
        { Origin: 'https://untrusted-sibling.serviettelab.com', 'Sec-Fetch-Site': 'same-site' },
        { Origin: 'null', 'Sec-Fetch-Site': 'same-site' },
        { Origin: 'https://attacker.example.invalid', 'Sec-Fetch-Site': 'cross-site' },
        { Origin: 'https://serviettelab.com', 'Sec-Fetch-Site': 'same-site' },
        { 'Sec-Fetch-Site': 'same-site' },
        { 'Sec-Fetch-Site': 'cross-site' },
        { Authorization: 'JWT fake-cannot-bypass-cookie-origin-check', 'Sec-Fetch-Site': 'same-site' },
      ]
      for (const headers of attempts) {
        const before = (await cms.count({ collection: 'users' })).totalDocs
        const response = await invoke('users', { method: 'POST', body: accountForm(), headers: { Cookie: cookie, ...headers } as HeadersInit })
        assert.equal(response.status, 403)
        assert.equal((await cms.count({ collection: 'users' })).totalDocs, before)
      }
    })
    await t.test('hosted cookies are Secure and HttpOnly, keeping SameSite Lax and two-hour sessions', () => {
      const setCookie = login.headers.get('set-cookie') || ''
      assert.match(setCookie, /;\s*Secure(?:=true)?(?:;|$)/i)
      assert.match(setCookie, /;\s*HttpOnly(?:=true)?(?:;|$)/i)
      assert.match(setCookie, /;\s*SameSite=Lax(?:;|$)/i)
      const claims = JSON.parse(Buffer.from(loggedIn.token.split('.')[1], 'base64url').toString())
      assert.equal(claims.exp - claims.iat, 7200)
    })
    await t.test('legitimate staff can save and publish each locale without publishing the other saved drafts', async () => {
      const created = await invoke('pages?locale=en', { method: 'POST', headers: { ...ownHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant: tenant.id, title: 'EN published original', _status: 'published' }) })
      assert.equal(created.status, 201)
      const id = (await created.json()).doc.id
      const read = async (locale: string, draft: boolean) => {
        const response = await invoke(`pages/${id}?locale=${locale}&draft=${draft}&fallback-locale=none`, { headers: ownHeaders })
        assert.equal(response.status, 200)
        return response.json()
      }
      const write = async (locale: string, title: string, draft: boolean) => {
        const opened = await read(locale, true)
        const response = await invoke(`pages/${id}?locale=${locale}&draft=${draft}`, { method: 'PATCH',
          headers: { ...ownHeaders, 'Content-Type': 'application/json' }, body: JSON.stringify({ title,
            _editorialRevision: opened._editorialRevision, _status: draft ? 'draft' : 'published' }) })
        assert.equal(response.status, 200)
      }
      for (const locale of ['kh', 'cn']) await write(locale, `${locale} published original`, false)
      for (const locale of ['en', 'kh', 'cn']) await write(locale, `${locale} private draft`, true)
      for (const locale of ['en', 'kh', 'cn']) {
        await write(locale, `${locale} published update`, false)
        assert.equal((await read(locale, false)).title, `${locale} published update`)
        for (const pending of ['en', 'kh', 'cn'].slice(['en', 'kh', 'cn'].indexOf(locale) + 1)) {
          assert.equal((await read(pending, true)).title, `${pending} private draft`)
          assert.equal((await read(pending, false)).title, pending === 'en' ? 'EN published original' : `${pending} published original`)
        }
      }
    })
    await t.test('header-authenticated server integrations keep working without browser cookies or Origin', async () => {
      const apiKey = randomBytes(32).toString('hex')
      await cms.update({ collection: 'users', id: staff.id, data: { enableAPIKey: true, apiKey } as never })
      const response = await invoke('users/me', { headers: { Authorization: `users API-Key ${apiKey}` } })
      assert.equal(response.status, 200)
      assert.equal((await response.json()).user.id, staff.id)
    })
    await t.test('refresh retains two-hour sessions, logout removes the cookie, and old token no longer authenticates', async () => {
      const refresh = await invoke('users/refresh-token', { method: 'POST', headers: ownHeaders })
      assert.equal(refresh.status, 200)
      const refreshData = await refresh.json()
      const claims = JSON.parse(Buffer.from(refreshData.refreshedToken.split('.')[1], 'base64url').toString())
      assert.equal(claims.exp - claims.iat, 7200)
      const logout = await invoke('users/logout', { method: 'POST', headers: ownHeaders })
      assert.equal(logout.status, 200)
      assert.match(logout.headers.get('set-cookie') || '', /;\s*Secure(?:=true)?(?:;|$)/i)
      const me = await invoke('users/me', { headers: ownHeaders })
      assert.equal((await me.json()).user, null)
    })
  } finally {
    await cms.destroy()
    await rm(dir, { recursive: true, force: true })
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
})
