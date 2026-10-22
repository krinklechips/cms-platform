import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  APPROVED_IDENTITIES, applyRefresh, collectCandidates, hashJSON, parseRefreshArgs,
  planRefresh, readSQLState, sha256, validateManifest, assertRefreshEnvironment, type RefreshRuntime, type RecordState, type SQLRead,
} from '../src/lib/live-content-refresh'

const faqID = 'e1afc59c-6012-4c04-b0d5-aeaddfe46889'
const careerID = 'c89d76a4-1d2e-461c-b3ad-444f9df08903'
const snapshot = (extra: Record<string, unknown> = {}) => Buffer.from(JSON.stringify({ tables: {
  faq_items: [{ id: faqID }], career_positions: [{ id: careerID, slug: 'clinical-fellowship' }],
  content_translations: [
    { entity_type: 'faq', entity_id: faqID, locale: 'km', field: 'question', value: 'Khmer question' },
    { entity_type: 'faq', entity_id: faqID, locale: 'zh', field: 'answer', value: 'Chinese answer' },
    { entity_type: 'faq', entity_id: faqID, locale: 'km', field: 'category', value: 'Khmer category' },
    { entity_type: 'career_position', entity_id: 'clinical-fellowship', locale: 'km', field: 'shortDescription', value: 'Khmer career' },
  ], ...extra,
} }))

function fixture() {
  const state: RecordState = {
    identity: { collection: 'faq-items', id: '1', sourceId: faqID, tenantId: '1' },
    parent: { faq_items: [{ id: 1, tenant_id: 1, source_id: faqID, order: 7, _status: 'published' }],
      faq_items_locales: [{ id: 1, _parent_id: 1, _locale: 'en', question: 'English', answer: 'Existing', category: 'General' }] },
    history: { _faq_items_v: [{ id: 10, parent_id: 1, version_tenant_id: 1, version_source_id: faqID,
      version_order: 7, version__status: 'published', latest: true }],
    _faq_items_v_locales: [{ id: 10, _parent_id: 10, _locale: 'en', version_question: 'English', version_answer: 'Existing', version_category: 'General' }] },
    columns: ['question', 'answer', 'category'], localizedFields: ['question', 'answer', 'category'],
    maxVersions: 100, canPublish: true, links: [],
  }
  const events: string[] = []
  let committed = structuredClone(state)
  const runtime: RefreshRuntime = {
    destination: { host: '127.0.0.1', port: 55439, database: 'cms_refresh_fixture', schema: 'public' },
    tenantSlug: 'roomchang', tenantId: '1',
    transaction: async (readonly, fn) => {
      events.push(readonly ? 'begin-read-only' : 'begin')
      const working = structuredClone(committed)
      try { const result = await fn(working); if (!readonly) committed = working; events.push(readonly ? 'rollback-read-only' : 'commit'); return result }
      catch (e) { events.push('rollback'); throw e }
    },
    resolve: async (_tx, collection, sourceId) => collection === 'faq-items' && sourceId === faqID ? [state.identity] : [],
    lock: async () => { events.push('lock') },
    read: async (tx) => { events.push('read'); return structuredClone(tx as RecordState) },
    update: async (tx, _record, locale, data, mode) => {
      events.push('native-read-write')
      const s = tx as RecordState
      const old = s.history._faq_items_v.find(r => r.latest)!
      const oldID = old.id
      for (const row of s.history._faq_items_v) row.latest = false
      const id = Number(oldID) + 1
      s.history._faq_items_v.push({ ...old, id, latest: true, version__status: mode === 'publish' ? 'published' : 'draft' })
      const locals = s.history._faq_items_v_locales.filter(r => r._parent_id === oldID)
      s.history._faq_items_v_locales.push(...locals.map((r, i) => ({ ...r, id: id * 100 + i, _parent_id: id })))
      let target = s.history._faq_items_v_locales.find(r => r._parent_id === id && r._locale === locale)
      if (!target) { target = { id: id * 100 + 50, _parent_id: id, _locale: locale }; s.history._faq_items_v_locales.push(target) }
      for (const [f, v] of Object.entries(data)) target['version_' + f] = v
      if (mode === 'publish') {
        let p = s.parent.faq_items_locales.find(r => r._locale === locale)
        if (!p) { p = { id: 100 + s.parent.faq_items_locales.length, _parent_id: 1, _locale: locale }; s.parent.faq_items_locales.push(p) }
        Object.assign(p, data)
      }
    },
    finalizePublish: async (tx) => {
      events.push('finalize-publish')
      const s = tx as RecordState, old = s.history._faq_items_v.find(r => r.latest)!
      const oldID = old.id, id = Number(oldID) + 1
      for (const row of s.history._faq_items_v) row.latest = false
      s.history._faq_items_v.push({ ...old, id, latest: true, version__status: 'published', snapshot: false })
      const locals = s.history._faq_items_v_locales.filter(r => r._parent_id === oldID)
      s.history._faq_items_v_locales.push(...locals.map((r, i) => ({ ...r, id: id * 100 + i, _parent_id: id })))
    },
  }
  return { runtime, events, get: () => committed, change: (fn: (s: RecordState) => void) => fn(committed) }
}

