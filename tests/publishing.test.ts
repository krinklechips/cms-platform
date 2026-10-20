import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { Payload, TypedUser } from 'payload'
import { gatherActivity } from '../src/lib/site-activity'
import { publishingState } from '../src/lib/publishing-state'
import { withDrafts } from '../src/lib/with-drafts'
import { isNavigationItemActive } from '../src/lib/navigation-state'

const editor = { id: 7, collection: 'users', roles: ['editor'], tenants: [{ tenant: 42 }] } as TypedUser

test('navigation opens the current collection without matching a similarly named collection', () => {
  assert.equal(isNavigationItemActive('/admin/collections/pages', '/admin/collections/pages'), true)
  assert.equal(isNavigationItemActive('/admin/collections/pages/1', '/admin/collections/pages'), true)
  assert.equal(isNavigationItemActive('/admin/collections/pages-extra', '/admin/collections/pages'), false)
  assert.equal(isNavigationItemActive('/admin/collections/doctors/1', '/admin/collections/pages'), false)
})

test('distinguishes unsaved edits, saved drafts and published CMS content', () => {
  assert.equal(publishingState({ modified: true, processing: false, hasPublishedDoc: true, unpublishedVersionCount: 0 }), 'Unsaved changes')
  assert.equal(publishingState({ modified: false, processing: true, hasPublishedDoc: true, unpublishedVersionCount: 0 }), 'Saving changes')
  assert.equal(publishingState({ modified: false, processing: false, hasPublishedDoc: true, unpublishedVersionCount: 1 }), 'Draft saved')
  assert.equal(publishingState({ modified: false, processing: false, hasPublishedDoc: true, unpublishedVersionCount: 0 }), 'Published in CMS')
  assert.equal(publishingState({ modified: false, processing: false, hasPublishedDoc: false, unpublishedVersionCount: 0 }), 'Not published')
})

test('drafts wrapper keeps preview in the action bar, not an extra form panel', () => {
  const result = withDrafts({
    slug: 'pages',
    admin: { components: { edit: { editMenuItems: ['/ExistingMenu'], beforeDocumentControls: ['/ExistingControl'] } } },
    fields: [{ name: 'title', type: 'text' }],
  })
  assert.deepEqual(result.admin?.components?.edit?.editMenuItems, ['/ExistingMenu'])
  assert.equal(result.admin?.components?.edit?.PublishButton, '/components/PreviewPublishButton#PreviewPublishButton')
  assert.deepEqual(result.admin?.components?.edit?.beforeDocumentControls, [
    '/ExistingControl', '/components/PublishingStatus#PublishingStatus',
  ])
  assert.equal(result.fields.length, 1)
  assert.equal(result.fields[0].type, 'text')
  assert.equal(result.admin?.hideAPIURL, true)
})

test('activity reads latest drafts, counts all drafts, and sorts across collections', async () => {
  const calls: Record<string, unknown>[] = []
  const payload = {
    collections: Object.fromEntries(['pages', 'videos'].map((slug) => [slug, {
      config: { versions: { drafts: true }, admin: { useAsTitle: 'title' } },
    }])),
    find: async (args: Record<string, unknown>) => {
      calls.push(args)
      const slug = args.collection as string
      return {
        docs: [{ id: slug === 'pages' ? 1 : 2, title: slug, updatedAt: slug === 'pages' ? '2026-10-19T00:00:00Z' : '2026-10-20T00:00:00Z' }],
        totalDocs: 10,
      }
    },
  } as unknown as Payload
  const activity = await gatherActivity(payload, 42, editor)
  assert.ok(calls.every((call) => call.draft === true))
  assert.ok(calls.every((call) => call.overrideAccess === false && call.user === editor))
  assert.ok(calls.every((call) => JSON.stringify(call.where).includes('42')))
  assert.equal(activity.unpublished[0].collection, 'videos')
  assert.equal(activity.unpublishedTotal, 20)
  assert.equal(activity.incomplete, false)
})

test('query failures cannot become an all-published success state', async () => {
  const payload = {
    collections: { pages: { config: { versions: { drafts: true } } } },
    find: async () => { throw new Error('Database unavailable') },
  } as unknown as Payload
  const activity = await gatherActivity(payload, 42, editor)
  assert.equal(activity.incomplete, true)
  assert.equal(activity.unpublishedTotal, 0)
})

test('activity never queries private drafts without a signed-in user', async () => {
  const payload = { collections: {}, find: async () => { assert.fail('Anonymous activity must not query content') } } as unknown as Payload
  const activity = await gatherActivity(payload, 42, null)
  assert.equal(activity.incomplete, true)
  assert.deepEqual(activity.unpublished, [])
})
