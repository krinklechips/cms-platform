import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const require = createRequire(import.meta.url)
const lock = JSON.parse(readFileSync(path.join(root, 'package-lock.json'), 'utf8'))

test('all locked and installed RCMS-006/007/008 dependency copies select the reviewed fixes', () => {
  const fixed = { undici: '7.30.1', dompurify: '3.4.17', 'happy-dom': '21.0.4' }
  for (const [name, version] of Object.entries(fixed)) {
    const copies = Object.entries(lock.packages).filter(([location]) => location.endsWith(`/node_modules/${name}`) || location === `node_modules/${name}`)
    assert.ok(copies.length > 0, name)
    for (const [location, entry] of copies) {
      assert.equal((entry as { version: string }).version, version, location)
      const installed = JSON.parse(readFileSync(path.join(root, location, 'package.json'), 'utf8'))
      assert.equal(installed.version, version, `installed ${location}`)
    }
  }
  const fromPayload = createRequire(require.resolve('payload'))
  assert.equal(fromPayload('undici/package.json').version, fixed.undici)
  const fromHeadless = createRequire(require.resolve('@lexical/headless'))
  assert.equal(JSON.parse(readFileSync(path.join(path.dirname(fromHeadless.resolve('happy-dom')), '../package.json'), 'utf8')).version, fixed['happy-dom'])
})

for (const scenario of ['malformed-response', 'integrity', 'upload', 'ssrf', 'headless', 'module-alias']) {
  test(`isolated dependency compatibility and security: ${scenario}`, { timeout: 40000 }, () => {
    const result = spawnSync(process.execPath, [
      '--max-old-space-size=512', fileURLToPath(new URL('./dependency-patches-child.mjs', import.meta.url)), scenario,
    ], {
      cwd: root, timeout: 30000, killSignal: 'SIGKILL', maxBuffer: 1024 * 1024,
      env: { PATH: process.env.PATH, HOME: os.tmpdir(), TMPDIR: os.tmpdir(), NODE_ENV: 'test' },
      encoding: 'utf8',
    })
    assert.ifError(result.error)
    assert.equal(result.signal, null, result.stderr)
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`)
    assert.match(result.stdout, new RegExp(`PASS ${scenario}`))
  })
}

const chrome = [process.env.DEPENDENCY_CHROME_PATH, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome'].find(candidate => candidate && existsSync(candidate))

test('Monaco sanitizer blocks the three advisory conditions and preserves normal formatting in Chromium', {
  timeout: 30000, skip: chrome ? false : 'Set DEPENDENCY_CHROME_PATH to run the real-browser sanitizer regressions',
}, async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'dependency-chromium-'))
  try {
    const fromMonaco = createRequire(require.resolve('monaco-editor'))
    const purifier = pathToFileURL(path.join(path.dirname(fromMonaco.resolve('dompurify')), 'purify.js')).href
    const fixture = new URL('./dependency-sanitizer-browser.js', import.meta.url).href
    const html = path.join(dir, 'fixture.html')
    await writeFile(html, `<!doctype html><meta charset="utf-8"><body><script src="${purifier}"></script><script src="${fixture}"></script></body>`)
    const result = spawnSync(chrome!, [
      '--headless', '--disable-gpu', '--disable-background-networking', '--no-first-run', '--no-default-browser-check',
      '--no-proxy-server', '--host-resolver-rules=MAP * ~NOTFOUND', `--user-data-dir=${path.join(dir, 'profile')}`,
      '--dump-dom', pathToFileURL(html).href,
    ], { timeout: 20000, killSignal: 'SIGKILL', maxBuffer: 1024 * 1024, encoding: 'utf8' })
    assert.ifError(result.error)
    assert.equal(result.status, 0, result.stderr)
    const encoded = /data-dependency-result="([A-Za-z0-9+/=]+)"/.exec(result.stdout)?.[1]
    assert.ok(encoded, result.stdout + result.stderr)
    const report = JSON.parse(Buffer.from(encoded, 'base64').toString())
    assert.ok(report.results.length >= 20)
    assert.deepEqual(report.results.filter((entry: { safe: boolean }) => !entry.safe), [])
    assert.equal(report.version, '3.4.17')
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})