test('candidate scope is fixed: 35 FAQ identities and four career identities, KH/CN scalar cells only', () => {
  assert.equal(APPROVED_IDENTITIES['faq-items'].length, 35)
  assert.equal(APPROVED_IDENTITIES['career-positions'].length, 4)
  const c = collectCandidates(snapshot())
  assert.equal(c.cells.length, 4)
  assert.equal(c.sourceHash, sha256(snapshot()))
  assert.deepEqual(new Set(c.cells.map(c => c.locale)), new Set(['kh', 'cn']))
  assert.ok(c.cells.some(c => c.collection === 'career-positions' && c.field === 'description'))
})

test('duplicate source identities and translation keys fail closed', () => {
  assert.throws(() => collectCandidates(snapshot({ faq_items: [{ id: faqID }, { id: faqID }] })), /duplicate/)
  const x = JSON.parse(snapshot().toString())
  x.tables.content_translations.push(x.tables.content_translations[0])
  assert.throws(() => collectCandidates(Buffer.from(JSON.stringify(x))), /duplicate/)
})

test('unknown identities, EN, arrays and stats are never candidates', () => {
  const x = JSON.parse(snapshot().toString())
  x.tables.faq_items.push({ id: 'unapproved' })
  for (const [entity, id, locale, field, value] of [
    ['faq', 'unapproved', 'km', 'question', 'No'], ['faq', faqID, 'en', 'answer', 'No'],
    ['faq', faqID, 'zh', 'features', ['No']], ['site_stat', 'clinical_experience', 'zh', 'displayValue', 'No'],
  ]) x.tables.content_translations.push({ entity_type: entity, entity_id: id, locale, field, value })
  assert.equal(collectCandidates(Buffer.from(JSON.stringify(x))).cells.length, 4)
})

test('planning is read-only, category requires migrated localized storage, and unavailable publishing stages visibly', async () => {
  const f = fixture()
  f.change(s => { s.columns = ['question', 'answer']; s.canPublish = false })
  const p = await planRefresh(snapshot(), f.runtime)
  assert.equal(p.manifest.records[0].mode, 'draft')
  assert.equal(p.manifest.records[0].cells.length, 2)
  assert.ok(p.conflicts.some(c => c.code === 'category_not_migrated'))
  assert.ok(p.conflicts.some(c => c.code === 'staged_not_visible'))
  assert.deepEqual(f.events, ['begin-read-only', 'read', 'rollback-read-only'])
})

