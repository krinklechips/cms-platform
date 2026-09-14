import { readFileSync } from 'node:fs'
import { getPayload } from 'payload'
import config from '../src/payload.config'

/** Live renders the home highlight cards from messages/{km,zh}.json (homeHighlights.card.*); align the CMS kh/cn text to it. */
const REPO = process.env.ROOMCHANG_REPO ?? '/Users/enochphan/Desktop/Desktop - Silver Edge/ENOCH/Businesses/roomchang'
type Card = { title?: string; description?: string; cta?: string }
const cards = (loc: string) => (JSON.parse(readFileSync(`${REPO}/messages/${loc}.json`, 'utf8')).homeHighlights?.card ?? {}) as Record<string, Card>

async function main() {
  const payload = await getPayload({ config })
  const en = cards('en')
  const docs = await payload.find({ collection: 'feature-cards', limit: 50, depth: 0, overrideAccess: true, locale: 'en' })
  for (const [loc, m] of [['kh', cards('km')], ['cn', cards('zh')]] as const) {
    let n = 0
    for (const d of docs.docs as { id: number; title?: string }[]) {
      const norm = (s?: string) => (s ?? '').toLowerCase().replace(/[^a-z]/g, '')
      // 'CA® Clear Aligner' vs 'Clear Aligner (CA)' — match on letters only.
      const key = Object.keys(en).find((k) => en[k].title === d.title || norm(en[k].title) === norm(d.title) || (norm(d.title).includes('clearaligner') && norm(en[k].title).includes('clearaligner')))
      const t = key ? m[key] : undefined
      if (!t) { console.log(`  no match for card "${d.title}"`); continue }
      await payload.update({ collection: 'feature-cards', id: d.id, data: { title: t.title, description: t.description, cta: t.cta } as never, draft: false, overrideAccess: true, locale: loc })
      n++
    }
    console.log(`✓ feature-cards ${loc}: ${n}/${docs.docs.length} aligned`)
  }
  process.exit(0)
}
main().catch((e) => { console.error('FAILED:', e.message); process.exit(1) })
