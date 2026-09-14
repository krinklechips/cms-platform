import { createClient } from '@supabase/supabase-js'
import { getPayload } from 'payload'
import config from '../src/payload.config'

/** Copy localized doctor names (live content_translations) into CMS doctors — READS live, WRITES CMS. */
async function main() {
  const live = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const payload = await getPayload({ config })
  const { data, error } = await live.from('content_translations').select('entity_id, locale, value').eq('entity_type', 'doctor').eq('field', 'name')
  if (error) throw new Error(error.message)
  const LOC: Record<string, 'kh' | 'cn'> = { km: 'kh', zh: 'cn' }
  const docs = await payload.find({ collection: 'doctors', limit: 200, depth: 0, overrideAccess: true })
  const bySource = new Map(docs.docs.map((d) => [String((d as { sourceId?: string }).sourceId), d.id]))
  let n = 0
  for (const row of data as { entity_id: string; locale: string; value: unknown }[]) {
    const id = bySource.get(String(row.entity_id)); const loc = LOC[row.locale]
    const name = typeof row.value === 'string' ? row.value : null
    if (!id || !loc || !name) continue
    await payload.update({ collection: 'doctors', id, data: { name }, draft: false, overrideAccess: true, locale: loc })
    n++
  }
  console.log(`✓ copied ${n} localized doctor names`)
  process.exit(0)
}
main().catch((e) => { console.error('FAILED:', e.message); process.exit(1) })
