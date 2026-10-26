import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'
import ts from 'typescript'
import { getPreviewUrl } from '../src/lib/preview-routes'

const require = createRequire(import.meta.url)
const compiled = ts.transpileModule(readFileSync(new URL('../src/app/(frontend)/preview/services/[slug]/page.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
}).outputText

test('obsolete service preview returns native 404 before reading CMS data in every language', async () => {
  let reads = 0
  const output = { exports: {} as any }
  new Function('require', 'module', 'exports', compiled)((name: string) => {
    if (name === '@payload-config') return { default: {} }
    if (name === 'payload') return { getPayload: async () => {
      reads++
      return { find: async () => ({ docs: [{ id: 99, slug: 'unpublished-audit-fixture', _status: 'draft', tenant: 2 }] }) }
    } }
    if (name === './preview-client') return { ServicePreviewClient: () => null }
    return require(name)
  }, output, output.exports)

  for (const locale of ['en', 'kh', 'cn']) {
    await assert.rejects(async () => output.exports.default({
      params: Promise.resolve({ slug: 'unpublished-audit-fixture' }),
      searchParams: Promise.resolve({ locale }),
    }), /NEXT_HTTP_ERROR_FALLBACK;404/)
  }
  assert.equal(reads, 0, 'The disabled route must not initialize Payload or query content')
})

test('supported service previews still use the test-site entry point and selected language', async () => {
  const previousSite = process.env.DUMMY_SITE_URL
  const previousSecret = process.env.PREVIEW_SECRET
  const previousTenant = process.env.DUMMY_SITE_TENANT_ID
  process.env.DUMMY_SITE_URL = 'https://preview.example.test'
  process.env.PREVIEW_SECRET = 'synthetic-preview-test-secret'
  process.env.DUMMY_SITE_TENANT_ID = '1'
  const req = { user: { roles: ['editor'], tenants: [{ tenant: 1 }] },
    payload: { findByID: async () => ({ id: 1, tenant: 1 }) } }
  try {
    for (const code of ['en', 'kh', 'cn']) {
      const value = await getPreviewUrl({ data: { id: 1, slug: 'implant-bridges' }, locale: { code }, collectionConfig: { slug: 'services' }, req } as unknown as Parameters<typeof getPreviewUrl>[0])
      const url = new URL(String(value))
      assert.equal(url.origin, 'https://preview.example.test')
      assert.equal(url.pathname, '/api/preview')
      assert.equal(url.searchParams.get('redirect'), `/${code}/services/implant-bridges`)
    }
  } finally {
    if (previousSite === undefined) delete process.env.DUMMY_SITE_URL
    else process.env.DUMMY_SITE_URL = previousSite
    if (previousSecret === undefined) delete process.env.PREVIEW_SECRET
    else process.env.PREVIEW_SECRET = previousSecret
    if (previousTenant === undefined) delete process.env.DUMMY_SITE_TENANT_ID
    else process.env.DUMMY_SITE_TENANT_ID = previousTenant
  }
})
