import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { buildConfig, getPayload } from 'payload'
import { withDrafts } from '../src/lib/with-drafts'
import { withEditorialConcurrency } from '../src/lib/with-editorial-concurrency'

test('native create revisions remain usable when the clock advances before the first version', { timeout: 120000 }, async t => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cms-create-revision-'))
  const payload = await getPayload({ key: randomUUID(), config: buildConfig({
    secret: 'isolated-create-revision-test', telemetry: false, typescript: { autoGenerate: false },
    db: sqliteAdapter({ client: { url: `file:${path.join(dir, 'fixture.db')}` } }),
    localization: { locales: ['en', 'kh', 'cn'], defaultLocale: 'en', fallback: true },
    collections: [
      { slug: 'users', auth: true, fields: [] },
      withEditorialConcurrency(withDrafts({ slug: 'pages',
        access: { create: ({ req }) => Boolean(req.user), update: ({ req }) => Boolean(req.user) },
        fields: [{ name: 'title', type: 'text', localized: true }],
      })),
    ],
  }) })
  const user = { id: 999, collection: 'users' as const, email: 'fixture@example.invalid' }
  const nativeCreate = payload.db.create.bind(payload.db)
  try {
    for (const locale of ['en', 'kh', 'cn'] as const) {
      for (const draft of [true, false]) await t.test(`${locale} ${draft ? 'draft' : 'published'} create response can be saved without a reread`, async () => {
        t.mock.timers.enable({ apis: ['Date'], now: new Date('2030-01-01T00:00:00Z') })
        payload.db.create = async args => {
          const doc = await nativeCreate(args)
          if (args.collection === 'pages') t.mock.timers.tick(1)
          return doc
        }
        try {
          const created: any = await payload.create({ collection: 'pages', locale, draft, user,
            overrideAccess: false, data: { title: `${locale} original`, _status: draft ? 'draft' : 'published' } as never })
          const latest: any = await payload.findByID({ collection: 'pages', id: created.id, locale, draft: true,
            fallbackLocale: false, depth: 0, user, overrideAccess: false })
          assert.equal(created.updatedAt, latest.updatedAt, 'initial parent and version must describe the same content revision')
          assert.equal(created._editorialRevision, latest._editorialRevision)
          const saved: any = await payload.update({ collection: 'pages', id: created.id, locale, draft: true,
            user, overrideAccess: false, data: { title: `${locale} follow-up`, _status: 'draft', _editorialRevision: created._editorialRevision } as never })
          assert.equal(saved.title, `${locale} follow-up`)
          assert.ok(Date.parse(saved.updatedAt) > Date.parse(created.updatedAt), 'subsequent revisions stay monotonic')
          await assert.rejects(() => payload.update({ collection: 'pages', id: created.id, locale, draft: true,
            user, overrideAccess: false, data: { title: 'stale overwrite', _status: 'draft', _editorialRevision: created._editorialRevision } as never }),
          (error: any) => error.status === 409)
          const after: any = await payload.findByID({ collection: 'pages', id: created.id, locale, draft: true, user })
          assert.equal(after.title, `${locale} follow-up`)
          assert.equal(saved._editorialRevision, after._editorialRevision)
        } finally { payload.db.create = nativeCreate; t.mock.timers.reset() }
      })
    }
  } finally { payload.db.create = nativeCreate; t.mock.timers.reset(); await payload.destroy(); await rm(dir, { recursive: true, force: true }) }
})
