import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

const legacyTools = [
  'sync-roomchang.ts',
  'reconcile-live.ts',
  'seed-homepage.ts',
  'convert-sections-to-blocks.ts',
  'align-homepage-locales.ts',
  'align-feature-cards-locales.ts',
  'copy-doctor-names.ts',
  'restore-doctor-names-en.ts',
  'seed-initial-versions.ts',
  'verify-editor-access.ts',
  'functional-battery.ts',
]

for (const tool of legacyTools) {
  test(`${tool} refuses legacy content writes before opening a database, including --apply/--force`, () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'cms-import-guard-'))
    const database = path.join(dir, 'must-not-be-created.db')
    try {
      const result = spawnSync(process.execPath, ['--import', 'tsx', `scripts/${tool}`, '--apply', '--force'], {
        cwd: process.cwd(),
        encoding: 'utf8',
        timeout: 20_000,
        killSignal: 'SIGKILL',
        env: {
          PATH: process.env.PATH,
          HOME: dir,
          TMPDIR: dir,
          NODE_ENV: 'test',
          NODE_OPTIONS: '--no-deprecation',
          DATABASE_URI: `file:${database}`,
          PAYLOAD_SECRET: 'isolated-content-protection-test-only',
          NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:1',
          SUPABASE_SERVICE_ROLE_KEY: 'isolated-test-not-a-real-key',
        },
      })
      assert.match(result.stderr + result.stdout, /CMS_CONTENT_WRITE_BLOCKED/, 'The command must fail at the content-protection guard, not later in a database/source request')
      assert.equal(result.status, 1)
      assert.equal(existsSync(database), false, 'A blocked import must not even initialise its destination database')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
}
