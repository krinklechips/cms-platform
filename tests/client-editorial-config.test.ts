import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'
import { buildConfig, type CollectionConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { createClientCollectionConfig } from '../node_modules/payload/dist/collections/config/client.js'
import { withEditorialConcurrency } from '../src/lib/with-editorial-concurrency'
import { nativeBundle, nativeFunction } from './helpers/native-ui-bundle'

const sanitized = await buildConfig({ secret: 'isolated-client-serializer-test', telemetry: false,
  typescript: { autoGenerate: false }, db: sqliteAdapter({ client: { url: 'file::memory:' } }),
  collections: [false, true].map(protectedCollection => {
    const config: CollectionConfig = { slug: protectedCollection ? 'pages' : 'ordinary-pages', fields: [], versions: { drafts: true },
      admin: { custom: { retainedSetting: 'retained' } } }
    return protectedCollection ? withEditorialConcurrency(config) : config
  }),
})
const clientConfig = (protectedCollection: boolean) => createClientCollectionConfig({
  collection: sanitized.collections.find(collection => collection.slug === (protectedCollection ? 'pages' : 'ordinary-pages'))!,
  defaultIDType: 'number', i18n: { t: (key: string) => key, language: 'en', fallbackLanguage: 'en' } as never, importMap: {},
})

function initializer(source: ts.SourceFile, name: string, parent: ts.Node = source): string {
  let expression: ts.Expression | undefined
  function visit(node: ts.Node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === name) expression = node.initializer
    ts.forEachChild(node, visit)
  }
  visit(parent)
  assert.ok(expression, `Find ${name} in the real installed component`)
  return expression.getText(source)
}

test('editorial marker survives the real Payload server-to-client collection serializer', () => {
  const client = clientConfig(true)
  assert.equal((client as unknown as { custom?: unknown }).custom, undefined, 'Server-only custom must stay private')
  assert.equal(client.admin?.custom?.editorialConcurrency, true)
  assert.equal(client.admin?.custom?.retainedSetting, 'retained')
})

for (const protectedCollection of [false, true]) {
  for (const component of ['UnpublishButton', 'PublishButton']) {
    test(`${component} leaf and shipped protection detect a serialized collection (protected=${protectedCollection})`, () => {
      const client = clientConfig(protectedCollection)
      const path = `../node_modules/@payloadcms/ui/dist/elements/${component}/index.js`
      const source = ts.createSourceFile(path, readFileSync(new URL(path, import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS)
      assert.equal(new Function('entityConfig', `return (${initializer(source, 'editorialConcurrencyEnabled')})`)(client), protectedCollection)
      const shipped = nativeFunction(component === 'UnpublishButton' ? 'confirm-un-publish-' : 'version:publishChanges')
      assert.equal(new Function(component === 'UnpublishButton' ? 'D' : 'S', `return (${initializer(nativeBundle, 'cmsProtected', shipped)})`)(client), protectedCollection)
    })
  }
  test(`version Restore protection detects a serialized collection (protected=${protectedCollection})`, () => {
    const path = '../node_modules/@payloadcms/next/dist/views/Version/Restore/index.js'
    const source = ts.createSourceFile(path, readFileSync(new URL(path, import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS)
    assert.equal(new Function('collectionConfig', `return (${initializer(source, 'protectedRestore')})`)(clientConfig(protectedCollection)), protectedCollection)
  })
}
