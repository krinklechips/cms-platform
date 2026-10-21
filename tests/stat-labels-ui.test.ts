import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { after, beforeEach, test } from 'node:test'
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import ts from 'typescript'
import * as statPages from '../src/lib/stat-pages'

const domPackage = 'happy-dom'
const { Window } = await import(domPackage).catch((error: NodeJS.ErrnoException) => {
  if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error
  return { Window: null }
})
if (!Window) {
  test('stat label DOM interactions', { skip: 'Optional happy-dom runtime is not available' }, () => {})
} else {
  const window = new Window({ url: 'https://cms.example.test' })
  Object.assign(globalThis, { window, document: window.document, HTMLElement: window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true })
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  let key = 'clinical_experience'
  let drawer: { drawerSlug?: string; onSelect?: (args: unknown) => void } = {}
  let cellProps: any
  let documentTitle = ''
  let statPage = 'clinical'
  const selected: unknown[] = []
  const row = Object.freeze({ id: 11, key: 'clinical_experience', displayValue: '30 年', _status: 'draft' })
  const ui = {
    useFormFields: (select: any) => select([{ key: { value: key } }]),
    useListDrawerContext: () => drawer,
    useConfig: () => ({ config: { routes: { admin: '/admin' } } }),
    Link: ({ children, prefetch: _prefetch, ...props }: any) => React.createElement('a', props, children),
    useDocumentTitle: () => {
      const [title, setDocumentTitle] = React.useState(key)
      documentTitle = title
      return { title, setDocumentTitle }
    },
    DefaultCell: (props: any) => {
      cellProps = props
      if (props.onClick) return React.createElement('button', { onClick: () => props.onClick({ cellData: props.cellData, collectionSlug: props.collectionSlug, rowData: props.rowData }) }, props.cellData)
      return React.createElement(props.link ? 'a' : 'span', { href: props.link ? props.linkURL : undefined }, props.cellData)
    },
  }
  const require = createRequire(new URL('../src/components/StatUsage.tsx', import.meta.url))
  const output = { exports: {} as any }
  const compiled = ts.transpileModule(readFileSync(new URL('../src/components/StatUsage.tsx', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText
  new Function('require', 'module', 'exports', compiled)((name: string) => {
    if (name === '@payloadcms/ui') return ui
    if (name === '@/lib/stat-pages') return statPages
    if (name === 'next/navigation') return { useSearchParams: () => new URLSearchParams({ statPage }) }
    return require(name)
  }, output, output.exports)
  const props = { cellData: row.key, rowData: row, collectionSlug: 'site-stats', field: { name: 'key', type: 'text' }, link: true, linkURL: '/admin/collections/site-stats/11' }
  const renderCell = async (overrides = {}) => act(() => root.render(React.createElement(output.exports.StatNameCell, { ...props, ...overrides })))
  beforeEach(async () => {
    await act(() => root.render(null))
    key = 'clinical_experience'
    drawer = {}
    cellProps = undefined
    documentTitle = ''
    statPage = 'clinical'
    selected.length = 0
  })
  after(async () => {
    await act(() => root.unmount())
    await window.happyDOM.close()
  })

  test('stat name cell preserves the normal edit URL and shows its page destinations', async () => {
    await renderCell()
    assert.equal(container.querySelector('a')?.getAttribute('href'), props.linkURL)
    assert.equal(container.querySelector('a')?.textContent, 'Clinical experience')
    assert.match(container.textContent!, /Clinical Results only/)
    assert.equal(cellProps.onClick, undefined)
    assert.equal(row.key, 'clinical_experience')
  })

  test('selection drawer selects the original record rather than navigating to its editor', async () => {
    drawer = { drawerSlug: 'stat-picker', onSelect: (value) => selected.push(value) }
    await renderCell()
    assert.equal(Boolean(container.querySelector('a')), false)
    assert.ok(container.querySelector('button'))
    await act(() => container.querySelector('button')!.click())
    assert.deepEqual(selected, [{ collectionSlug: 'site-stats', doc: row, docID: 11 }])
    assert.equal(cellProps.link, false)
  })

  test('record links retain the originating page while opening the existing statistic ID', async () => {
    await renderCell({ linkURL: undefined })
    assert.equal(container.querySelector('a')?.getAttribute('href'), '/admin/collections/site-stats/11?statPage=clinical')
  })

  test('non-linked columns do not become drawer selection buttons', async () => {
    drawer = { drawerSlug: 'stat-picker', onSelect: (value) => selected.push(value) }
    await renderCell({ link: false })
    assert.equal(Boolean(container.querySelector('button')), false)
    assert.deepEqual(selected, [])
  })

  test('explicit cell callbacks survive outside a selection drawer', async () => {
    const clicks: unknown[] = []
    await renderCell({ onClick: (value: unknown) => clicks.push(value) })
    await act(() => container.querySelector('button')!.click())
    assert.equal(clicks.length, 1)
    assert.equal((clicks[0] as any).rowData, row)
  })

  test('editor title and page labels follow the record without altering form values or drafts', async () => {
    await act(() => root.render(React.createElement(output.exports.StatUsage)))
    assert.equal(documentTitle, 'Clinical experience (Clinical Results only)')
    assert.match(container.textContent!, /Pages updatedClinical Results only/)
    const clinicalLink = container.querySelector('a')?.getAttribute('href')
    assert.ok(clinicalLink)
    assert.equal(new URL(clinicalLink, 'https://cms.example.test').searchParams.get('statPage'), 'clinical')
    key = 'years_experience'
    await act(() => root.render(React.createElement(output.exports.StatUsage)))
    assert.equal(documentTitle, 'Years of experience (Home page, Our Team)')
    assert.match(container.textContent!, /Home page, Our Team/)
    assert.deepEqual(Array.from(container.querySelectorAll('a')).map((link) => new URL(link.href).searchParams.get('statPage')), ['home', 'team'])
    assert.deepEqual(row, { id: 11, key: 'clinical_experience', displayValue: '30 年', _status: 'draft' })
  })
}