test('empty strings, whitespace, populated parents and historical intentional clears protect the whole record', async () => {
  for (const value of ['', ' ', 'Staff edit']) {
    const f = fixture()
    f.change(s => s.history._faq_items_v_locales.push({ id: 99, _parent_id: 10, _locale: 'kh', version_question: value }))
    const p = await planRefresh(snapshot(), f.runtime)
    assert.equal(p.manifest.records.length, 0)
    assert.ok(p.conflicts.some(c => c.code === 'history_has_value'))
  }
  const f = fixture()
  f.change(s => {
    s.history._faq_items_v.unshift({ ...s.history._faq_items_v[0], id: 9, latest: false })
    s.history._faq_items_v_locales.push({ id: 99, _parent_id: 9, _locale: 'kh', version_question: 'Later deliberately cleared' })
  })
  assert.equal((await planRefresh(snapshot(), f.runtime)).manifest.records.length, 0)
})

test('any pre-existing latest draft or ambiguous latest flag blocks the entire record', async () => {
  const f = fixture()
  f.change(s => { s.history._faq_items_v[0].version__status = 'draft' })
  assert.ok((await planRefresh(snapshot(), f.runtime)).conflicts.some(c => c.code === 'pending_draft'))
  f.change(s => s.history._faq_items_v.push({ ...s.history._faq_items_v[0], id: 11 }))
  assert.equal((await planRefresh(snapshot(), f.runtime)).manifest.records.length, 0)
})

test('manifest rejects unsafe fields, duplicate cells, wrong tenant and value tampering', async () => {
  const f = fixture(), { manifest } = await planRefresh(snapshot(), f.runtime)
  for (const mutate of [
    (m: any) => { m.tenantSlug = 'other' },
    (m: any) => { m.records[0].cells[0].field = 'sourceId' },
    (m: any) => { m.records[0].cells[0].locale = 'all' },
    (m: any) => { m.records[0].cells.push(m.records[0].cells[0]) },
    (m: any) => { m.records[0].cells[0].valueHash = '0'.repeat(64) },
    (m: any) => { m.force = true },
  ]) { const m = structuredClone(manifest); mutate(m); assert.throws(() => validateManifest(m, snapshot(), f.runtime)) }
})

test('apply checks current hash after lock before native read and does not write stale state', async () => {
  const f = fixture(), { manifest } = await planRefresh(snapshot(), f.runtime)
  f.events.length = 0
  f.change(s => { s.parent.faq_items[0].order = 8 })
  const before = hashJSON(f.get())
  const r = await applyRefresh(snapshot(), manifest, f.runtime)
  assert.equal(r.records[0].code, 'stale_state')
  assert.deepEqual(f.events, ['begin', 'lock', 'read', 'rollback'])
  assert.equal(hashJSON(f.get()), before)
})

test('apply appends native locale versions, preserves old content, and publishes both locales', async () => {
  const f = fixture(), { manifest } = await planRefresh(snapshot(), f.runtime)
  f.events.length = 0
  const r = await applyRefresh(snapshot(), manifest, f.runtime)
  assert.equal(r.records[0].code, 'published')
  assert.equal(r.appliedCells, 3)
  assert.equal(f.get().parent.faq_items_locales.find(r => r._locale === 'kh')?.question, 'Khmer question')
  assert.equal(f.get().parent.faq_items_locales.find(r => r._locale === 'cn')?.answer, 'Chinese answer')
  assert.equal(f.get().history._faq_items_v[0].latest, false)
  assert.equal(f.get().history._faq_items_v_locales[0].version_question, 'English')
  assert.ok(f.events.indexOf('lock') < f.events.indexOf('read'))
  assert.ok(f.events.indexOf('read') < f.events.indexOf('native-read-write'))
})

test('parent locale permutation and regenerated surrogate IDs preserve logical identity, never values', async () => {
  for (const corrupt of [false, true]) {
    const f = fixture(), { manifest } = await planRefresh(snapshot(), f.runtime)
    const finalize = f.runtime.finalizePublish
    f.runtime.finalizePublish = async (...args) => {
      await finalize(...args)
      const rows = (args[0] as RecordState).parent.faq_items_locales
      rows.reverse()
      for (const [i, row] of rows.entries()) row.id = 9000 + i
      if (corrupt) rows.find(r => r._locale === 'en')!.answer = 'Collateral change'
    }
    const before = hashJSON(f.get()), report = await applyRefresh(snapshot(), manifest, f.runtime)
    assert.equal(report.records[0].code, corrupt ? 'preservation_failed' : 'published')
    if (corrupt) assert.equal(hashJSON(f.get()), before)
    else assert.equal(f.get().parent.faq_items_locales.find(r => r._locale === 'en')!.answer, 'Existing')
  }
})

