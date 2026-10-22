import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseArgs } from 'node:util'
import { fileURLToPath } from 'node:url'

const { values } = parseArgs({ options: { 'site-root': { type: 'string' }, browser: { type: 'string' }, evidence: { type: 'string' }, help: { type: 'boolean' } } })
if (values.help) {
  console.log(`Complete typography release gate (all 11 cases, no skips):
  node scripts/test-typography.mjs --site-root <website> [--browser <Chromium executable>] [--evidence <JSON path>]

Prerequisites: repository npm dependencies, a locally installed Chromium/Chrome,
and the website checkout with its existing @tailwindcss/node dependency installed.
The checkout must match the deployment target (cms-sandbox for the test site),
not an older production/Desktop branch. Check its revision and CSS source hash.
No jsdom, optional DOM package, website build or running server is required.
ROOMCHANG_TYPOGRAPHY_SITE_ROOT and ROOMCHANG_TYPOGRAPHY_BROWSER may supply paths.
Plain npm test runs CMS cases when Chromium exists; website cases are explicitly
skipped without a site root. A plain-suite pass does not replace this release gate.
The gate uses isolated, network-blocked Chromium and unchanged compiler output.
It checks computed styles, not downloaded font glyphs or a hydrated application.`)
  process.exit(0)
}
const requestedRoot = values['site-root'] ?? process.env.ROOMCHANG_TYPOGRAPHY_SITE_ROOT
assert.ok(requestedRoot, 'Pass --site-root <website checkout>; website typography coverage is required, not optional.')
const siteRoot = realpathSync(requestedRoot)
const browserExecutable = values.browser ?? process.env.ROOMCHANG_TYPOGRAPHY_BROWSER ?? [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome',
].find(existsSync)
assert.ok(browserExecutable && existsSync(browserExecutable), 'Install Chromium/Chrome or supply --browser <executable>.')
const cmsRoot = fileURLToPath(new URL('..', import.meta.url))
const sources = [
  ...['package.json', 'package-lock.json', 'src/app/(payload)/custom.scss', 'src/lib/cms-content-typography.ts'].map(path => resolve(cmsRoot, path)),
  ...['package.json', 'package-lock.json', 'src/app/globals.css', 'src/components/sections/home-stats.tsx', 'src/components/site/site-header.tsx'].map(path => resolve(siteRoot, path)),
]
const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex')
const before = sources.map(path => ({ path, before: hash(path) }))
const args = ['--import', 'tsx', '--test', 'tests/typography.test.ts']
const startedAt = new Date().toISOString()
const result = spawnSync(process.execPath, args, {
  cwd: cmsRoot, timeout: 60000, encoding: 'utf8', maxBuffer: 5 * 1024 * 1024,
  env: { HOME: process.env.HOME, PATH: process.env.PATH, NODE_ENV: 'test',
    TSX_DISABLE_CACHE: '1', ROOMCHANG_TYPOGRAPHY_SITE_ROOT: siteRoot,
    ROOMCHANG_TYPOGRAPHY_BROWSER: browserExecutable, ROOMCHANG_TYPOGRAPHY_COMPLETE: '1' },
})
process.stdout.write(result.stdout ?? '')
process.stderr.write(result.stderr ?? '')
if (result.error) process.stderr.write(`${result.error.message}\n`)
const counts = Object.fromEntries(['tests', 'pass', 'fail', 'cancelled', 'skipped'].map(key => {
  const match = result.stdout?.match(new RegExp(`^# ${key} (\\d+)$`, 'm'))
  return [key, match ? Number(match[1]) : null]
}))
const preservation = before.map(source => ({ ...source, after: hash(source.path) }))
const unchanged = preservation.every(source => source.before === source.after)
const browserVersion = (result.stdout ?? '').split('\n').flatMap(line => {
  if (!line.startsWith('# {')) return []
  try { const record = JSON.parse(line.slice(2)); return record.protocolVersion && record.product ? [record] : [] } catch { return [] }
})[0]
const complete = counts.tests === 11 && counts.skipped === 0 && counts.cancelled === 0
const evidence = { startedAt, finishedAt: new Date().toISOString(), node: process.version, command: [process.execPath, ...args],
  cmsRoot, siteRoot, browserExecutable, browserVersion, cssRewrites: false, networkBlocked: true,
  status: result.status, signal: result.signal, error: result.error?.message,
  counts, complete, unchanged, sources: preservation }
if (values.evidence) writeFileSync(resolve(values.evidence), `${JSON.stringify(evidence, null, 2)}\n`)
console.log(`Typography coverage complete=${complete}; source/package preservation=${unchanged}; ${sources.length} SHA-256 comparisons.`)
process.exitCode = unchanged && complete && browserVersion && !result.error ? result.status ?? 1 : 1
