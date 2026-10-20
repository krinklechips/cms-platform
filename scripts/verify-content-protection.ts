import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { getPayload } from 'payload'
import config from '../src/payload.config'

if (process.env.DATABASE_URI !== 'file:./content-protection-demo.db') {
  throw new Error('Requires the isolated file:./content-protection-demo.db database')
}

const payload = await getPayload({ config })
const stamp = Date.now()
let moduleId: number | undefined
let tenantId: number | undefined
let editorId: number | undefined
let pageId: number | undefined

try {
  const module = await payload.create({ collection: 'modules', data: {
    name: 'Isolated content protection', key: `content-protection-${stamp}`,
    defaultMonthlyPrice: 0, contentCollections: ['pages'],
  } })
  moduleId = module.id
  const tenant = await payload.create({ collection: 'tenants', data: {
    name: 'Isolated content protection', slug: `content-protection-${stamp}`,
    subscriptions: [{ module: module.id, active: true }],
  } })
  tenantId = tenant.id
  const editor = await payload.create({ collection: 'users', data: {
    email: `protection-${stamp}@roomchang.test`, password: 'Local-fixture-only-2026!',
    roles: ['editor'], tenants: [{ tenant: tenant.id }],
  } })
  editorId = editor.id
  const user = { ...editor, collection: 'users' as const }
  const page = await payload.create({ collection: 'pages', data: {
    tenant: tenant.id, title: 'Approved editorial content', _status: 'published',
  }, overrideAccess: false, user, locale: 'en' })
  pageId = page.id

  for (let revision = 1; revision <= 25; revision++) {
    await payload.update({ collection: 'pages', id: page.id, draft: true,
      data: { title: `Editor draft revision ${revision}` }, overrideAccess: false, user, locale: 'en' })
  }
  const history = await payload.findVersions({ collection: 'pages', where: { parent: { equals: page.id } }, limit: 100 })
  const original = history.docs.find((version) => version.version.title === 'Approved editorial content')
  assert.ok(original, 'The original published revision must still be recoverable after more than 20 editor saves')
  assert.equal(history.totalDocs, 26)

  const publishedBefore = await payload.findByID({ collection: 'pages', id: page.id, locale: 'all', depth: 0 })
  const draftBefore = await payload.findByID({ collection: 'pages', id: page.id, draft: true, locale: 'all', depth: 0 })
  const versionsBefore = await payload.findVersions({ collection: 'pages', where: { parent: { equals: page.id } }, limit: 100 })

  for (const tool of ['sync-roomchang.ts', 'reconcile-live.ts', 'seed-homepage.ts', 'convert-sections-to-blocks.ts', 'align-homepage-locales.ts', 'align-feature-cards-locales.ts', 'copy-doctor-names.ts', 'restore-doctor-names-en.ts', 'seed-initial-versions.ts', 'verify-editor-access.ts', 'functional-battery.ts']) {
    const result = spawnSync(process.execPath, ['--import', 'tsx', `scripts/${tool}`, '--apply', '--force'], {
      cwd: process.cwd(), encoding: 'utf8', timeout: 20_000, killSignal: 'SIGKILL',
      env: {
        PATH: process.env.PATH, NODE_ENV: 'test', NODE_OPTIONS: '--no-deprecation',
        DATABASE_URI: 'file:./content-protection-demo.db',
        PAYLOAD_SECRET: process.env.PAYLOAD_SECRET,
        NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:1',
        SUPABASE_SERVICE_ROLE_KEY: 'isolated-test-not-a-real-key',
      },
    })
    assert.equal(result.status, 1, `${tool} must refuse the write`)
    assert.match(result.stderr + result.stdout, /CMS_CONTENT_WRITE_BLOCKED/)
  }
  assert.deepEqual(await payload.findByID({ collection: 'pages', id: page.id, locale: 'all', depth: 0 }), publishedBefore, 'Blocked tools must preserve every published field and timestamp')
  assert.deepEqual(await payload.findByID({ collection: 'pages', id: page.id, draft: true, locale: 'all', depth: 0 }), draftBefore, 'Blocked tools must preserve the saved draft in every locale')
  assert.deepEqual(await payload.findVersions({ collection: 'pages', where: { parent: { equals: page.id } }, limit: 100 }), versionsBefore, 'Blocked tools must not alter or prune version history')

  await payload.restoreVersion({ collection: 'pages', id: original.id, overrideAccess: false, user, locale: 'en' })
  const restored = await payload.findByID({ collection: 'pages', id: page.id, draft: true, overrideAccess: false, user, locale: 'en' })
  assert.equal(restored.title, 'Approved editorial content', 'An editor can restore the retained older revision')

  for (let revision = 1; revision <= 101; revision++) {
    await payload.update({ collection: 'pages', id: page.id, draft: true,
      data: { title: `Retention boundary ${revision}` }, overrideAccess: false, user, locale: 'en' })
  }
  const bounded = await payload.countVersions({ collection: 'pages', where: { parent: { equals: page.id } } })
  assert.equal(bounded.totalDocs, 100, 'History must retain 100 revisions, without growing indefinitely')
  console.log('PASS: all eleven blocked legacy writers preserve published content, saved drafts and history; older revisions restore; retention is 100')
} finally {
  if (pageId !== undefined) await payload.delete({ collection: 'pages', id: pageId })
  if (editorId !== undefined) await payload.delete({ collection: 'users', id: editorId })
  if (tenantId !== undefined) await payload.delete({ collection: 'tenants', id: tenantId })
  if (moduleId !== undefined) await payload.delete({ collection: 'modules', id: moduleId })
  await payload.destroy()
}
