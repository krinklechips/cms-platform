import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test, { type TestContext } from 'node:test'
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import * as translations from '@payloadcms/translations'
import { formatAdminURL } from 'payload/shared'
import ts from 'typescript'
import { requests } from '../node_modules/@payloadcms/ui/dist/utilities/api.js'

const domPackage = 'happy-dom'
const { Window } = await import(domPackage).catch((error: NodeJS.ErrnoException) => {
  if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error
  return { Window: null }
})
const domOptions = { skip: !Window && 'Optional happy-dom runtime is not available' }
const restoreURL = new URL('../node_modules/@payloadcms/next/dist/views/Version/Restore/index.js', import.meta.url)
const require = createRequire(restoreURL)
const compiled = ts.transpileModule(readFileSync(restoreURL, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText
const token = (character: string) => `sha256:${character.repeat(64)}`

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(done => { resolve = done })
  return { promise, resolve }
}

async function mountRestore(t: TestContext, options: { protected?: boolean; global?: boolean; postStatus?: number } = {}) {
  const window = new Window({ url: 'https://cms.example.test/admin/collections/pages/42/versions/old-version' })
  const globals = { window, document: window.document, HTMLElement: window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true }
  const originals = Object.fromEntries(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]))
  Object.assign(globalThis, globals)
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  t.after(async () => {
    await act(() => root.unmount())
    await window.happyDOM.close()
    for (const [key, descriptor] of Object.entries(originals)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor)
      else Reflect.deleteProperty(globalThis, key)
    }
  })

  const reads: { url: URL; signal: AbortSignal; response: ReturnType<typeof deferred<Response>> }[] = []
  const posts: { url: URL; headers: Headers }[] = []
  const errors: unknown[] = []
  const successes: unknown[] = []
  const navigations: string[] = []
  let transitions = 0
  const confirmations: Promise<unknown>[] = []
  let locale = { code: 'en', label: 'English' }
  let props = {
    collectionConfig: options.global ? undefined : { slug: 'pages', custom: { editorialConcurrency: options.protected !== false } },
    globalConfig: options.global ? { slug: 'settings' } : undefined,
    label: 'Page', originalDocID: 42, versionID: 'old-version', status: 'published', versionDateFormatted: '2026-10-19',
  }
  const ModalContext = React.createContext({ open: false, toggleModal: (_slug: string) => {} })
  function ModalProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState(false)
    return React.createElement(ModalContext, { value: { open, toggleModal: () => setOpen(previous => !previous) } }, children)
  }
  const ui = {
    useConfig: () => ({ config: { routes: { api: '/api', admin: '/admin' } } }),
    useLocale: () => locale,
    useModal: () => React.useContext(ModalContext),
    useTranslation: () => ({ i18n: { language: 'en', fallbackLanguage: 'en' }, t: (key: string) => key }),
    useRouteTransition: () => ({ startRouteTransition: (navigate: () => void) => { transitions++; navigate() } }),
    toast: { error: (message: unknown) => errors.push(message), success: (message: unknown) => successes.push(message) },
    Button: ({ children, disabled, onClick }: { children: React.ReactNode; disabled: boolean; onClick: () => void }) =>
      React.createElement('button', { type: 'button', 'data-open-restore': true, disabled, onClick }, children),
    ConfirmationModal: ({ onConfirm, heading }: { onConfirm: () => Promise<unknown>; heading: string }) => {
      const { open } = React.useContext(ModalContext)
      return open ? React.createElement('section', { role: 'dialog', 'aria-label': heading },
        React.createElement('button', { type: 'button', 'data-confirm-restore': true, onClick: () => {
          confirmations.push(onConfirm())
        } }, 'Confirm restore')) : null
    },
  }
  const modules: Record<string, unknown> = {
    'react/jsx-runtime': require('react/jsx-runtime'), react: require('react'),
    '@payloadcms/translations': translations, '@payloadcms/ui': ui, '@payloadcms/ui/shared': { requests },
    'payload/shared': { formatAdminURL },
    'next/navigation.js': { useRouter: () => ({ push: (url: string) => navigations.push(url) }) },
  }
  const output = { exports: {} as any }
  // Keep the native Restore, React effects, and HTTP utility real; replace only its UI/provider boundaries.
  new Function('require', 'module', 'exports', compiled)((name: string) => {
    assert.ok(name in modules, `Unexpected Restore dependency: ${name}`)
    return modules[name]
  }, output, output.exports)
  t.mock.method(globalThis, 'fetch', async (url: string, init: RequestInit) => {
    const parsed = new URL(url, 'https://cms.example.test')
    if (init.method === 'post') {
      posts.push({ url: parsed, headers: new Headers(init.headers) })
      return options.postStatus === 409
        ? Response.json({ errors: [{ message: 'A newer saved version is available.' }] }, { status: 409 })
        : Response.json({ message: 'Restored as draft' })
    }
    assert.equal(init.method, undefined, 'Only capture GET and restore POST are allowed')
    const response = deferred<Response>()
    reads.push({ url: parsed, signal: init.signal as AbortSignal, response })
    // Deliberately allow late responses after abort to verify the component rejects them too.
    return response.promise
  })

  const render = async (changes: Partial<typeof props> = {}, localeCode = locale.code) => {
    props = { ...props, ...changes }
    locale = { code: localeCode, label: localeCode }
    await act(() => root.render(React.createElement(ModalProvider, null, React.createElement(output.exports.Restore, props))))
  }
  await render()
  return {
    container, reads, posts, errors, successes, navigations, render,
    get transitions() { return transitions },
    get button() { return container.querySelector<HTMLButtonElement>('[data-open-restore]')! },
    resolveRead: async (index: number, revision: string | null = token('a'), status = 200) => {
      await act(async () => {
        reads[index].response.resolve(Response.json(revision === null ? {} : { _editorialRevision: revision }, { status }))
      })
    },
    open: async () => { await act(() => container.querySelector<HTMLButtonElement>('[data-open-restore]')!.click()) },
    confirm: async () => {
      const button = container.querySelector<HTMLButtonElement>('[data-confirm-restore]')
      assert.ok(button, 'Open the native confirmation action before confirming')
      await act(async () => {
        button.click()
        await confirmations.at(-1)
      })
    },
  }
}

