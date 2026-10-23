import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import ts from 'typescript'

const entry = createRequire(import.meta.url).resolve('@payloadcms/ui')
assert.match(entry, /dist\/exports\/client\/index\.js$/)
export const nativeBundle = ts.createSourceFile(entry, readFileSync(entry, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS)

export function nativeFunction(marker: string): ts.FunctionDeclaration | ts.VariableDeclaration {
  let found: ts.FunctionDeclaration | ts.VariableDeclaration | undefined
  function visit(node: ts.Node) {
    if (found) return
    if ((ts.isFunctionDeclaration(node) || ts.isVariableDeclaration(node) && node.initializer &&
      (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))) && node.getText(nativeBundle).includes(marker)) {
      found = node
      return
    }
    ts.forEachChild(node, visit)
  }
  visit(nativeBundle)
  assert.ok(found, `Locate shipped native UI function: ${marker}`)
  return found
}

export function nativeCallback(parent: ts.Node, name: string): ts.ArrowFunction {
  let found: ts.ArrowFunction | undefined
  function visit(node: ts.Node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(nativeBundle) === name && node.initializer && ts.isCallExpression(node.initializer)) {
      const value = node.initializer.arguments[0]
      if (value && ts.isArrowFunction(value)) found = value
    }
    ts.forEachChild(node, visit)
  }
  visit(parent)
  assert.ok(found, `Locate shipped native UI callback: ${name}`)
  return found
}
