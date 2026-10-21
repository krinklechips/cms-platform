import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { after, beforeEach, test } from 'node:test'
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import ts from 'typescript'

// DOM coverage uses the already available optional runtime, never an install.
const domPackage = 'happy-dom'
const { Window } = await import(domPackage).catch((error: NodeJS.ErrnoException) => {
  if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error
  return { Window: null }
})
if (!Window) {
  test(
    'media picker DOM interactions',
    { skip: 'Optional happy-dom runtime is not available; validation tests still run' },
    () => {},
  )
} else {
  // Only Payload's provider/drawer boundary is doubled; React and DOM events are real.
  const window = new Window({ url: 'https://cms.example.test' })
  Object.assign(globalThis, {
    window,
    document: window.document,
    HTMLElement: window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
  })
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  const writes: unknown[] = []
  let value: unknown
  let tenant: unknown
  let selectedTenantID: number | string | undefined
  let locale = 'en'
  let disabled = false
  let formInitializing = false
  let formProcessing = false
  let hasSavePermission = true
  let currentPath: string | undefined
  let siblingFields: Record<string, { value: unknown }> = {}
  let canRead = true
  let canCreate = true
  let listArgs: any
  let listProps: any
  let uploadProps: any
  let uploadOpen = false
  let listsClosed = 0
  let uploadsClosed = 0
  const List = (props: any) => {
    listProps = props
    return null
  }
  const Upload = (props: any) => {
    uploadProps = props
    return null
  }
  const require = createRequire(new URL('../src/components/ImageUrlPreview.tsx', import.meta.url))
  const ui = {
    useField: (args: any) => ({
      value,
      path: currentPath ?? args.potentiallyStalePath,
      setValue: (next: unknown) => writes.push(next),
      disabled,
      formInitializing,
      formProcessing,
    }),
    useFormFields: (select: any) => select([{ ...siblingFields, tenant: { value: tenant } }]),
    useDocumentInfo: () => ({ data: { tenant }, hasSavePermission }),
    useLocale: () => ({ code: locale }),
    useAuth: () => ({ permissions: { collections: { media: { create: canCreate, read: canRead } } } }),
    useListDrawer: (args: any) => {
      listArgs = args
      const [open, setOpen] = React.useState(false)
      return [
        List,
        null,
        {
          isDrawerOpen: open,
          openDrawer: () => setOpen(true),
          closeDrawer: () => {
            listsClosed++
            setOpen(false)
          },
        },
      ]
    },
    useDocumentDrawer: () => {
      const [open, setOpen] = React.useState(false)
      uploadOpen = open
      return [
        Upload,
        null,
        {
          isDrawerOpen: open,
          openDrawer: () => setOpen(true),
          closeDrawer: () => {
            uploadsClosed++
            setOpen(false)
          },
        },
      ]
    },
    Button: ({ children, onClick, disabled, type, ...props }: any) =>
      React.createElement('button', { onClick, disabled, type, title: props.tooltip }, children),
    SearchIcon: () => null,
    PlusIcon: () => null,
    SwapIcon: () => null,
  }
  const compiled = ts.transpileModule(
    readFileSync(new URL('../src/components/ImageUrlPreview.tsx', import.meta.url), 'utf8'),
    {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    },
  ).outputText
  const output = { exports: {} as any }
  new Function('require', 'module', 'exports', compiled)(
    (name: string) => {
      if (name === '@payloadcms/ui') return ui
      if (name === '@payloadcms/plugin-multi-tenant/client') return { useTenantSelection: () => ({ selectedTenantID }) }
      return require(name)
    },
    output,
    output.exports,
  )
  const { ImageUrlPreview } = output.exports
  const hero = output.exports.HeroImageUrlPreview ?? ImageUrlPreview
  const section = output.exports.SectionImageUrlPreview ?? ImageUrlPreview
  const render = async (props = {}) =>
    act(() => root.render(React.createElement(ImageUrlPreview, { path: 'slides.0.imageUrl', ...props })))
  const renderSource = async (component: React.FC<any>, path = 'slides.0.imageUrl', props = {}) =>
    act(() => root.render(React.createElement(component, { path, ...props })))
  const button = (label: string) => {
    const result = Array.from(container.querySelectorAll('button')).find((node) => node.textContent?.includes(label))
    assert.ok(result, `Missing button: ${label}`)
    return result
  }
  const click = async (label: string) => act(() => button(label).click())
  const media = (overrides = {}) => ({
    id: 9,
    tenant: 1,
    url: 'https://media.example.test/roomchang/photo.jpg',
    mimeType: 'image/jpeg',
    ...overrides,
  })

  beforeEach(async () => {
    await act(() => root.render(null))
    value = 'https://legacy.example.test/photo.jpg'
    tenant = 1
    selectedTenantID = 2
    locale = 'en'
    disabled = false
    formInitializing = formProcessing = false
    hasSavePermission = true
    currentPath = undefined
    siblingFields = {}
    canRead = canCreate = true
    listArgs = listProps = uploadProps = undefined
    listsClosed = uploadsClosed = 0
    writes.length = 0
  })
  after(async () => {
    await act(() => root.unmount())
    await window.happyDOM.close()
  })

  test('mount and locale changes preserve the exact existing URL', async () => {
    await render()
    locale = 'kh'
    await render()
    assert.deepEqual(writes, [])
    assert.equal(container.querySelector('img')?.getAttribute('src'), value)
  })

  test('explicit selection writes the selected image URL, not its relationship ID', async () => {
    await render()
    await click('Select image')
    assert.deepEqual(listArgs.filterOptions, {
      media: { and: [{ tenant: { equals: 1 } }, { mimeType: { like: 'image/' } }] },
    })
    assert.equal(listProps.allowCreate, false, 'Built-in create must not implicitly select an upload')
    await act(() => listProps.onSelect({ collectionSlug: 'media', doc: media() }))
    assert.deepEqual(writes, ['https://media.example.test/roomchang/photo.jpg'])
  })

  test('selection rejects wrong tenants, missing tenants, non-images, and unsafe URLs without changing the field', async () => {
    await render()
    await click('Select image')
    for (const doc of [
      media({ tenant: 2 }),
      media({ tenant: null }),
      media({ mimeType: 'application/pdf' }),
      media({ mimeType: undefined }),
      media({ url: 'javascript:alert(1)' }),
      media({ url: null }),
    ]) {
      await act(() => listProps.onSelect({ collectionSlug: 'media', doc }))
      assert.deepEqual(writes, [])
      assert.ok(container.querySelector('[role="alert"]'), 'Selection failure must be visible')
    }
    await act(() => listProps.onSelect({ collectionSlug: 'doctors', doc: media() }))
    assert.deepEqual(writes, [])
  })

  test('upload save closes the official create drawer but leaves the URL untouched', async () => {
    await render()
    await click('Upload image')
    assert.equal(uploadOpen, true)
    assert.deepEqual(uploadProps.initialData, { tenant: 1 })
    await act(() => uploadProps.onSave({ doc: media(), operation: 'create' }))
    assert.equal(uploadOpen, false)
    assert.deepEqual(writes, [])
    assert.match(container.textContent ?? '', /uploaded/i)
  })

  test('missing tenant fails closed and does not open an unscoped media library', async () => {
    tenant = undefined
    selectedTenantID = undefined
    await render()
    assert.equal(button('Select image').disabled, true)
    assert.equal(button('Upload image').disabled, true)
    assert.deepEqual(writes, [])
  })

  test('read-only fields cannot select or upload', async () => {
    await render({ readOnly: true })
    assert.equal(button('Select image').disabled, true)
    assert.equal(button('Upload image').disabled, true)
    assert.deepEqual(writes, [])
  })

  test('media read/create permissions control their respective actions', async () => {
    canCreate = false
    await render()
    assert.equal(button('Select image').disabled, false)
    assert.equal(button('Upload image').disabled, true)
    canRead = false
    await render()
    assert.equal(button('Select image').disabled, true)
    assert.deepEqual(writes, [])
  })

  test('old selection callbacks cannot write after locale, tenant, path, or URL changes', async () => {
    for (const change of ['locale', 'tenant', 'path', 'url']) {
      await act(() => root.render(null))
      tenant = 1
      locale = 'en'
      value = 'https://legacy.example.test/photo.jpg'
      await render()
      await click('Select image')
      const staleSelection = listProps.onSelect
      if (change === 'locale') locale = 'cn'
      if (change === 'tenant') tenant = 2
      if (change === 'url') value = '/images/manually-entered.jpg'
      await render(change === 'path' ? { path: 'slides.1.imageUrl' } : {})
      await act(() => staleSelection({ collectionSlug: 'media', doc: media() }))
      assert.deepEqual(writes, [], change)
    }
  })

  test('an empty URL retains selection/upload actions without dirtying the document', async () => {
    value = ''
    await render()
    assert.equal(button('Select image').disabled, false)
    assert.equal(button('Upload image').disabled, false)
    assert.equal(container.querySelector('img'), null)
    assert.deepEqual(writes, [])
  })

  test('changing locale closes an open media modal instead of leaving an orphaned modal state', async () => {
    await render()
    await click('Select image')
    locale = 'kh'
    await render()
    assert.equal(listsClosed, 1)
    await click('Upload image')
    locale = 'cn'
    await render()
    assert.equal(uploadsClosed, 1)
    assert.deepEqual(writes, [])
  })

  test('an unrelated parent rerender preserves the open library query/filter identity', async () => {
    await render()
    await click('Select image')
    const initialFilter = listArgs.filterOptions
    await render()
    assert.equal(listArgs.filterOptions, initialFilter)
  })

  test('local image URLs preview without rewriting the URL', async () => {
    value = '/api/media/file/photo.jpg'
    await render()
    assert.equal(container.querySelector('img')?.getAttribute('src'), '/api/media/file/photo.jpg')
    assert.deepEqual(writes, [])
  })

  test('invalid URLs show an actionable message without issuing an image request', async () => {
    for (const unsafe of [
      'javascript:alert(1)',
      'data:image/svg+xml,<svg/>',
      '//evil.test/a.png',
      '/\\evil.test/a.png',
      'http://media.example.test/a.jpg',
    ]) {
      value = unsafe
      await render()
      assert.equal(container.querySelector('img'), null, unsafe)
      assert.match(container.textContent ?? '', /https|relative/i)
      assert.deepEqual(writes, [])
    }
  })

  test('loading and broken previews stay visible, retry works, and URL changes reset errors', async () => {
    await render()
    assert.match(container.textContent ?? '', /loading/i)
    await act(() => container.querySelector('img')!.dispatchEvent(new window.Event('error') as unknown as Event))
    assert.match(container.querySelector('[role="alert"]')?.textContent ?? '', /image/i)
    await click('Retry preview')
    assert.match(container.textContent ?? '', /loading/i)
    await act(() => container.querySelector('img')!.dispatchEvent(new window.Event('load') as unknown as Event))
    assert.doesNotMatch(container.textContent ?? '', /loading/i)
    await act(() => container.querySelector('img')!.dispatchEvent(new window.Event('error') as unknown as Event))
    value = 'https://media.example.test/new.jpg'
    await render()
    assert.match(container.textContent ?? '', /loading/i)
    assert.equal(container.querySelector('img')?.getAttribute('src'), value)
    assert.deepEqual(writes, [])
  })

  test('native hero selection hides the fallback preview even when the relation is unresolved', async () => {
    for (const native of [9, 'unresolved-id', { id: 9 }, media()]) {
      siblingFields = { 'slides.0.image': { value: native } }
      await renderSource(hero)
      assert.ok(!container.querySelector('img'), 'An inactive fallback must not look like the active image')
      assert.match(container.querySelector('[role="status"]')?.textContent ?? '', /active source: media library/i)
      assert.match(container.textContent ?? '', /fallback.*inactive/i)
      assert.match(container.textContent ?? '', /remove.*(?:field|above)/i, 'Explain the existing native removal control')
      assert.deepEqual(writes, [])
    }
  })

  test('explicit native removal activates the untouched fallback URL without copying or clearing either source', async () => {
    siblingFields = { 'slides.0.image': { value: 9 } }
    await renderSource(hero)
    siblingFields['slides.0.image'].value = null // Payload's existing native Remove control.
    await renderSource(hero)
    assert.match(container.textContent ?? '', /active source: (?:fallback )?url/i)
    assert.equal(container.querySelector('img')?.getAttribute('src'), value)
    assert.deepEqual(writes, [])
  })

  test('native source survives mount, locale changes, and upload save without any field writes', async () => {
    siblingFields = { 'slides.0.image': { value: { id: 9 } } }
    await renderSource(hero)
    locale = 'kh'
    await renderSource(hero)
    await click('Upload image')
    await act(() => uploadProps.onSave({ doc: media(), operation: 'create' }))
    assert.ok(!container.querySelector('img'), 'Native selection must hide the fallback preview')
    assert.match(container.textContent ?? '', /active source: media library/i)
    assert.deepEqual(writes, [])
    assert.equal(value, 'https://legacy.example.test/photo.jpg')
    assert.deepEqual(siblingFields['slides.0.image'].value, { id: 9 })
  })

  test('native changes invalidate open selection and upload callbacks, including replacement and removal', async () => {
    for (const [previous, next] of [[null, 9], [9, 10], [9, null], [{ id: 9 }, { id: 10 }]]) {
      await act(() => root.render(null))
      siblingFields = { 'slides.0.image': { value: previous } }
      await renderSource(hero)
      await click('Select image')
      const staleSelection = listProps.onSelect
      await click('Upload image')
      const staleSave = uploadProps.onSave
      const closed = [listsClosed, uploadsClosed]
      siblingFields['slides.0.image'].value = next
      await renderSource(hero)
      assert.deepEqual([listsClosed, uploadsClosed], closed.map((count) => count + 1))
      await act(() => {
        staleSelection({ collectionSlug: 'media', doc: media() })
        staleSave({ doc: media(), operation: 'create' })
      })
      assert.deepEqual(writes, [])
      assert.doesNotMatch(container.textContent ?? '', /image uploaded/i)
    }
  })

  test('section sources resolve the exact sibling through gallery, image pair, and nested two-column paths', async () => {
    for (const path of [
      'sections.2.src',
      'sections.1.images.3.url',
      'sections.4.left.src',
      'sections.4.right.src',
      'sections.0.left.0.images.2.url',
      'sections.0.right.0.left.src',
    ]) {
      const parent = path.slice(0, path.lastIndexOf('.') + 1)
      siblingFields = { [`${parent}media`]: { value: 9 }, media: { value: null } }
      await renderSource(section, path)
      assert.ok(!container.querySelector('img'), path)
      assert.match(container.textContent ?? '', /active source: media library/i, path)
      siblingFields[`${parent}media`].value = null
      siblingFields.media.value = 99 // Another row must never determine this source.
      await renderSource(section, path)
      assert.equal(container.querySelector('img')?.getAttribute('src'), value, path)
      assert.deepEqual(writes, [])
    }
  })

  test('hero source follows the current reordered field path, not the stale server prop', async () => {
    currentPath = 'slides.3.imageUrl'
    siblingFields = { 'slides.0.image': { value: null }, 'slides.3.image': { value: 9 } }
    await renderSource(hero, 'slides.0.imageUrl')
    assert.ok(!container.querySelector('img'), 'Use the native relation at the current field path')
    assert.match(container.textContent ?? '', /active source: media library/i)
    assert.deepEqual(writes, [])
  })

  test('selecting a fallback while native is active changes only the URL and keeps its preview inactive', async () => {
    siblingFields = { 'slides.0.image': { value: 9 } }
    await renderSource(hero)
    await click('Select image')
    await act(() => listProps.onSelect({ collectionSlug: 'media', doc: media() }))
    assert.deepEqual(writes, ['https://media.example.test/roomchang/photo.jpg'])
    assert.equal(siblingFields['slides.0.image'].value, 9)
    assert.ok(!container.querySelector('img'), 'Selecting a fallback must not make it look active')
    assert.match(container.textContent ?? '', /fallback.*inactive/i)
  })

  test('URL-only fields ignore unrelated native siblings and remain usable', async () => {
    siblingFields = { image: { value: 9 }, media: { value: 10 } }
    await render({ path: 'seoImage' })
    assert.equal(container.querySelector('img')?.getAttribute('src'), value)
    assert.deepEqual(writes, [])
  })

  test('source-aware controls respect read-only, disabled, initializing, processing, and save permissions', async () => {
    siblingFields = { 'slides.0.image': { value: 9 } }
    for (const mode of ['readOnly', 'fieldReadOnly', 'disabled', 'initializing', 'processing', 'noSave']) {
      disabled = mode === 'disabled'
      formInitializing = mode === 'initializing'
      formProcessing = mode === 'processing'
      hasSavePermission = mode !== 'noSave'
      await renderSource(hero, 'slides.0.imageUrl', {
        readOnly: mode === 'readOnly',
        field: { admin: { readOnly: mode === 'fieldReadOnly' } },
      })
      assert.equal(button('Select image').disabled, true, mode)
      assert.equal(button('Upload image').disabled, true, mode)
      assert.deepEqual(writes, [])
    }
  })
}
