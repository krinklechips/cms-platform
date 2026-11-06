import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { getPayload, handleEndpoints } from 'payload'
import { loadPayloadConfig } from './helpers/load-payload-config'
import { logServiceWriteDenial } from '../src/lib/service-write-diagnostics'

test('diagnostics are bounded, exclude unrelated requests and cannot change an error response', () => {
  type Args = Parameters<typeof logServiceWriteDenial>[0]
  const entries: unknown[] = []
  const req = { method: 'PATCH', routeParams: { id: '13' }, locale: 'kh', user: { id: 3 },
    headers: new Headers({ Cookie: 'private-cookie', Authorization: 'private-token' }),
    data: { name: 'private text' }, payload: { logger: { warn: (entry: unknown) => entries.push(entry) } },
  } as unknown as Args['req']
  const args = { collection: { slug: 'services' }, error: Object.assign(new Error('private error details'), { status: 403 }),
    context: {}, req, result: { errors: [{ message: 'Original response' }] } } as unknown as Args
  const original = structuredClone(args.result)
  assert.equal(logServiceWriteDenial(args), undefined)
  assert.deepEqual(entries, [{ event: 'cms-service-write-denied', accountId: 3, pageId: '13', language: 'kh', status: 403, stage: 'authorization' }])
  for (const language of ['en', 'cn'] as const) {
    req.locale = language
    logServiceWriteDenial(args)
    assert.equal((entries.at(-1) as { language: string }).language, language)
  }
  logServiceWriteDenial({ ...args, error: Object.assign(new Error('private'), { status: 401 }),
    req: { ...req, user: null } as Args['req'] })
  assert.deepEqual(entries.at(-1), { event: 'cms-service-write-denied', accountId: null, pageId: '13', language: 'cn', status: 401, stage: 'authentication' })
  const allowed = entries.length
  for (const status of [400, 404, 409, 428, 500]) logServiceWriteDenial({ ...args, error: Object.assign(new Error('private'), { status }) })
  logServiceWriteDenial({ ...args, collection: { slug: 'pages' } as Args['collection'] })
  logServiceWriteDenial({ ...args, req: { ...req, method: 'GET' } as Args['req'] })
  logServiceWriteDenial({ ...args, req: { ...req, routeParams: { id: 'unsafe-private-path' } } as Args['req'] })
  assert.equal(entries.length, allowed)
  req.payload.logger.warn = (() => { throw new Error('logger unavailable') }) as typeof req.payload.logger.warn
  assert.doesNotThrow(() => logServiceWriteDenial(args))
  assert.deepEqual(args.result, original)
  assert.ok(!JSON.stringify(entries).includes('private'))
})

