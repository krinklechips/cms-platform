import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { after, test } from 'node:test'
import React, { act } from 'react'
import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import ts from 'typescript'

const { Window } = await import('happy-dom')
const window = new Window({ url: 'https://roomchang.serviettelab.com/admin' })
Object.assign(globalThis, { window, document: window.document, HTMLElement: window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true })
const { hydrateRoot } = await import('react-dom/client')
after(() => window.happyDOM.abort())

function loadSource(path: string, exports: object, doubles: Record<string, unknown> = {}) {
  const url = new URL(path, import.meta.url)
  const require = createRequire(url)
  const compiled = ts.transpileModule(readFileSync(url, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText
  new Function('require', 'module', 'exports', compiled)((name: string) => name in doubles ? doubles[name] : require(name), { exports }, exports)
}

const brand: { AdminLogo?: React.ComponentType; AdminIcon?: React.ComponentType } = {}
loadSource('../src/components/AdminBrand.tsx', brand)
assert.ok(brand.AdminLogo)
assert.ok(brand.AdminIcon)
const { AdminLogo, AdminIcon } = brand

for (const [host, name, src] of [
  ['roomchang.serviettelab.com', 'Roomchang Dental Hospital', '/roomchang-mark.png'],
  ['serviettelab.com', 'Serviette Labs', '/serviette-logo.png'],
]) {
  test(`branding hydrates the server placeholder on ${host} without changing identity`, async () => {
    window.happyDOM.setURL(`https://${host}/admin`)
    const tree = React.createElement(React.Fragment, null, React.createElement(AdminLogo), React.createElement(AdminIcon))
    const html = renderToString(tree)
    assert.doesNotMatch(html, /<img|Roomchang|Serviette/)
    const container = document.createElement('div')
    container.innerHTML = html
    document.body.append(container)
    const hydrationErrors: unknown[] = []
    let root: ReturnType<typeof hydrateRoot> | undefined
    try {
      await act(() => { root = hydrateRoot(container, tree, { onRecoverableError: error => hydrationErrors.push(error) }) })
      const images = [...container.querySelectorAll('img')]
      assert.equal(images.length, 2)
      assert.ok(images.every(image => image.getAttribute('src') === src))
      assert.equal(images[1].alt, name)
      assert.ok(container.textContent?.includes(name) || images[0].alt === name)
      assert.deepEqual(hydrationErrors, [])
    } finally {
      await act(() => root?.unmount())
      container.remove()
    }
  })
}

type FindResult = { docs: Record<string, unknown>[] }
type DashboardProps = {
  payload?: { find: (args: { collection: string }) => Promise<FindResult> }
  user?: { roles?: string[] } | null
  hostTenant?: { id: number | string; name: string } | null
}
const dashboard: { PlatformDashboard?: (props: DashboardProps) => Promise<React.ReactNode> } = {}
loadSource('../src/components/PlatformDashboard.tsx', dashboard, {
  '@payloadcms/ui': { Gutter: ({ children }: { children: React.ReactNode }) => children },
  './OpenTenantContent': { OpenTenantContent: () => null },
})
assert.ok(dashboard.PlatformDashboard)
const { PlatformDashboard } = dashboard

const collections: Record<string, FindResult> = {
  tenants: { docs: [
    { id: 1, name: 'Roomchang', slug: 'roomchang', domains: [{ domain: 'roomchang.example' }], subscriptions: [
      { module: 10, active: true }, { module: { id: 11 }, monthlyPrice: 0 }, { module: 12, active: false, monthlyPrice: 900 },
    ] },
    { id: 2, name: 'Other workspace', slug: 'other', subscriptions: [{ module: 10, monthlyPrice: 25 }] },
  ] },
  modules: { docs: [{ id: 10, name: 'Website', defaultMonthlyPrice: 100 }, { id: 11, name: 'Media', defaultMonthlyPrice: 40 }] },
  invoices: { docs: [
    { tenant: 1, status: 'draft' }, { tenant: { id: 1 }, status: 'sent' }, { tenant: 1, status: 'paid' }, { tenant: 2, status: 'paid' },
  ] },
}
const payload = { find: async ({ collection }: { collection: string }) => collections[collection] }
const superAdmin = { roles: ['super-admin'] }

type LinkProps = { href?: string; prefetch?: boolean; children?: React.ReactNode }
function internalLinks(node: React.ReactNode): React.ReactElement<LinkProps>[] {
  if (Array.isArray(node)) return node.flatMap(internalLinks)
  if (!React.isValidElement<LinkProps>(node)) return []
  return [
    ...(node.props.href?.startsWith('/') ? [node] : []),
    ...internalLinks(node.props.children),
  ]
}

test('the platform cockpit stays super-admin-only, tenant-scoped, and preserves subscription and invoice totals', async () => {
  let reads = 0
  assert.equal(await PlatformDashboard({ payload: { find: async () => { reads++; throw new Error('Unexpected read') } }, user: { roles: ['tenant-admin'] } }), null)
  assert.equal(reads, 0)
  const tree = await PlatformDashboard({ payload, user: superAdmin })
  const html = renderToStaticMarkup(tree)
  assert.match(html, /2 tenants.*\$125\/mo subscribed/)
  assert.match(html, /Website/)
  assert.match(html, /Media/)
  assert.match(html, /1 \/ 1 \/ 1/)
  const links = internalLinks(tree)
  assert.ok(links.some(link => link.props.href === '/admin/collections/tenants/1'))
  for (const link of links) {
    assert.notEqual(link.type, 'a')
    assert.equal(link.props.prefetch, false)
  }
  const scoped = renderToStaticMarkup(await PlatformDashboard({ payload, user: superAdmin, hostTenant: { id: '1', name: 'Roomchang' } }))
  assert.match(scoped, /Roomchang.*workspace/)
  assert.doesNotMatch(scoped, /Other workspace|tenants\/2/)
  assert.match(scoped, /\$100/)
})

test('a failed cockpit query shows the existing fallback without taking down the dashboard', async () => {
  const tree = await PlatformDashboard({ payload: { find: async () => { throw new Error('Database unavailable') } }, user: superAdmin })
  assert.match(renderToStaticMarkup(tree), /Cockpit failed to load: Database unavailable/)
})

test('platform navigation preserves destinations and never prefetches logout', async () => {
  const navigation: { PlatformNav?: (props: { user: { roles: string[] } }) => Promise<React.ReactNode> } = {}
  loadSource('../src/components/PlatformNav.tsx', navigation, {
    '@payloadcms/next/rsc': {}, '@payloadcms/ui/shared': {}, '@payloadcms/translations': {},
    '@/lib/get-tenant-by-host': { normalizeHost: () => null },
    './TenantNavigation': {}, './TenantNavBanner': {}, './PlatformBackLink': {}, '@/lib/stat-pages': {},
  })
  assert.ok(navigation.PlatformNav)
  const links = internalLinks(await navigation.PlatformNav({ user: superAdmin }))
  assert.deepEqual(links.map(link => link.props.href), [
    '/admin', '/admin/collections/tenants', '/admin/collections/modules', '/admin/collections/invoices', '/admin/collections/users', '/admin/logout',
  ])
  for (const link of links) {
    assert.notEqual(link.type, 'a')
    assert.equal(link.props.prefetch, false)
  }
})

test('portal and tenant banner keep their branded admin destination without prefetching', async () => {
  let hostTenant: { name: string; slug: string; logoUrl: string } | null = { name: 'Roomchang', slug: 'roomchang', logoUrl: '/roomchang-mark.png' }
  const doubles = {
    'next/headers': { headers: async () => new Headers({ host: 'roomchang.example' }) },
    'next/headers.js': { headers: async () => new Headers({ host: 'roomchang.example' }) },
    '@/lib/get-tenant-by-host': { getTenantByHost: async () => hostTenant },
    '@/payload.config': {}, payload: { getPayload: async () => ({}) },
  }
  const portal: { default?: () => Promise<React.ReactNode> } = {}
  const banner: { TenantNavBanner?: (props: { payload: object }) => Promise<React.ReactNode> } = {}
  loadSource('../src/app/(frontend)/page.tsx', portal, doubles)
  loadSource('../src/components/TenantNavBanner.tsx', banner, doubles)
  assert.ok(portal.default)
  assert.ok(banner.TenantNavBanner)
  const trees = [await portal.default(), await banner.TenantNavBanner({ payload: {} })]
  hostTenant = null
  trees.push(await portal.default())
  for (const tree of trees) {
    const links = internalLinks(tree)
    assert.equal(links.length, 1)
    assert.equal(links[0].props.href, '/admin')
    assert.equal(links[0].props.prefetch, false)
    assert.notEqual(links[0].type, 'a')
  }
  assert.match(renderToStaticMarkup(trees[0]), /Roomchang.*Staff sign in/)
  assert.match(renderToStaticMarkup(trees[1]), /Roomchang dashboard.*Preview workspace/)
  assert.match(renderToStaticMarkup(trees[2]), /Serviette Labs.*Sign in/)
})

test('incomplete activity retains its retry and preview-only publishing warning', () => {
  const activity: { SiteActivityDashboard?: typeof import('../src/components/SiteActivityDashboard').SiteActivityDashboard } = {}
  loadSource('../src/components/SiteActivityDashboard.tsx', activity, {
    '@payloadcms/ui': { Gutter: ({ children }: { children: React.ReactNode }) => children },
    '@/lib/site-pages': { UNMODELED_PAGES: [] },
  })
  assert.ok(activity.SiteActivityDashboard)
  const props = { previewUrl: 'https://preview.example.test/en', recent: [], unpublished: [], unpublishedTotal: 0, incomplete: true }
  const html = renderToStaticMarkup(React.createElement(activity.SiteActivityDashboard, props))
  assert.match(html, /Publishing: Preview only/)
  assert.match(html, /Publishing status is not verified/)
  assert.match(html, /href="\/admin">Retry/)
  assert.match(html, /Recent edits unavailable/)
  assert.match(html, /Draft status unavailable/)
})
