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
const ui = {
  Button: ({ children, onClick, disabled, type, extraButtonProps }: any) => React.createElement('button', { onClick, disabled, type, ...extraButtonProps }, children),
  MinimizeMaximizeIcon: () => React.createElement('svg', { 'aria-hidden': true }),
  useDocumentInfo: () => doc,
  useDocumentDrawerContext: () => ({ drawerSlug: drawer }),
  useFormModified: () => modified,
  useFormProcessing: () => processing,
  useWindowInfo: () => ({ breakpoints: { m: mobile } }),
  useLivePreviewContext: () => preview,
}
const require = createRequire(new URL('../src/components/PublishingStatus.tsx', import.meta.url))
const output = { exports: {} as any }
const compiled = ts.transpileModule(readFileSync(new URL('../src/components/PublishingStatus.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText
new Function('require', 'module', 'exports', compiled)((name: string) => {
  if (name === '@payloadcms/ui') return ui
  if (name === '@/lib/publishing-state') return { publishingState }
  if (name === './TranslationStatus') return { TranslationStatus: () => null }
  return require(name)
}, output, output.exports)
const { PublishingStatus } = output.exports
const render = () => act(() => root.render(React.createElement(PublishingStatus)))
const click = () => act(() => container.querySelector('button')!.click())
beforeEach(async () => {
  await act(() => root.render(null))
  doc = { id: 1, collectionSlug: 'homepage', hasPublishedDoc: true, unpublishedVersionCount: 0 }
  modified = false; processing = false; mobile = false; drawer = undefined; changes = []; popups = 0
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
  for (const change of [() => { doc.id = undefined }, () => { drawer = 'service-drawer' }, () => { preview.isLivePreviewEnabled = false }, () => { preview.url = '' }]) {
    await act(() => root.render(null))
    doc.id = 1; drawer = undefined; preview.isLivePreviewEnabled = true; preview.url = 'https://preview.example.test/en'
    changes = []
    change()
    await render()
    assert.equal(container.querySelector('button'), null)
    assert.deepEqual(changes, [])
  }
})
