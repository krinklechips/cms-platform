import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'

type ASTBranch = { type: string; nodes: (ASTBranch | { type: 'text'; value: string })[]; parent?: ASTBranch }

const require = createRequire(import.meta.url)
const braces = require('braces')
const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'))

test('the resolved graph excludes the vulnerable DOMPurify and esbuild releases', () => {
  let sanitizers = 0
  let builders = 0
  for (const [name, entry] of Object.entries(lock.packages) as [string, { version: string }][]) {
    if (name.endsWith('/dompurify')) {
      sanitizers++
      assert.equal(entry.version, '3.4.16', name)
    }
    if (name.endsWith('/esbuild')) {
      builders++
      const [major, minor] = entry.version.split('.').map(Number)
      assert.ok(major > 0 || minor >= 25, `${name}@${entry.version} remains vulnerable`)
    }
  }
  assert.ok(sanitizers > 0)
  assert.ok(builders > 0)
})

test('every installed braces entry point rejects excessive brace and parenthesis nesting before stack exhaustion', async t => {
  const entries = Object.keys(lock.packages).filter(name => name.endsWith('/braces'))
  assert.ok(entries.length > 0)
  for (const entry of entries) {
    const instance = require(new URL(`../${entry}`, import.meta.url).pathname)
    for (const [open, close] of [['{', '}'], ['(', ')'], ['{(', ')}']]) {
      const depth = open.length === 1 ? 4000 : 2000
      const input = open.repeat(depth) + 'a' + close.repeat(depth)
      assert.ok(input.length < 10000)
      for (const [method, operation] of Object.entries({
        'braces()': instance,
        'braces.parse()': instance.parse,
        'braces.compile()': instance.compile,
        'braces.expand()': instance.expand,
        'braces.stringify()': instance.stringify,
      })) {
        await t.test(`${entry}: ${method} rejects ${open} nesting at depth ${depth}`, () => {
          assert.throws(() => operation(input), error => error instanceof SyntaxError && /nesting depth/.test(error.message))
        })
      }
      assert.throws(() => instance.parse(open.repeat(101), { maxDepth: Infinity, maxLength: Infinity }), SyntaxError)
    }
  }
})

test('direct braces AST walkers cannot bypass the depth guard', () => {
  for (const name of ['compile', 'expand', 'stringify']) {
    const root: ASTBranch = { type: 'root', nodes: [] }
    let node = root
    for (let depth = 0; depth < 4000; depth++) {
      const child: ASTBranch = { type: 'paren', nodes: [], parent: node }
      node.nodes.push(child)
      node = child
    }
    node.nodes.push({ type: 'text', value: 'a' })
    for (const operation of [braces[name], require(`braces/lib/${name}`)]) {
      assert.throws(() => operation(root), error => error instanceof SyntaxError && /nesting depth/.test(error.message))
    }
  }
})

test('bounded legitimate brace patterns, escaped literals, quotes and character classes retain their behavior', () => {
  assert.deepEqual(braces.expand('src/{app,lib}/file-{1..3}.ts'), [
    'src/app/file-1.ts', 'src/app/file-2.ts', 'src/app/file-3.ts',
    'src/lib/file-1.ts', 'src/lib/file-2.ts', 'src/lib/file-3.ts',
  ])
  assert.equal(braces.compile('src/{app,lib}/**/*.{ts,tsx}'), 'src/(app|lib)/**/*.(ts|tsx)')
  assert.deepEqual(braces.expand('{a,{b,c}}'), ['a', 'b', 'c'])
  for (const [open, close] of [['{', '}'], ['(', ')']]) {
    const input = open.repeat(100) + 'a' + close.repeat(100)
    assert.equal(braces.stringify(braces.parse(input)), input)
    assert.equal(braces.compile(input), input)
    assert.deepEqual(braces.expand(input), [input])
    assert.throws(() => braces.parse(open.repeat(101) + 'a' + close.repeat(101)), SyntaxError)
  }
  const literals = '{'.repeat(200)
  assert.equal(braces.stringify(braces.parse(`"${literals}"`)), literals)
  assert.equal(braces.stringify(braces.parse('[' + literals + ']')), '[' + literals + ']')
  assert.equal(braces.stringify(braces.parse('\\{'.repeat(200))), literals)
  assert.throws(() => braces.parse('a'.repeat(10001)), SyntaxError)
})

test('the existing ESLint flat config resolves at the installed Next version', async () => {
  const { ESLint } = require('eslint')
  const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  assert.equal(manifest.devDependencies['eslint-config-next'], manifest.dependencies.next)
  const eslint = new ESLint()
  const config = await eslint.calculateConfigForFile('src/payload.config.ts')
  assert.ok(config.rules['@next/next/no-html-link-for-pages'])
  const [result] = await eslint.lintText('export const value: number = 1\n', { filePath: 'src/dependency-security-fixture.ts' })
  assert.equal(result.fatalErrorCount, 0)
  assert.equal(result.errorCount, 0)
})

test('both legacy Drizzle loaders still transpile TypeScript with the scoped esbuild override', async () => {
  const core = require('@esbuild-kit/core-utils')
  for (const transform of [core.transformSync, core.transform]) {
    const result = await transform('module.exports = (21 as number) * 2', '/tmp/dependency-security-fixture.ts', { format: 'cjs' })
    const fixtureModule = { exports: undefined }
    runInNewContext(result.code, { module: fixtureModule })
    assert.equal(fixtureModule.exports, 42)
  }
  const dir = await mkdtemp(path.join(os.tmpdir(), 'dependency-security-loader-'))
  const { unregister } = require('esbuild-register/dist/node').register()
  try {
    const fixture = path.join(dir, 'fixture.cts')
    await writeFile(fixture, 'module.exports = (21 as number) * 2\n')
    assert.equal(require(fixture), 42)
  } finally {
    unregister()
    await rm(dir, { recursive: true, force: true })
  }
})

test('all resolved esbuild servers withhold cross-origin access from an arbitrary website', async () => {
  for (const name of Object.keys(lock.packages).filter(name => name.endsWith('/esbuild'))) {
    const esbuild = require(new URL(`../${name}`, import.meta.url).pathname)
    const context = await esbuild.context({
      stdin: { contents: 'export const answer = 42', loader: 'js' },
      outfile: 'dependency-security-fixture.js', write: false,
    })
    try {
      const { port } = await context.serve({ host: '127.0.0.1', port: 0 })
      const response = await fetch(`http://127.0.0.1:${port}/dependency-security-fixture.js`, {
        headers: { Origin: 'https://attacker.example.invalid' },
      })
      assert.equal(response.status, 200)
      assert.match(await response.text(), /answer = 42/)
      assert.equal(response.headers.get('access-control-allow-origin'), null, name)
    } finally {
      await context.dispose()
    }
  }
})
