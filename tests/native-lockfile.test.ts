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
