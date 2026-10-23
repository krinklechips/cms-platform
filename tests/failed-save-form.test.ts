import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import type { FormState } from 'payload'
import { formatAdminURL, hasLocalizeStatusEnabled } from 'payload/shared'
import * as qs from 'qs-esm'
import ts from 'typescript'
import { fieldReducer } from '../node_modules/@payloadcms/ui/dist/forms/Form/fieldReducer.js'

const formURL = new URL('../node_modules/@payloadcms/ui/dist/forms/Form/index.js', import.meta.url)
const source = ts.createSourceFile(formURL.pathname, readFileSync(formURL, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS)
let submit: ts.ArrowFunction | undefined
function findSubmit(node: ts.Node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(source) === 'submit'
    && node.initializer && ts.isCallExpression(node.initializer)) {
    const callback = node.initializer.arguments[0]
    if (callback && ts.isArrowFunction(callback)) submit = callback
  }
  ts.forEachChild(node, findSubmit)
}
findSubmit(source)
assert.ok(submit && ts.isBlock(submit.body), 'Locate the installed Form submit callback')
const request = submit.body.statements.find(ts.isTryStatement)
assert.ok(request, 'Locate the native request/response try block')
const responseIndex = request.tryBlock.statements.findIndex(statement => ts.isVariableStatement(statement)
  && statement.declarationList.declarations.some(declaration => declaration.name.getText(source) === 'res'))
assert.ok(responseIndex >= 0 && ts.isIfStatement(request.tryBlock.statements[responseIndex + 1]))
// Execute every installed statement after the HTTP request, not a rewritten copy of its logic.
const responseSource = request.tryBlock.statements.slice(responseIndex + 2).map(statement => statement.getText(source)).join('\n')

function formHarness(modified = true, modifiedWhileProcessing = false) {
  const fields = {
    title: { initialValue: 'Saved title', value: 'Unsaved title', valid: true },
    'sections.0.text': { initialValue: 'Saved text', value: 'Unsaved text', valid: true },
  }
  const state = { modified, disabled: true, processing: true, submitted: false, valid: true }
  const contextRef: { current: { fields: FormState } } = { current: { fields } }
  const modifiedWhileProcessingRef = { current: modifiedWhileProcessing }
  const errors: unknown[] = []
  const successes: unknown[] = []
  let successCalls = 0
  const scope = {
    contextRef,
    modifiedWhileProcessingRef,
    setModified: (value: boolean) => { state.modified = value },
    setDisabled: (value: boolean) => { state.disabled = value },
    setProcessing: (value: boolean) => { state.processing = value },
    setSubmitted: (value: boolean) => { state.submitted = value },
    setIsValid: (value: boolean) => { state.valid = value },
    handleResponse: undefined as undefined | ((res: Response) => void),
    onSuccess: async () => { successCalls++ },
    successToast: (message: unknown) => { successes.push(message) },
    errorToast: (message: unknown) => { errors.push(message) },
    overridesFromArgs: {} as Record<string, unknown>,
    validateDrafts: false,
    context: {},
    serializableFormState: structuredClone(fields),
    acceptValues: true,
    prevFormState: { current: fields },
    dispatchFields: (action: Parameters<typeof fieldReducer>[1]) => {
      contextRef.current.fields = fieldReducer(contextRef.current.fields, action)
    },
    redirect: undefined,
    disableToast: false,
    t: (key: string) => key,
    errorMessages: {},
    _jsx: (component: unknown, props: unknown) => ({ component, props }),
    FieldErrorsToast: 'FieldErrorsToast',
  }
  return {
    fields, state, scope, contextRef, modifiedWhileProcessingRef, errors, successes,
    get successCalls() { return successCalls },
    respond: (res: Response) => new Function('res', ...Object.keys(scope), `return (async () => {${responseSource}\n})()`)(res, ...Object.values(scope)),
  }
}

