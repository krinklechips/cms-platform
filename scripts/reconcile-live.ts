import { createClient } from '@supabase/supabase-js'
import { getPayload } from 'payload'
import config from '../src/payload.config'

/**
 * Reconciliation the one-way sync cannot do on its own (READS live, WRITES CMS):
 *  1. prune CMS docs whose source row no longer exists on live (sync never deletes)
 *  2. refresh pricing values that changed on live (pricing_items, comparison rows)
 * Dry-run by default; pass --apply to execute.
 */
const APPLY = process.argv.includes('--apply')
type Row = Record<string, unknown> & { id: number | string }

const PRUNE: { collection: string; table: string }[] = [
  { collection: 'services', table: 'services' }, { collection: 'doctors', table: 'doctors' },
  { collection: 'technology', table: 'technology' }, { collection: 'branches', table: 'branches' },
  { collection: 'brand-logos', table: 'brand_logos' }, { collection: 'testimonials', table: 'testimonials' },
  { collection: 'partners', table: 'partners' }, { collection: 'pricing-items', table: 'pricing_items' },
  { collection: 'pricing-comparison-rows', table: 'pricing_comparison_rows' },
]
const PRICE_MAPS: { collection: string; table: string; fields: [string, string][] }[] = [
  { collection: 'pricing-items', table: 'pricing_items', fields: [['name', 'name'], ['price', 'price'], ['ada', 'ada'], ['aus', 'aus'], ['note', 'note'], ['order', 'order']] },
  { collection: 'pricing-comparison-rows', table: 'pricing_comparison_rows', fields: [['treatment', 'treatment'], ['roomchangPrice', 'roomchang_price'], ['australiaPrice', 'australia_price'], ['singaporePrice', 'singapore_price'], ['ada', 'ada'], ['order', 'sort_order']] },
]
const norm = (v: unknown) => (v === null || v === undefined ? '' : typeof v === 'number' ? String(v) : String(v).trim())

async function main() {
  const live = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const payload = await getPayload({ config })
  let pruned = 0, updated = 0

  for (const { collection, table } of PRUNE) {
    const { data, error } = await live.from(table).select('id')
    if (error) throw new Error(`${table}: ${error.message}`)
    const liveIds = new Set((data as Row[]).map((r) => String(r.id)))
    const cms = await payload.find({ collection: collection as never, limit: 1000, depth: 0, overrideAccess: true })
    for (const doc of cms.docs as { id: number; sourceId?: string | null; name?: string; treatment?: string }[]) {
      if (!doc.sourceId || liveIds.has(String(doc.sourceId))) continue
      console.log(`PRUNE ${collection}/${doc.id} "${doc.name ?? doc.treatment ?? ''}" (source ${doc.sourceId} gone on live)`)
      if (APPLY) await payload.delete({ collection: collection as never, id: doc.id, overrideAccess: true })
      pruned++
    }
  }

  for (const { collection, table, fields } of PRICE_MAPS) {
    const { data, error } = await live.from(table).select('*')
    if (error) throw new Error(`${table}: ${error.message}`)
    const byId = new Map((data as Row[]).map((r) => [String(r.id), r]))
    const cms = await payload.find({ collection: collection as never, limit: 1000, depth: 0, overrideAccess: true, locale: 'en' })
    for (const doc of cms.docs as (Row & { sourceId?: string | null })[]) {
      const src = doc.sourceId ? byId.get(String(doc.sourceId)) : undefined
      if (!src) continue
      const patch: Record<string, unknown> = {}
      for (const [cmsField, liveCol] of fields) {
        if (norm(doc[cmsField]) !== norm(src[liveCol])) patch[cmsField] = src[liveCol] ?? null
      }
      if (Object.keys(patch).length === 0) continue
      console.log(`UPDATE ${collection}/${doc.id} "${doc.name ?? doc.treatment ?? ''}":`, JSON.stringify(patch))
      if (APPLY) await payload.update({ collection: collection as never, id: doc.id, data: patch as never, draft: false, overrideAccess: true, locale: 'en' })
      updated++
    }
  }
  console.log(`${APPLY ? '✓ applied' : 'DRY RUN'}: ${pruned} pruned, ${updated} updated`)
  process.exit(0)
}
main().catch((e) => { console.error('RECONCILE FAILED:', e.message); process.exit(1) })
