import assert from 'node:assert/strict'
import { realpathSync } from 'node:fs'
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

test('typography source reads require the expected checkout and cannot follow files outside it', async () => {
  const { typographySiteRoot, typographySource } = await import('../scripts/lib/typography-paths.mjs')
  const dir = await mkdtemp(path.join(os.tmpdir(), 'typography-paths-'))
  try {
    const root = path.join(dir, 'site')
    await mkdir(root)
    await writeFile(path.join(root, 'package.json'), JSON.stringify({ name: 'roomchang-foundation' }))
    await writeFile(path.join(dir, 'private.txt'), 'Unrelated private fixture')
    await symlink(path.join(dir, 'private.txt'), path.join(root, 'outside.txt'))
    assert.equal(typographySiteRoot(root), realpathSync(root))
    assert.throws(() => typographySource(root, '../private.txt'), /outside|checkout/i)
    assert.throws(() => typographySource(root, 'outside.txt'), /outside|checkout/i)
    await writeFile(path.join(root, 'package.json'), JSON.stringify({ name: 'another-project' }))
    assert.throws(() => typographySiteRoot(root), /Roomchang|checkout/i)
  } finally { await rm(dir, { recursive: true, force: true }) }
})

test('typography evidence is new JSON under its private artifact directory, never a caller-selected file', async () => {
  const { writeTypographyEvidence } = await import('../scripts/lib/typography-paths.mjs')
  const dir = await mkdtemp(path.join(os.tmpdir(), 'typography-evidence-'))
  try {
    for (const name of ['../outside.json', '/tmp/outside.json', 'nested/a.json', 'a.txt', 'a\\b.json']) {
      assert.throws(() => writeTypographyEvidence(dir, name, {}), /filename|JSON/i)
    }
    writeTypographyEvidence(dir, 'gate.json', { passed: true })
    assert.deepEqual(JSON.parse(await readFile(path.join(dir, '.artifacts/typography/gate.json'), 'utf8')), { passed: true })
    assert.throws(() => writeTypographyEvidence(dir, 'gate.json', {}), /exist/i)
    await symlink(path.join(dir, 'elsewhere.json'), path.join(dir, '.artifacts/typography/link.json'))
    assert.throws(() => writeTypographyEvidence(dir, 'link.json', {}), /exist/i)
  } finally { await rm(dir, { recursive: true, force: true }) }
})

test('typography evidence refuses a symlinked artifact parent before creating output directories', async () => {
  const { writeTypographyEvidence } = await import('../scripts/lib/typography-paths.mjs')
  const dir = await mkdtemp(path.join(os.tmpdir(), 'typography-parent-'))
  try {
    const root = path.join(dir, 'checkout')
    const outside = path.join(dir, 'outside')
    await mkdir(root)
    await mkdir(outside)
    await symlink(outside, path.join(root, '.artifacts'))
    assert.throws(() => writeTypographyEvidence(root, 'gate.json', {}), /symlink|checkout/i)
    await assert.rejects(readFile(path.join(outside, 'typography/gate.json')), /ENOENT/)
  } finally { await rm(dir, { recursive: true, force: true }) }
})

test('refresh verification connections are structured, password-free and restricted to the owned loopback fixture', async () => {
  const { refreshFixtureConnection } = await import('../scripts/lib/refresh-fixture.mjs')
  assert.deepEqual(refreshFixtureConnection('postgres://fixture@localhost:55439/cms_refresh_fixture'), {
    host: '127.0.0.1', port: 55439, database: 'cms_refresh_fixture', user: 'fixture',
  })
  for (const value of [
    'postgres://fixture@db.example.com:55439/cms_refresh_fixture',
    'postgres://fixture@localhost:5432/cms_refresh_fixture',
    'postgres://fixture@localhost:55439/production',
    'postgres://fixture:password@localhost:55439/cms_refresh_fixture',
    'postgres://fixture@localhost:55439/cms_refresh_fixture?host=production',
    'postgres://fixture@localhost:55439/cms_refresh_fixture#extra',
  ]) assert.throws(() => refreshFixtureConnection(value), /loopback|fixture/i)
})