for (const status of [400, 401, 403, 409, 422, 500]) {
  for (const duringSave of [false, true]) {
    test(`${status} preserves unsaved fields and the dirty/leave-warning state (edited during save: ${duringSave})`, async () => {
      const form = formHarness(true, duringSave)
      const before = structuredClone(form.fields)
      await form.respond(Response.json({ message: 'Save rejected' }, { status }))
      assert.equal(form.state.modified, true, 'A rejected save must not clear the dirty/leave-warning state')
      assert.equal(form.contextRef.current.fields, form.fields)
      assert.deepEqual(form.contextRef.current.fields, before)
      assert.deepEqual(form.state, { modified: true, disabled: false, processing: false, submitted: true, valid: true })
      assert.deepEqual(form.errors, ['Save rejected'])
      assert.deepEqual(form.successes, [])
      assert.equal(form.successCalls, 0)
      assert.equal(form.modifiedWhileProcessingRef.current, false)
    })
  }
}

test('a rejected pristine form stays pristine rather than being forced dirty', async () => {
  const form = formHarness(false)
  await form.respond(Response.json({ message: 'Save rejected' }, { status: 409 }))
  assert.equal(form.state.modified, false)
})

test('server field errors preserve entered values while attaching validation feedback', async () => {
  const form = formHarness()
  await form.respond(Response.json({ errors: [{ data: { errors: [{ path: 'title', message: 'Invalid title' }] } }] }, { status: 422 }))
  assert.equal(form.state.modified, true)
  assert.equal(form.state.valid, false)
  assert.deepEqual(form.contextRef.current.fields.title,
    { ...form.fields.title, valid: false, errorMessage: 'Invalid title' })
  assert.deepEqual(form.contextRef.current.fields['sections.0.text'], form.fields['sections.0.text'])
})

test('non-JSON conflicts keep unsaved text and report the HTTP error', async () => {
  const form = formHarness()
  await form.respond(new Response('Conflict', { status: 409, statusText: 'Conflict' }))
  assert.equal(form.state.modified, true)
  assert.equal(form.contextRef.current.fields, form.fields)
  assert.deepEqual(form.errors, ['Conflict'])
})

for (const duringSave of [false, true]) {
  for (const status of [200, 201, 204]) {
    test(`${status} preserves successful-save dirty-state behavior (edited during save: ${duringSave})`, async () => {
      const form = formHarness(true, duringSave)
      await form.respond(status === 204 ? new Response(null, { status }) : Response.json({}, { status }))
      assert.equal(form.state.modified, duringSave)
      assert.equal(form.modifiedWhileProcessingRef.current, false)
      assert.deepEqual(form.state, { modified: duringSave, disabled: false, processing: false, submitted: false, valid: true })
      assert.equal(form.successCalls, 1)
      assert.deepEqual(form.errors, [])
      assert.deepEqual(form.successes, ['general:submissionSuccessful'])
    })
  }
}

test('a conflict consumes the in-flight edit flag so a later successful retry clears dirty state', async () => {
  const form = formHarness(true, true)
  await form.respond(Response.json({ message: 'Save rejected' }, { status: 409 }))
  assert.equal(form.state.modified, true)
  assert.equal(form.modifiedWhileProcessingRef.current, false)
  await form.respond(Response.json({}))
  assert.equal(form.state.modified, false)
})

for (const status of [200, 409]) {
  test(`custom response handlers observe the correct dirty state for ${status}`, async () => {
    const form = formHarness()
    let observed: boolean | undefined
    form.scope.handleResponse = () => { observed = form.state.modified }
    await form.respond(Response.json({}, { status }))
    assert.equal(observed, status === 409)
    assert.equal(form.contextRef.current.fields, form.fields)
    assert.equal(form.successCalls, 0)
  })
}

const domPackage = 'happy-dom'
const { Window } = await import(domPackage).catch((error: NodeJS.ErrnoException) => {
  if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error
  return { Window: null }
})

