import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { after, beforeEach, test } from 'node:test'
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import ts from 'typescript'
import { buildMediaFolders } from '../src/lib/media-folders'

const { Window } = await import('happy-dom')
const window = new Window({ url: 'https://cms.example.test' })
Object.assign(globalThis, { window, document: window.document, HTMLElement: window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true })
const container = document.createElement('div')
document.body.append(container)
const root = createRoot(container)
let selectedTenantID: number | undefined = 1
let query: any = {}
let listData: any = { docs: [] }
let isInDrawer = false
let documentID: number | undefined
let data: any = {}
let value = ''
let writes: string[] = []
let disabled = false
let tenant = 1
let requests: string[] = []
let failed = false
let extraPrefix = false
let extraSibling = false
const originalFetch = globalThis.fetch
globalThis.fetch = async (input: any) => {
  requests.push(String(input))
  return new Response(JSON.stringify({ tenant: { id: tenant, slug: 'roomchang' }, folders: buildMediaFolders('roomchang', tenant === 2 ? [] : [
    { prefix: 'roomchang/doctors', count: 87 }, { prefix: 'roomchang/brands/logos', count: 40 },
    ...(extraPrefix ? [{ prefix: 'serviette-media/roomchang/doctors', count: 1 }] : []),
    ...(extraSibling ? [{ prefix: 'roomchang/brands/icons', count: 1 }] : []),
  ]) }), { status: failed ? 503 : 200 })
}
const ui = {
  useConfig: () => ({ config: { routes: { api: '/api' } } }),
  useListQuery: () => ({ data: listData, query, handleWhereChange: async (where: any) => { query = { ...query, where, page: 1 } } }),
  useListDrawerContext: () => ({ isInDrawer }),
  useDocumentInfo: () => ({ id: documentID, data }),
  useFormFields: (select: any) => select([{ tenant: { value: tenant } }]),
  useField: () => ({ value, disabled, formInitializing: false, formProcessing: false, setValue: (next: string) => { writes.push(next); value = next } }),
  FolderIcon: () => React.createElement('svg', { 'aria-hidden': true }),
}
const require = createRequire(new URL('../src/components/MediaFolders.tsx', import.meta.url))
const output = { exports: {} as any }
const compiled = ts.transpileModule(readFileSync(new URL('../src/components/MediaFolders.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText
new Function('require', 'module', 'exports', compiled)((name: string) => {
  if (name === '@payloadcms/ui') return ui
  if (name === '@payloadcms/plugin-multi-tenant/client') return { useTenantSelection: () => ({ selectedTenantID }) }
  return require(name)
}, output, output.exports)
const { MediaFolderBrowser, MediaUploadFolder } = output.exports
const render = (Component = MediaFolderBrowser) => act(async () => { root.render(React.createElement(Component, { path: '_uploadFolder' })); await new Promise(resolve => setTimeout(resolve, 10)) })
const choose = async (path: string) => act(() => {
  const select = container.querySelector('select')!
  select.value = path
  select.dispatchEvent(new window.Event('change', { bubbles: true }) as unknown as Event)
})
beforeEach(async () => {
  await act(() => root.render(null))
  selectedTenantID = 1; query = {}; listData = { docs: [] }; isInDrawer = false
  documentID = undefined; data = {}; value = ''; writes = []; disabled = false; tenant = 1; requests = []; failed = false; extraPrefix = false; extraSibling = false
})
after(async () => { await act(() => root.unmount()); globalThis.fetch = originalFetch; window.happyDOM.abort() })

test('library folder selection filters the native list and preserves search and page permissions', async () => {
  query = { page: 3, search: 'photo', where: { tenant: { equals: 1 } } }
  await render()
  assert.equal(requests[0], '/api/media/folders?tenant=1')
  assert.match(container.textContent ?? '', /doctors.*87/s)
  await choose('doctors')
  await render()
  assert.deepEqual(query, { page: 1, search: 'photo', where: { and: [{ tenant: { equals: 1 } }, { prefix: { in: ['roomchang/doctors'] } }] } })
  assert.equal(container.querySelector('select')?.value, 'doctors')
  await choose('')
  assert.deepEqual(query.where, { and: [{ tenant: { equals: 1 } }] })
  assert.deepEqual(writes, [])
})

test('nested folder buttons and breadcrumbs work in an image picker and preserve its image restriction', async () => {
  isInDrawer = true; listData = { docs: [{ tenant: 1 }] }
  query = { where: { mimeType: { like: 'image/' } } }
  await render()
  const brands = [...container.querySelectorAll('button')].find(button => button.textContent?.includes('brands'))!
  await act(() => brands.click())
  await render()
  const logos = [...container.querySelectorAll('button')].find(button => button.textContent?.includes('logos') && button.querySelector('svg'))!
  await act(() => logos.click())
  await render()
  assert.equal(container.querySelector('select')?.value, 'brands/logos')
  assert.match(container.querySelector('nav')?.textContent ?? '', /All files.*brands.*logos/)
  assert.deepEqual(query.where, { and: [{ mimeType: { like: 'image/' } }, { prefix: { in: ['roomchang/brands/logos'] } }] })
  assert.deepEqual(writes, [])
})

test('new upload chooses a category only on explicit input; existing file location is read-only', async () => {
  await render(MediaUploadFolder)
  assert.deepEqual(writes, [])
  await choose('brands/logos')
  assert.deepEqual(writes, ['brands/logos'])
  await act(() => root.render(null))
  documentID = 663; data = { prefix: 'roomchang/doctors' }; requests = []; writes = []
  await render(MediaUploadFolder)
  assert.equal(container.querySelector('select'), null)
  assert.match(container.textContent ?? '', /roomchang\/doctors/)
  assert.deepEqual(requests, [])
  assert.deepEqual(writes, [])
})

test('tenant changes reload folders without changing a field; failed reads offer retry', async () => {
  await render(MediaUploadFolder)
  selectedTenantID = 2; tenant = 2
  await render(MediaUploadFolder)
  assert.equal(requests.at(-1), '/api/media/folders?tenant=2')
  assert.deepEqual(writes, [])
  await act(() => root.render(null))
  failed = true
  await render()
  assert.match(container.querySelector('[role="alert"]')?.textContent ?? '', /could not load/i)
  failed = false
  await act(async () => { container.querySelector('button')!.click(); await new Promise(resolve => setTimeout(resolve, 10)) })
  assert.ok(container.querySelector('select'))
})

test('tenant switches clear the previous folder restriction instead of trapping the new workspace in an empty list', async () => {
  await render()
  await choose('doctors')
  selectedTenantID = 2; tenant = 2
  await render()
  await render()
  assert.deepEqual(query.where, {})
  assert.deepEqual(writes, [])
})

test('an old folder filter can be cleared even after a new prefix variant changes the catalogue', async () => {
  query = { where: { and: [{ mimeType: { like: 'image/' } }, { prefix: { in: ['roomchang/doctors'] } }] } }
  extraPrefix = true
  await render()
  await choose('')
  assert.deepEqual(query.where, { and: [{ mimeType: { like: 'image/' } }] })
})

test('changing the tenant of a NEW upload clears its old category so the submitted and displayed destination agree', async () => {
  await render(MediaUploadFolder)
  await choose('doctors')
  selectedTenantID = 2; tenant = 2
  await render(MediaUploadFolder)
  await render(MediaUploadFolder)
  assert.equal(container.querySelector('select')?.value, '')
  assert.equal(value, '')
  assert.deepEqual(writes, ['doctors', ''])
})

test('a selected parent keeps including new sibling folders when the media catalogue refreshes', async () => {
  await render()
  await choose('brands')
  await render()
  extraSibling = true; listData = { docs: [], totalDocs: 128 }
  await render()
  await render()
  assert.equal(container.querySelector('select')?.value, 'brands')
  assert.deepEqual(query.where, { and: [{ prefix: { in: ['roomchang/brands/logos', 'roomchang/brands/icons'] } }] })
})
