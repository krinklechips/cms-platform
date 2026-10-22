import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { postgresAdapter, type PostgresAdapter } from '@payloadcms/db-postgres'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import pg from 'pg'
import { buildConfig, createLocalReq, getAccessResults, getPayload, type CollectionConfig } from 'payload'
import { getEntityPermissions } from 'payload/internal'
import { Enquiries } from '../src/collections/Enquiries'
import { EditorialAudit } from '../src/collections/EditorialAudit'
import { Media } from '../src/collections/Media'
import { Modules } from '../src/collections/Modules'
import { Services } from '../src/collections/Services'
import { Tenants } from '../src/collections/Tenants'
import { Users } from '../src/collections/Users'
import { withModuleGating } from '../src/lib/module-gating'
import { withDrafts } from '../src/lib/with-drafts'
import { withEditorialConcurrency } from '../src/lib/with-editorial-concurrency'
import { withEditorialAudit } from '../src/lib/editorial-audit'

type Access = NonNullable<NonNullable<CollectionConfig['access']>['create']>
type Args = Parameters<Access>[0]
const permitted = (value: unknown): boolean => value === true || Boolean(value && typeof value === 'object' && 'permission' in value && value.permission === true)
const hasWhere = (value: unknown): boolean => Boolean(value && typeof value === 'object' && 'where' in value && value.where)
const gated = withModuleGating({ slug: 'services', fields: [] })
const tenantDocs = new Map([
  ['1', { id: 1, enabledCollections: ['services', 'doctors'] }],
  ['2', { id: 2, enabledCollections: [] }],
  ['3', { id: 3, enabledCollections: ['services', 'doctors'] }],
  ['4', { id: 4 }],
])

const fixture = (memberships = [1, 2], selected = 1) => {
  const reads: { collection: string; id: string; req?: Args['req'] }[] = []
  const req = {
    user: { id: 7, collection: 'users', roles: ['editor'], tenants: memberships.map(tenant => ({ tenant })) },
    context: {}, locale: 'kh', fallbackLocale: false, transactionID: 'write-transaction',
    headers: new Headers({ cookie: `payload-tenant=${selected}` }),
    payload: { findByID: async (options: { collection: string; id: string | number; req?: Args['req'] }) => {
      reads.push({ ...options, id: String(options.id) })
      if (options.collection === 'tenants') return tenantDocs.get(String(options.id)) ?? null
      return { id: options.id, tenant: Number(options.id) === 20 ? 2 : 1 }
    } },
  } as unknown as Args['req']
  return { req, reads }
}

test('create uses the proposed tenant regardless of membership order, cookie or populated entitlement claims', async () => {
  for (const memberships of [[1, 2], [2, 1]]) {
    for (const selected of [1, 2, 3]) {
      for (const tenant of [1, { id: '1', enabledCollections: [] }]) {
        assert.notEqual(await gated.access!.create!({ req: fixture(memberships, selected).req, data: { tenant } }), false)
      }
      for (const tenant of [2, { id: '2', enabledCollections: ['services'] }]) {
        assert.equal(await gated.access!.create!({ req: fixture(memberships, selected).req, data: { tenant } }), false)
      }
    }
  }
})

test('actual creates with no valid target fail closed even with a selected entitled tenant', async () => {
  for (const data of [undefined, {}, { tenant: null }, { tenant: [] }, { tenant: {} }, { tenant: '' }, { tenant: 999 }, { tenant: 4 }]) {
    assert.equal(await gated.access!.create!({ req: fixture().req, data }), false)
  }
  const { req } = fixture()
  req.user = null
  assert.equal(await gated.access!.create!({ req, data: { tenant: 1 } }), false)
})

test('Admin navigation stays visible when any populated membership is entitled, independent of order', () => {
  const hidden = gated.admin!.hidden
  assert.equal(typeof hidden, 'function')
  for (const tenants of [[tenantDocs.get('1'), tenantDocs.get('2')], [tenantDocs.get('2'), tenantDocs.get('1')]]) {
    assert.equal((hidden as (args: unknown) => boolean)({ user: { roles: ['editor'], tenants: tenants.map(tenant => ({ tenant })) } }), false)
  }
})

test('tenant cache is keyed by ID, shared across collections and retains the write transaction', async () => {
  const { req, reads } = fixture()
  req.context.gatingTenant = { enabledCollections: ['services'] }
  assert.notEqual(await gated.access!.create!({ req, data: { tenant: 1 } }), false)
  assert.equal(await gated.access!.create!({ req, data: { tenant: 2 } }), false)
  assert.notEqual(await withModuleGating({ slug: 'doctors', fields: [] }).access!.create!({ req, data: { tenant: '1' } }), false)
  assert.deepEqual(reads.map(({ collection, id }) => [collection, id]), [['tenants', '1'], ['tenants', '2']])
  assert.ok(reads.every(read => read.req?.transactionID === 'write-transaction'))
  assert.equal(req.locale, 'kh')
  assert.equal(req.fallbackLocale, false)
})