test('collateral mutation or history pruning rolls back rather than committing a partial record', async () => {
  for (const corrupt of [(s: RecordState) => { s.parent.faq_items[0].order = 999 },
    (s: RecordState) => { s.history._faq_items_v_locales[0].version_question = 'Overwritten' },
    (s: RecordState) => { s.history._faq_items_v.shift() }]) {
    const f = fixture(), { manifest } = await planRefresh(snapshot(), f.runtime)
    const native = f.runtime.update
    f.runtime.update = async (...args) => { await native(...args); corrupt(args[0] as RecordState) }
    const before = hashJSON(f.get())
    const report = await applyRefresh(snapshot(), manifest, f.runtime)
    assert.equal(report.records[0].code, 'preservation_failed')
    assert.equal(hashJSON(f.get()), before)
  }
})

test('new direct or nested history children may not be attached to an old version', async () => {
  for (const nested of [false, true]) {
    const f = fixture()
    f.change(s => {
      s.history._faq_items_v.unshift({ ...s.history._faq_items_v[0], id: 9, latest: false })
      if (nested) {
        s.links = [{ table: '_faq_items_v_rows', parent: '_faq_items_v' }, { table: '_faq_items_v_rows_locales', parent: '_faq_items_v_rows' }]
        s.history._faq_items_v_rows = [{ id: 'old-row', _parent_id: 9, _order: 1 }]
        s.history._faq_items_v_rows_locales = []
      }
    })
    const p = await planRefresh(snapshot(), f.runtime), native = f.runtime.update
    f.runtime.update = async (...args) => {
      await native(...args)
      const s = args[0] as RecordState
      if (nested) s.history._faq_items_v_rows_locales.push({ id: 9000, _parent_id: 'old-row', _locale: 'cn', value: 'New historical content' })
      else s.history._faq_items_v_locales.push({ id: 9000, _parent_id: 9, _locale: 'cn', version_answer: 'New historical content' })
    }
    const before = hashJSON(f.get())
    assert.equal((await applyRefresh(snapshot(), p.manifest, f.runtime)).records[0].code, 'preservation_failed')
    assert.equal(hashJSON(f.get()), before)
  }
})

test('publication finalization appends a published latest version and retains importer snapshots unchanged', async () => {
  const f = fixture(), native = f.runtime.update, finalize = f.runtime.finalizePublish
  f.runtime.update = async (...args) => {
    await native(...args)
    const root = (args[0] as RecordState).history._faq_items_v.find(r => r.latest)!
    root.version__status = 'draft'
    root.snapshot = true
  }
  let finalized = 0
  f.runtime.finalizePublish = async (tx, record, expectedHash) => {
    finalized++
    await finalize(tx, record, expectedHash)
  }
  const { manifest } = await planRefresh(snapshot(), f.runtime)
  assert.equal((await applyRefresh(snapshot(), manifest, f.runtime)).records[0].code, 'published')
  assert.equal(finalized, 1)
  assert.equal(f.get().history._faq_items_v.find(r => r.latest)!.version__status, 'published')
  assert.equal(f.get().history._faq_items_v.filter(r => r.snapshot).length, 2)
  assert.ok(f.get().history._faq_items_v.filter(r => r.snapshot).every(r => r.version__status === 'draft' && !r.latest))
  assert.equal(f.get().parent.faq_items_locales.find(r => r._locale === 'en')!.question, 'English')
  assert.equal(f.get().parent.faq_items[0].order, 7)
})

