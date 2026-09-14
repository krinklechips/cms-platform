import { createClient } from '@supabase/supabase-js'
import { getPayload } from 'payload'
import config from '../src/payload.config'

/**
 * The live home highlight cards take their Khmer/Chinese text from the live
 * database (content_translations, entity_type 'homepage_feature_card', keyed by
 * the card slug) — NOT from messages/*.json. READS live, WRITES CMS kh/cn.
 */
const LOC: Record<string, 'kh' | 'cn'> = { km: 'kh', zh: 'cn' }
async function main() {
  const live = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const payload = await getPayload({ config })
  const { data, error } = await live.from('content_translations').select('entity_id, locale, field, value').eq('entity_type', 'homepage_feature_card')
  if (error) throw new Error(error.message)
  const cards = await payload.find({ collection: 'feature-cards', limit: 50, depth: 0, overrideAccess: true })
  const bySlug = new Map(cards.docs.map((c) => [String((c as { slug?: string }).slug), c.id]))
  const patches = new Map<string, Record<string, unknown>>() // `${id}|${loc}` → data
  for (const r of data as { entity_id: string; locale: string; field: string; value: unknown }[]) {
    const id = bySlug.get(r.entity_id); const loc = LOC[r.locale]
    if (!id || !loc || typeof r.value !== 'string' || !['title', 'description', 'cta'].includes(r.field)) continue
    const key = `${id}|${loc}`; patches.set(key, { ...(patches.get(key) ?? {}), [r.field]: r.value })
  }
  for (const [key, patch] of patches) {
    const [id, loc] = key.split('|')
    await payload.update({ collection: 'feature-cards', id: Number(id), data: patch as never, draft: false, overrideAccess: true, locale: loc as 'kh' | 'cn' })
    console.log(`✓ feature-card ${id} [${loc}]: ${Object.keys(patch).join(', ')}`)
  }
  process.exit(0)
}
main().catch((e) => { console.error('FAILED:', e.message); process.exit(1) })
