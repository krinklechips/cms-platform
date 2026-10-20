import assert from 'node:assert/strict'
import { createLocalReq, getPayload } from 'payload'
import { handleStaleDataCheck } from '../node_modules/@payloadcms/ui/dist/utilities/handleStaleDataCheck.js'
import config from '../src/payload.config'
import { CONTENT_COLLECTION_SLUGS } from '../src/lib/content-collections'
import { gatherActivity } from '../src/lib/site-activity'

// This fixture must never run against a real CMS database.
if (process.env.DATABASE_URI !== 'file:./publishing-ux-demo.db') {
  throw new Error('Requires the isolated file:./publishing-ux-demo.db database')
}

const payload = await getPayload({ config })
try {
  let tenant = (await payload.find({ collection: 'tenants', where: { slug: { equals: 'roomchang' } }, limit: 1 })).docs[0]
  if (!tenant) {
    const module = await payload.create({ collection: 'modules', data: {
      name: 'Local preview', key: 'local-preview', defaultMonthlyPrice: 0,
      contentCollections: [...CONTENT_COLLECTION_SLUGS],
    } })
    tenant = await payload.create({ collection: 'tenants', data: {
      name: 'Roomchang - local preview', slug: 'roomchang',
      domains: [{ domain: 'roomchang.localhost' }], subscriptions: [{ module: module.id, active: true }],
    } })
    await payload.create({ collection: 'users', data: {
      email: 'editor@roomchang.test', password: 'Local-preview-only-2026!', name: 'Preview Editor',
      roles: ['editor'], tenants: [{ tenant: tenant.id }],
    } })
  }
  const editor = (await payload.find({ collection: 'users', where: { email: { equals: 'editor@roomchang.test' } }, depth: 2, limit: 1 })).docs[0]
  await payload.update({ collection: 'tenants', id: tenant.id, data: {
    domains: [{ domain: 'roomchang.localhost' }, { domain: 'localhost' }],
  } })
  await payload.update({ collection: 'users', id: editor.id, data: {
    enableAPIKey: true, apiKey: 'local-preview-api-key-not-for-production',
  } })
  const user = { ...editor, collection: 'users' as const }
  const otherTenant = await payload.create({ collection: 'tenants', data: {
    name: 'Local isolation check', slug: `local-isolation-${Date.now()}`,
  } })
  let otherPageId: number | undefined
  try {
    const otherPage = await payload.create({ collection: 'pages', draft: true, data: {
      tenant: otherTenant.id, title: 'Private draft belonging to another clinic',
    } })
    otherPageId = otherPage.id
    const isolated = await gatherActivity(payload, otherTenant.id, user)
    assert.equal(isolated.recent.length, 0, 'Activity must respect the editor tenant boundary')
    assert.equal(isolated.unpublishedTotal, 0, 'Another clinic draft must never enter the queue')
  } finally {
    if (otherPageId !== undefined) await payload.delete({ collection: 'pages', id: otherPageId })
    await payload.delete({ collection: 'tenants', id: otherTenant.id })
  }
  let page = (await payload.find({ collection: 'pages', where: { tenant: { equals: tenant.id } }, limit: 1 })).docs[0]
  if (!page) page = await payload.create({ collection: 'pages', data: {
    tenant: tenant.id, title: 'Patient information', _status: 'published',
  }, overrideAccess: false, user })

  await payload.update({ collection: 'pages', id: page.id, draft: true, data: { title: 'Patient information - updated' }, overrideAccess: false, user })
  const publicDoc = await payload.findByID({ collection: 'pages', id: page.id, overrideAccess: false })
  assert.equal(publicDoc.title, page.title, 'Saving a draft must not change published content')
  const pending = await gatherActivity(payload, tenant.id, user)
  assert.equal(pending.incomplete, false)
  assert.ok(pending.unpublished.some((doc) => doc.collection === 'pages' && doc.id === page.id), 'Previously published page with a saved draft must appear in queue')
  assert.equal(pending.unpublishedTotal, 1)

  // Characterize the native guard: our current draft is fresh, an older tab is not.
  const latestDraft = await payload.findByID({ collection: 'pages', id: page.id, draft: true, overrideAccess: false, user })
  const req = await createLocalReq({ user }, payload)
  const fresh = await handleStaleDataCheck({ id: page.id, collectionSlug: 'pages', originalUpdatedAt: latestDraft.updatedAt, req })
  assert.equal(fresh.isStale, false, 'The latest saved draft must not be mistaken for another edit')
  const olderTab = await handleStaleDataCheck({ id: page.id, collectionSlug: 'pages', originalUpdatedAt: page.updatedAt, req })
  assert.equal(olderTab.isStale, true, 'An editor holding an older version must still be protected')

  await payload.update({ collection: 'pages', id: page.id, data: { title: page.title, _status: 'published' }, overrideAccess: false, user })
  const published = await gatherActivity(payload, tenant.id, user)
  assert.equal(published.unpublishedTotal, 0, 'Publishing must clear the latest draft from the queue')

  // Leave one pending change for the local browser walkthrough.
  await payload.update({ collection: 'pages', id: page.id, draft: true, data: { title: 'Patient information - updated' }, overrideAccess: false, user })
  console.log('PASS: editor draft/save/publish queue and stale-tab protection in isolated SQLite database')
  console.log(`Local editor: /admin/collections/pages/${page.id}`)
} finally {
  await payload.destroy()
}
