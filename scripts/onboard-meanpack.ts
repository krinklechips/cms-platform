import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { getPayload } from 'payload'

/** First import only. Never refreshes or overwrites editorial work. Run with
 * an explicit database configuration and --website-source <Meanpack checkout>.
 * No user credentials, passwords, or API keys are created or printed. */
const arg = (key: string) => { const i = process.argv.indexOf(`--${key}`); return i < 0 ? undefined : process.argv[i + 1] }
const source = arg('website-source')
if (!source || !process.env.DATABASE_URI) throw new Error('Explicit website source and DATABASE_URI are required')

async function main() {
  const { initialWebsiteContent } = await import(pathToFileURL(path.join(source!, 'src/lib/website-content.ts')).href)
  const content = initialWebsiteContent()
  const { default: config } = await import('../src/payload.config')
  const metadataFixture = process.argv.includes('--metadata-only-fixture')
  if (metadataFixture && !['localhost', '127.0.0.1'].includes(new URL(process.env.DATABASE_URI!).hostname)) throw new Error('Metadata fixtures require a disposable loopback database')
  const cfg = await config
  if (metadataFixture) {
    const media = cfg.collections.find(c => c.slug === 'media')!
    if (typeof media.upload !== 'object') throw new Error('Media upload configuration missing')
    media.upload.filesRequiredOnCreate = false
  }
  const payload = await getPayload({ config: cfg })
  const actor = await payload.find({ collection: 'users', where: { and: [{ email: { equals: 'enoch.phan@gmail.com' } }, { roles: { contains: 'super-admin' } }] }, limit: 1, overrideAccess: true })
  if (!actor.docs[0]) throw new Error('The existing Enoch platform administrator is required for the import audit trail')
  const staff = { ...actor.docs[0], collection: 'users' as const }
  const existing = await payload.find({ collection: 'tenants', where: { slug: { equals: 'meanpack' } }, limit: 2, depth: 0, overrideAccess: true, user: staff })
  if (existing.totalDocs > 1) throw new Error('Mean Pack tenant is ambiguous')
  const moduleRows = await payload.find({ collection: 'modules', where: { key: { equals: 'meanpack-website' } }, limit: 1, overrideAccess: true, user: staff })
  let mod = moduleRows.docs[0]
  if (!mod) mod = await payload.create({ collection: 'modules', data: { name: 'Mean Pack website', key: 'meanpack-website', defaultMonthlyPrice: 0, contentCollections: ['meanpack-websites'] }, overrideAccess: true, user: staff })
  let tenant = existing.docs[0]
  if (!tenant) tenant = await payload.create({ collection: 'tenants', data: { name: 'Mean Pack', slug: 'meanpack', domains: [{ domain: 'meanpack.serviettelab.com' }], subscriptions: [{ module: mod.id, active: true, monthlyPrice: 0 }] }, overrideAccess: true, user: staff })
  const documents = await payload.find({ collection: 'meanpack-websites', where: { tenant: { equals: tenant.id } }, limit: 1, overrideAccess: true, user: staff })
  if (documents.totalDocs) throw new Error('Mean Pack content already exists. Import refused to protect staff edits.')
  if (!Array.isArray(tenant.enabledCollections) || !tenant.enabledCollections.includes('meanpack-websites')) throw new Error('Mean Pack tenant needs its website entitlement before import')

  const assets = new Map<string, number>()
  const upload = async (asset: { url: string; alt: string }) => {
    if (!asset.url.startsWith('/assets/')) throw new Error('Seed files must come from the explicit local website checkout')
    if (assets.has(asset.url)) return assets.get(asset.url)!
    const filename = path.basename(asset.url)
    const prior = await payload.find({ collection: 'media', where: { and: [{ tenant: { equals: tenant.id } }, { filename: { like: filename } }] }, limit: 2, depth: 0, overrideAccess: true, user: staff })
    if (prior.totalDocs > 1) throw new Error(`Ambiguous imported media: ${filename}`)
    const file = prior.docs[0] ?? await payload.create({ collection: 'media', data: { tenant: tenant.id, alt: asset.alt || 'Mean Pack operations in Battambang', prefix: 'meanpack/site',
      ...(metadataFixture ? { filename, mimeType: filename.endsWith('.mp4') ? 'video/mp4' : 'image/webp', filesize: 1, width: 1280, height: 960 } : {}) } as never,
      ...(metadataFixture ? {} : { filePath: path.join(source!, 'public', asset.url) }), locale: 'en', overrideAccess: true, user: staff })
    assets.set(asset.url, Number(file.id))
    return Number(file.id)
  }
  const logo = await upload(content.logo)
  const scenes: Record<string, number> = {}
  for (const [name, asset] of Object.entries(content.scenes)) scenes[name] = await upload(asset as { url: string; alt: string })
  const media = []
  for (const item of content.media) media.push({ slug: item.slug, kind: item.kind, category: item.category, title: item.title, description: item.description, published: true,
    file: await upload({ url: item.src_path, alt: item.alt_text }), poster: item.poster_path ? await upload({ url: item.poster_path, alt: item.title }) : null })
  const products = []
  for (const item of content.products) products.push({ ...item, image: await upload(item.image), published: true })
  if (!tenant.logo) await payload.update({ collection: 'tenants', id: tenant.id, data: { logo }, overrideAccess: true, user: staff })
  const doc = await payload.create({ collection: 'meanpack-websites', data: {
    tenant: tenant.id, name: 'Mean Pack website', _status: 'published', contact: content.contact, identity: content.identity,
    copy: content.copy, logo, scenes, media, products, processStages: content.processStages, ...content.lists, routeSteps: content.routeSteps,
  }, locale: 'en', draft: false, overrideAccess: true, user: staff })
  console.log(JSON.stringify({ tenantId: tenant.id, documentId: doc.id, importedMedia: assets.size, galleryEntries: media.length, crops: products.length, editor: `https://meanpack.serviettelab.com/admin/collections/meanpack-websites/${doc.id}` }))
  await Promise.race([payload.destroy(), new Promise(resolve => setTimeout(resolve, 2000))])
}
main().then(() => process.exit(0)).catch(error => { console.error(error instanceof Error ? error.message.replace(/postgres(?:ql)?:\/\/[^\s"']+/g, '[REDACTED CONNECTION]') : 'Mean Pack import failed'); process.exit(1) })
