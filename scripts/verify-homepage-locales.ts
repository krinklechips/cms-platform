import assert from 'node:assert/strict'
import { getPayload } from 'payload'
import config from '../src/payload.config'

if (process.env.DATABASE_URI !== 'file:./homepage-locales-demo.db') throw new Error('Requires the isolated homepage-locales-demo.db fixture')
const resolved = await config
resolved.typescript.autoGenerate = false
const payload = await getPayload({ config: resolved })
const stamp = Date.now()
let moduleId: number | undefined
let tenantId: number | undefined
let userId: number | undefined
let homeId: number | undefined
try {
  const catalogModule = await payload.create({ collection: 'modules', data: { name: 'Homepage isolation fixture', key: `homepage-isolation-${stamp}`, defaultMonthlyPrice: 0, contentCollections: ['homepage'] } })
  moduleId = catalogModule.id
  const tenant = await payload.create({ collection: 'tenants', data: { name: 'Homepage isolation fixture', slug: `homepage-isolation-${stamp}`, subscriptions: [{ module: catalogModule.id, active: true }] } })
  tenantId = tenant.id
  const editor = await payload.create({ collection: 'users', data: { email: `home-isolation-${stamp}@roomchang.test`, password: 'Local-fixture-only-2026!', roles: ['editor'], tenants: [{ tenant: tenant.id }] } })
  userId = editor.id
  const user = { ...editor, collection: 'users' as const }
  const home = await payload.create({ collection: 'homepage', user, overrideAccess: false, locale: 'en', data: {
    tenant: tenant.id, heroPill: 'English pill', _status: 'published',
    heroButtons: [{ label: 'English A', url: '/a' }, { label: 'English B', url: '/b' }],
    slides: [{ title: 'English image A', imageUrl: 'https://example.com/a.jpg' }, { title: 'English image B', imageUrl: 'https://example.com/b.jpg' }],
  } })
  homeId = home.id
  const read = (locale: 'en' | 'kh' | 'cn', draft = false) => payload.findByID({ collection: 'homepage', id: home.id, locale, draft, depth: 0, fallbackLocale: false })
  for (const locale of ['kh', 'cn'] as const) {
    const doc = await read('en')
    await payload.update({ collection: 'homepage', id: home.id, user, overrideAccess: false, locale, publishSpecificLocale: locale, data: {
      heroButtons: doc.heroButtons?.map((row, index) => ({ ...row, label: `${locale} ${index ? 'B' : 'A'}` })),
      slides: doc.slides?.map((row, index) => ({ ...row, title: `${locale} image ${index ? 'B' : 'A'}` })), _status: 'published',
    } })
  }
  const english = await read('en')
  const chinese = await read('cn')
  await payload.update({ collection: 'homepage', id: home.id, locale: 'en', draft: true, user, overrideAccess: false, data: {
    heroButtons: english.heroButtons?.map((row) => ({ ...row, label: `Private ${row.label}` })),
    slides: english.slides?.map((row) => ({ ...row, title: `Private ${row.title}` })),
  } })
  await payload.update({ collection: 'homepage', id: home.id, locale: 'cn', draft: true, user, overrideAccess: false, data: {
    heroButtons: chinese.heroButtons?.map((row) => ({ ...row, label: `Private ${row.label}` })),
    slides: chinese.slides?.map((row) => ({ ...row, title: `Private ${row.title}` })),
  } })
  const labels = (doc: Awaited<ReturnType<typeof read>>) => ({
    buttons: Object.fromEntries((doc.heroButtons ?? []).map((row) => [row.url, row.label])),
    slides: Object.fromEntries((doc.slides ?? []).map((row) => [row.imageUrl, row.title])),
  })
  const englishDraft = labels(await read('en', true))
  const chineseDraft = labels(await read('cn', true))
  const khmer = await read('kh', true)
  await payload.update({ collection: 'homepage', id: home.id, locale: 'kh', publishSpecificLocale: 'kh', user, overrideAccess: false, data: {
    heroButtons: khmer.heroButtons?.slice().reverse(), slides: khmer.slides?.slice().reverse(), _status: 'published',
  } })
  assert.deepEqual(labels(await read('en')), labels(english), 'English labels must remain attached to the original destinations and images')
  assert.deepEqual(labels(await read('cn')), labels(chinese), 'Chinese labels must remain attached to the original destinations and images')
  assert.deepEqual(labels(await read('en', true)), englishDraft, 'English saved work must remain private and attached to its row')
  assert.deepEqual(labels(await read('cn', true)), chineseDraft, 'Chinese saved work must remain private and attached to its row')
  assert.deepEqual((await read('kh')).heroButtons?.map((row) => row.url), ['/b', '/a'])
  assert.deepEqual(labels(await read('kh')), { buttons: { '/b': 'kh B', '/a': 'kh A' }, slides: { 'https://example.com/b.jpg': 'kh image B', 'https://example.com/a.jpg': 'kh image A' } })
  console.log('PASS: homepage button/slide reordering preserves all published translations and other-language drafts by stable row ID')
} finally {
  if (homeId !== undefined) await payload.delete({ collection: 'homepage', id: homeId })
  if (userId !== undefined) await payload.delete({ collection: 'users', id: userId })
  if (tenantId !== undefined) await payload.delete({ collection: 'tenants', id: tenantId })
  if (moduleId !== undefined) await payload.delete({ collection: 'modules', id: moduleId })
  await payload.destroy()
}
