import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

test('the lockfile retains every declared libsql native platform, not just the developer platform', () => {
  const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'))
  const native = lock.packages['node_modules/libsql'].optionalDependencies
  assert.ok(native['@libsql/linux-x64-gnu'], 'Render requires the Linux native binding')
  for (const [name, version] of Object.entries(native)) {
    assert.equal(lock.packages[`node_modules/${name}`]?.version, version, `${name} must be installable from a clean platform-specific npm ci`)
  }
})

test('all native optional dependencies resolve at the correct version on every platform', () => {
  const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'))
  const resolve = (owner: string, name: string) => {
    let scope = owner
    for (;;) {
      const candidate = lock.packages[`${scope ? `${scope}/` : ''}node_modules/${name}`]
      if (candidate) return candidate
      if (!scope) return undefined
      const parent = scope.lastIndexOf('/node_modules/')
      scope = parent < 0 ? '' : scope.slice(0, parent)
    }
  }
  for (const [owner, entry] of Object.entries(lock.packages) as [string, { optionalDependencies?: Record<string, string> }][]) {
    for (const [name, version] of Object.entries(entry.optionalDependencies ?? {})) {
      if (!/^(@libsql\/|@img\/|@esbuild\/|@next\/swc-)/.test(name)) continue
      assert.equal(resolve(owner, name)?.version, version, `${owner} requires ${name}@${version}`)
    }
  }
})
