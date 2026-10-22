import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

const verifier = new URL('../scripts/verify-runtime.mjs', import.meta.url)
const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))

function fixture(pin: string | undefined, run: (root: string, env: NodeJS.ProcessEnv) => void) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'cms-runtime-startup-'))
  const bin = path.join(root, 'bin')
  const scripts = path.join(root, 'scripts')
  mkdirSync(bin)
  mkdirSync(scripts)
  if (existsSync(verifier)) copyFileSync(verifier, path.join(scripts, 'verify-runtime.mjs'))
  if (pin !== undefined) writeFileSync(path.join(root, '.node-version'), pin)
  const calls = path.join(root, 'calls.jsonl')
  const marker = (phase: string) => `import fs from 'node:fs'; fs.appendFileSync(process.env.RUNTIME_CALLS_FILE, JSON.stringify({ phase: ${JSON.stringify(phase)}, args: process.argv.slice(2) }) + '\\n');\n`
  for (const phase of ['payload', 'next']) {
    writeFileSync(path.join(bin, phase), '#!/usr/bin/env node\n' + marker(phase), { mode: 0o755 })
  }
  writeFileSync(path.join(scripts, 'verify-migrations.mjs'), marker('verify-migrations'))
  const env = {
    ...process.env,
    PATH: [path.dirname(process.execPath), bin, process.env.PATH].filter(Boolean).join(path.delimiter),
    RUNTIME_CALLS_FILE: calls,
    PORT: '4321',
    PAYLOAD_SECRET: 'runtime-fixture-must-not-be-logged',
    DATABASE_URI: 'runtime-fixture-database-must-not-be-logged',
  }
  try { run(root, env) } finally { rmSync(root, { recursive: true, force: true }) }
}

function boot(root: string, env: NodeJS.ProcessEnv) {
  return spawnSync('/bin/sh', ['-c', manifest.scripts.start], { cwd: root, env, encoding: 'utf8', timeout: 5000 })
}

test('matching startup logs actual and pinned Node before migrations and preserves the existing start chain', () => {
  fixture(`${process.versions.node}\n`, (root, env) => {
    const result = boot(root, env)
    assert.equal(result.error, undefined)
    assert.equal(result.status, 0, result.stderr)
    assert.match(result.stdout, new RegExp(`^verify-runtime: actual=v${process.versions.node.replaceAll('.', '\\.')} expected=v${process.versions.node.replaceAll('.', '\\.')}\\n`))
    const calls = readFileSync(path.join(root, 'calls.jsonl'), 'utf8').trim().split('\n').map(line => JSON.parse(line))
    assert.deepEqual(calls, [
      { phase: 'payload', args: ['migrate', '--forceAcceptWarning'] },
      { phase: 'verify-migrations', args: [] },
      { phase: 'next', args: ['start', '-p', '4321'] },
    ])
    assert.doesNotMatch(result.stdout + result.stderr, /runtime-fixture-/)
  })
})

test('a wrong Node runtime fails closed before any migration or server command executes', () => {
  fixture('0.0.0\n', (root, env) => {
    const result = boot(root, env)
    assert.equal(result.error, undefined)
    assert.equal(result.status, 1)
    assert.match(result.stdout, /verify-runtime: actual=v[0-9.]+ expected=v0\.0\.0/)
    assert.match(result.stderr, /Node version mismatch; refusing startup/)
    assert.equal(existsSync(path.join(root, 'calls.jsonl')), false)
  })
})

test('a missing or non-exact runtime pin fails closed without exposing its contents', async t => {
  for (const pin of [undefined, '', '22\n', 'lts\n', '>=22.23.4\n', '22.23.4\nprivate-invalid-pin-content']) {
    await t.test(pin === undefined ? 'missing pin' : `invalid pin ${JSON.stringify(pin.split('\n')[0])}`, () => {
      fixture(pin, (root, env) => {
        const result = boot(root, env)
        assert.equal(result.error, undefined)
        assert.equal(result.status, 1)
        assert.match(result.stderr, /cannot read an exact Node version from \.node-version; refusing startup/)
        assert.doesNotMatch(result.stdout + result.stderr, /private-invalid-pin-content|runtime-fixture-/)
        assert.equal(existsSync(path.join(root, 'calls.jsonl')), false)
      })
    })
  }
})

test('runtime verification resolves the project pin relative to the script, not the current directory', () => {
  fixture(`${process.versions.node}\n`, (root, env) => {
    const result = spawnSync(process.execPath, [path.join(root, 'scripts/verify-runtime.mjs')], {
      cwd: os.tmpdir(), env, encoding: 'utf8', timeout: 5000,
    })
    assert.equal(result.status, 0, result.stderr)
    assert.match(result.stdout, /verify-runtime: actual=v[0-9.]+ expected=v[0-9.]+/)
  })
})

test('runtime help works without a pin and cannot accidentally run migrations', () => {
  fixture(undefined, (root, env) => {
    for (const argument of ['--help', '-h']) {
      const result = spawnSync(process.execPath, [path.join(root, 'scripts/verify-runtime.mjs'), argument], {
        cwd: root, env, encoding: 'utf8', timeout: 5000,
      })
      assert.equal(result.status, 0, result.stderr)
      assert.match(result.stdout, /Usage: node scripts\/verify-runtime\.mjs/)
      assert.equal(existsSync(path.join(root, 'calls.jsonl')), false)
    }
  })
})

test('unsupported runtime arguments cannot override or disable the pinned version', () => {
  fixture('0.0.0\n', (root, env) => {
    for (const args of [['--skip'], ['--node-version', process.versions.node], ['--help', '--skip']]) {
      const result = spawnSync(process.execPath, [path.join(root, 'scripts/verify-runtime.mjs'), ...args], {
        cwd: root, env, encoding: 'utf8', timeout: 5000,
      })
      assert.equal(result.status, 1)
      assert.match(result.stderr, /unsupported arguments; refusing startup/)
      assert.equal(existsSync(path.join(root, 'calls.jsonl')), false)
    }
  })
})