test('a protected pre-existing draft or draft-only import is never finalized', async () => {
  for (const preexistingDraft of [true, false]) {
    const f = fixture()
    let finalized = 0
    f.runtime.finalizePublish = async () => { finalized++ }
    const { manifest } = await planRefresh(snapshot(), f.runtime, preexistingDraft ? 'publish' : 'draft')
    if (preexistingDraft) {
      f.change(s => { s.history._faq_items_v[0].version__status = 'draft' })
      manifest.records[0].expectedHash = hashJSON(f.get())
    }
    const report = await applyRefresh(snapshot(), manifest, f.runtime)
    assert.equal(report.records[0].code, preexistingDraft ? 'pending_draft' : 'staged_not_visible')
    assert.equal(finalized, 0)
  }
})

test('publish version headroom includes the final status-only version', async () => {
  const f = fixture()
  f.change(s => { s.maxVersions = 5 })
  assert.equal((await planRefresh(snapshot(), f.runtime)).manifest.records.length, 0)
})

test('retention limits prevent native history deletion and snapshot/destination mismatch aborts before transactions', async () => {
  const f = fixture()
  f.change(s => { s.maxVersions = 4 })
  assert.equal((await planRefresh(snapshot(), f.runtime)).manifest.records.length, 0)
  f.change(s => { s.maxVersions = 100 })
  const { manifest } = await planRefresh(snapshot(), f.runtime)
  f.events.length = 0
  await assert.rejects(applyRefresh(Buffer.from('{}'), manifest, f.runtime))
  f.runtime.destination.host = 'other-host'
  await assert.rejects(applyRefresh(snapshot(), manifest, f.runtime))
  assert.equal(f.events.length, 0)
})

test('CLI requires explicit source/destination guards and apply manifest SHA before loading configuration', () => {
  const base = ['--config', '/tmp/config.ts', '--snapshot', '/tmp/source.json', '--tenant-slug', 'roomchang',
    '--source-sha256', 'a'.repeat(64), '--expected-db-host', '127.0.0.1', '--expected-db-port', '55439', '--expected-db-name', 'cms_refresh_fixture']
  assert.equal(parseRefreshArgs(base).apply, false)
  assert.throws(() => parseRefreshArgs([...base, '--apply']), /manifest/)
  assert.equal(parseRefreshArgs([...base, '--apply', '--manifest', '/tmp/manifest.json', '--manifest-sha256', 'b'.repeat(64)]).apply, true)
  for (const argv of [[], [...base, '--force'], [...base, '--tenant-slug', 'other']]) assert.throws(() => parseRefreshArgs(argv))
})

test('SQL state identity does not acquire manifest-only fields on apply', async () => {
  const f = fixture(), s = f.get()
  const query: SQLRead = async text => {
    if (text.includes('information_schema')) return []
    if (text.includes('pg_constraint')) return []
    const root = text.includes('"_faq_items_v"') ? s.history._faq_items_v : s.parent.faq_items
    return root.map(record => ({ record }))
  }
  const options = { localizedFields: [], maxVersions: 100, canPublish: true }
  const planned = await readSQLState(query, s.identity, 'public', options)
  const applied = await readSQLState(query, { ...s.identity, expectedHash: 'a'.repeat(64), mode: 'publish', cells: [] } as any, 'public', options)
  assert.equal(hashJSON(applied), hashJSON(planned))
})

test('native parent locale surrogate IDs may change, but locale content and array IDs may not', async () => {
  const f = fixture(), { manifest } = await planRefresh(snapshot(), f.runtime)
  const update = f.runtime.update
  f.runtime.update = async (...args) => {
    await update(...args)
    for (const row of (args[0] as RecordState).parent.faq_items_locales) row.id += 1000
  }
  assert.equal((await applyRefresh(snapshot(), manifest, f.runtime)).records[0].code, 'published')
  for (const corrupt of [(s: RecordState) => { s.parent.faq_items_locales.find(r => r._locale === 'en')!.answer = 'Changed' },
    (s: RecordState) => { s.parent.faq_items_rows[0].id = 'replacement' }]) {
    const x = fixture()
    x.change(s => { s.parent.faq_items_rows = [{ id: 'stable-array-id', _parent_id: 1, _order: 1, value: 'Retain' }] })
    const p = await planRefresh(snapshot(), x.runtime), native = x.runtime.update
    x.runtime.update = async (...args) => { await native(...args); corrupt(args[0] as RecordState) }
    const before = hashJSON(x.get())
    assert.equal((await applyRefresh(snapshot(), p.manifest, x.runtime)).records[0].code, 'preservation_failed')
    assert.equal(hashJSON(x.get()), before)
  }
})

