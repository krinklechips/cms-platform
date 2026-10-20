import assert from 'node:assert/strict'
import { test } from 'node:test'
import { assertLegacyContentWritesAllowed } from '../scripts/lib/protect-editorial-content'

test('a local opt-in never unlocks a shared Postgres database', () => {
  for (const databaseUri of ['postgres://localhost/cms', 'postgresql://localhost/cms', 'libsql://shared-db.example']) {
    assert.throws(() => assertLegacyContentWritesAllowed('fixture', {
      argv: ['--allow-local-content-overwrite', '--apply', '--force'], databaseUri, nodeEnv: 'test',
    }), /CMS_CONTENT_WRITE_BLOCKED/)
  }
})

test('production and missing destination configuration fail closed', () => {
  assert.throws(() => assertLegacyContentWritesAllowed('fixture', {
    argv: ['--allow-local-content-overwrite'], databaseUri: 'file:./fixture.db', nodeEnv: 'production',
  }), /CMS_CONTENT_WRITE_BLOCKED/)
  assert.throws(() => assertLegacyContentWritesAllowed('fixture', {
    argv: ['--allow-local-content-overwrite'], databaseUri: '', nodeEnv: 'test',
  }), /CMS_CONTENT_WRITE_BLOCKED/)
})

test('disposable local SQLite writes require the separate explicit opt-in', () => {
  assert.throws(() => assertLegacyContentWritesAllowed('fixture', {
    argv: ['--apply', '--force'], databaseUri: 'file:./fixture.db', nodeEnv: 'test',
  }), /CMS_CONTENT_WRITE_BLOCKED/)
  assert.doesNotThrow(() => assertLegacyContentWritesAllowed('fixture', {
    argv: ['--allow-local-content-overwrite'], databaseUri: 'file:./fixture.db', nodeEnv: 'test',
  }))
})