test('service denial diagnostics identify authentication without logging content or changing publication', { timeout: 120000 }, async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'cms-service-diagnostics-'))
  Object.assign(process.env, { NODE_ENV: 'test', DATABASE_URI: `file:${path.join(dir, 'fixture.db')}`,
    PAYLOAD_SECRET: randomUUID(), PAYLOAD_FORCE_DRIZZLE_PUSH: 'true' })
  const original = await loadPayloadConfig()
  const key = randomUUID()
  const cms = await getPayload({ key, config: { ...original, telemetry: false,
    db: sqliteAdapter({ client: { url: process.env.DATABASE_URI! }, transactionOptions: {} }) as typeof original.db,
    typescript: { ...original.typescript, autoGenerate: false },
    admin: { ...original.admin, importMap: { ...original.admin.importMap, autoGenerate: false } },
  } })
  const warnings: unknown[][] = []
  const warn = cms.logger.warn
  cms.logger.warn = ((...args: unknown[]) => warnings.push(args)) as typeof warn
  try {
    const tenant = await cms.db.create({ collection: 'tenants', data: { name: 'Disposable Roomchang', slug: 'roomchang', enabledCollections: ['services'] } })
    const password = randomUUID()
    const editor = { ...await cms.create({ collection: 'users', data: { email: 'card-editor@example.invalid', password,
      roles: ['editor'], tenants: [{ tenant: tenant.id }] } }), collection: 'users' as const }
    const service = await cms.create({ collection: 'services', locale: 'en', user: editor, overrideAccess: false, data: {
      name: 'EN original', tenant: tenant.id, slug: 'sleep-apnea-fixture', _status: 'published',
      sections: [{ blockType: 'cards', numbered: true, columns: 3, items: [0, 1, 2].map(i => ({ title: `EN title ${i}`, body: `EN body ${i}` })) }],
    } })
    const read = (locale: 'en' | 'kh' | 'cn', draft = true) => cms.findByID({ collection: 'services', id: service.id,
      locale, draft, fallbackLocale: false, depth: 0, user: editor, overrideAccess: false })
    const invoke = (route: string, init: RequestInit = {}) => handleEndpoints({ config: cms.config, payloadInstanceCacheKey: key,
      request: new Request(`https://roomchang.serviettelab.com/api/${route}`, init) })
    const login = await invoke('users/login', { method: 'POST', headers: { Origin: 'https://roomchang.serviettelab.com', 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: editor.email, password }) })
    assert.equal(login.status, 200)
    const { token } = await login.json()
    const headers = { Origin: 'https://roomchang.serviettelab.com', 'Content-Type': 'application/json',
      Cookie: `payload-token=${token};payload-tenant=${tenant.id}` }
    for (const locale of ['en', 'kh', 'cn'] as const) {
      const result = await invoke(`services/${service.id}?locale=${locale}&publishSpecificLocale=${locale}`, {
        method: 'PATCH', headers, body: JSON.stringify({ ...await read(locale), name: `${locale} published`, _status: 'published',
          sections: [{ blockType: 'cards', numbered: true, columns: 3,
            items: [0, 1, 2].map(i => ({ title: `${locale} title ${i}`, body: `${locale} body ${i}` })) }],
        }),
      })
      assert.equal(result.status, 200)
    }
    for (const locale of ['en', 'cn'] as const) await cms.update({ collection: 'services', id: service.id, locale,
      draft: true, user: editor, overrideAccess: false, data: { name: `${locale} private draft`, _status: 'draft',
        _editorialRevision: (await read(locale))._editorialRevision } })
    const versionRows = async () => (await cms.findVersions({ collection: 'services', locale: 'all', pagination: false,
      where: { parent: { equals: service.id } } })).docs
    const unchanged = await versionRows()
    const denied = await invoke(`services/${service.id}?locale=kh&secret=must-not-be-logged`, {
      method: 'PATCH', headers: { ...headers, Cookie: 'payload-tenant=1;another-cookie=must-not-be-logged' },
      body: JSON.stringify({ ...await read('kh'), _status: 'published', description: 'Private unsaved text must not be logged' }),
    })
    assert.equal(denied.status, 403)
    assert.deepEqual((await denied.json()).errors, [{ message: 'You are not allowed to perform this action.' }])
    assert.deepEqual(await versionRows(), unchanged)
    const events = warnings.filter(args => (args[0] as { event?: string })?.event === 'cms-service-write-denied')
    assert.equal(events.length, 1, 'A failed native Service publication must emit one metadata-only diagnostic')
    assert.deepEqual(events[0][0], { event: 'cms-service-write-denied', accountId: null, pageId: String(service.id),
      language: 'kh', status: 403, stage: 'authentication' })
    assert.ok(!JSON.stringify(events).includes('must-not-be-logged'))
    assert.ok(!JSON.stringify(events).includes('Private unsaved text'))
    assert.ok(!JSON.stringify(events).includes(password))
    assert.ok(!JSON.stringify(events).includes(token))
    const kh = await read('kh')
    const restored = await invoke(`services/${service.id}?locale=kh&publishSpecificLocale=kh`, {
      method: 'PATCH', headers, body: JSON.stringify({ ...kh, _status: 'published',
        sections: [{ ...kh.sections![0], items: [0, 1, 2].map(i => ({ title: `kh updated ${i}`, body: `kh updated body ${i}` })) }],
      }),
    })
    assert.equal(restored.status, 200)
    const cards = (await read('kh', false)).sections!.find(section => section.blockType === 'cards')
    assert.equal(cards?.items?.length, 3)
    for (const locale of ['en', 'cn'] as const) {
      assert.equal((await read(locale, false)).name, `${locale} published`)
      assert.equal((await read(locale)).name, `${locale} private draft`)
    }
    assert.equal(warnings.filter(args => (args[0] as { event?: string })?.event === 'cms-service-write-denied').length, 1)
    const otherTenant = await cms.db.create({ collection: 'tenants', data: { name: 'Other fixture', slug: 'other-fixture', enabledCollections: [] } })
    const saved = await versionRows()
    const forbidden = await invoke(`services/${service.id}?locale=kh`, { method: 'PATCH',
      headers, body: JSON.stringify({ ...await read('kh'), tenant: otherTenant.id, _status: 'published' }),
    })
    assert.equal(forbidden.status, 403)
    assert.deepEqual(await versionRows(), saved)
    assert.deepEqual(warnings.filter(args => (args[0] as { event?: string })?.event === 'cms-service-write-denied').at(-1)?.[0], {
      event: 'cms-service-write-denied', accountId: editor.id, pageId: String(service.id), language: 'kh', status: 403, stage: 'authorization',
    })
  } finally {
    cms.logger.warn = warn
    await cms.destroy()
    await rm(dir, { recursive: true, force: true })
  }
})
