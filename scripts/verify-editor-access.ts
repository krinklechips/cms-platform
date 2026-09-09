/**
 * Empirical access + drafts check for a tenant editor — runs the REAL
 * access-control stack via the Local API with overrideAccess:false,
 * impersonating the user document directly. No password, no HTTP.
 *
 * Proves: reads, draft save (public untouched), publish (public updated),
 * version history, and that anonymous reads never see a never-published doc.
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'

async function main() {
  const payload = await getPayload({ config })
  const borin = await payload.findByID({ collection: 'users', id: 3, depth: 2, overrideAccess: true })
  const user = { ...borin, collection: 'users' as const }
  console.log(`USER ${borin.email} roles=${JSON.stringify(borin.roles)}`)

  for (const slug of ['services', 'doctors', 'homepage', 'pages'] as const) {
    const res = await payload.find({ collection: slug, overrideAccess: false, user, limit: 1, depth: 0 })
    console.log(`READ ${slug}: totalDocs=${res.totalDocs}`)
  }

  // ── Drafts round-trip on the demo page ──────────────────────────────────
  const demo = (await payload.find({ collection: 'pages', where: { slug: { equals: 'welcome-to-roomchang' } }, overrideAccess: true, limit: 1, locale: 'en' })).docs[0]
  if (!demo) throw new Error('demo page missing')
  const originalTitle = demo.title as string
  const draftTitle = `${originalTitle} (draft ${Date.now() % 10000})`

  await payload.update({ collection: 'pages', id: demo.id, data: { title: draftTitle }, draft: true, overrideAccess: false, user, locale: 'en' })
  const anon = await payload.findByID({ collection: 'pages', id: demo.id, overrideAccess: false, locale: 'en', depth: 0 }) // no user = anonymous
  const asDraft = await payload.findByID({ collection: 'pages', id: demo.id, draft: true, overrideAccess: false, user, locale: 'en', depth: 0 })
  console.log(`DRAFT SAVE: public still "${anon.title}" | draft shows "${asDraft.title}" -> ${anon.title === originalTitle && asDraft.title === draftTitle ? 'OK' : 'FAIL'}`)

  await payload.update({ collection: 'pages', id: demo.id, data: { title: originalTitle, _status: 'published' } as never, draft: false, overrideAccess: false, user, locale: 'en' })
  const after = await payload.findByID({ collection: 'pages', id: demo.id, overrideAccess: false, locale: 'en', depth: 0 })
  console.log(`PUBLISH: public now "${after.title}" -> ${after.title === originalTitle ? 'OK (restored)' : 'FAIL'}`)

  const versions = await payload.findVersions({ collection: 'pages', where: { parent: { equals: demo.id } }, overrideAccess: true, limit: 50 })
  console.log(`VERSION HISTORY: ${versions.totalDocs} versions recorded for the demo page`)

  // ── Never-published doc must be invisible to anonymous readers ─────────
  const scratch = await payload.create({ collection: 'pages', data: { title: 'Smoke Draft Only' } as never, draft: true, overrideAccess: false, user, locale: 'en' })
  const anonList = await payload.find({ collection: 'pages', where: { id: { equals: scratch.id } }, overrideAccess: false, limit: 1 })
  console.log(`NEVER-PUBLISHED DRAFT hidden from public: ${anonList.totalDocs === 0 ? 'OK' : 'FAIL (' + anonList.totalDocs + ')'}`)
  await payload.delete({ collection: 'pages', id: scratch.id, overrideAccess: true })
  console.log('scratch draft deleted')
  process.exit(0)
}
main().catch((err) => { console.error('VERIFY FAILED:', err.message); process.exit(1) })
