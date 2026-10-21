import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { migrations } from '../src/migrations'

test('audit migration is registered after storage and refuses to discard the log on downgrade', async () => {
  const migration = migrations.find(({ name }) => name === '20261021_180000_editorial_audit')
  assert.ok(migration)
  assert.ok(migrations.indexOf(migration) > migrations.findIndex(({ name }) => name === '20261021_120000_payload_391_schema'))
  await assert.rejects(() => migration.down({} as never), /Refusing to discard editorial audit history/)
})

test('audit snapshot retains every prior content, draft, version, enum, column and index unchanged', () => {
  const previous = JSON.parse(readFileSync(new URL('../src/migrations/20261021_120000_payload_391_schema.json', import.meta.url), 'utf8'))
  const current = JSON.parse(readFileSync(new URL('../src/migrations/20261021_180000_editorial_audit.json', import.meta.url), 'utf8'))
  assert.equal(current.prevId, previous.id)
  assert.notEqual(current.id, previous.id)
  assert.ok(current.tables['public.editorial_audit'])
  assert.deepEqual(current.enums['public.enum_editorial_audit_action'].values,
    ['create', 'update', 'draft', 'publish', 'unpublish', 'restore', 'delete'])
  delete current.tables['public.editorial_audit']
  delete current.enums['public.enum_editorial_audit_action']
  assert.deepEqual({ ...current, id: previous.id, prevId: previous.prevId }, previous)
})