test('update and delete resolve persisted ownership instead of submitted ownership or actor ordering', async () => {
  for (const memberships of [[1, 2], [2, 1]]) {
    for (const operation of ['update', 'delete'] as const) {
      const access = gated.access![operation]!
      assert.equal(await access({ req: fixture(memberships).req, id: 20, data: { tenant: 1 } }), false)
      assert.notEqual(await access({ req: fixture(memberships, 2).req, id: 10 }), false)
    }
  }
})

test('updates require enabled source and destination, reject clearing ownership, and allow entitled transfers', async () => {
  for (const tenant of [2, null, '', {}, []]) {
    assert.equal(await gated.access!.update!({ req: fixture().req, id: 10, data: { tenant } }), false)
  }
  assert.notEqual(await gated.access!.update!({ req: fixture([1, 3]).req, id: 10, data: { tenant: 3 } }), false)
})

test('existing write denials survive super-admin and media exemptions', async () => {
  for (const slug of ['services', 'media']) {
    const denied = withModuleGating({ slug, fields: [], access: { create: () => false, update: () => false, delete: () => false } })
    const { req } = fixture()
    req.user = { ...req.user, roles: ['super-admin'] } as Args['req']['user']
    for (const operation of ['create', 'update', 'delete'] as const) {
      assert.equal(await denied.access![operation]!({ req, id: 20, data: { tenant: 2 } }), false)
    }
  }
  const { req, reads } = fixture([2])
  assert.equal(await withModuleGating({ slug: 'media', fields: [] }).access!.create!({ req, data: { tenant: 2 } }), true)
  req.user = { ...req.user, roles: ['super-admin'] } as Args['req']['user']
  assert.equal(await gated.access!.update!({ req, id: 20 }), true)
  assert.equal(reads.length, 0)
})

