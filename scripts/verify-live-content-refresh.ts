import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import pg from 'pg'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { buildConfig, getPayload, type Access, type Payload, type PayloadRequest } from 'payload'
import { FaqItems } from '../src/collections/FaqItems'
import { CareerPositions } from '../src/collections/CareerPositions'
import { withDrafts } from '../src/lib/with-drafts'
import { APPROVED_IDENTITIES, applyRefresh, hashJSON, planRefresh, type Identity, type Manifest, type RecordState } from '../src/lib/live-content-refresh'
import { collectionPolicies, createRefreshRuntime } from './refresh-live-translations'

// No app configuration, env files, service credentials, or non-fixture destinations.
const url = process.argv[2]
if (!url || process.argv.length !== 3) throw new Error('Pass the explicit cms_refresh_fixture PostgreSQL URL only.')
const parsed = new URL(url)
if (!['postgres:', 'postgresql:'].includes(parsed.protocol) || !['127.0.0.1', 'localhost'].includes(parsed.hostname)
  || parsed.port !== '55439' || parsed.pathname !== '/cms_refresh_fixture' || parsed.search || parsed.hash || parsed.password) {
  throw new Error('Only password-free localhost:55439/cms_refresh_fixture is permitted.')
}
const schema = 'refresh_' + randomUUID().replaceAll('-', '')
const pool = new pg.Pool({ connectionString: url, max: 4 })
const acquired = new Set<pg.PoolClient>()
const fixturePools = new Set<pg.Pool>()
class FixturePool extends pg.Pool {
  constructor(options?: pg.PoolConfig) {
    super(options)
    fixturePools.add(this)
    this.on('acquire', c => acquired.add(c))
    this.on('release', (_e, c) => acquired.delete(c))
  }
}
let cms: Payload | undefined
let created = false
try {
  await pool.query(`CREATE SCHEMA "${schema}"`)
  created = true
  const actorTenant = (user: unknown) => {
    const tenant = (user as any)?.tenant
    return tenant && typeof tenant === 'object' ? tenant.id : tenant
  }
  const tenantAccess: Access = ({ req }) => req.user ? { tenant: { equals: actorTenant(req.user) } } : false
  const scoped = (c: typeof FaqItems) => withDrafts({ ...c,
    fields: [{ name: 'tenant', type: 'relationship', relationTo: 'tenants', required: true }, ...c.fields],
    access: { create: ({ req }) => Boolean(req.user), read: tenantAccess, update: tenantAccess,
      readVersions: ({ req }) => req.user ? { 'version.tenant': { equals: actorTenant(req.user) } } : false },
  })
  cms = await getPayload({ key: schema, config: buildConfig({
    secret: 'isolated-local-refresh-fixture-only', telemetry: false, typescript: { autoGenerate: false },
    db: postgresAdapter({ schemaName: schema, pool: { connectionString: url, max: 8,
      options: '-c lock_timeout=10000 -c statement_timeout=15000' }, pg: { ...pg, Pool: FixturePool },
      push: true, disableCreateDatabase: true }),
    localization: { locales: ['en', 'kh', 'cn'], defaultLocale: 'en', fallback: false },
    collections: [
      { slug: 'tenants', fields: [{ name: 'slug', type: 'text', required: true }] },
      { slug: 'users', auth: { disableLocalStrategy: true }, fields: [{ name: 'tenant', type: 'relationship', relationTo: 'tenants' }] },
      scoped(FaqItems), scoped(CareerPositions),
    ],
  }) })
  const payload = cms
  const tenant = await payload.create({ collection: 'tenants', data: { slug: 'roomchang' } as never })
  // A fixture-only actor row, not an auth account: no passwords, tokens or login credentials.
  const actorRow = await payload.create({ collection: 'users', data: { tenant: tenant.id, email: 'fixture@example.invalid' } as never })
  const actor = { ...actorRow, collection: 'users' } as unknown as PayloadRequest['user']
  const sourceIDs = APPROVED_IDENTITIES['faq-items'].slice(0, 4)
  const faqDocs: { id: string | number }[] = []
  for (const [i, sourceId] of sourceIDs.entries()) faqDocs.push(await payload.create({ collection: 'faq-items',
    locale: 'en', user: actor, overrideAccess: false, data: { tenant: tenant.id, sourceId, question: 'English ' + i,
      answer: 'English answer', category: 'General', order: i, _status: 'published' } as never }))
  const career = await payload.create({ collection: 'career-positions', locale: 'en', user: actor, overrideAccess: false,
    data: { tenant: tenant.id, sourceId: APPROVED_IDENTITIES['career-positions'][0], slug: 'clinical-fellowship',
      title: 'Career', order: 5, _status: 'published', requirements: [{ id: 'aaaaaaaaaaaaaaaaaaaaaaaa', value: 'English requirement' }],
      benefits: [{ id: 'bbbbbbbbbbbbbbbbbbbbbbbb', value: 'English benefit' }] } as never })
  for (const locale of ['kh', 'cn'] as const) await payload.update({ collection: 'career-positions', id: career.id,
    locale, user: actor, overrideAccess: false, draft: false, publishAllLocales: true,
    data: { title: locale + ' career', requirements: [{ id: (locale === 'kh' ? 'c' : 'd').repeat(24), value: locale + ' requirement' }],
      benefits: [{ id: (locale === 'kh' ? 'e' : 'f').repeat(24), value: locale + ' benefit' }] } as never })
  const translations = sourceIDs.flatMap(sourceId => ['km', 'zh'].flatMap(locale => ['question', 'answer', 'category'].map(field => ({
    entity_type: 'faq', entity_id: sourceId, locale, field, value: locale + ':' + field + ':' + sourceId.slice(0, 4),
  }))))
  translations.push(...['km', 'zh'].map(locale => ({ entity_type: 'career_position', entity_id: 'clinical-fellowship',
    locale, field: 'shortDescription', value: locale + ':career description' })))
  const bytes = Buffer.from(JSON.stringify({ tables: { faq_items: sourceIDs.map(id => ({ id })),
    career_positions: [{ id: APPROVED_IDENTITIES['career-positions'][0], slug: 'clinical-fellowship' }], content_translations: translations } }))
  const policies = collectionPolicies(payload.config)
  policies['faq-items'].canPublish = policies['career-positions'].canPublish = true
  const runtime = await createRefreshRuntime({ pool, destination: { host: parsed.hostname, port: 55439, database: 'cms_refresh_fixture', schema },
    tenantId: String(tenant.id), tenantSlug: 'roomchang', policies, payload, actor })
  const identities: Identity[] = faqDocs.map((d, i) => ({ collection: 'faq-items', id: String(d.id), sourceId: sourceIDs[i], tenantId: String(tenant.id) }))
  identities.push({ collection: 'career-positions', id: String(career.id), sourceId: APPROVED_IDENTITIES['career-positions'][0], tenantId: String(tenant.id) })
  const state = (id: Identity) => runtime.transaction(true, tx => runtime.read(tx, id))
  const wholeHash = async () => hashJSON(await Promise.all(identities.map(state)))
  const subset = (m: Manifest, ids: string[]): Manifest => ({ ...m, records: m.records.filter(r => ids.includes(r.sourceId)) })
  const initialHash = await wholeHash()
  const plan = await planRefresh(bytes, runtime)
  assert.equal(plan.manifest.records.length, 5)
  assert.equal(plan.candidateCells, 26)
  assert.equal(await wholeHash(), initialHash, 'SQL-only plan must not change any content or version flag')
  const beforePublish = await Promise.all([identities[0], identities[4]].map(state))
  const apply = await applyRefresh(bytes, subset(plan.manifest, [sourceIDs[0], career.sourceId!]), runtime)
  assert.equal(apply.appliedCells, 8, JSON.stringify(apply))
  assert.ok(apply.records.every(r => r.code === 'published'))
  for (const [i, identity] of [identities[0], identities[4]].entries()) {
    const saved = await state(identity), root = '_' + identity.collection.replaceAll('-', '_') + '_v'
    const latest = saved.history[root].filter(r => r.latest)
    assert.equal(latest.length, 1)
    assert.equal(latest[0].version__status, 'published', 'Import must not leave a saved-draft badge')
    assert.notEqual(latest[0].snapshot, true)
    assert.equal(saved.history[root].length, beforePublish[i].history[root].length + 5, 'Two locale publications and one final status-only version')
    const snapshots = saved.history[root].filter(r => r.snapshot)
    assert.equal(snapshots.length, 2)
    assert.ok(snapshots.every(r => !r.latest && r.version__status === 'draft'), 'Retain native snapshots as immutable historical drafts')
  }
  const read = (collection: Identity['collection'], id: string | number) => payload.findByID({ collection, id, locale: 'all',
    fallbackLocale: false, draft: false, user: actor, overrideAccess: false, depth: 0 }) as Promise<any>
  const publishedFaq = await read('faq-items', faqDocs[0].id)
  assert.equal(publishedFaq.question.kh, 'km:question:' + sourceIDs[0].slice(0, 4))
  assert.equal(publishedFaq.category.cn, 'zh:category:' + sourceIDs[0].slice(0, 4))
  assert.equal(publishedFaq.question.en, 'English 0')
  assert.equal(publishedFaq.category.en, 'General')
  assert.equal(publishedFaq.order, 0)
  const publishedCareer = await read('career-positions', career.id)
  assert.equal(publishedCareer.description.cn, 'zh:career description')
  assert.equal(publishedCareer.requirements.kh[0].id, 'cccccccccccccccccccccccc')
  assert.equal(publishedCareer.requirements.kh[0].value, 'kh requirement')
  assert.equal(publishedCareer.benefits.en[0].value, 'English benefit')
  const afterApply = await wholeHash()
  const replay = await applyRefresh(bytes, subset(plan.manifest, [sourceIDs[0], career.sourceId!]), runtime)
  assert.equal(replay.appliedCells, 0)
  assert.equal(await wholeHash(), afterApply, 'Replay must not mutate either parent or history')

  // Hold the identical editor lock, change state, then let the importer acquire it.
  const writer = await pool.connect()
  await writer.query('BEGIN')
  try {
    await writer.query('SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))', ['editorial:faq-items', String(faqDocs[1].id)])
    await writer.query(`UPDATE "${schema}".faq_items SET "order"=99 WHERE id=$1`, [faqDocs[1].id])
    const pending = applyRefresh(bytes, subset(plan.manifest, [sourceIDs[1]]), runtime)
    let observed = false
    for (let i = 0; i < 100; i++) {
      const waiting = await pool.query(`SELECT 1 FROM pg_locks WHERE locktype='advisory' AND NOT granted AND database=(SELECT oid FROM pg_database WHERE datname='cms_refresh_fixture')`)
      if (waiting.rowCount) { observed = true; break }
      await new Promise(r => setTimeout(r, 10))
    }
    await writer.query('COMMIT')
    const report = await pending
    assert.equal(observed, true, 'Importer must wait on the real editor advisory lock')
    assert.equal(report.records[0].code, 'stale_state')
  } finally { await writer.query('ROLLBACK'); writer.release() }
  // Finish the simulated editor change with a native published version for later cases.
  await payload.update({ collection: 'faq-items', id: faqDocs[1].id, locale: 'en', draft: false, publishAllLocales: true,
    user: actor, overrideAccess: false, data: { order: 99, _status: 'published' } })

  await payload.update({ collection: 'faq-items', id: faqDocs[2].id, locale: 'en', draft: true,
    user: actor, overrideAccess: false, data: { answer: 'Pending staff draft' } })
  const draftState = await state(identities[2])
  const draftManifest = subset(plan.manifest, [sourceIDs[2]])
  draftManifest.records[0].expectedHash = hashJSON(draftState)
  const draftHash = await wholeHash()
  assert.equal((await applyRefresh(bytes, draftManifest, runtime)).records[0].code, 'pending_draft')
  assert.equal(await wholeHash(), draftHash)

  for (const answer of ['Intentional staff content', null]) await payload.update({ collection: 'faq-items', id: faqDocs[3].id,
    locale: 'kh', draft: true, user: actor, overrideAccess: false, data: { answer } })
  await payload.update({ collection: 'faq-items', id: faqDocs[3].id, locale: 'en', draft: false, publishAllLocales: true,
    user: actor, overrideAccess: false, data: { question: 'English 3', _status: 'published' } })
  const clearManifest = subset(plan.manifest, [sourceIDs[3]])
  clearManifest.records[0].expectedHash = hashJSON(await state(identities[3]))
  const clearHash = await wholeHash()
  assert.equal((await applyRefresh(bytes, clearManifest, runtime)).records[0].code, 'history_has_value')
  assert.equal(await wholeHash(), clearHash)

  const fresh = await planRefresh(bytes, runtime)
  const rollbackManifest = subset(fresh.manifest, [sourceIDs[1]])
  assert.equal(rollbackManifest.records.length, 1)
  const editor = await payload.create({ collection: 'users', data: { tenant: tenant.id, email: 'editor@example.invalid' } as never })
  const lease = await payload.create({ collection: 'payload-locked-documents', data: {
    document: { relationTo: 'faq-items', value: faqDocs[1].id }, user: { relationTo: 'users', value: editor.id },
  } as never })
  const leaseHash = async () => hashJSON({
    rows: (await pool.query(`SELECT to_jsonb(r) AS row FROM "${schema}".payload_locked_documents r ORDER BY id`)).rows,
    relationships: (await pool.query(`SELECT to_jsonb(r) AS row FROM "${schema}".payload_locked_documents_rels r ORDER BY id`)).rows,
  })
  const lockBefore = await leaseHash(), contentBeforeLease = await wholeHash()
  assert.equal((await applyRefresh(bytes, rollbackManifest, runtime)).records[0].code, 'editor_lease')
  assert.equal(await leaseHash(), lockBefore, 'Importer must not clear or alter the editor lease')
  assert.equal(await wholeHash(), contentBeforeLease)
  await payload.delete({ collection: 'payload-locked-documents', id: lease.id })

  const commit = payload.db.commitTransaction
  let discardedCommits = 0
  payload.db.commitTransaction = async id => { discardedCommits++; await payload.db.rollbackTransaction(id) }
  try {
    const beforeDiscard = await wholeHash()
    const discarded = await applyRefresh(bytes, rollbackManifest, runtime)
    assert.equal(discarded.records[0].code, 'indeterminate_commit')
    assert.equal(discarded.appliedCells, 0)
    assert.equal(discardedCommits, 1, 'An uncertain commit must not be retried')
    assert.equal(await wholeHash(), beforeDiscard, 'Real rollback behind a swallowed commit must remain unchanged')
  } finally { payload.db.commitTransaction = commit }

  const nativeUpdate = runtime.update
  runtime.update = async (...args) => {
    await nativeUpdate(...args)
    await (args[0] as { query: (text: string, params: unknown[]) => Promise<unknown> }).query(
      `INSERT INTO "${schema}"._faq_items_v_locales (_parent_id, _locale, version_answer)
       SELECT min(id), 'cn', 'Injected into retained history' FROM "${schema}"._faq_items_v WHERE parent_id=$1`, [faqDocs[1].id])
  }
  const childInjectionHash = await wholeHash()
  assert.equal((await applyRefresh(bytes, rollbackManifest, runtime)).records[0].code, 'preservation_failed')
  assert.equal(await wholeHash(), childInjectionHash, 'New children of old versions must roll back with the whole record')

  runtime.update = async (...args) => {
    await nativeUpdate(...args)
    await (args[0] as { query: (text: string, params: unknown[]) => Promise<unknown> }).query(
      `UPDATE "${schema}".faq_items_locales SET question='Collateral change' WHERE _parent_id=$1 AND _locale='en'`, [faqDocs[1].id])
  }
  const rollbackHash = await wholeHash()
  assert.equal((await applyRefresh(bytes, rollbackManifest, runtime)).records[0].code, 'preservation_failed')
  assert.equal(await wholeHash(), rollbackHash, 'Actual PostgreSQL rollback must preserve every pre-existing row')
  runtime.update = nativeUpdate
  assert.equal(Object.keys((payload.db as any).sessions).length, 0)
  console.log('PASS: native PostgreSQL bilingual FAQ/career/category publish finishes latest=published with old snapshots retained; read-only/replay hashes unchanged; editor advisory lock + stale hash, pending draft, historical clear, editor lease, discarded commit, old-version child injection and collateral rollback protected; durable post-commit reads verified; EN/shared fields, arrays and old versions preserved.')
} finally {
  try { if (cms) await cms.destroy() } finally {
    for (const client of acquired) client.release(true)
    await Promise.all([...fixturePools].map(p => p.end()))
    if (created) await pool.query(`DROP SCHEMA "${schema}" CASCADE`)
    await pool.end()
  }
}
