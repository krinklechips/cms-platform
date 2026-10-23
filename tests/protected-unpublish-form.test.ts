import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'
import * as qs from 'qs-esm'
import { formatAdminURL } from 'payload/shared'
import { nativeBundle, nativeCallback, nativeFunction } from './helpers/native-ui-bundle'

const url = new URL('../node_modules/@payloadcms/ui/dist/elements/UnpublishButton/index.js', import.meta.url)
const source = ts.createSourceFile(url.pathname, readFileSync(url, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS)
let callback: ts.ArrowFunction | undefined
function find(node: ts.Node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(source) === 'unpublish' && node.initializer && ts.isCallExpression(node.initializer)) {
    const value = node.initializer.arguments[0]
    if (value && ts.isArrowFunction(value)) callback = value
  }
  ts.forEachChild(node, find)
}
find(source)
assert.ok(callback, 'Execute the installed native unpublish callback, not a rewritten implementation')
const shippedCallback = nativeCallback(nativeFunction('confirm-un-publish-'), '_')

async function unpublish(options: { locale: string; all: boolean; protected?: boolean; status?: number }, shipped: boolean) {
  const submitted: Record<string, unknown>[] = [], direct: { url: string; init: RequestInit }[] = [], resets: unknown[] = []
  const flags: [string, unknown][] = [], errors: unknown[] = []
  let tasks = 0
  const scope = {
    qs, formatAdminURL, editorialConcurrencyEnabled: options.protected !== false,
    entityConfig: { admin: { custom: { editorialConcurrency: options.protected !== false } } },
    dataFromProps: { title: 'Previously saved', _editorialRevision: `sha256:${'a'.repeat(64)}` },
    collectionSlug: 'pages', globalSlug: undefined, serverURL: '', api: '/api', localeCode: options.locale, id: 22,
    i18n: { language: 'en' }, t: (key: string) => key,
    resetForm: (data: unknown) => { resets.push(data) },
    submit: async (args: Record<string, unknown>) => {
      submitted.push(args)
      tasks++
      return { res: Response.json({ doc: { title: 'Entered unsaved copy' } }, { status: options.status ?? 200 }) }
    },
    requests: { patch: async (url: string, init: RequestInit) => {
      direct.push({ url, init }); tasks++
      return Response.json({ errors: [{ message: 'Current revision required' }] }, { status: options.status ?? 200 })
    } },
    incrementVersionCount: () => flags.push(['version', 1]),
    setUnpublishedVersionCount: (value: unknown) => flags.push(['unpublished', value]),
    setMostRecentVersionIsAutosaved: (value: unknown) => flags.push(['autosaved', value]),
    setHasPublishedDoc: (value: unknown) => flags.push(['published', value]),
    toast: { success: () => undefined, error: (message: unknown) => errors.push(message) },
  }
  const aliases = { ZE: qs, XE: formatAdminURL, cmsProtected: scope.editorialConcurrencyEnabled, cmsSubmit: scope.submit,
    r: scope.dataFromProps, o: scope.collectionSlug, n: scope.globalSlug, I: scope.serverURL, x: scope.api, g: scope.localeCode,
    e: scope.id, S: scope.i18n, F: scope.t, h: scope.resetForm, Ze: scope.requests, l: scope.incrementVersionCount,
    d: scope.setUnpublishedVersionCount, u: scope.setMostRecentVersionIsAutosaved, c: scope.setHasPublishedDoc, q: scope.toast }
  const bindings = shipped ? aliases : scope
  const run = new Function(...Object.keys(bindings), `return (${shipped ? shippedCallback.getText(nativeBundle) : callback!.getText(source)})`)(...Object.values(bindings))
  run(options.all)
  // The native event intentionally launches a void async task.
  for (let i = 0; i < 10; i++) await Promise.resolve()
  assert.equal(tasks, 1)
  return { submitted, direct, resets, flags, errors }
}

for (const shipped of [false, true]) {
for (const locale of ['en', 'kh', 'cn']) {
  for (const all of [false, true]) {
    test(`${shipped ? 'shipped bundle' : 'leaf'} protected ${locale} unpublish (all=${all}) uses the revision-bearing Form without resetting entered text`, async () => {
      const result = await unpublish({ locale, all }, shipped)
      assert.equal(result.submitted.length, 1, 'Unpublish must use the same protected submission path as Save/Publish')
      assert.equal(result.direct.length, 0)
      const submission = result.submitted[0]
      const target = new URL(String(submission.action), 'https://cms.example.test')
      assert.equal(target.pathname, '/api/pages/22')
      assert.equal(target.searchParams.get('locale'), locale)
      assert.equal(target.searchParams.get('unpublishAllLocales'), String(all))
      assert.equal(String(submission.method).toLowerCase(), 'patch')
      assert.deepEqual(submission.overrides, { _status: 'draft' })
      assert.equal(submission.skipValidation, true)
      assert.deepEqual(result.resets, [], 'Form owns the successful merge and updated revision; do not reset it to old props')
      assert.ok(result.flags.some(([name, value]) => name === 'published' && value === false))
    })
  }
}

for (const status of [400, 409, 428, 500]) {
  test(`${shipped ? 'shipped bundle' : 'leaf'} protected unpublish HTTP ${status} leaves publication flags and unsaved form values intact`, async () => {
    const result = await unpublish({ locale: 'kh', all: true, status }, shipped)
    assert.equal(result.submitted.length, 1)
    assert.deepEqual(result.flags, [])
    assert.deepEqual(result.resets, [])
  })
}

test(`${shipped ? 'shipped bundle' : 'leaf'} unprotected native unpublish retains its existing direct-request behavior`, async () => {
  const result = await unpublish({ locale: 'cn', all: true, protected: false }, shipped)
  assert.equal(result.submitted.length, 0)
  assert.equal(result.direct.length, 1)
  assert.equal(new URL(result.direct[0].url, 'https://cms.example.test').searchParams.has('locale'), false)
  assert.equal(result.resets.length, 1)
})
}
