import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import pg from 'pg'
import { postgresAdapter, type PostgresAdapter } from '@payloadcms/db-postgres'
import { buildConfig, createLocalReq, getPayload, type Payload } from 'payload'
import { withDrafts } from '../src/lib/with-drafts'
import { withEditorialConcurrency } from '../src/lib/with-editorial-concurrency'
import { postgresConnection } from '../src/lib/postgres-connection.mjs'
import type { User } from '../src/payload-types'

const binaries = '/opt/homebrew/opt/postgresql@18/bin'
const hasStatus = (status: number) => (error: unknown) => error instanceof Error && 'status' in error && error.status === status
test('isolated PostgreSQL rejects stale deletion and retains every published locale, draft and version', {
  timeout: 120000, skip: !existsSync(`${binaries}/initdb`) ? 'Local PostgreSQL unavailable' : false,
}, async t => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'cms-delete-pg-'))
  const cluster = path.join(directory, 'cluster')
  const socket = net.createServer()
  await new Promise<void>(resolve => socket.listen(0, '127.0.0.1', resolve))
  const port = (socket.address() as net.AddressInfo).port
  await new Promise<void>(resolve => socket.close(() => resolve()))
  const command = (name: string, args: string[]) => execFileSync(`${binaries}/${name}`, args, {
    encoding: 'utf8', env: { PATH: process.env.PATH, HOME: directory, LC_ALL: 'C', NODE_ENV: 'test' },
  })
  let running = false
  let cms: Payload | undefined
  const acquired = new Set<pg.PoolClient>()
  class FixturePool extends pg.Pool {
    constructor(options?: pg.PoolConfig) {
      super(options)
      this.on('acquire', client => acquired.add(client))
      this.on('release', (_error, client) => acquired.delete(client))
    }
  }
  try {
    command('initdb', ['-D', cluster, '-U', 'delete_fixture', '-A', 'trust', '--no-locale'])
    command('pg_ctl', ['-D', cluster, '-l', path.join(directory, 'postgres.log'), '-o', `-h 127.0.0.1 -p ${port} -k ${directory}`, '-w', 'start'])
    running = true
    const payload = cms = await getPayload({ key: randomUUID(), config: buildConfig({
      secret: 'isolated-delete-postgres-test-only', telemetry: false, typescript: { autoGenerate: false },
      db: postgresAdapter({ pool: postgresConnection(`postgres://delete_fixture@127.0.0.1:${port}/postgres`, { NODE_ENV: 'test' }),
        push: true, disableCreateDatabase: true, pg: { ...pg, Pool: FixturePool } }),
      localization: { locales: ['en', 'kh', 'cn'], defaultLocale: 'en', fallback: false },
      collections: [
        { slug: 'users', auth: true, fields: [] },
        withEditorialConcurrency(withDrafts({ slug: 'pages', fields: [{ name: 'title', type: 'text', localized: true }],
          access: { read: ({ req }) => Boolean(req.user), update: ({ req }) => Boolean(req.user), delete: ({ req }) => Boolean(req.user) } })),
      ],
    }) })
    const users: (User & { collection: 'users' })[] = []
    for (let index = 0; index < 2; index++) users.push({ ...await payload.create({ collection: 'users',
      data: { email: `delete-${index}@example.invalid`, password: 'isolated-delete-password-1234' } as never }), collection: 'users' as const })
    for (const locale of ['en', 'kh', 'cn'] as const) await t.test(`${locale} stale/missing delete is atomic; explicitly fresh deletion still works`, async () => {
      const page = await payload.create({ collection: 'pages', locale: 'en', data: { title: 'en published', _status: 'published' } as never })
      const read = (code: 'en' | 'kh' | 'cn', draft = true, user = users[0]) => payload.findByID({ collection: 'pages', id: page.id,
        locale: code, fallbackLocale: false, draft, user, overrideAccess: false }) as Promise<{ title?: string | null; _editorialRevision: string }>
      for (const code of ['kh', 'cn'] as const) await payload.update({ collection: 'pages', id: page.id, locale: code,
        publishSpecificLocale: code, data: { title: `${code} published`, _status: 'published' } as never })
      const opened = await read(locale)
      const other = locale === 'en' ? 'kh' : 'en'
      await payload.update({ collection: 'pages', id: page.id, locale: other, draft: true, user: users[1], overrideAccess: false,
        data: { title: 'Borin newer private draft', _status: 'draft', _editorialRevision: (await read(other, true, users[1]))._editorialRevision } as never })
      const versions = () => payload.findVersions({ collection: 'pages', where: { parent: { equals: page.id } }, locale: 'all', pagination: false })
      const before = await versions()
      const remove = async (revision?: string) => {
        const req = await createLocalReq({ locale, user: users[0] }, payload)
        if (revision) req.headers.set('if-match', revision)
        return payload.delete({ collection: 'pages', id: page.id, locale, req, user: users[0], overrideAccess: false })
      }
      await assert.rejects(() => remove(opened._editorialRevision), hasStatus(409))
      await assert.rejects(() => remove(), hasStatus(428))
      assert.deepEqual((await versions()).docs, before.docs)
      for (const code of ['en', 'kh', 'cn'] as const) assert.equal((await read(code, false)).title, `${code} published`)
      assert.equal((await read(other)).title, 'Borin newer private draft')
      await remove((await read(locale))._editorialRevision)
      assert.equal((await versions()).totalDocs, 0, 'Only intentional deletion of a fresh disposable record may purge its versions')
    })
  } finally {
    if (cms) {
      const pool = (cms.db as unknown as PostgresAdapter).pool
      await cms.destroy()
      // Payload retains its health-check client; the disposable cluster must
      // release that client before pool.end(), not terminate its socket first.
      for (const client of acquired) client.release(true)
      await pool.end()
    }
    if (running) command('pg_ctl', ['-D', cluster, '-m', 'immediate', '-w', 'stop'])
    await rm(directory, { recursive: true, force: true })
  }
})