test('native transferred drafts authorize both stored owners while retaining document editing and restore', { timeout: 120000 }, async t => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cms-module-transfer-'))
  const payload = await getPayload({ key: randomUUID(), config: buildConfig({
    secret: 'module-transfer-synthetic-local-only', telemetry: false, defaultDepth: 0,
    typescript: { autoGenerate: false }, admin: { user: 'users', importMap: { autoGenerate: false } },
    localization: { locales: ['en', 'kh', 'cn'], defaultLocale: 'en', fallback: true },
    db: sqliteAdapter({ client: { url: `file:${path.join(dir, 'fixture.db')}` }, transactionOptions: {} }),
    collections: [
      { slug: 'users', auth: true, fields: [] },
      { slug: 'tenants', fields: [{ name: 'enabledCollections', type: 'json' }] },
      withEditorialConcurrency(withModuleGating(withDrafts({ slug: 'services', fields: [
        { name: 'name', type: 'text', localized: true }, { name: 'description', type: 'text', localized: true }, { name: 'slug', type: 'text' },
      ] }))),
    ],
    plugins: [multiTenantPlugin({ tenantsSlug: 'tenants', collections: { services: {} },
      userHasAccessToAllTenants: user => user.roles?.includes('super-admin') ?? false })],
  }) })
  const transferred = async () => {
    const source = await payload.db.create({ collection: 'tenants', data: { enabledCollections: ['services'] } })
    const target = await payload.db.create({ collection: 'tenants', data: { enabledCollections: ['services'] } })
    const user = { id: 99, collection: 'users' as const, roles: ['editor'], tenants: [{ tenant: source.id }, { tenant: target.id }] } as never
    const published = await payload.create({ collection: 'services', locale: 'en', user, overrideAccess: false,
      data: { tenant: source.id, name: 'Published source', slug: randomUUID(), _status: 'published' } })
    const versions = await payload.findVersions({ collection: 'services', where: { parent: { equals: published.id } } })
    const moved = await payload.update({ collection: 'services', id: published.id, locale: 'en', user, overrideAccess: false, draft: true,
      data: { tenant: target.id, name: 'Private target draft', _status: 'draft', _editorialRevision: published._editorialRevision } })
    assert.equal(moved.tenant, target.id)
    assert.equal((await payload.findByID({ collection: 'services', id: published.id, draft: false })).tenant, source.id)
    const req = async (selected = source.id) => {
      const request = await createLocalReq({ user, locale: 'en', fallbackLocale: false }, payload)
      request.headers = new Headers({ cookie: `payload-tenant=${selected}` })
      return request
    }
    const snapshot = async () => ({
      parent: await payload.db.findOne({ collection: 'services', req: await req(), where: { id: { equals: published.id } } }),
      versions: await payload.db.findVersions({ collection: 'services', pagination: false, sort: 'id', req: await req(),
        where: { parent: { equals: published.id } } }),
    })
    return { source, target, published, moved, version: versions.docs[0], user, req, snapshot }
  }
  const forbidden = (error: unknown) => Boolean(error && typeof error === 'object' && 'status' in error && error.status === 403)
  try {
    await t.test('revoking the published source entitlement blocks publish, draft save and restore after a valid transfer', async () => {
      const state = await transferred()
      await payload.db.updateOne({ collection: 'tenants', id: state.source.id, data: { enabledCollections: [] } })
      const before = await state.snapshot()
      for (const draft of [false, true]) {
        await assert.rejects(async () => payload.update({ collection: 'services', id: state.published.id, req: await state.req(state.target.id),
          overrideAccess: false, draft, publishAllLocales: !draft, data: { name: 'Must not replace the disabled source',
            _status: draft ? 'draft' : 'published', _editorialRevision: state.moved._editorialRevision } }), forbidden)
        assert.deepEqual(await state.snapshot(), before)
      }
      const req = await state.req()
      req.query = { locale: 'en' }
      req.headers.set('if-match', state.moved._editorialRevision!)
      await assert.rejects(() => payload.restoreVersion({ collection: 'services', id: state.version.id, req, overrideAccess: false, draft: true }), forbidden)
      assert.deepEqual(await state.snapshot(), before)
    })

    await t.test('valid divergent owners retain native document and field update permissions without losing the latest draft', async () => {
      const state = await transferred()
      for (const selected of [state.source.id, state.target.id]) {
        for (const data of [undefined, state.moved]) {
          const permissions = await getEntityPermissions({ id: state.published.id, entity: payload.collections.services.config,
            entityType: 'collection', fetchData: true, operations: ['update', 'delete'], blockReferencesPermissions: {},
            data, req: await state.req(selected) })
          assert.equal(permissions.update?.permission, true)
          assert.equal(permissions.fields.name.update?.permission, true)
          assert.equal(permissions.fields.description.update?.permission, true)
          assert.equal(permissions.delete?.permission, true)
        }
      }
      const saved = await payload.update({ collection: 'services', id: state.published.id, req: await state.req(), overrideAccess: false,
        draft: true, data: { description: 'Continued target edits', _status: 'draft', _editorialRevision: state.moved._editorialRevision } })
      assert.equal(saved.tenant, state.target.id)
      assert.equal(saved.name, 'Private target draft')
      assert.equal(saved.description, 'Continued target edits')
      assert.equal((await payload.findByID({ collection: 'services', id: saved.id, draft: false })).tenant, state.source.id)
    })

    await t.test('valid divergent owners can restore a locale while preserving the latest shared tenant and other drafts', async () => {
      const state = await transferred()
      const kh = await payload.findByID({ collection: 'services', id: state.published.id, locale: 'kh', draft: true, fallbackLocale: false, user: state.user })
      await payload.update({ collection: 'services', id: state.published.id, locale: 'kh', user: state.user, overrideAccess: false, draft: true,
        data: { name: 'Other private locale', _status: 'draft', _editorialRevision: kh._editorialRevision } })
      const latest = await payload.findByID({ collection: 'services', id: state.published.id, locale: 'en', draft: true, user: state.user })
      const req = await state.req()
      req.query = { locale: 'en' }
      req.headers.set('if-match', latest._editorialRevision!)
      const restored = await payload.restoreVersion({ collection: 'services', id: state.version.id, req, overrideAccess: false, draft: true })
      assert.equal(restored.tenant, state.target.id)
      assert.equal(restored.name, 'Published source')
      assert.equal((await payload.findByID({ collection: 'services', id: state.published.id, locale: 'kh', draft: true, fallbackLocale: false })).name, 'Other private locale')
      assert.equal((await payload.findByID({ collection: 'services', id: state.published.id, draft: false })).tenant, state.source.id)
    })

    await t.test('dual-owner lookup constraints cannot authorize a writer missing either stored-owner membership', async () => {
      const state = await transferred()
      const before = await state.snapshot()
      for (const tenant of [state.target.id, state.source.id]) {
        const user = { id: 99, collection: 'users', roles: ['editor'], tenants: [{ tenant }] } as never
        for (const draft of [false, true]) {
          await assert.rejects(() => payload.update({ collection: 'services', id: state.published.id, locale: 'en', user,
            overrideAccess: false, draft, data: { name: 'Missing stored membership', _status: draft ? 'draft' : 'published',
              _editorialRevision: state.moved._editorialRevision } }), error => Boolean(error && typeof error === 'object'
                && 'status' in error && [403, 404].includes(Number(error.status))))
          assert.deepEqual(await state.snapshot(), before)
        }
      }
    })

    await t.test('native single delete cannot remove a latest draft whose owner has a disabled module', async () => {
      for (const owner of ['target', 'source'] as const) {
        const state = await transferred()
        await payload.db.updateOne({ collection: 'tenants', id: state[owner].id, data: { enabledCollections: [] } })
        const before = await state.snapshot()
        await assert.rejects(async () => payload.delete({ collection: 'services', id: state.published.id,
          req: await state.req(), overrideAccess: false }), forbidden)
        assert.deepEqual(await state.snapshot(), before)
        const permissions = await getEntityPermissions({ id: state.published.id, entity: payload.collections.services.config,
          entityType: 'collection', fetchData: true, operations: ['delete'], blockReferencesPermissions: {}, req: await state.req() })
        assert.equal(permissions.delete?.permission, false)
      }
    })

    await t.test('native single delete cannot remove a draft belonging to an unassigned stored owner', async () => {
      const state = await transferred()
      const before = await state.snapshot()
      for (const tenant of [state.source.id, state.target.id]) {
        const user = { id: 99, collection: 'users', roles: ['editor'], tenants: [{ tenant }] } as never
        await assert.rejects(() => payload.delete({ collection: 'services', id: state.published.id, user, overrideAccess: false }), forbidden)
        assert.deepEqual(await state.snapshot(), before)
      }
    })

    await t.test('versioned bulk delete is disabled before deleting any versions', async () => {
      for (const deny of ['disabled-target', 'unassigned-target'] as const) {
        const state = await transferred()
        if (deny === 'disabled-target') await payload.db.updateOne({ collection: 'tenants', id: state.target.id, data: { enabledCollections: [] } })
        const user = deny === 'unassigned-target'
          ? { id: 99, collection: 'users', roles: ['editor'], tenants: [{ tenant: state.source.id }] } as never : state.user
        const before = await state.snapshot()
        await assert.rejects(() => payload.delete({ collection: 'services', where: { id: { equals: state.published.id } }, user, overrideAccess: false }), forbidden)
        assert.deepEqual(await state.snapshot(), before)
      }
    })

    await t.test('native delete remains available for both entitled owners and existing super-admin policy', async () => {
      for (const admin of [false, true]) {
        const state = await transferred()
        if (admin) await payload.db.updateOne({ collection: 'tenants', id: state.target.id, data: { enabledCollections: [] } })
        const user = admin ? { id: 99, collection: 'users', roles: ['super-admin'], tenants: [] } as never : state.user
        const deleted = await payload.delete({ collection: 'services', id: state.published.id, user, overrideAccess: false })
        assert.equal(deleted.id, state.published.id)
        const after = await state.snapshot()
        assert.equal(after.parent, null)
        assert.equal(after.versions.totalDocs, 0)
      }
    })
  } finally {
    await payload.destroy()
    await rm(dir, { recursive: true, force: true })
  }
})

