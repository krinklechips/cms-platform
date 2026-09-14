import { createClient } from '@supabase/supabase-js'
import { getPayload } from 'payload'
import config from '../src/payload.config'
async function main() {
  const live = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const payload = await getPayload({ config })
  const { data, error } = await live.from('doctors').select('id, name'); if (error) throw new Error(error.message)
  const docs = await payload.find({ collection: 'doctors', limit: 200, depth: 0, overrideAccess: true })
  const bySource = new Map(docs.docs.map((d) => [String((d as { sourceId?: string }).sourceId), d.id]))
  let n = 0
  for (const r of data as { id: string; name: string }[]) {
    const id = bySource.get(String(r.id)); if (!id) continue
    await payload.update({ collection: 'doctors', id, data: { name: r.name }, draft: false, overrideAccess: true, locale: 'en' }); n++
  }
  console.log(`✓ restored ${n} English doctor names`); process.exit(0)
}
main().catch((e) => { console.error('FAILED:', e.message); process.exit(1) })
