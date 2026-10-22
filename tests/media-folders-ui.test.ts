import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { after, beforeEach, test } from 'node:test'
import React, { act } from 'react'
import { compile } from 'sass'
import ts from 'typescript'
import { buildMediaFolders, createMediaFolderPath } from '../src/lib/media-folders'

const { Window } = await import('happy-dom')
const window = new Window({ url: 'https://cms.example.test' })
Object.assign(globalThis, { window, document: window.document, HTMLElement: window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true })
const { createRoot } = await import('react-dom/client')
const container = document.createElement('div')
document.body.append(container)
const root = createRoot(container)
let selectedTenantID: number | undefined = 1
let query: any = {}
let listData: any = { docs: [] }
const ListDataSnapshot = React.createContext<typeof listData | undefined>(undefined)
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
let registered: string[] = []
let posted: any[] = []
let createFails = false
let resolveCreation: (() => void) | undefined
let pauseCreation = false
let suspendBrowser = false
const suspendedBrowser = new Promise<never>(() => {})
const PendingBrowser = () => {
  if (suspendBrowser) throw suspendedBrowser
  return null
}
const originalFetch = globalThis.fetch
const catalog = () => ({ tenant: { id: tenant, slug: 'roomchang' }, folders: buildMediaFolders('roomchang', tenant === 2 ? [] : [
    { prefix: 'roomchang/doctors', count: 87 }, { prefix: 'roomchang/brands/logos', count: 40 },
    ...(extraPrefix ? [{ prefix: 'serviette-media/roomchang/doctors', count: 1 }] : []),
    ...(extraSibling ? [{ prefix: 'roomchang/brands/icons', count: 1 }] : []),
  ], registered) })
