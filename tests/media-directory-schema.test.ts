import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { migrations } from '../src/migrations'

const name = '20261022_040000_media_directories'
test('folder migration is registered and refuses to discard folder records on downgrade', async () => {
  const migration = migrations.find(migration => migration.name === name)
  assert.ok(migration)
  await assert.rejects(() => migration.down({} as never), /Refusing to discard/)
})

test('folder snapshot adds only its metadata table and retains every old schema definition', () => {
  const previous = JSON.parse(readFileSync(new URL('../src/migrations/20261021_180000_editorial_audit.json', import.meta.url), 'utf8'))
  const current = JSON.parse(readFileSync(new URL(`../src/migrations/${name}.json`, import.meta.url), 'utf8'))
  assert.equal(current.prevId, previous.id)
  assert.ok(current.tables['public.media_directories'].indexes.tenant_path_idx.isUnique)
  delete current.tables['public.media_directories']
  assert.deepEqual({ ...current, id: previous.id, prevId: previous.prevId }, previous)
})