test('protected Restore captures a raw draft revision on view load and stays disabled until it arrives', domOptions, async t => {
  const form = await mountRestore(t)
  assert.equal(form.reads.length, 1)
  const read = form.reads[0]
  assert.equal(read.url.pathname, '/api/pages/42')
  assert.deepEqual(Object.fromEntries(read.url.searchParams), { draft: 'true', depth: '0', 'fallback-locale': 'none', locale: 'en' })
  assert.equal(read.signal.aborted, false)
  assert.equal(form.button.disabled, true)
  await form.open()
  assert.equal(form.container.querySelector('[role=dialog]'), null)
  assert.equal(form.posts.length, 0)
  await form.resolveRead(0)
  assert.equal(form.button.disabled, false)
})

test('confirmation sends If-Match from the initial capture without fetching a newer token', domOptions, async t => {
  const form = await mountRestore(t)
  await form.resolveRead(0, token('a'))
  await form.open()
  await form.render()
  await form.confirm()
  assert.equal(form.reads.length, 1, 'Confirmation must not silently authorize newer intervening saves')
  assert.equal(form.posts.length, 1)
  assert.equal(form.posts[0].headers.get('If-Match'), token('a'))
  assert.equal(form.posts[0].headers.get('Accept-Language'), 'en')
  assert.equal(form.posts[0].url.pathname, '/api/pages/versions/old-version')
  assert.deepEqual(Object.fromEntries(form.posts[0].url.searchParams), { draft: 'true', locale: 'en' })
  assert.deepEqual(form.successes, ['Restored as draft'])
  assert.deepEqual(form.navigations, ['/admin/collections/pages/42?locale=en'])
  assert.equal(form.transitions, 1)
})

test('409 reports the conflict and stays on the history view without refreshing its captured token', domOptions, async t => {
  const form = await mountRestore(t, { postStatus: 409 })
  await form.resolveRead(0, token('a'))
  await form.open()
  await form.confirm()
  assert.deepEqual(form.errors, ['A newer saved version is available.'])
  assert.deepEqual(form.successes, [])
  assert.deepEqual(form.navigations, [])
  assert.equal(form.transitions, 0)
  assert.equal(form.reads.length, 1)
  assert.equal(form.posts[0].headers.get('If-Match'), token('a'))
})

