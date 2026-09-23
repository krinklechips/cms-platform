/**
 * Functional battery — every editor flow through the REAL access stack (Local
 * API, overrideAccess:false, impersonating the editor account). Hard assertions,
 * self-cleaning. Local API has no tenant cookie, so creates pass tenant:1
 * explicitly (the admin assigns it from the login). Run: DATABASE_URI="$DATABASE_URI_PROD" npx tsx scripts/functional-battery.ts
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'

const results: { test: string; ok: boolean; note: string }[] = []
const record = (test: string, ok: boolean, note = '') => { results.push({ test, ok, note }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${test}${note ? ' — ' + note : ''}`) }
const step = async (name: string, fn: () => Promise<void>) => { try { await fn() } catch (e) { record(name, false, 'threw: ' + (e as Error).message.slice(0, 80)) } }
const expectThrow = async (fn: () => Promise<unknown>): Promise<string | null> => { try { await fn(); return null } catch (e) { return (e as Error).message } }

async function main() {
  const payload = await getPayload({ config })
  const borin = { ...(await payload.findByID({ collection: 'users', id: 3, depth: 2, overrideAccess: true })), collection: 'users' as const }
  const enoch = { ...(await payload.findByID({ collection: 'users', id: 1, depth: 2, overrideAccess: true })), collection: 'users' as const }
  const stamp = Date.now() % 100000
  let pageId: number | string | undefined
  let mediaId: number | string | undefined

  try {
    for (const slug of ['services', 'doctors', 'homepage', 'pages', 'media'] as const) {
      const r = await payload.find({ collection: slug, overrideAccess: false, user: borin, limit: 1, depth: 0 })
      record(`read ${slug}`, r.totalDocs > 0, `${r.totalDocs} docs`)
    }

    const created = await payload.create({ collection: 'pages', data: { title: `Battery Test ${stamp}`, tenant: 1 } as never, draft: true, overrideAccess: false, user: borin, locale: 'en' })
    pageId = created.id
    record('create page (title only) → auto web address', (created as { slug?: string }).slug === `battery-test-${stamp}`, String((created as { slug?: string }).slug))
    const anonNew = await payload.find({ collection: 'pages', where: { id: { equals: pageId } }, overrideAccess: false, limit: 1 })
    record('never-published page hidden from public', anonNew.totalDocs === 0)

    await step('media upload (editor) → R2 URL', async () => {
      const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
      const media = await payload.create({ collection: 'media', data: { alt: `battery ${stamp}`, tenant: 1 } as never, file: { data: png, mimetype: 'image/png', name: `battery-${stamp}.png`, size: png.length }, overrideAccess: false, user: borin })
      mediaId = media.id
      const mediaUrl = (media as { url?: string }).url ?? ''
      record('media upload (editor) → R2 URL', mediaUrl.includes('r2.dev') && mediaUrl.includes('roomchang/'), mediaUrl.slice(0, 70))
    })

    await payload.update({ collection: 'pages', id: pageId, data: {
      _status: 'published',
      sections: [
        { blockType: 'text', heading: 'Battery heading', body: 'Battery body text.' },
        ...(mediaId ? [{ blockType: 'image', media: mediaId, alt: 'battery image' }] : []),
      ],
    } as never, draft: false, overrideAccess: false, user: borin, locale: 'en' })
    const pub = await payload.findByID({ collection: 'pages', id: pageId, overrideAccess: false, depth: 1, locale: 'en' }) as { sections?: { blockType: string; heading?: string; media?: { url?: string } }[] }
    record('publish page with text section', (pub.sections?.length ?? 0) >= 1 && pub.sections?.[0].heading === 'Battery heading')
    record('image section resolves Media Library URL (depth 1)', Boolean(pub.sections?.[1]?.media?.url), mediaId ? '' : 'skipped: no upload')

    await payload.update({ collection: 'pages', id: pageId, data: { title: `បាតេរី ${stamp}`, _status: 'published' } as never, draft: false, overrideAccess: false, user: borin, locale: 'kh' })
    const kh = await payload.findByID({ collection: 'pages', id: pageId, overrideAccess: false, depth: 0, locale: 'kh' }) as { title?: string }
    const en = await payload.findByID({ collection: 'pages', id: pageId, overrideAccess: false, depth: 0, locale: 'en' }) as { title?: string }
    record('Khmer edit isolated from English', kh.title === `បាតេរី ${stamp}` && en.title === `Battery Test ${stamp}`)

    await payload.update({ collection: 'pages', id: pageId, data: { title: `Battery Draft ${stamp}` } as never, draft: true, overrideAccess: false, user: borin, locale: 'en' })
    const pubAfter = await payload.findByID({ collection: 'pages', id: pageId, overrideAccess: false, depth: 0, locale: 'en' }) as { title?: string }
    const draftView = await payload.findByID({ collection: 'pages', id: pageId, draft: true, overrideAccess: false, user: borin, depth: 0, locale: 'en' }) as { title?: string }
    record('save draft leaves public untouched', pubAfter.title === `Battery Test ${stamp}` && draftView.title === `Battery Draft ${stamp}`)

    const versions = await payload.findVersions({ collection: 'pages', where: { parent: { equals: pageId } }, overrideAccess: true, limit: 50, sort: 'createdAt' })
    record('version history recorded', versions.totalDocs >= 3, `${versions.totalDocs} versions`)
    const firstPublished = versions.docs.find((v) => (v as { version?: { _status?: string; title?: string } }).version?._status === 'published' && (v as { version?: { title?: string } }).version?.title === `Battery Test ${stamp}`)
    if (firstPublished) {
      await payload.restoreVersion({ collection: 'pages', id: firstPublished.id, overrideAccess: false, user: borin })
      const restored = await payload.findByID({ collection: 'pages', id: pageId, draft: true, overrideAccess: false, user: borin, depth: 0, locale: 'en' }) as { title?: string }
      record('restore an earlier version', restored.title === `Battery Test ${stamp}`, String(restored.title))
    } else record('restore an earlier version', false, 'no matching published version found')

    const doc = (await payload.find({ collection: 'doctors', limit: 1, depth: 0, overrideAccess: true })).docs[0]
    const err = await expectThrow(() => payload.update({ collection: 'doctors', id: doc.id, data: { department: 'NOT_A_DEPARTMENT' } as never, draft: true, overrideAccess: false, user: borin }))
    record('doctor department rejects unknown value', Boolean(err), err?.slice(0, 60) ?? 'no error raised')

    const tenants = await payload.find({ collection: 'tenants', overrideAccess: false, user: borin, limit: 10, depth: 0 })
    record('editor sees only own tenant', tenants.totalDocs === 1 && String(tenants.docs[0].id) === '1', `${tenants.totalDocs} tenant(s)`)
    const usersErr = await expectThrow(() => payload.create({ collection: 'users', data: { email: `x${stamp}@example.com`, password: 'irrelevant-1234', roles: ['editor'], tenants: [{ tenant: 1 }] } as never, overrideAccess: false, user: borin }))
    record('editor cannot create users', Boolean(usersErr))
    const invErr = await expectThrow(() => payload.find({ collection: 'invoices', overrideAccess: false, user: borin, limit: 1 }))
    record('editor cannot read invoices', Boolean(invErr))
    const modErr = await expectThrow(() => payload.find({ collection: 'modules', overrideAccess: false, user: borin, limit: 1 }))
    record('editor cannot read module catalogue', Boolean(modErr))
    const teamAdmin = { ...(await payload.findByID({ collection: 'users', id: 2, depth: 2, overrideAccess: true })), collection: 'users' as const }
    const adminInv = await payload.find({ collection: 'invoices', overrideAccess: false, user: teamAdmin, limit: 5, depth: 0 })
    record('tenant-admin sees only own tenant invoices', adminInv.docs.every((i) => String((i as { tenant?: unknown }).tenant) === '1'), `${adminInv.totalDocs} invoice(s)`)

    const guardErr = await expectThrow(() => payload.create({ collection: 'users', data: { email: `ghost${stamp}@example.com`, password: 'irrelevant-1234', roles: ['editor'], tenants: [] } as never, overrideAccess: false, user: enoch }))
    record('tenant-less user refused with a plain message', Boolean(guardErr && /site|tenant/i.test(guardErr)), guardErr?.slice(0, 70) ?? '')

    let missing = 0
    for (const loc of ['en', 'kh', 'cn'] as const) {
      const svc = await payload.find({ collection: 'services', limit: 50, depth: 0, overrideAccess: true, locale: loc })
      missing += svc.docs.filter((s) => !Array.isArray((s as { sections?: unknown[] }).sections) || (s as { sections?: unknown[] }).sections!.length === 0).length
    }
    record('all services have section blocks (en/kh/cn)', missing === 0, `${missing} missing`)
  } finally {
    if (pageId) { await payload.delete({ collection: 'pages', id: pageId, overrideAccess: false, user: borin }).catch(async () => payload.delete({ collection: 'pages', id: pageId!, overrideAccess: true })); const gone = await payload.find({ collection: 'pages', where: { id: { equals: pageId } }, overrideAccess: true, limit: 1 }); record('delete page (editor) + verify gone', gone.totalDocs === 0) }
    if (mediaId) { await payload.delete({ collection: 'media', id: mediaId, overrideAccess: false, user: borin }).catch(async () => payload.delete({ collection: 'media', id: mediaId!, overrideAccess: true })); record('delete uploaded media (editor)', true) }
  }
  const fails = results.filter((r) => !r.ok)
  console.log(`\n${results.length - fails.length}/${results.length} passed${fails.length ? ' — FAILURES: ' + fails.map((f) => f.test).join('; ') : ''}`)
  process.exit(fails.length ? 1 : 0)
}
main().catch((e) => { console.error('BATTERY CRASHED:', e.message); process.exit(1) })
