import assert from 'node:assert/strict'
import { test } from 'node:test'

test('production admin responses prevent framing without blocking their own website preview iframe', async () => {
  const environment = process.env as Record<string, string | undefined>
  const before = environment.NODE_ENV
  environment.NODE_ENV = 'production'
  try {
    const config = (await import('../next.config')).default
    assert.equal(typeof config.headers, 'function')
    const rules = await config.headers!()
    const global = rules.find(rule => rule.source === '/:path*')
    assert.ok(global)
    const headers = new Headers(Object.fromEntries(global.headers.map(header => [header.key, header.value])))
    assert.equal(headers.get('X-Content-Type-Options'), 'nosniff')
    assert.equal(headers.get('X-Frame-Options'), 'SAMEORIGIN')
    assert.equal(headers.get('Referrer-Policy'), 'strict-origin-when-cross-origin')
    assert.match(headers.get('Content-Security-Policy') || '', /frame-ancestors 'self'/)
    assert.doesNotMatch(headers.get('Content-Security-Policy') || '', /frame-src|default-src|script-src/, 'Do not accidentally prohibit the existing side preview or Next scripts')
    assert.match(headers.get('Strict-Transport-Security') || '', /max-age=31536000/)
    assert.doesNotMatch(headers.get('Strict-Transport-Security') || '', /includeSubDomains|preload/, 'Other tenants and sibling services are not in this HSTS change')
  } finally {
    if (before === undefined) delete environment.NODE_ENV
    else environment.NODE_ENV = before
  }
})