for (const [name, revision, status] of [['failed capture', token('a'), 403], ['missing token', null, 200]] as const) {
  test(`${name} leaves protected Restore disabled and reports the failed check`, domOptions, async t => {
    const form = await mountRestore(t)
    await form.resolveRead(0, revision, status)
    assert.equal(form.button.disabled, true)
    assert.equal(form.errors.length, 1)
    assert.match(String(form.errors[0]), /Unable to check the current saved version/)
    assert.deepEqual(form.posts, [])
    assert.deepEqual(form.navigations, [])
  })
}

for (const kind of ['locale', 'parent'] as const) {
  test(`${kind} changes disable the old token, abort reads, and ignore a late old response`, domOptions, async t => {
    const form = await mountRestore(t)
    await form.render(kind === 'parent' ? { originalDocID: 43 } : {}, kind === 'locale' ? 'kh' : 'en')
    assert.equal(form.reads.length, 2)
    assert.equal(form.reads[0].signal.aborted, true)
    assert.equal(form.button.disabled, true)
    await form.resolveRead(0, token('a'))
    assert.equal(form.button.disabled, true, 'An aborted request cannot authorize the new locale or parent')
    await form.resolveRead(1, token('b'))
    assert.equal(form.button.disabled, false)
    await form.open()
    await form.confirm()
    assert.equal(form.posts[0].headers.get('If-Match'), token('b'))
    assert.equal(form.posts[0].url.searchParams.get('locale'), kind === 'locale' ? 'kh' : 'en')
    assert.equal(form.reads[1].url.pathname, kind === 'parent' ? '/api/pages/43' : '/api/pages/42')
  })

  test(`returning to an earlier ${kind} must wait for a fresh capture instead of reusing its old token`, domOptions, async t => {
    const form = await mountRestore(t)
    await form.resolveRead(0, token('a'))
    assert.equal(form.button.disabled, false)
    await form.open()
    await form.render(kind === 'parent' ? { originalDocID: 43 } : {}, kind === 'locale' ? 'kh' : 'en')
    assert.equal(form.button.disabled, true)
    await form.render({ originalDocID: 42 }, 'en')
    assert.equal(form.reads.length, 3)
    assert.equal(form.reads[1].signal.aborted, true)
    assert.equal(form.button.disabled, true, 'A matching old key is not a newly captured revision')
    await form.confirm()
    assert.equal(form.posts.length, 0, 'An already-open modal must not submit the stale captured token')
    await form.resolveRead(1, token('b'))
    assert.equal(form.button.disabled, true)
    await form.resolveRead(2, token('c'))
    assert.equal(form.button.disabled, false)
    await form.confirm()
    assert.equal(form.posts[0].headers.get('If-Match'), token('c'))
  })
}

for (const global of [false, true]) {
  test(`unprotected ${global ? 'global' : 'collection'} Restore remains available without capture GET or If-Match`, domOptions, async t => {
    const form = await mountRestore(t, { protected: false, global })
    assert.equal(form.button.disabled, false)
    assert.deepEqual(form.reads, [])
    await form.open()
    await form.confirm()
    assert.equal(form.posts.length, 1)
    assert.equal(form.posts[0].headers.has('If-Match'), false)
    assert.equal(form.posts[0].url.pathname, global ? '/api/globals/settings/versions/old-version' : '/api/pages/versions/old-version')
    assert.deepEqual(Object.fromEntries(form.posts[0].url.searchParams), { draft: 'true', locale: 'en' })
    assert.deepEqual(form.navigations, [global ? '/admin/globals/settings?locale=en' : '/admin/collections/pages/42?locale=en'])
  })
}

test('an open confirmation cannot reuse its captured revision after the parent changes', domOptions, async t => {
  const form = await mountRestore(t)
  await form.resolveRead(0)
  await form.open()
  await form.render({ originalDocID: 43 })
  await form.confirm()
  assert.equal(form.button.disabled, true)
  assert.deepEqual(form.posts, [])
  assert.deepEqual(form.navigations, [])
  assert.match(String(form.errors.at(-1)), /Wait for the saved-version check/)
})