test('native PostgreSQL delete shares the editorial writer lock before ownership and audit capture', { timeout: 120000 }, async t => {
  const bin = process.env.MODULE_GATING_POSTGRES_BIN ?? '/opt/homebrew/opt/postgresql@18/bin'
  if (!existsSync(path.join(bin, 'initdb'))) {
    t.skip('Set MODULE_GATING_POSTGRES_BIN to a local PostgreSQL installation; never provide an application URI')
    return
  }
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cms-module-delete-pg-'))
  const cluster = path.join(dir, 'cluster')
  const server = net.createServer()
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  assert.ok(address && typeof address !== 'string')
  const port = address.port
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
  const command = (name: string, args: string[]) => execFileSync(path.join(bin, name), args, {
    encoding: 'utf8', timeout: 30000, env: { PATH: process.env.PATH, HOME: dir, NODE_ENV: 'test', LC_ALL: 'C', LANG: 'C', TZ: 'UTC' },
  })
  const barrier = () => {
    let arrived!: () => void
    let release!: () => void
    const reached = new Promise<void>(resolve => { arrived = resolve })
    const waiting = new Promise<void>(resolve => { release = resolve })
    return { reached, release, arrive: async () => { arrived(); await waiting } }
  }
  type Pause = { id: number; gate: ReturnType<typeof barrier> }
  let deletePause: Pause | undefined
  let writePause: Pause | undefined
  let running = false
  let payload: Awaited<ReturnType<typeof getPayload>> | undefined
  let pool: pg.Pool | undefined
  const reviewed = withEditorialAudit(withEditorialConcurrency(withModuleGating(withDrafts({ slug: 'services', fields: [
    { name: 'name', type: 'text', localized: true }, { name: 'slug', type: 'text' },
  ] }))))
  const collection: CollectionConfig = { ...reviewed, hooks: { ...reviewed.hooks,
    beforeDelete: [...(reviewed.hooks?.beforeDelete ?? []), async ({ id }) => {
      if (deletePause?.id === id) await deletePause.gate.arrive()
    }],
    beforeChange: [...(reviewed.hooks?.beforeChange ?? []), async ({ originalDoc }) => {
      if (writePause && writePause.id === originalDoc?.id) await writePause.gate.arrive()
    }],
  } }
  try {
    command('initdb', ['-D', cluster, '-U', 'module_delete_fixture', '-A', 'trust', '--no-locale'])
    command('pg_ctl', ['-D', cluster, '-l', path.join(dir, 'postgres.log'), '-o', `-h 127.0.0.1 -p ${port} -k ${dir}`, '-w', 'start'])
    running = true
    const connection = { host: '127.0.0.1', port, user: 'module_delete_fixture', database: 'postgres', max: 8,
      options: '-c lock_timeout=10000 -c statement_timeout=15000' }
    pool = new pg.Pool(connection)
    const databasePool = pool
    payload = await getPayload({ key: randomUUID(), disableDBConnect: true, disableOnInit: true, cron: false,
      config: buildConfig({ secret: 'module-delete-pg-synthetic-local-only', telemetry: false, defaultDepth: 0,
        typescript: { autoGenerate: false }, admin: { user: 'users', importMap: { autoGenerate: false } },
        localization: { locales: ['en', 'kh', 'cn'], defaultLocale: 'en', fallback: true },
        db: postgresAdapter({ pool: connection, push: true, disableCreateDatabase: true, migrationDir: path.join(dir, 'unused-migrations') }),
        collections: [{ slug: 'users', auth: true, fields: [] },
          { slug: 'tenants', fields: [{ name: 'enabledCollections', type: 'json' }] }, collection, EditorialAudit],
        plugins: [multiTenantPlugin({ tenantsSlug: 'tenants', collections: { services: {} },
          userHasAccessToAllTenants: user => user.roles?.includes('super-admin') ?? false })],
      }),
    })
    const app = payload
    const database = app.db as unknown as PostgresAdapter
    database.pool = databasePool
    await database.connect!()
    const seed = async () => {
      const source = (await app.db.create({ collection: 'tenants', data: { enabledCollections: ['services'] } })).id
      const target = (await app.db.create({ collection: 'tenants', data: { enabledCollections: ['services'] } })).id
      const user = { id: 99, collection: 'users', roles: ['editor'], tenants: [{ tenant: source }, { tenant: target }] } as never
      const deleter = { id: 99, collection: 'users', roles: ['editor'], tenants: [{ tenant: source }] } as never
      const doc = await app.create({ collection: 'services', locale: 'en', user, overrideAccess: false,
        data: { tenant: source, name: 'Published A', slug: randomUUID(), _status: 'published' } })
      const transfer = () => app.update({ collection: 'services', id: doc.id, locale: 'en', user, overrideAccess: false, draft: true,
        data: { tenant: target, name: 'New B private draft', _status: 'draft', _editorialRevision: doc._editorialRevision } })
      const snapshot = async () => ({
        parent: (await databasePool.query('SELECT to_jsonb(t) row FROM services t WHERE id=$1', [doc.id])).rows,
        versions: (await databasePool.query('SELECT to_jsonb(t) row FROM _services_v t WHERE parent_id=$1 ORDER BY id', [doc.id])).rows,
        locales: (await databasePool.query('SELECT to_jsonb(t) row FROM _services_v_locales t WHERE _parent_id IN (SELECT id FROM _services_v WHERE parent_id=$1) ORDER BY id', [doc.id])).rows,
        audit: (await databasePool.query('SELECT to_jsonb(t) row FROM editorial_audit t WHERE document_i_d=$1 ORDER BY id', [String(doc.id)])).rows,
      })
      return { source, target, user, deleter, doc, transfer, snapshot }
    }
    const status = (error: unknown) => Number((error as { status?: number }).status)
    const advisoryWaiters = async () => Number((await databasePool.query("SELECT count(*)::int n FROM pg_stat_activity WHERE datname=current_database() AND wait_event='advisory'")).rows[0].n)
    const waiting = (operation: Promise<unknown>) => Promise.race([
      operation.then(() => false), new Promise<boolean>(resolve => setTimeout(() => resolve(true), 500)),
    ])

    await t.test('single delete holds its lock through ownership, audit capture, and native version deletion', async () => {
      const state = await seed()
      const pause = barrier()
      deletePause = { id: state.doc.id, gate: pause }
      const deleting = app.delete({ collection: 'services', id: state.doc.id, locale: 'en', user: state.deleter, overrideAccess: false })
      await pause.reached
      const writer = state.transfer().then(doc => ({ saved: true, tenant: doc.tenant, status: 200 }), error => ({ saved: false, tenant: undefined, status: status(error) }))
      try {
        assert.equal(await waiting(writer), true, 'A transfer must not commit after delete authorization/audit capture')
        assert.ok(await advisoryWaiters() > 0, 'The native writer must wait on the same PostgreSQL advisory lock')
      } finally {
        pause.release()
        deletePause = undefined
        await Promise.allSettled([deleting, writer])
      }
      await deleting
      assert.equal((await writer).saved, false)
      const after = await state.snapshot()
      assert.equal(after.parent.length, 0)
      assert.equal(after.versions.length, 0)
      assert.equal(after.locales.length, 0)
      assert.deepEqual(after.audit.map(row => row.row.action), ['create', 'delete'])
      assert.ok(after.audit.every(row => row.row.tenant_id === state.source))
    })

    await t.test('a delete waiting for a transfer rechecks ownership and cannot append a stale audit snapshot', async () => {
      const state = await seed()
      const pause = barrier()
      writePause = { id: state.doc.id, gate: pause }
      const writer = state.transfer()
      await pause.reached
      const deleting = app.delete({ collection: 'services', id: state.doc.id, locale: 'en', user: state.deleter, overrideAccess: false })
        .then(() => ({ deleted: true, status: 200 }), error => ({ deleted: false, status: status(error) }))
      try {
        assert.equal(await waiting(deleting), true, 'Delete must wait before reading ownership or capturing audit state')
        assert.ok(await advisoryWaiters() > 0)
      } finally {
        pause.release()
        writePause = undefined
        await Promise.allSettled([writer, deleting])
      }
      assert.equal((await writer).tenant, state.target)
      assert.deepEqual(await deleting, { deleted: false, status: 403 })
      const after = await state.snapshot()
      assert.equal(after.parent.length, 1)
      assert.equal(after.versions.length, 2)
      assert.deepEqual(after.audit.map(row => row.row.action), ['create', 'draft'])
      assert.equal((await app.findByID({ collection: 'services', id: state.doc.id, draft: true })).tenant, state.target)
    })

    await t.test('native bulk deletion is rejected without changing any parent, versions, locales or audit rows', async () => {
      const state = await seed()
      const before = await state.snapshot()
      for (const overrideAccess of [false, true]) {
        await assert.rejects(() => app.delete({ collection: 'services', where: { id: { equals: state.doc.id } }, user: state.user, overrideAccess }),
          error => [400, 403].includes(status(error)) && /bulk delete|bulk deletes/i.test((error as Error).message))
        assert.deepEqual(await state.snapshot(), before)
      }
      assert.equal(app.collections.services.config.disableBulkDelete, true, 'Payload must also hide the unsafe Admin bulk-delete action')
      await app.delete({ collection: 'services', id: state.doc.id, user: state.user, overrideAccess: false })
      const after = await state.snapshot()
      assert.equal(after.parent.length, 0)
      assert.equal(after.versions.length, 0)
      assert.deepEqual(after.audit.map(row => row.row.action), ['create', 'delete'])
    })
  } finally {
    deletePause?.gate.release()
    writePause?.gate.release()
    if (payload) await payload.destroy()
    if (pool && !pool.ended) await pool.end()
    if (running) command('pg_ctl', ['-D', cluster, '-m', 'immediate', '-w', 'stop'])
    await rm(dir, { recursive: true, force: true })
  }
})

