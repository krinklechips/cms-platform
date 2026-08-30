/**
 * Boot-time migration gate — refuses to start the server while any migration
 * file has not been applied to the connected database.
 *
 * WHY: `payload migrate` in the start command has TWICE exited 0 on Render
 * without actually applying new migrations, leaving the API serving a stale
 * schema ("Something went wrong" on affected collections) with a green
 * deploy. Fail-loud rule: a deploy with unapplied migrations must go RED.
 *
 * Plain Node + pg (a dependency of @payloadcms/db-postgres) so it runs in
 * production without tsx or the payload config.
 */
import { readdirSync } from 'node:fs'
import pg from 'pg'

const uri = process.env.DATABASE_URI
if (!uri) {
  console.error('verify-migrations: DATABASE_URI is not set — refusing to start.')
  process.exit(1)
}

const files = readdirSync(new URL('../src/migrations/', import.meta.url))
  .filter((f) => f.endsWith('.ts') && f !== 'index.ts')
  .map((f) => f.replace(/\.ts$/, ''))
  .sort()

const client = new pg.Client({ connectionString: uri })
try {
  await client.connect()
  const { rows } = await client.query('SELECT name FROM payload_migrations')
  const applied = new Set(rows.map((r) => r.name))
  const missing = files.filter((f) => !applied.has(f))
  if (missing.length > 0) {
    console.error('✗ verify-migrations: UNAPPLIED MIGRATIONS — refusing to start:')
    for (const m of missing) console.error(`    ${m}`)
    console.error(
      'Apply them from a machine with the FULL prod env (incl. R2_*, or the diff is wrong):\n' +
        '    DATABASE_URI="$DATABASE_URI_PROD" npm run migrate\n' +
        'then redeploy. See docs/OPERATIONS.md.',
    )
    process.exit(1)
  }
  console.log(`✓ verify-migrations: ${files.length} migration files, all applied.`)
} finally {
  await client.end().catch(() => {})
}
