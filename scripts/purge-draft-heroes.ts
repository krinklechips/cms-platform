import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
const dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(dirname, '../.env') })
async function run() {
  const { default: config } = await import('../src/payload.config')
  const payload = await getPayload({ config })
  const res = await payload.delete({
    collection: 'hero-slides',
    where: { published: { equals: false } },
  })
  console.log('✓ deleted from CMS:', res.docs.length, 'drafts:', res.docs.map((d) => (d as { title?: string }).title).join(' | '))
  process.exit(0)
}
run().catch((e) => { console.error(e.message); process.exit(1) })