test('native plugin operations and Admin permissions honor target entitlements using disposable SQLite', { timeout: 120000 }, async t => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cms-module-gating-'))
  const scoped: CollectionConfig = withModuleGating({
    slug: 'doctors', access: { read: () => true, update: () => ({ name: { not_equals: 'protected' } }), delete: () => ({ name: { not_equals: 'protected' } }) },
    fields: [{ name: 'name', type: 'text' }],
  })
  const payload = await getPayload({ key: randomUUID(), config: buildConfig({
    secret: 'module-gating-synthetic-local-only', telemetry: false, typescript: { autoGenerate: false },
    admin: { user: 'users' }, defaultDepth: 0,
    localization: { locales: ['en', 'kh', 'cn'], defaultLocale: 'en', fallback: true },
    db: sqliteAdapter({ client: { url: `file:${path.join(dir, 'fixture.db')}` }, transactionOptions: {} }),
    collections: [{ ...Users, fields: [...Users.fields] }, { ...Tenants, fields: [...Tenants.fields] }, { ...Modules, fields: [...Modules.fields] },
      withModuleGating(withDrafts({ ...Services, fields: [...Services.fields] })), scoped,
      withModuleGating({ slug: 'technology', versions: { drafts: true }, fields: [{ name: 'name', type: 'text' }, { name: 'slug', type: 'text' }] }),
      withModuleGating({ ...Media, fields: [...Media.fields] }), withModuleGating({ ...Enquiries, fields: [...Enquiries.fields] })],
    plugins: [multiTenantPlugin({ tenantsSlug: 'tenants', collections: { services: {}, doctors: {}, technology: {}, media: {}, enquiries: {} },
      tenantsArrayField: { includeDefaultField: true, arrayFieldAccess: { create: ({ req }) => req.user?.roles?.includes('super-admin') ?? false,
        update: ({ req }) => req.user?.roles?.includes('super-admin') ?? false } },
      userHasAccessToAllTenants: user => user.roles?.includes('super-admin') ?? false })],
  }) })
  try {
    const enabled = await payload.db.create({ collection: 'tenants', data: { name: 'Enabled', slug: 'enabled', enabledCollections: ['services', 'doctors', 'technology'] } })
    const disabled = await payload.db.create({ collection: 'tenants', data: { name: 'Disabled', slug: 'disabled', enabledCollections: [] } })
    const foreign = await payload.db.create({ collection: 'tenants', data: { name: 'Unassigned', slug: 'unassigned', enabledCollections: ['services', 'doctors', 'technology'] } })
    const second = await payload.db.create({ collection: 'tenants', data: { name: 'Also enabled', slug: 'also-enabled', enabledCollections: ['services', 'doctors', 'technology'] } })
    const actor = (memberships: number[], role = 'editor') => ({ id: 7, collection: 'users', roles: [role], tenants: memberships.map(tenant => ({ tenant })) }) as never
    const reqFor = async (memberships: number[], selected = disabled.id, role = 'editor') => {
      const req = await createLocalReq({ user: actor(memberships, role), locale: 'en', fallbackLocale: false }, payload)
      req.headers = new Headers({ host: 'platform.example.test', cookie: `payload-tenant=${selected}` })
      return req
    }
    const denied = (error: unknown) => Boolean(error && typeof error === 'object' && 'status' in error && [400, 403].includes(Number(error.status)))
    const seedService = (tenant: number, slug: string) => payload.create({ collection: 'services', locale: 'en', data: { tenant, slug, name: 'Synthetic published service', _status: 'published' } })
    const nativeCreate = async (memberships: number[], tenant: number, draft: boolean, selected = disabled.id) => payload.create({
      collection: 'services', req: await reqFor(memberships, selected), overrideAccess: false, draft,
      data: { tenant, slug: randomUUID(), name: 'Synthetic service', _status: draft ? 'draft' : 'published' },
    })

    await t.test('native draft and publish creates are independent of cookie and membership order', async () => {
      for (const memberships of [[enabled.id, disabled.id], [disabled.id, enabled.id]]) {
        for (const selected of [enabled.id, disabled.id]) {
          for (const draft of [true, false]) {
            await assert.rejects(() => nativeCreate(memberships, disabled.id, draft, selected), denied)
            assert.equal((await nativeCreate(memberships, enabled.id, draft, selected)).tenant, enabled.id)
          }
        }
      }
    })

    await t.test('native membership still rejects an enabled but unassigned target, including drafts', async () => {
      for (const draft of [true, false]) {
        await assert.rejects(() => nativeCreate([enabled.id], foreign.id, draft), error => {
          assert.equal((error as Error).name, 'ValidationError')
          assert.ok(JSON.stringify(error).includes('tenant'))
          return true
        })
      }
    })

    await t.test('native Admin collection permissions retain Create New and write controls for entitled memberships', async () => {
      for (const memberships of [[enabled.id], [disabled.id, enabled.id], [enabled.id, disabled.id]]) {
        const permissions = await getAccessResults({ req: await reqFor(memberships) })
        assert.equal(permitted(permissions.collections!.services!.create), true)
        assert.equal(permitted(permissions.collections!.services!.update), true)
        assert.equal(permitted(permissions.collections!.services!.delete), true)
        assert.ok(hasWhere(permissions.collections!.services!.update))
        assert.ok(hasWhere(permissions.collections!.services!.delete))
      }
      const permissions = await getAccessResults({ req: await reqFor([disabled.id]) })
      assert.equal(permitted(permissions.collections!.services!.create), false)
      assert.equal(permitted(permissions.collections!.services!.update), false)
      assert.equal(permitted(permissions.collections!.services!.delete), false)
    })

    await t.test('native writes without a tenant do not borrow the cookie or permission-discovery grant', async () => {
      const req = await reqFor([enabled.id], enabled.id)
      assert.equal(permitted((await getAccessResults({ req })).collections!.services!.create), true)
      for (const draft of [true, false]) {
        await assert.rejects(() => payload.create({ collection: 'services', req, overrideAccess: false, draft,
          data: { slug: randomUUID(), name: 'No proposed owner' } as never }), denied)
      }
    })

    await t.test('native updates and deletes use persisted ownership; spoofed and forged transfers are denied', async () => {
      const source = await seedService(enabled.id, randomUUID())
      const blocked = await seedService(disabled.id, randomUUID())
      for (const draft of [true, false]) {
        for (const memberships of [[enabled.id, disabled.id], [disabled.id, enabled.id]]) {
          const req = await reqFor(memberships)
          await assert.rejects(() => payload.update({ collection: 'services', id: blocked.id, req, overrideAccess: false, draft,
            data: { tenant: enabled.id, name: 'Spoofed ownership' } }), denied)
          await assert.rejects(() => payload.update({ collection: 'services', id: source.id, req, overrideAccess: false, draft,
            data: { tenant: disabled.id } }), denied)
          assert.equal((await payload.update({ collection: 'services', id: source.id, req, overrideAccess: false, draft,
            data: { name: 'Allowed change' } })).tenant, enabled.id)
        }
        await assert.rejects(async () => payload.update({ collection: 'services', id: source.id, req: await reqFor([enabled.id]), overrideAccess: false,
          draft, data: { tenant: foreign.id } }), denied)
        await assert.rejects(async () => payload.update({ collection: 'services', id: source.id, req: await reqFor([enabled.id]), overrideAccess: false,
          draft, data: { tenant: null } as never }), denied)
      }
      await assert.rejects(async () => payload.delete({ collection: 'services', id: blocked.id, req: await reqFor([enabled.id, disabled.id]), overrideAccess: false }), denied)
      assert.equal((await payload.delete({ collection: 'services', id: source.id, req: await reqFor([disabled.id, enabled.id]), overrideAccess: false })).id, source.id)
      const transfer = await seedService(enabled.id, randomUUID())
      assert.equal((await payload.update({ collection: 'services', id: transfer.id, req: await reqFor([enabled.id, second.id]), overrideAccess: false,
        data: { tenant: second.id, _status: 'published' } })).tenant, second.id)
    })

    await t.test('native update gates use the stored latest draft owner rather than the published parent', async () => {
      const source = await seedService(enabled.id, randomUUID())
      await payload.update({ collection: 'services', id: source.id, draft: true, req: await reqFor([], enabled.id, 'super-admin'),
        data: { tenant: disabled.id, name: 'Synthetic private draft' } })
      assert.equal((await payload.findByID({ collection: 'services', id: source.id, draft: false })).tenant, enabled.id)
      assert.equal((await payload.findByID({ collection: 'services', id: source.id, draft: true })).tenant, disabled.id)
      for (const draft of [true, false]) {
        await assert.rejects(async () => payload.update({ collection: 'services', id: source.id, req: await reqFor([enabled.id, disabled.id]),
          overrideAccess: false, draft, data: { tenant: enabled.id, name: 'Cannot rescue an unentitled draft' } }), denied)
      }
      assert.equal((await payload.findByID({ collection: 'services', id: source.id, draft: true })).name, 'Synthetic private draft')
    })

    await t.test('bulk updates/deletes intersect existing Where policies, entitlements and native membership', async () => {
      const rows: { id: number }[] = []
      for (const [tenant, name] of [[enabled.id, 'editable'], [enabled.id, 'protected'], [disabled.id, 'disabled'], [foreign.id, 'foreign']] as const) {
        rows.push(await payload.db.create({ collection: 'doctors', data: { tenant, name } }))
      }
      const req = await reqFor([enabled.id, disabled.id], disabled.id)
      await assert.rejects(() => payload.update({ collection: 'doctors', id: rows[1].id, req, overrideAccess: false, data: { name: 'bypass' } }), denied)
      await assert.rejects(() => payload.update({ collection: 'doctors', id: rows[3].id, req, overrideAccess: false, data: { name: 'bypass' } }), denied)
      const updated = await payload.update({ collection: 'doctors', where: { id: { in: rows.map(row => row.id) } }, req, overrideAccess: false, data: { name: 'changed' } })
      assert.deepEqual(updated.docs.map(doc => doc.id), [rows[0].id])
      assert.equal(updated.errors.length, 0)
      await assert.rejects(() => payload.update({ collection: 'doctors', where: { id: { in: rows.map(row => row.id) } }, req,
        overrideAccess: false, data: { tenant: disabled.id } }), denied)
      const deleted = await payload.delete({ collection: 'doctors', where: { id: { in: rows.map(row => row.id) } }, req, overrideAccess: false })
      assert.deepEqual(deleted.docs.map(doc => doc.id), [rows[0].id])
      const remaining = await payload.find({ collection: 'doctors', where: { id: { in: rows.slice(1).map(row => row.id) } }, depth: 0 })
      assert.deepEqual(remaining.docs.map(doc => doc.name).sort(), ['disabled', 'foreign', 'protected'])
    })

    await t.test('native restore authorizes the persisted owner, not historical membership or selected cookie', async () => {
      const source = await seedService(disabled.id, randomUUID())
      const historical = await payload.findVersions({ collection: 'services', where: { parent: { equals: source.id } }, depth: 0 })
      const req = await reqFor([enabled.id, disabled.id], enabled.id)
      req.query = { locale: 'en' }
      await assert.rejects(() => payload.restoreVersion({ collection: 'services', id: historical.docs[0].id, req, overrideAccess: false, draft: true }), denied)
      const allowed = await seedService(enabled.id, randomUUID())
      const allowedVersion = await payload.findVersions({ collection: 'services', where: { parent: { equals: allowed.id } }, depth: 0 })
      const allowedReq = await reqFor([disabled.id, enabled.id], disabled.id)
      allowedReq.query = { locale: 'en' }
      assert.equal((await payload.restoreVersion({ collection: 'services', id: allowedVersion.docs[0].id, req: allowedReq, overrideAccess: false, draft: true })).tenant, enabled.id)
    })

    await t.test('native unscoped restore rechecks the actual historical transfer after status-only access', async () => {
      for (const historicalTenant of [disabled.id, foreign.id]) {
        const source = await payload.create({ collection: 'technology', data: { tenant: historicalTenant, name: 'Historical synthetic owner', slug: randomUUID(), _status: 'published' } })
        const versions = await payload.findVersions({ collection: 'technology', where: { parent: { equals: source.id } } })
        await payload.update({ collection: 'technology', id: source.id, data: { tenant: enabled.id, name: 'Current synthetic owner', _status: 'published' } })
        const req = await reqFor([enabled.id, disabled.id])
        await assert.rejects(() => payload.restoreVersion({ collection: 'technology', id: versions.docs[0].id, req, overrideAccess: false, draft: true }), denied)
        const current = await payload.findByID({ collection: 'technology', id: source.id, draft: true })
        assert.equal(current.tenant, enabled.id)
        assert.equal(current.name, 'Current synthetic owner')
      }
    })

    await t.test('super-admin bypass does not override existing denials and media remains exempt but tenant-isolated', async () => {
      const admin = await reqFor([], enabled.id, 'super-admin')
      assert.equal((await payload.create({ collection: 'services', req: admin, overrideAccess: false,
        data: { tenant: disabled.id, slug: randomUUID(), name: 'Admin policy' } })).tenant, disabled.id)
      for (const req of [admin, await reqFor([enabled.id])]) {
        await assert.rejects(() => payload.create({ collection: 'enquiries', req, overrideAccess: false, data: { tenant: enabled.id, name: 'Read only' } }), denied)
      }
      const media = await payload.db.create({ collection: 'media', data: { tenant: disabled.id, filename: 'local-fixture.png', mimeType: 'image/png' } })
      const req = await reqFor([disabled.id])
      assert.equal((await payload.update({ collection: 'media', id: media.id, req, overrideAccess: false, data: { alt: 'Local fixture' } })).alt, 'Local fixture')
      assert.equal((await payload.update({ collection: 'media', id: media.id, req, overrideAccess: false, data: { tenant: foreign.id } })).tenant, disabled.id)
    })
  } finally {
    await payload.destroy()
    await rm(dir, { recursive: true, force: true })
  }
})
