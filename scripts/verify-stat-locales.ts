import assert from 'node:assert/strict'
import { getPayload } from 'payload'
import config from '../src/payload.config'

if (process.env.DATABASE_URI !== 'file:./stat-locales-demo.db') {
  throw new Error('Requires the isolated file:./stat-locales-demo.db database')
}

const payload = await getPayload({ config })
const stamp = Date.now()
let moduleId: number | undefined
let tenantId: number | undefined
let editorId: number | undefined
let statId: number | undefined
try {
  const catalogModule = await payload.create({ collection: 'modules', data: { name: 'Stat fixture', key: `stat-fixture-${stamp}`, defaultMonthlyPrice: 0, contentCollections: ['site-stats'] } })
  moduleId = catalogModule.id
  const tenant = await payload.create({ collection: 'tenants', data: { name: 'Stat fixture', slug: `stat-fixture-${stamp}`, subscriptions: [{ module: catalogModule.id, active: true }] } })
  tenantId = tenant.id
  const editor = await payload.create({ collection: 'users', data: { email: `stat-${stamp}@roomchang.test`, password: 'Local-stat-only-2026!', roles: ['editor'], tenants: [{ tenant: tenant.id }] } })
  editorId = editor.id
  const user = { ...editor, collection: 'users' as const }
  const stat = await payload.create({ collection: 'site-stats', locale: 'en', user, overrideAccess: false, data: { tenant: tenant.id, key: 'clinical_experience', displayValue: '30 years', numericValue: 30, suffix: ' years', label: 'Clinical experience', _status: 'published' } })
  statId = stat.id
  await payload.update({ collection: 'site-stats', id: stat.id, locale: 'cn', user, overrideAccess: false, data: { displayValue: '30 years CN', suffix: ' years CN', label: 'Chinese clinical label', _status: 'published' } })
  const read = (locale: 'en' | 'kh' | 'cn', draft = false) => payload.findByID({ collection: 'site-stats', id: stat.id, locale, draft, depth: 0 })
  assert.equal((await read('en')).displayValue, '30 years', 'A Chinese save must not replace the English value')
  const en = await read('en')
  const cn = await read('cn')
  const content = (doc: typeof en) => ({ displayValue: doc.displayValue, suffix: doc.suffix, label: doc.label, numericValue: doc.numericValue, originalDisplayValue: doc.originalDisplayValue })
  await payload.update({ collection: 'site-stats', id: stat.id, locale: 'en', draft: true, data: { displayValue: 'Private English draft', originalDisplayValue: 'Older draft baseline' } })
  await payload.update({ collection: 'site-stats', id: stat.id, locale: 'cn', draft: true, user, overrideAccess: false, data: { displayValue: 'Private Chinese draft' } })
  const enDraft = content(await read('en', true))
  const cnDraft = content(await read('cn', true))

  await payload.update({ collection: 'site-stats', id: stat.id, locale: 'kh', draft: true, user, overrideAccess: false, data: { displayValue: '30 Khmer draft', suffix: ' Khmer draft', label: 'Khmer label' } })
  assert.equal((await read('kh', true)).displayValue, '30 Khmer draft')
  assert.notEqual((await read('kh')).displayValue, '30 Khmer draft', 'A draft must remain private')
  assert.deepEqual(content(await read('en')), content(en))
  assert.deepEqual(content(await read('cn')), content(cn))

  await payload.update({ collection: 'site-stats', id: stat.id, locale: 'kh', publishSpecificLocale: 'kh', user, overrideAccess: false, data: { displayValue: '30 Khmer published', suffix: ' Khmer published', label: 'Khmer label', _status: 'published' } })
  assert.equal((await read('kh')).displayValue, '30 Khmer published')
  assert.equal((await read('kh')).suffix, ' Khmer published')
  assert.deepEqual(content(await read('en')), content(en), 'Khmer publishing must preserve English')
  assert.deepEqual(content(await read('cn')), content(cn), 'Khmer publishing must preserve Chinese')
  assert.deepEqual(content(await read('en', true)), enDraft, 'Pending English work must remain a private saved draft')
  assert.deepEqual(content(await read('cn', true)), cnDraft, 'Pending Chinese work must remain a private saved draft')
  console.log('PASS: localized stat draft and publish preserve English and Chinese content')
} finally {
  if (statId !== undefined) await payload.delete({ collection: 'site-stats', id: statId })
  if (editorId !== undefined) await payload.delete({ collection: 'users', id: editorId })
  if (tenantId !== undefined) await payload.delete({ collection: 'tenants', id: tenantId })
  if (moduleId !== undefined) await payload.delete({ collection: 'modules', id: moduleId })
  await payload.destroy()
}
