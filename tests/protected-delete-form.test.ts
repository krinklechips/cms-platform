import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'
import { formatAdminURL } from 'payload/shared'
import { nativeBundle, nativeCallback, nativeFunction } from './helpers/native-ui-bundle'

const url = new URL('../node_modules/@payloadcms/ui/dist/elements/DeleteDocument/index.js', import.meta.url)
const source = ts.createSourceFile(url.pathname, readFileSync(url, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS)
let callback: ts.ArrowFunction | undefined
function find(node: ts.Node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(source) === 'handleDelete' && node.initializer && ts.isCallExpression(node.initializer)) {
    const value = node.initializer.arguments[0]
    if (value && ts.isArrowFunction(value)) callback = value
  }
  ts.forEachChild(node, find)
}
find(source)
assert.ok(callback)
const shippedCallback = nativeCallback(nativeFunction('w=`delete-${e}`'), 'S')

async function remove(shipped: boolean, locale: string, status: number, protectedCollection = true) {
  const sent: { url: string; init: RequestInit }[] = [], modified: boolean[] = [], errors: unknown[] = []
  const revision = `sha256:${'a'.repeat(64)}`
  const scope = {
    collectionConfig: { admin: { custom: { editorialConcurrency: protectedCollection } } },
    getDataByPath: (name: string) => { assert.equal(name, '_editorialRevision'); return revision },
    localeCode: locale, formatAdminURL, api: '/api', collectionSlug: 'pages', id: 22,
    deletePermanently: false, hasDeletePermission: true, hasTrashPermission: false,
    shouldPermanentlyDelete: () => true, setModified: (value: boolean) => modified.push(value),
    requests: { delete: async (url: string, init: RequestInit) => {
      assert.deepEqual(modified, [], 'Do not clear dirty state before the server accepts deletion')
      sent.push({ url, init })
      return Response.json(status >= 400 ? { errors: [{ message: 'Newer saved version; reopen before deletion' }] } : { message: 'Deleted fixture' }, { status })
    } },
    i18n: { language: 'en' }, t: (key: string) => key, title: 'Unsaved text must remain', singularLabel: 'Page',
    toast: { error: (message: unknown) => errors.push(message), success: () => {} },
    getTranslation: (label: unknown) => label, redirectAfterDelete: false, onDelete: undefined,
    addDefaultError: () => errors.push('Unexpected error'), startRouteTransition: () => {}, router: { push: () => {} }, adminRoute: '/admin',
  }
  const aliases = { d: scope.collectionConfig, cmsGetDeleteField: scope.getDataByPath, cmsDeleteLocale: locale,
    sE: formatAdminURL, c: scope.api, r: scope.collectionSlug, e: scope.id, R: false, f: true, m: false,
    Eg: scope.shouldPermanentlyDelete, p: scope.setModified, Ze: scope.requests, g: scope.i18n, b: scope.t,
    C: scope.title, i: scope.singularLabel, q: scope.toast, nE: scope.getTranslation, s: false, n: undefined,
    I: scope.addDefaultError, y: scope.startRouteTransition, h: scope.router, a: scope.adminRoute }
  const bindings = shipped ? aliases : scope
  const run = new Function(...Object.keys(bindings), `return (${shipped ? shippedCallback.getText(nativeBundle) : callback!.getText(source)})`)(...Object.values(bindings))
  await run()
  return { sent, modified, errors, revision }
}

for (const shipped of [false, true]) for (const locale of ['en', 'kh', 'cn']) {
  test(`${shipped ? 'shipped bundle' : 'leaf'} ${locale} deletion sends the opened revision and explicit locale`, async () => {
    const result = await remove(shipped, locale, 200)
    assert.equal(result.sent.length, 1)
    const request = result.sent[0]
    const url = new URL(request.url, 'https://cms.example.test')
    assert.equal(url.pathname, '/api/pages/22')
    assert.equal(url.searchParams.get('locale'), locale)
    assert.equal(new Headers(request.init.headers).get('if-match'), result.revision)
    assert.deepEqual(result.modified, [false])
    assert.deepEqual(result.errors, [])
  })
  for (const status of [409, 428]) test(`${shipped ? 'shipped bundle' : 'leaf'} ${locale} rejected delete ${status} retains unsaved changes`, async () => {
    const result = await remove(shipped, locale, status)
    assert.equal(result.sent.length, 1)
    assert.deepEqual(result.modified, [])
    assert.equal(result.errors.length, 1)
  })
}