test('mounted native Form retains entered text and modified context after 409, then clears dirty state on successful retry', {
  skip: !Window && 'Optional happy-dom runtime is not available',
}, async t => {
  const window = new Window({ url: 'https://cms.example.test' })
  const globals = { window, document: window.document, HTMLElement: window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true }
  const originalGlobals = Object.fromEntries(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]))
  Object.assign(globalThis, globals)
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  t.after(async () => {
    await act(() => root.unmount())
    await window.happyDOM.close()
    for (const [key, descriptor] of Object.entries(originalGlobals)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor)
      else Reflect.deleteProperty(globalThis, key)
    }
  })

  const errors: unknown[] = []
  const providerModules: Record<string, unknown> = {
    'next/navigation.js': { useRouter: () => ({ push: () => assert.fail('Do not navigate after a rejected save') }) },
    sonner: { toast: { error: (message: unknown) => errors.push(message), success: () => undefined } },
    '../../elements/Toasts/fieldErrors.js': { FieldErrorsToast: () => null },
    '../../providers/Auth/index.js': { useAuth: () => ({ refreshCookie: () => undefined, user: { id: 1 } }) },
    '../../providers/Config/index.js': { useConfig: () => ({ config: {} }) },
    '../../providers/DocumentInfo/index.js': { useDocumentInfo: () => ({ id: 1, collectionSlug: 'pages', docConfig: {} }) },
    '../../providers/Locale/index.js': { useLocale: () => ({ code: 'en' }) },
    '../../providers/Operation/index.js': { useOperation: () => 'update' },
    '../../providers/RouteTransition/index.js': { useRouteTransition: () => ({ startRouteTransition: () => assert.fail('Do not transition') }) },
    '../../providers/ServerFunctions/index.js': { useServerFunctions: () => ({ getFormState: () => assert.fail('Do not reset entered values') }) },
    '../../providers/Translation/index.js': { useTranslation: () => ({ i18n: { language: 'en' }, t: (key: string) => key }) },
    '../../providers/UploadHandlers/index.js': { useUploadHandlers: () => ({ getUploadHandler: () => undefined }) },
  }
  const formRequire = createRequire(formURL)
  for (const statement of source.statements) {
    if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
      const name = statement.moduleSpecifier.text
      if (!(name in providerModules)) {
        providerModules[name] = await import(name.startsWith('.') ? new URL(name, formURL).href : formRequire.resolve(name))
      }
    }
  }
  const compiled = ts.transpileModule(source.text, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText
  const output = { exports: {} as any }
  new Function('require', 'module', 'exports', compiled)((name: string) => {
    assert.ok(name in providerModules, `Unexpected Form dependency: ${name}`)
    return providerModules[name]
  }, output, output.exports)

  let status = 409
  const bodies: string[] = []
  t.mock.method(globalThis, 'fetch', async (_url: string, init: RequestInit) => {
    bodies.push(String((init.body as FormData).get('_payload')))
    return Response.json({ message: status === 409 ? 'Save rejected' : 'Saved' }, { status })
  })
  const { useForm, useFormFields, useFormModified } = output.exports
  let api: ReturnType<typeof useForm>
  function Editor() {
    api = useForm()
    const value = useFormFields(([fields]: [Record<string, { value: string }>]) => fields.title.value)
    const modified = useFormModified()
    return React.createElement('input', {
      'aria-label': 'Title', value, 'data-modified': String(modified),
      onInput: (event: React.FormEvent<HTMLInputElement>) => {
        api.dispatchFields({ type: 'UPDATE', path: 'title', value: event.currentTarget.value })
        api.setModified(true)
      },
      onChange: () => undefined,
    })
  }
  await act(() => root.render(React.createElement(output.exports.Form, {
    action: '/fixture-only', method: 'PATCH', disableSuccessStatus: true,
    initialState: { title: { initialValue: 'Saved title', value: 'Saved title', valid: true } },
  }, React.createElement(Editor))))
  const input = container.querySelector('input')!
  assert.equal(input.dataset.modified, 'false')
  await act(() => {
    input.value = 'Unsaved text after conflict'
    input.dispatchEvent(new window.Event('input', { bubbles: true }))
  })
  assert.equal(input.dataset.modified, 'true')
  await act(async () => { await api.submit() })
  assert.equal(input.value, 'Unsaved text after conflict')
  assert.equal(input.dataset.modified, 'true', 'Leave-warning consumers must still observe unsaved changes')
  assert.equal(api.getData().title, 'Unsaved text after conflict')
  assert.deepEqual(errors, ['Save rejected'])
  assert.equal(container.querySelector('form')!.getAttribute('data-form-ready'), 'true')
  status = 200
  await act(async () => { await api.submit() })
  assert.equal(input.value, 'Unsaved text after conflict')
  assert.equal(input.dataset.modified, 'false')
  assert.deepEqual(bodies.map(body => JSON.parse(body).title), ['Unsaved text after conflict', 'Unsaved text after conflict'])
})