globalThis.fetch = async (input: any, init?: any) => {
  requests.push(String(input))
  if (init?.method === 'POST') {
    const body = JSON.parse(init.body)
    posted.push({ url: String(input), ...body })
    if (pauseCreation) await new Promise<void>(resolve => { resolveCreation = resolve })
    if (createFails) return new Response(JSON.stringify({ errors: [{ message: 'Folder creation failed' }] }), { status: 503 })
    const path = createMediaFolderPath(body.parent, body.name)
    registered.push(path)
    return new Response(JSON.stringify({ path, created: true, catalog: catalog() }), { status: 201 })
  }
  return new Response(JSON.stringify(catalog()), { status: failed ? 503 : 200 })
}
const ui = {
  useConfig: () => ({ config: { routes: { api: '/api' } } }),
  useListQuery: () => ({ data: React.useContext(ListDataSnapshot) ?? listData, query, handleWhereChange: async (where: any) => { query = { ...query, where, page: 1 } } }),
  useListDrawerContext: () => ({ isInDrawer }),
  useDocumentInfo: () => ({ id: documentID, data }),
  useFormFields: (select: any) => select([{ tenant: { value: tenant } }]),
  useField: () => ({ value, disabled, formInitializing: false, formProcessing: false, setValue: (next: string) => { writes.push(next); value = next } }),
  FolderIcon: () => React.createElement('svg', { 'aria-hidden': true }),
}
const require = createRequire(new URL('../src/components/MediaFolders.tsx', import.meta.url))
const output = { exports: {} as any }
const compiled = ts.transpileModule(readFileSync(new URL('../src/components/MediaFolders.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
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
  registered = []; posted = []; createFails = false
  resolveCreation = undefined; pauseCreation = false
  suspendBrowser = false
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

test('the library, image picker and new upload all expose folder creation without submitting the document', async () => {
  for (const Component of [MediaFolderBrowser, MediaUploadFolder]) {
    await act(() => root.render(null))
    await render(Component)
    const button = [...container.querySelectorAll('button')].find(button => button.textContent?.includes('New folder'))
    assert.ok(button, 'Folder creation must be available where folders are selected')
    assert.equal(button.type, 'button')
    await act(() => button.click())
    await render(Component)
    assert.ok(container.querySelector('input'), 'Show a folder-name input')
    assert.deepEqual(writes, [])
  }
})

const button = (name: string) => [...container.querySelectorAll('button')].find(button => button.textContent === name)!
const fillName = async (name: string) => act(() => {
  const input = container.querySelector('input')!
  Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!.call(input, name)
  input.dispatchEvent(new window.Event('input', { bubbles: true }) as unknown as Event)
})

test('creating an empty subfolder in the library and picker selects it and retains native filters', async () => {
  isInDrawer = true; query = { where: { mimeType: { like: 'image/' } } }
  await render(); await choose('doctors'); await render()
  await act(() => button('New folder').click())
  await fillName('New Team')
  await act(async () => { button('Create folder').click(); await new Promise(resolve => setTimeout(resolve, 10)) })
  await render()
  assert.deepEqual(posted, [{ url: '/api/media/folders?tenant=1', parent: 'doctors', name: 'New Team' }])
  assert.equal(container.querySelector('select')?.value, 'doctors/new-team')
  assert.deepEqual(query.where, { and: [{ mimeType: { like: 'image/' } }, { prefix: { in: ['roomchang/doctors/new-team', 'serviette-media/roomchang/doctors/new-team'] } }] })
  assert.deepEqual(writes, [])
})

test('new uploads select the explicitly created folder, while a failed creation leaves the upload and form untouched', async () => {
  await render(MediaUploadFolder); await choose('doctors')
  await render(MediaUploadFolder)
  await act(() => button('New folder').click())
  await fillName('Portraits')
  createFails = true
  await act(async () => { button('Create folder').click(); await new Promise(resolve => setTimeout(resolve, 10)) })
  assert.match(container.querySelector('[role="alert"]')?.textContent ?? '', /creation failed/)
  assert.equal(value, 'doctors')
  assert.equal(container.querySelector('input')?.value, 'Portraits')
  createFails = false
  await act(async () => { button('Create folder').click(); await new Promise(resolve => setTimeout(resolve, 10)) })
  await render(MediaUploadFolder)
  assert.equal(value, 'doctors/portraits')
  assert.equal(container.querySelector('select')?.value, 'doctors/portraits')
  assert.deepEqual(writes, ['doctors', 'doctors/portraits'])
})

test('opening and cancelling folder creation does not submit the document or change its folder', async () => {
  await render(MediaUploadFolder)
  await act(() => button('New folder').click())
  await fillName('Not Created')
  await act(() => button('Cancel').click())
  assert.equal(container.querySelector('input'), null)
  assert.deepEqual(posted, [])
  assert.deepEqual(writes, [])
})

test('returning from another tab refreshes folders without discarding an unsaved folder name', async () => {
  await render()
  await act(() => button('New folder').click())
  await fillName('New Equipment')
  await act(async () => { window.dispatchEvent(new window.Event('focus')); await new Promise(resolve => setTimeout(resolve, 10)) })
  await render()
  assert.equal(container.querySelector('input')?.value, 'New Equipment')
  assert.deepEqual(posted, [])
})

test('creation responses retain filters changed while the request was in flight', async () => {
  await render()
  await act(() => button('New folder').click())
  await fillName('New Equipment')
  pauseCreation = true
  await act(() => button('Create folder').click())
  query = { search: 'new search', where: { filename: { contains: 'recent filter' } } }
  await render()
  await act(async () => { resolveCreation!(); await new Promise(resolve => setTimeout(resolve, 10)) })
  await render()
  assert.equal(query.search, 'new search')
  assert.deepEqual(query.where.and[0], { filename: { contains: 'recent filter' } })
})

const browserTree = () => React.createElement(ListDataSnapshot, { value: listData },
  React.createElement(React.Suspense, { fallback: 'Pending folders' },
    React.createElement(MediaFolderBrowser), React.createElement(PendingBrowser)))

test('abandoned drawer renders cannot change the remembered tenant when the committed list becomes empty', async () => {
  isInDrawer = true
  selectedTenantID = 2
  listData = { docs: [{ tenant: 1 }] }
  await act(async () => { root.render(browserTree()); await new Promise(resolve => setTimeout(resolve, 10)) })
  assert.equal(requests.at(-1), '/api/media/folders?tenant=1')
  listData = { docs: [{ tenant: 2 }] }
  suspendBrowser = true
  await act(() => React.startTransition(() => root.render(browserTree())))
  listData = { docs: [] }
  suspendBrowser = false
  await act(async () => { root.render(browserTree()); await new Promise(resolve => setTimeout(resolve, 10)) })
  assert.equal(requests.at(-1), '/api/media/folders?tenant=1')
  assert.deepEqual(writes, [])
})

test('committed drawer tenant changes remain authoritative when filtering leaves no documents', async () => {
  isInDrawer = true
  selectedTenantID = 2
  listData = { docs: [{ tenant: 1 }] }
  await render()
  assert.equal(requests.at(-1), '/api/media/folders?tenant=1')
  tenant = 2
  listData = { docs: [{ tenant: 2 }] }
  await render()
  assert.equal(requests.at(-1), '/api/media/folders?tenant=2')
  listData = { docs: [] }
  selectedTenantID = 1
  await render()
  assert.equal(requests.at(-1), '/api/media/folders?tenant=2')
  assert.deepEqual(writes, [])
})

test('a pending folder creation uses the latest committed filters, never an abandoned render callback', async () => {
  const committedQuery = { search: 'committed search', where: { filename: { contains: 'committed filter' } } }
  query = committedQuery
  await act(async () => { root.render(browserTree()); await new Promise(resolve => setTimeout(resolve, 10)) })
  await act(() => button('New folder').click())
  await fillName('Committed Folder')
  pauseCreation = true
  await act(() => button('Create folder').click())
  query = { search: 'abandoned search', where: { filename: { contains: 'abandoned filter' } } }
  suspendBrowser = true
  await act(() => React.startTransition(() => root.render(browserTree())))
  query = committedQuery
  suspendBrowser = false
  await act(async () => { resolveCreation!(); await new Promise(resolve => setTimeout(resolve, 10)) })
  assert.equal(query.search, 'committed search')
  assert.deepEqual(query.where.and[0], { filename: { contains: 'committed filter' } })
  assert.deepEqual(writes, [])
})

test('the library and picker keep the creator right-aligned when the folder toolbar wraps', async () => {
  const style = document.createElement('style')
  style.textContent = compile(new URL('../src/app/(payload)/custom.scss', import.meta.url).pathname).css
  document.head.append(style)
  try {
    await render()
    const creator = container.querySelector('.cms-media-folders__select > .cms-media-folders__create')!
    const computed = window.getComputedStyle(creator as unknown as Parameters<typeof window.getComputedStyle>[0])
    assert.equal(computed.marginLeft, 'auto', 'A wrapped button must stay right-aligned so its right-anchored panel remains on-screen')
  } finally { style.remove() }
})
