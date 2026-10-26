import assert from 'node:assert/strict'
import { test } from 'node:test'
import { NextRequest } from 'next/server'
import proxy, { config } from '../src/proxy'
import { cmsPublicOrigin, trustedCMSOrigins } from '../src/lib/cms-browser-security'

test('production browser trust contains explicit HTTPS CMS origins, never website domains or wildcards', () => {
  const environment = { NODE_ENV: 'production' }
  assert.deepEqual(trustedCMSOrigins(environment), ['https://serviettelab.com', 'https://roomchang.serviettelab.com'])
  assert.equal(cmsPublicOrigin(environment), 'https://serviettelab.com')
  for (const value of ['http://serviettelab.com', 'https://trusted.invalid/path', 'https://user:password@trusted.invalid', 'https://trusted.invalid?secret=x']) {
    assert.throws(() => trustedCMSOrigins({ ...environment, CMS_TRUSTED_ORIGINS: value }), /CMS origins/)
    assert.throws(() => cmsPublicOrigin({ ...environment, CMS_PUBLIC_URL: value }), /CMS origins/)
  }
  const request = new NextRequest('https://roomchang.com/api/pages', { method: 'POST', headers: {
    Cookie: 'payload-token=synthetic', Origin: 'https://roomchang.com', 'Sec-Fetch-Site': 'same-origin',
  } })
  assert.equal(proxy(request)?.status, 403)
})

test('the proxy covers API writes without redirecting API reads through tenant pinning', () => {
  assert.ok(config.matcher.includes('/api/:path*'))
  assert.equal(proxy(new NextRequest('https://roomchang.serviettelab.com/api/pages')), undefined)
})

test('public reads, preflight, and cookie-less API clients are not blocked by the browser write guard', () => {
  for (const method of ['GET', 'HEAD', 'OPTIONS', 'POST']) {
    assert.equal(proxy(new NextRequest('https://roomchang.serviettelab.com/api/pages', { method,
      headers: method === 'POST' ? { Authorization: 'users API-Key isolated-service-fixture' } : { Origin: 'https://public-website.example.invalid' } })), undefined)
  }
})

test('forwarded HTTPS host is checked explicitly rather than trusting a sibling Origin or internal URL', () => {
  const headers = { Cookie: 'payload-token=synthetic; payload-tenant=1', 'X-Forwarded-Host': 'roomchang.serviettelab.com', 'X-Forwarded-Proto': 'https',
    Origin: 'https://roomchang.serviettelab.com', 'Sec-Fetch-Site': 'same-origin' }
  assert.equal(proxy(new NextRequest('http://localhost:10000/api/pages', { method: 'POST', headers })), undefined)
  for (const origin of ['https://serviettelab.com', 'https://untrusted-sibling.serviettelab.com', 'null']) {
    assert.equal(proxy(new NextRequest('http://localhost:10000/api/pages', { method: 'POST', headers: { ...headers, Origin: origin } }))?.status, 403)
  }
})

test('unsafe originless cookie requests cannot fall back to same-site metadata or forged Authorization', () => {
  for (const site of ['same-site', 'cross-site', 'none', '']) {
    const response = proxy(new NextRequest('https://roomchang.serviettelab.com/api/pages', { method: 'PATCH', headers: {
      Cookie: 'payload-token=synthetic; payload-tenant=1', 'Sec-Fetch-Site': site, Authorization: 'JWT invalid-not-an-authentication-bypass',
    } }))
    assert.equal(response?.status, 403)
  }
  assert.equal(proxy(new NextRequest('https://roomchang.serviettelab.com/api/pages', { method: 'PATCH', headers: {
    Cookie: 'payload-token=synthetic; payload-tenant=1', 'Sec-Fetch-Site': 'same-origin',
  } })), undefined)
})

test('the admin guard also rejects a same-site sibling Server Action without altering normal tenant pinning', () => {
  const request = new NextRequest('https://roomchang.serviettelab.com/admin/collections/pages/1', { method: 'POST', headers: {
    Cookie: 'payload-token=synthetic; payload-tenant=1', Origin: 'https://untrusted-sibling.serviettelab.com', 'Next-Action': 'synthetic',
  } })
  assert.equal(proxy(request)?.status, 403)
  const normal = proxy(new NextRequest('https://roomchang.serviettelab.com/admin', { headers: { Host: 'roomchang.serviettelab.com' } }))
  assert.equal(normal?.status, 307)
  assert.equal(new URL(normal!.headers.get('location')!).pathname, '/api/pin-tenant')
})
