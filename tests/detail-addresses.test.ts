import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { getPayload, ValidationError } from 'payload'
import { loadPayloadConfig } from './helpers/load-payload-config'

test('Service and Technology URLs reserve published and latest draft addresses without rewriting content', { timeout: 120000 }, async t => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cms-detail-address-'))
  const original = await loadPayloadConfig()
  const cms = await getPayload({ key: randomUUID(), config: { ...original, secret: 'isolated-detail-address-only', telemetry: false,
    db: sqliteAdapter({ client: { url: `file:${path.join(dir, 'fixture.db')}` }, transactionOptions: {} }) as typeof original.db,
    typescript: { ...original.typescript, autoGenerate: false },
  } })
  try {
    const tenant = await cms.db.create({ collection: 'tenants', data: { name: 'Fixture', slug: 'fixture', enabledCollections: ['services', 'technology'] } })
    const other = await cms.db.create({ collection: 'tenants', data: { name: 'Other', slug: 'other', enabledCollections: ['services', 'technology'] } })
    const user = { ...await cms.create({ collection: 'users', data: { email: 'detail-owner@example.invalid',
      password: 'isolated-detail-password-1234', roles: ['super-admin'] } as never }), collection: 'users' as const }
    const duplicate = (error: unknown) => error instanceof ValidationError && /address.*already used/i.test(JSON.stringify(error.data))
    for (const collection of ['services', 'technology'] as const) await t.test(collection, async () => {
      const create = (slug: string, draft = false, owner = tenant.id) => cms.create({ collection, draft, user,
        data: { tenant: owner, name: 'Original English', slug, _status: draft ? 'draft' : 'published' } as never })
      const update = async (id: number, data: Record<string, unknown>, draft = false, locale: 'en' | 'kh' | 'cn' = 'en') => {
        const opened = await cms.findByID({ collection, id, draft: true, locale, user })
        return cms.update({ collection, id, draft, locale, user, publishSpecificLocale: locale,
          data: { ...data, _status: draft ? 'draft' : 'published', _editorialRevision: (opened as unknown as { _editorialRevision: string })._editorialRevision } as never })
      }
      const first = await create('preserved')
      const second = await create('another')
      for (const locale of ['kh', 'cn'] as const) await update(first.id, { name: `${locale} published`, _status: 'published' }, false, locale)
      for (const locale of ['en', 'kh', 'cn'] as const) await update(first.id, { name: `${locale} Borin private draft`, _status: 'draft' }, true, locale)
      const before = await cms.findVersions({ collection, locale: 'all', pagination: false })
      for (const draft of [false, true]) {
        await assert.rejects(() => create('preserved', draft), duplicate)
        await assert.rejects(() => update(second.id, { slug: 'preserved' }, draft), duplicate)
      }
      assert.deepEqual(await cms.findVersions({ collection, locale: 'all', pagination: false }), before)
      assert.equal((await create('preserved', false, other.id)).slug, 'preserved')
      await update(first.id, { slug: 'private-address' }, true)
      assert.equal((await cms.findByID({ collection, id: first.id })).slug, 'preserved')
      for (const draft of [false, true]) await assert.rejects(() => create('private-address', draft), duplicate)
      for (const locale of ['en', 'kh', 'cn'] as const) {
        assert.equal((await cms.findByID({ collection, id: first.id, locale, draft: true, fallbackLocale: false })).name, `${locale} Borin private draft`)
      }
      for (const slug of ['invalid/path', 'name?draft=1', 'Mixed Case']) await assert.rejects(() => create(slug), /address|slug/i)
      await assert.rejects(() => cms.db.create({ collection, data: { tenant: tenant.id, slug: 'preserved' } }))
    })
  } finally { await cms.destroy(); await rm(dir, { recursive: true, force: true }) }
})
