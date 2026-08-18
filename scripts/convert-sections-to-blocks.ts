/**
 * One-time converter: legacy `content` JSON ({ sections: [...] }) → the new
 * `sections` blocks field, per document, per locale (en/kh/cn).
 *
 *   DATABASE_URI="$PROD_URI" npx tsx scripts/convert-sections-to-blocks.ts
 *
 * Non-destructive: `content` is never modified — the site prefers `sections`
 * when it has any block and falls back to the JSON otherwise, so a partial or
 * failed run changes nothing for pages it didn't reach.
 *
 * Shape mapping (mirror of the site's blocksToSections):
 *   type            -> blockType
 *   list.items      string[] -> [{ item }]
 *   gallery.images  string[] -> [{ url }]
 *   twocol.left/right  section -> [block]   (blocks field, maxRows 1)
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'

type AnySection = { type: string; [k: string]: unknown }

const LOCALES = ['en', 'kh', 'cn'] as const

function sectionToBlock(section: AnySection): Record<string, unknown> {
  const { type, ...rest } = section
  const block: Record<string, unknown> = { ...rest, blockType: type }

  if (type === 'list' && Array.isArray(rest.items)) {
    block.items = (rest.items as string[]).map((item) => ({ item }))
  }
  if (type === 'gallery' && Array.isArray(rest.images)) {
    block.images = (rest.images as string[]).map((url) => ({ url }))
  }
  if (type === 'twocol') {
    block.left = rest.left ? [sectionToBlock(rest.left as AnySection)] : []
    block.right = rest.right ? [sectionToBlock(rest.right as AnySection)] : []
  }
  return block
}

async function run() {
  const payload = await getPayload({ config })
  let converted = 0
  let skipped = 0
  let failed = 0

  for (const collection of ['services', 'technology'] as const) {
    const { docs } = await payload.find({
      collection,
      limit: 200,
      depth: 0,
      overrideAccess: true,
      locale: 'en',
    })

    for (const doc of docs) {
      for (const locale of LOCALES) {
        try {
          const localized = (await payload.findByID({
            collection,
            id: doc.id,
            depth: 0,
            locale,
            fallbackLocale: false,
            overrideAccess: true,
          })) as unknown as Record<string, unknown>
          const content = localized?.content as { sections?: AnySection[] } | null | undefined
          const sections = content?.sections
          if (!Array.isArray(sections) || sections.length === 0) {
            skipped++
            continue
          }
          const existing = localized?.sections as unknown[] | undefined
          if (Array.isArray(existing) && existing.length > 0) {
            skipped++ // already converted — idempotent re-runs
            continue
          }
          const blocks = sections.map(sectionToBlock)
          await payload.update({
            collection,
            id: doc.id,
            locale,
            data: { sections: blocks },
            overrideAccess: true,
          })
          converted++
          console.log(`✔ ${collection}/${doc.id} [${locale}] ${blocks.length} sections`)
        } catch (err) {
          failed++
          console.error(`✘ ${collection}/${doc.id} [${locale}]:`, (err as Error).message)
        }
      }
    }
  }

  console.log(`\nDone. converted=${converted} skipped=${skipped} failed=${failed}`)
  process.exit(failed > 0 ? 1 : 0)
}

run()
