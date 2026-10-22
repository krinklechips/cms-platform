import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { after, beforeEach, test } from 'node:test'
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import ts from 'typescript'
import { publishingState } from '../src/lib/publishing-state'

const { Window } = await import('happy-dom')
const window = new Window({ url: 'https://cms.example.test' })
Object.assign(globalThis, { window, document: window.document, HTMLElement: window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true })
const container = document.createElement('div')
document.body.append(container)
const root = createRoot(container)
let doc: any
let modified: boolean
let processing: boolean
let mobile: boolean | undefined
let drawer: string | undefined
let preview: any
let changes: any[]
let popups: number
let translationFeedback: string | null
const require = createRequire(new URL('../src/components/PublishingStatus.tsx', import.meta.url))
const nativeButton = { exports: {} as any }
const nativeButtonSource = ts.transpileModule(readFileSync(new URL('../node_modules/@payloadcms/ui/dist/elements/Button/index.js', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText
new Function('require', 'module', 'exports', nativeButtonSource)((name: string) => {
  if (name.endsWith('.scss')) return {}
  if (name.startsWith('../../icons/')) return Object.fromEntries(['Chevron', 'Edit', 'Link', 'Plus', 'Swap', 'X'].map(icon => [`${icon}Icon`, () => null]))
  if (name === '../Link/index.js') return { Link: ({ children, href }: any) => React.createElement('a', { href }, children) }
  if (name === '../Popup/index.js') return { Popup: () => null }
  if (name === '../Tooltip/index.js') return { Tooltip: () => null }
  return require(name)
}, nativeButton, nativeButton.exports)
const ui = {
  Button: nativeButton.exports.Button,
  ExternalLinkIcon: () => React.createElement('svg', { 'aria-hidden': true }),
  MinimizeMaximizeIcon: () => React.createElement('svg', { 'aria-hidden': true }),
  useDocumentInfo: () => doc,
  useDocumentDrawerContext: () => ({ drawerSlug: drawer }),
  useFormModified: () => modified,
  useFormProcessing: () => processing,
  useWindowInfo: () => ({ breakpoints: { m: mobile } }),
  useLivePreviewContext: () => preview,
}
const output = { exports: {} as any }
const compiled = ts.transpileModule(readFileSync(new URL('../src/components/PublishingStatus.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText
new Function('require', 'module', 'exports', compiled)((name: string) => {
  if (name === '@payloadcms/ui') return ui
  if (name === '@/lib/publishing-state') return { publishingState }
  if (name === './TranslationStatus') return { TranslationStatus: () => translationFeedback ? React.createElement('span', { className: 'cms-translation-state', role: 'status' }, translationFeedback) : null }
  return require(name)
}, output, output.exports)
const { PublishingStatus } = output.exports
const render = () => act(() => root.render(React.createElement(PublishingStatus)))
const click = () => act(() => container.querySelector('button')!.click())
beforeEach(async () => {
  await act(() => root.render(null))
  doc = { id: 1, collectionSlug: 'homepage', hasPublishedDoc: true, unpublishedVersionCount: 0 }
  modified = false; processing = false; mobile = false; drawer = undefined; changes = []; popups = 0; translationFeedback = null
  preview = {
    isLivePreviewEnabled: true, isLivePreviewing: false, previewWindowType: 'iframe', url: 'https://preview.example.test/en',
    setIsLivePreviewing: (value: boolean) => { changes.push(['visible', value]); preview.isLivePreviewing = value },
    setPreviewWindowType: (value: string) => { changes.push(['type', value]); preview.previewWindowType = value },
    openPopupWindow: () => { popups++ },
  }
})
after(async () => { await act(() => root.unmount()); window.happyDOM.abort() })

test('opens every eligible desktop editor even when its old collection preference was closed', async () => {
  await render(); await render()
  assert.equal(preview.isLivePreviewing, true)
  assert.equal(container.querySelector('button')?.textContent, 'Hide preview')
  assert.equal(container.querySelector('button')?.getAttribute('aria-expanded'), 'true')
  assert.equal(container.querySelector('button')?.type, 'button')
  assert.equal(popups, 0)
})

test('hide/show works while dirty or saving, without submitting, opening a popup or resetting on save', async () => {
  await render(); await render()
  modified = true; processing = true
  await render(); await click(); await render()
  assert.equal(container.querySelector('button')?.textContent, 'Show preview')
  assert.equal(container.querySelector('button')?.disabled, false)
  modified = false; processing = false; doc.unpublishedVersionCount = 1
  preview.url = 'https://preview.example.test/en?changed=after-save'
  await render()
  assert.equal(preview.isLivePreviewing, false)
  assert.equal(popups, 0)
  await click(); await render()
  assert.equal(preview.isLivePreviewing, true)
})

test('new collections/documents get the same desktop layout and reopening uses an iframe, not a popup', async () => {
  await render(); await click(); await render()
  doc = { ...doc, id: 2, collectionSlug: 'services' }
  await render(); await render()
  assert.equal(preview.isLivePreviewing, true)
  preview.previewWindowType = 'popup'
  await render()
  assert.equal(container.querySelector('button')?.textContent, 'Show preview')
  await click(); await render()
  assert.equal(preview.previewWindowType, 'iframe')
  assert.equal(preview.isLivePreviewing, true)
  assert.equal(popups, 0)
})

test('mobile starts with fields visible and offers an explicit preview switch', async () => {
  mobile = true; preview.isLivePreviewing = true
  await render(); await render()
  assert.equal(preview.isLivePreviewing, false)
  assert.equal(container.querySelector('button')?.textContent, 'Show preview')
  await click(); await render()
  assert.equal(preview.isLivePreviewing, true)
  assert.equal(popups, 0)
})

test('normal hide/show never resets the already-loaded iframe handshake', async () => {
  await render(); await render()
  changes = []
  await click(); await render(); await click(); await render()
  assert.deepEqual(changes, [['visible', false], ['visible', true]])
})

test('waits for responsive state and a URL, then initializes once without writing form values', async () => {
  mobile = undefined; preview.url = ''
  await render()
  assert.equal(changes.length, 0)
  mobile = false; preview.url = 'https://preview.example.test/cn/pricing'
  await render(); await render()
  assert.equal(preview.isLivePreviewing, true)
  assert.equal(changes.filter(([name]) => name === 'visible').length, 1)
})

test('does not offer previews for create views, drawers, disabled or unmapped content', async () => {
  for (const change of [() => { doc.id = undefined }, () => { drawer = 'service-drawer' }, () => { preview.isLivePreviewEnabled = false }, () => { preview.url = '' }, () => { preview.url = null }, () => { preview.url = undefined }]) {
    await act(() => root.render(null))
    doc.id = 1; drawer = undefined; preview.isLivePreviewEnabled = true; preview.url = 'https://preview.example.test/en'
    changes = []
    change()
    await render()
    assert.equal(container.querySelector('button'), null)
    assert.equal(container.querySelector('a'), null)
    assert.deepEqual(changes, [])
  }
})

test('new-tab preview follows the current page and language without changing the inline panel', async () => {
  const cases = [
    ['https://preview.example.test/en/about/branches/fun-mall', '/en/about/branches/fun-mall'],
    ['https://preview.example.test/kh/about/branches/fun-mall', '/kh/about/branches/fun-mall'],
    ['https://preview.example.test/cn/about/branches/fun-mall', '/cn/about/branches/fun-mall'],
  ]
  for (const [url, path] of cases) {
    preview.url = url
    await render(); await render()
    const link = container.querySelector<HTMLAnchorElement>('a')
    assert.ok(link, 'Offer a separate new-tab preview link')
    assert.equal(link.textContent, 'Preview in new tab')
    assert.equal(new URL(link.href).pathname, path)
    assert.equal(link.target, '_blank')
    assert.ok(link.relList.contains('noopener'))
    assert.ok(link.relList.contains('noreferrer'))
    changes = []
    link.addEventListener('click', event => event.preventDefault())
    await act(() => link.click())
    assert.deepEqual(changes, [])
    assert.equal(preview.isLivePreviewing, true)
    assert.equal(preview.previewWindowType, 'iframe')
    assert.equal(popups, 0)
  }
})

test('new-tab preview preserves draft authentication and never submits unsaved form fields', async () => {
  modified = true; processing = true
  preview.url = 'https://preview.example.test/api/preview?secret=synthetic-fixture&redirect=%2Fcn%2Fservices%2Fdental-implants'
  let submitted = 0
  await act(() => root.render(React.createElement('form', { onSubmit: (event: React.FormEvent) => { event.preventDefault(); submitted++ } },
    React.createElement('input', { defaultValue: 'Unsaved staff edit' }), React.createElement(PublishingStatus))))
  const link = container.querySelector<HTMLAnchorElement>('a')
  assert.ok(link)
  assert.equal(link.href, 'https://preview.example.test/api/preview?secret=synthetic-fixture&redirect=%2Fcn%2Fservices%2Fdental-implants')
  assert.equal(link.getAttribute('aria-disabled'), null)
  link.addEventListener('click', event => event.preventDefault())
  changes = []
  await act(() => link.click())
  assert.equal(container.querySelector('input')?.value, 'Unsaved staff edit')
  assert.equal(submitted, 0)
  assert.deepEqual(changes, [])
  assert.equal(modified, true)
})

test('new-tab preview stays available with the inline panel hidden on desktop and mobile', async () => {
  for (const small of [false, true]) {
    await act(() => root.render(null))
    mobile = small
    await render(); await render()
    if (preview.isLivePreviewing) { await click(); await render() }
    assert.equal(preview.isLivePreviewing, false)
    assert.equal(container.querySelector('a')?.getAttribute('target'), '_blank')
    assert.equal(container.querySelector('button')?.textContent, 'Show preview')
  }
})

test('translation feedback does not split the preview action group or add standalone button spacing', async () => {
  for (const feedback of ['Checking Khmer translations...', 'Khmer: 1 empty translation field', 'Chinese: 12 empty translation fields']) {
    translationFeedback = feedback
    await render(); await render()
    const group = container.querySelector('[role="group"][aria-label="Page preview"]')
    assert.ok(group, 'Keep the two preview controls together when translation feedback is visible')
    assert.ok(group.querySelector('button'))
    assert.ok(group.querySelector('a'))
    assert.equal(group.querySelector('[role="status"]'), null)
    for (const control of group.querySelectorAll('.btn')) {
      assert.ok(control.classList.contains('btn--no-margin'), 'Toolbar controls must opt out of standalone button margins')
    }
  }
})

test('sticky preview follows toolbar resizing and native negative offsets, then restores existing styles', async () => {
  const editor = document.createElement('div')
  editor.className = 'collection-edit'
  editor.style.setProperty('--cms-doc-controls-offset', '14px', 'important')
  const toolbar = document.createElement('div')
  toolbar.className = 'doc-controls'
  toolbar.style.top = '0px'
  editor.append(toolbar); toolbar.append(container); document.body.append(editor)
  let height = 84
  toolbar.getBoundingClientRect = () => ({ height }) as DOMRect
  let resized: (() => void) | undefined
  let observed: unknown
  let disconnected = false
  const previousObserver = window.ResizeObserver
  Object.defineProperty(window, 'ResizeObserver', { configurable: true, value: class {
    constructor(callback: () => void) { resized = callback }
    observe(target: unknown) { observed = target }
    disconnect() { disconnected = true }
  } })
  try {
    await render(); await render()
    assert.equal(editor.style.getPropertyValue('--cms-doc-controls-offset'), '84px')
    assert.equal(observed, toolbar)
    height = 96; resized!()
    assert.equal(editor.style.getPropertyValue('--cms-doc-controls-offset'), '96px')
    toolbar.style.top = '-56px'
    window.dispatchEvent(new window.Event('resize'))
    assert.equal(editor.style.getPropertyValue('--cms-doc-controls-offset'), '40px')
    toolbar.style.top = '-120px'; resized!()
    assert.equal(editor.style.getPropertyValue('--cms-doc-controls-offset'), '0px')
    await act(() => root.render(null))
    assert.equal(disconnected, true)
    assert.equal(editor.style.getPropertyValue('--cms-doc-controls-offset'), '14px')
    assert.equal(editor.style.getPropertyPriority('--cms-doc-controls-offset'), 'important')
    resized!()
    assert.equal(editor.style.getPropertyValue('--cms-doc-controls-offset'), '14px')
  } finally {
    await act(() => root.render(null))
    document.body.append(container); editor.remove()
    Object.defineProperty(window, 'ResizeObserver', { configurable: true, value: previousObserver })
  }
})