const publishURL = new URL('../node_modules/@payloadcms/ui/dist/elements/PublishButton/index.js', import.meta.url)
const publishSource = ts.createSourceFile(publishURL.pathname, readFileSync(publishURL, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS)
const publishButton = publishSource.statements.find(statement => ts.isFunctionDeclaration(statement) && statement.name?.text === 'PublishButton')
assert.ok(publishButton && ts.isFunctionDeclaration(publishButton) && publishButton.body)
function declarationNamed(statement: ts.Statement, name: string) {
  return ts.isVariableStatement(statement) && statement.declarationList.declarations.find(declaration => declaration.name.getText(publishSource) === name)
}
const publishIndex = publishButton.body.statements.findIndex(statement => Boolean(declarationNamed(statement, 'publish')))
const statusIndex = publishButton.body.statements.findIndex(statement => Boolean(declarationNamed(statement, 'localizeStatusEnabled')))
assert.ok(statusIndex >= 0 && publishIndex > statusIndex)
const publishDeclaration = declarationNamed(publishButton.body.statements[publishIndex], 'publish')
assert.ok(publishDeclaration && publishDeclaration.initializer && ts.isCallExpression(publishDeclaration.initializer))
const publishCallback = publishDeclaration.initializer.arguments[0]
assert.ok(publishCallback && ts.isArrowFunction(publishCallback))
const publishSetup = publishButton.body.statements.slice(statusIndex, publishIndex).map(statement => statement.getText(publishSource)).join('\n')

for (const [name, custom, localizeStatus, expectedAll] of [
  ['protected collection without localized status', { editorialConcurrency: true }, false, 'true'],
  ['ordinary collection without localized status', undefined, false, null],
  ['explicitly unprotected collection', { editorialConcurrency: false }, false, null],
  ['unrelated custom configuration', { other: true }, false, null],
  ['non-boolean protection flag', { editorialConcurrency: 'true' }, false, null],
  ['ordinary collection with localized status', undefined, true, 'true'],
  ['protected collection with localized status', { editorialConcurrency: true }, true, 'true'],
] as const) {
  test(`native publish-all menu preserves explicit locale intent for ${name}`, async () => {
    const submissions: { action: string; overrides: { _status: string } }[] = []
    const scope = {
      entityConfig: { slug: 'pages', fields: [], admin: { custom }, versions: { drafts: { localizeStatus } } },
      hasLocalizeStatusEnabled, formatAdminURL, qs,
      localeCode: 'kh', api: '/api', collectionSlug: 'pages', globalSlug: undefined, id: 42,
      uploadStatus: 'idle',
      submit: async (options: typeof submissions[number]) => { submissions.push(options) },
    }
    await new Function(...Object.keys(scope), `${publishSetup}\nreturn (${publishCallback.getText(publishSource)})();`)(...Object.values(scope))
    assert.equal(submissions.length, 1)
    const url = new URL(submissions[0].action, 'https://cms.example.test')
    assert.equal(url.pathname, '/api/pages/42')
    assert.equal(url.searchParams.get('locale'), 'kh')
    assert.equal(url.searchParams.get('depth'), '0')
    assert.equal(url.searchParams.get('publishAllLocales'), expectedAll)
    assert.equal(url.searchParams.has('publishSpecificLocale'), false)
    assert.deepEqual(submissions[0].overrides, { _status: 'published' })
  })
}