test('a discarded commit or unreadable durable state never claims applied cells and is never retried', async () => {
  for (const unreadable of [false, true]) {
    const f = fixture(), { manifest } = await planRefresh(snapshot(), f.runtime)
    const native = f.runtime.transaction
    let writes = 0
    f.runtime.transaction = async (readonly, run) => {
      if (readonly) { if (unreadable) throw new Error('Cannot verify commit'); return native(true, run) }
      writes++
      return run(structuredClone(f.get()))
    }
    const before = hashJSON(f.get())
    const result = await applyRefresh(snapshot(), manifest, f.runtime)
    assert.equal(result.appliedCells, 0)
    assert.equal(result.records[0].code, 'indeterminate_commit')
    assert.equal(hashJSON(f.get()), before)
    assert.equal(writes, 1)
  }
})

test('database-drop environment switches are rejected without configuration or database initialization', () => {
  for (const value of ['true', '1', 'yes']) assert.throws(() => assertRefreshEnvironment(value), /drop_database/)
  assert.doesNotThrow(() => assertRefreshEnvironment(undefined))
})

test('native import options enforce explicit status, locale-only publishing, permissions and editor leases', async () => {
  const { createRefreshRuntime } = await import('../scripts/refresh-live-translations')
  const { editorialRevision } = await import('../src/lib/with-editorial-concurrency')
  const calls: any[] = []
  const starting = fixture().get()
  const identity = starting.identity, key = `${identity.collection}|${identity.id}`
  const updatedAt = '2030-01-01T00:00:00.000Z'
  const collection = { slug: identity.collection, fields: [] }
  starting.history._faq_items_v[0].version_updated_at = updatedAt
  const runtime = await createRefreshRuntime({ pool: {} as any, tenantId: '1', tenantSlug: 'roomchang',
    destination: fixture().runtime.destination, policies: {} as any, actor: { id: 1 } as any,
    payload: { db: { name: 'postgres' }, collections: { [identity.collection]: { config: collection } }, update: async (args: any) => {
      calls.push(args)
      return { id: identity.id, updatedAt: new Date(Date.parse(updatedAt) + calls.length).toISOString() }
    } } as any })
  const transaction = { req: { context: {}, transactionID: 'tx' }, locked: new Set([key]),
    initial: new Map([[key, starting]]), revisions: new Map([[key, updatedAt]]), published: new Set<string>() }
  for (const mode of ['publish', 'draft'] as const) await runtime.update(transaction, identity,
    'kh', { question: 'Approved' }, mode)
  assert.equal(calls[0].data._status, 'published')
  assert.equal(calls[1].data._status, 'draft')
  assert.equal(calls[0].publishAllLocales, false)
  assert.equal(calls[0].publishSpecificLocale, 'kh')
  assert.equal(calls[0].data._editorialRevision, editorialRevision(collection, { id: identity.id, updatedAt }, 'kh'))
  assert.notEqual(calls[0].data._editorialRevision, calls[1].data._editorialRevision)
  for (const call of calls) { assert.equal(call.overrideAccess, false); assert.equal(call.overrideLock, false); assert.equal(call.autosave, false) }
  await assert.rejects(runtime.finalizePublish({ req: { context: {}, transactionID: 'tx' } }, fixture().get().identity, '0'.repeat(64)), /finalize_not_authorized/)
  assert.equal(calls.length, 2, 'Status-only finalization requires a captured, locked, draft-free starting state')
})
