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
let value: string | undefined = undefined
let writes: string[] = []
let disabled = false
let tenant = 1
let requests: string[] = []
let failed = false
let extraPrefix = false
let extraSibling = false
let storedPrefix = false
let catalogTenant: number | undefined
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
const catalog = () => ({ tenant: { id: catalogTenant ?? tenant, slug: 'roomchang' }, folders: buildMediaFolders('roomchang', tenant === 2 ? [] : [
    { prefix: 'roomchang/doctors', count: 87 }, { prefix: 'roomchang/brands/logos', count: 40 },
    ...(extraPrefix ? [{ prefix: 'serviette-media/roomchang/doctors', count: 1 }] : []),
    ...(extraSibling ? [{ prefix: 'roomchang/brands/icons', count: 1 }] : []),
    ...(storedPrefix ? [{ prefix: 'legacy-assets/photos', count: 1 }] : []),
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
const { clearMediaUploadFolder } = require('../lib/media-upload-context')
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
const managerURL = new URL(import.meta.resolve('@payloadcms/ui/elements/BulkUpload/FormsManager'))
const managerSource = ts.createSourceFile(managerURL.pathname, readFileSync(managerURL, 'utf8'), ts.ScriptTarget.ES2022, true, ts.ScriptKind.JS)
const { formsManagementReducer } = await import(new URL('reducer.js', managerURL).href)
const bundleURL = new URL(import.meta.resolve('@payloadcms/ui'))
const bundleSource = ts.createSourceFile(bundleURL.pathname, readFileSync(bundleURL, 'utf8'), ts.ScriptTarget.ES2022, true, ts.ScriptKind.JS)

// Execute the installed callbacks themselves, isolating only their provider dependencies.
function managerCallback<T>(name: string, bindings: Record<string, unknown>): T {
  let callback: ts.Expression | undefined
  const visit = (node: ts.Node) => {
    if (ts.isVariableDeclaration(node) && node.name.getText(managerSource) === name && node.initializer && ts.isCallExpression(node.initializer)) {
      callback = node.initializer.arguments[0]
    }
    ts.forEachChild(node, visit)
  }
  visit(managerSource)
  assert.ok(callback, `Installed FormsManager must define ${name}`)
  return new Function(...Object.keys(bindings), `return (${callback.getText(managerSource)})`)(...Object.values(bindings)) as T
}

type InitialState = Record<string, { value?: unknown; initialValue?: unknown; addedByServer?: boolean }>
const newMediaState = (): InitialState => ({
  tenant: { initialValue: 1, value: 1 }, _uploadFolder: { addedByServer: true },
  prefix: { initialValue: 'roomchang/original', value: 'roomchang/original' }, alt: { value: 'Unvisited upload' },
})
function nativeFolderInitializer(options: Record<string, unknown> = {}) {
  return managerCallback<(state: InitialState | undefined) => InitialState>('applyFolderToState', {
    api: '/api', collectionSlug: 'media', folderID: undefined, folderFieldName: undefined, window, ...options,
  })
}
function bundledFolderInitializer(options: Record<string, unknown> = {}) {
  let callback: ts.Expression | undefined
  const visit = (node: ts.Node) => {
    if (ts.isPropertyAssignment(node) && node.name.getText(bundleSource) === 'initialState' && ts.isCallExpression(node.initializer)
      && node.initializer.arguments.some(arg => ts.isPropertyAccessExpression(arg) && arg.name.text === 'current')) {
      const name = node.initializer.expression.getText(bundleSource)
      let owner: ts.Node | undefined = node.parent
      while (owner && !ts.isFunctionDeclaration(owner)) owner = owner.parent
      assert.ok(owner, 'Bundled addFiles must belong to a provider function')
      const find = (child: ts.Node) => {
        if (ts.isVariableDeclaration(child) && child.name.getText(bundleSource) === name && child.initializer && ts.isCallExpression(child.initializer)) {
          callback = child.initializer.arguments[0]
        }
        ts.forEachChild(child, find)
      }
      find(owner)
    }
    ts.forEachChild(node, visit)
  }
  visit(bundleSource)
  assert.ok(callback, 'The shipped bundle must retain its actual per-file initializer')
  const bindings = { o: '/api', $: 'media', B: undefined, r: undefined, window, ...options }
  return new Function(...Object.keys(bindings), `return (${callback.getText(bundleSource)})`)(...Object.values(bindings)) as (state: InitialState) => InitialState
}
function nativeBatch(baseState: InitialState) {
  let state: any = { activeIndex: 0, forms: [], totalErrorCount: 0 }
  const applyFolderToState = nativeFolderInitializer()
  const bindings = () => ({
    applyFolderToState, forms: state.forms, activeIndex: state.activeIndex,
    dispatch: (action: unknown) => { state = formsManagementReducer(state, action) },
    initialStateRef: { current: baseState }, hasInitializedState: true,
    initializeSharedFormState: async () => { throw new Error('Fixture is already initialized') },
    toggleLoadingOverlay: () => {}, getFormDataRef: { current: () => state.forms[state.activeIndex]?.formState },
  })
  return {
    get forms(): { formState: InitialState }[] { return state.forms },
    addFiles: (names: string[]) => managerCallback<(files: unknown[]) => Promise<void>>('addFiles', bindings())(
      names.map(name => new window.File(['fixture'], name, { type: 'image/png' }))),
    addInitialForms: (states: InitialState[]) => managerCallback<(forms: unknown[]) => Promise<void>>('addInitialForms', bindings())(
      states.map((initialState, index) => ({ file: new window.File(['fixture'], `${index}.png`), initialState }))),
  }
}
const render = (Component = MediaFolderBrowser) => act(async () => { root.render(React.createElement(Component, { path: '_uploadFolder' })); await new Promise(resolve => setTimeout(resolve, 10)) })
const choose = async (path: string) => act(() => {
  const select = container.querySelector('select')!
  select.value = path
  select.dispatchEvent(new window.Event('change', { bubbles: true }) as unknown as Event)
})
beforeEach(async () => {
  await act(() => root.render(null))
  clearMediaUploadFolder()
  selectedTenantID = 1; query = {}; listData = { docs: [] }; isInDrawer = false
  documentID = undefined; data = {}; value = undefined; writes = []; disabled = false; tenant = 1; requests = []; failed = false; extraPrefix = false; extraSibling = false
  registered = []; posted = []; createFails = false
  storedPrefix = false; catalogTenant = undefined
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

test('Create New carries the selected authorized uploadable folder into the new upload form', async () => {
  registered = ['technology']
  await render()
  await choose('technology')
  await render()
  await render(MediaUploadFolder)
  await render(MediaUploadFolder)
  assert.equal(value, 'technology')
  assert.equal(container.querySelector('select')?.value, 'technology')
  assert.deepEqual(writes, ['technology'])
})

test('installed bulk initializer dispatches after native folder defaults and returns the listener state without changing its base', () => {
  const base = { folder: Object.freeze({ initialValue: 7, value: 7 }), alt: Object.freeze({ value: 'Original' }) }
  Object.freeze(base)
  let received: any
  const customize = (event: unknown) => {
    received = (event as CustomEvent).detail
    assert.equal(received.state.folder.value, 23)
    received.state = { ...received.state, alt: { ...received.state.alt, value: 'Customized' } }
  }
  window.addEventListener('payload:bulk-upload-initial-state', customize)
  try {
    const result = nativeFolderInitializer({ collectionSlug: 'other-uploads', folderID: 23, folderFieldName: 'folder' })(base)
    assert.equal(received?.api, '/api')
    assert.equal(received?.collectionSlug, 'other-uploads')
    assert.equal(result.folder.value, 23)
    assert.equal(result.folder.initialValue, 23)
    assert.equal(result.alt.value, 'Customized')
    assert.equal(base.folder.value, 7)
    assert.equal(base.alt.value, 'Original')
  } finally { window.removeEventListener('payload:bulk-upload-initial-state', customize) }
})

test('native bulk addFiles defaults every first, unvisited and later file without changing shared initial state', async () => {
  await render(); await choose('doctors'); await render()
  const base = newMediaState()
  for (const field of Object.values(base)) Object.freeze(field)
  Object.freeze(base)
  const batch = nativeBatch(base)
  await batch.addFiles(['first.png', 'unvisited.png', 'also-unvisited.png'])
  assert.deepEqual(batch.forms.map(form => form.formState._uploadFolder.value), ['doctors', 'doctors', 'doctors'])
  assert.equal(base._uploadFolder.value, undefined)
  assert.equal(base._uploadFolder.initialValue, undefined)
  for (const { formState } of batch.forms) {
    assert.notEqual(formState._uploadFolder, base._uploadFolder)
    assert.equal(formState._uploadFolder.initialValue, 'doctors')
    assert.equal(formState.prefix, base.prefix)
  }
  assert.notEqual(batch.forms[0].formState._uploadFolder, batch.forms[1].formState._uploadFolder)
  await choose('brands/logos'); await render()
  await batch.addFiles(['later-first.png', 'later-unvisited.png'])
  assert.deepEqual(batch.forms.map(form => form.formState._uploadFolder.value), ['brands/logos', 'brands/logos', 'doctors', 'doctors', 'doctors'])
  assert.equal(base._uploadFolder.value, undefined)
  assert.deepEqual(writes, [], 'No upload field was mounted for any file')
})

test('bundled FormsManager defaults every unvisited and later file while preserving native folders and manual overrides', async () => {
  await render(); await choose('doctors'); await render()
  const base: InitialState = { ...newMediaState(), folder: { initialValue: 7, value: 7 } }
  for (const field of Object.values(base)) Object.freeze(field)
  Object.freeze(base)
  const initialize = bundledFolderInitializer({ B: 23, r: 'folder' })
  const firstBatch = [base, base, base].map(initialize)
  assert.deepEqual(firstBatch.map(state => state._uploadFolder.value), ['doctors', 'doctors', 'doctors'])
  assert.ok(firstBatch.every(state => state.folder.value === 23 && state.folder.initialValue === 23))
  assert.notEqual(firstBatch[0]._uploadFolder, firstBatch[1]._uploadFolder)
  assert.equal(base._uploadFolder.value, undefined)
  assert.equal(base.folder.value, 7)
  await choose('brands/logos'); await render()
  assert.deepEqual([base, base].map(initialize).map(state => state._uploadFolder.value), ['brands/logos', 'brands/logos'])
  for (const value of ['', 'doctors']) {
    const manual = { ...base, _uploadFolder: Object.freeze({ value, initialValue: value }) }
    assert.equal(initialize(manual)._uploadFolder, manual._uploadFolder)
  }
  for (const options of [{ o: '/other-api' }, { $: 'other-uploads' }]) {
    assert.equal(bundledFolderInitializer(options)(base), base)
  }
  const foreignTenant = { ...base, tenant: { value: 2 } }
  assert.equal(bundledFolderInitializer()(foreignTenant), foreignTenant)
  assert.deepEqual(writes, [])
})

test('native initialForms preserves manual folder overrides, including General, while defaulting untouched files', async () => {
  await render(); await choose('doctors'); await render()
  const general = newMediaState()
  general._uploadFolder = Object.freeze({ value: '', initialValue: '' })
  const manual = newMediaState()
  manual._uploadFolder = Object.freeze({ value: 'brands/logos', initialValue: 'brands/logos' })
  const batch = nativeBatch(newMediaState())
  await batch.addInitialForms([newMediaState(), general, manual])
  assert.deepEqual(batch.forms.map(form => form.formState._uploadFolder.value), ['doctors', '', 'brands/logos'])
  assert.equal(batch.forms[1].formState._uploadFolder, general._uploadFolder)
  assert.equal(batch.forms[2].formState._uploadFolder, manual._uploadFolder)
})

test('bulk defaults use the latest committed folder after browser remount without retaining a stale listener', async () => {
  await render(); await choose('doctors'); await render()
  const initialize = nativeFolderInitializer()
  assert.equal(initialize(newMediaState())._uploadFolder.value, 'doctors')
  await act(() => root.render(null))
  assert.equal(initialize(newMediaState())._uploadFolder.value, undefined)
  query = { where: { prefix: { in: ['roomchang/brands/logos'] } } }
  await render()
  assert.equal(initialize(newMediaState())._uploadFolder.value, 'brands/logos')
})

test('later bulk additions reset to General for All files and nonuploadable paths without rewriting earlier files', async () => {
  storedPrefix = true
  await render(); await choose('doctors'); await render()
  const batch = nativeBatch(newMediaState())
  await batch.addFiles(['earlier.png'])
  for (const folder of ['', '@stored:legacy-assets/photos']) {
    await choose(folder); await render()
    await batch.addFiles(['later.png'])
    assert.equal(batch.forms[0].formState._uploadFolder.value, undefined)
  }
  assert.equal(batch.forms.at(-1)?.formState._uploadFolder.value, 'doctors')
})

test('bulk folder context resets on tenant changes and never substitutes the cookie for the actual state tenant', async () => {
  registered = ['technology']
  await render(); await choose('technology'); await render()
  const initialize = nativeFolderInitializer()
  assert.equal(initialize(newMediaState())._uploadFolder.value, 'technology')
  selectedTenantID = 2; tenant = 2
  await render(); await render()
  const tenantTwo = { ...newMediaState(), tenant: { value: 2 } }
  assert.equal(initialize(tenantTwo), tenantTwo)
  await choose('technology'); await render()
  assert.equal(initialize(tenantTwo)._uploadFolder.value, 'technology')
  const tenantOne = newMediaState()
  assert.equal(initialize(tenantOne), tenantOne)
  assert.equal(tenantTwo.tenant.value, 2)
})

test('failed or mismatched folder catalogues cannot supply bulk defaults', async () => {
  await render(); await choose('doctors'); await render()
  const initialize = nativeFolderInitializer()
  assert.equal(initialize(newMediaState())._uploadFolder.value, 'doctors')
  failed = true
  await act(async () => { window.dispatchEvent(new window.Event('focus')); await new Promise(resolve => setTimeout(resolve, 10)) })
  const unavailable = newMediaState()
  assert.equal(initialize(unavailable), unavailable)
  failed = false; catalogTenant = 2
  await act(async () => { window.dispatchEvent(new window.Event('focus')); await new Promise(resolve => setTimeout(resolve, 10)) })
  const mismatched = newMediaState()
  assert.equal(initialize(mismatched), mismatched)
})

test('bulk defaults require the actual form tenant and leave foreign scopes, existing records and explicit values unchanged', async () => {
  await render(); await choose('doctors'); await render()
  const initialize = nativeFolderInitializer()
  assert.equal(initialize(newMediaState())._uploadFolder.value, 'doctors')
  const cases = [
    { options: { api: '/other-api' }, state: newMediaState() },
    { options: { collectionSlug: 'other-uploads' }, state: newMediaState() },
    { options: {}, state: { ...newMediaState(), tenant: { value: 2 } } },
    { options: {}, state: { ...newMediaState(), tenant: {} } },
    { options: {}, state: { ...newMediaState(), tenant: { value: null } } },
    { options: {}, state: { ...newMediaState(), id: { value: 663 } } },
    { options: {}, state: { ...newMediaState(), _uploadFolder: { value: '' } } },
    { options: {}, state: { ...newMediaState(), _uploadFolder: { value: null } } },
    { options: {}, state: { ...newMediaState(), _uploadFolder: { initialValue: '' } } },
  ]
  for (const { options, state } of cases) assert.equal(nativeFolderInitializer(options)(state), state)
  const withoutField = { tenant: { value: 1 } }
  assert.equal(initialize(withoutField), withoutField)
  assert.equal(initialize(undefined), undefined)
  const populatedTenant = { ...newMediaState(), tenant: { value: { id: '1' } } }
  assert.equal(initialize(populatedTenant)._uploadFolder.value, 'doctors')
})

test('native folder defaults remain unchanged without a media default or when no event listener is mounted', async () => {
  const base: InitialState = { ...newMediaState(), folder: { value: 7, initialValue: 7 } }
  const initialize = nativeFolderInitializer({ folderID: 23, folderFieldName: 'folder' })
  const nativeOnly = initialize(base)
  assert.deepEqual(nativeOnly, { ...base, folder: { value: 23, initialValue: 23 } })
  assert.deepEqual(nativeFolderInitializer({ window: undefined, folderID: 23, folderFieldName: 'folder' })(base), nativeOnly)
  assert.equal(base.folder.value, 7)
  await render()
  assert.deepEqual(initialize(base), nativeOnly)
  await choose('doctors'); await render()
  const combined = initialize(base)
  assert.equal(combined.folder.value, 23)
  assert.equal(combined._uploadFolder.value, 'doctors')
  assert.equal(base._uploadFolder.value, undefined)
})

for (const folder of ['', '@stored:legacy-assets/photos']) {
  test(`browsing ${folder || 'All files'} resets the next upload to General uploads`, async () => {
    storedPrefix = true
    await render(); await choose('doctors'); await render()
    await choose(folder); await render()
    await render(MediaUploadFolder)
    assert.equal(container.querySelector('select')?.value, '')
    assert.deepEqual(writes, [])
  })
}

for (const override of ['', 'brands/logos']) {
  test(`an explicit ${override || 'General uploads'} form value wins over the browsed folder, including after remount`, async () => {
    await render(); await choose('doctors'); await render()
    value = override
    await render(MediaUploadFolder)
    await act(() => root.render(null))
    await render(MediaUploadFolder)
    assert.equal(container.querySelector('select')?.value, override)
    assert.equal(value, override)
    assert.deepEqual(writes, [])
  })
}

test('a manually chosen General destination is not reapplied from context on refresh or remount', async () => {
  await render(); await choose('doctors'); await render()
  await render(MediaUploadFolder)
  assert.equal(value, 'doctors')
  await choose('')
  await act(async () => { window.dispatchEvent(new window.Event('focus')); await new Promise(resolve => setTimeout(resolve, 10)) })
  await render(MediaUploadFolder)
  await act(() => root.render(null))
  await render(MediaUploadFolder)
  assert.equal(value, '')
  assert.equal(container.querySelector('select')?.value, '')
  assert.deepEqual(writes, ['doctors', ''])
})

test('the create form reauthorizes the browsed folder against its own tenant catalogue', async () => {
  registered = ['technology']
  await render(); await choose('technology'); await render()
  registered = []
  await render(MediaUploadFolder)
  assert.equal(container.querySelector('select')?.value, '')
  assert.deepEqual(writes, [])
})

test('a failed create catalogue read cannot default the upload until an authorized retry succeeds', async () => {
  await render(); await choose('doctors'); await render()
  failed = true
  await render(MediaUploadFolder)
  assert.deepEqual(writes, [])
  failed = false
  await act(async () => { container.querySelector('button')!.click(); await new Promise(resolve => setTimeout(resolve, 10)) })
  await render(MediaUploadFolder)
  assert.equal(value, 'doctors')
  assert.deepEqual(writes, ['doctors'])
})

test('a catalogue for another tenant cannot carry an identically named upload folder', async () => {
  await render(); await choose('doctors'); await render()
  catalogTenant = 2
  await render(MediaUploadFolder)
  assert.deepEqual(writes, [])
})

test('switching browser tenants clears upload context even when both catalogues contain the same path', async () => {
  registered = ['technology']
  await render(); await choose('technology'); await render()
  selectedTenantID = 2; tenant = 2
  await render(); await render()
  await render(MediaUploadFolder)
  assert.equal(container.querySelector('select')?.value, '')
  assert.deepEqual(writes, [])
})

test('switching a new upload tenant clears its carried folder and cannot resurrect it on a later new form', async () => {
  await render(); await choose('doctors'); await render()
  await render(MediaUploadFolder)
  selectedTenantID = 2; tenant = 2
  await render(MediaUploadFolder); await render(MediaUploadFolder)
  assert.equal(value, '')
  assert.deepEqual(writes, ['doctors', ''])
  await act(() => root.render(null))
  selectedTenantID = 1; tenant = 1; value = undefined; writes = []
  await render(MediaUploadFolder)
  assert.equal(container.querySelector('select')?.value, '')
  assert.deepEqual(writes, [])
})

test('browsed context never changes an existing media record or reads its upload catalogue', async () => {
  await render(); await choose('doctors'); await render()
  documentID = 663; data = { prefix: 'roomchang/original-path' }; requests = []
  await render(MediaUploadFolder)
  assert.equal(container.querySelector('select'), null)
  assert.match(container.textContent ?? '', /roomchang\/original-path/)
  assert.deepEqual(writes, [])
  assert.deepEqual(requests, [])
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

test('an abandoned folder render cannot replace the committed upload destination', async () => {
  query = { where: { prefix: { in: ['roomchang/doctors'] } } }
  await act(async () => { root.render(browserTree()); await new Promise(resolve => setTimeout(resolve, 10)) })
  query = { where: { prefix: { in: ['roomchang/brands/logos'] } } }
  suspendBrowser = true
  await act(() => React.startTransition(() => root.render(browserTree())))
  assert.equal(nativeFolderInitializer()(newMediaState())._uploadFolder.value, 'doctors')
  await render(MediaUploadFolder)
  assert.equal(value, 'doctors')
  assert.deepEqual(writes, ['doctors'])
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
