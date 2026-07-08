/**
 * One-way sync: roomchang production Supabase ──▶ this Payload CMS.
 *
 * The LIVE SITE keeps reading Supabase (source of truth). This pulls the
 * current content — services + doctors, in EN + KM + ZH — into Payload so
 * the team can edit here and the dummy site can render it.
 * Re-runnable: upserts by `sourceId`, so running it again refreshes from live.
 *
 *   npm run sync:roomchang
 *
 * Secrets: PAYLOAD_SECRET from ./ .env; Supabase creds are read from the
 * roomchang repo's .env (../roomchang/.env) — not duplicated here.
 */
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'
import { getPayload } from 'payload'

const dirname = path.dirname(fileURLToPath(import.meta.url))
// Load env BEFORE importing payload.config (which reads PAYLOAD_SECRET at
// module scope) — hence the dynamic import inside run().
dotenv.config({ path: path.resolve(dirname, '../.env') })
dotenv.config({ path: path.resolve(dirname, '../../roomchang/.env') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('✗ Missing Supabase creds (expected in ../roomchang/.env). Aborting.')
  process.exit(1)
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

type TrMap = Map<string, Record<string, unknown>> // `${entity_id}|${locale}` -> {field: value}

async function loadTranslations(entityType: string): Promise<TrMap> {
  const map: TrMap = new Map()
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('content_translations')
      .select('entity_id, locale, field, value')
      .eq('entity_type', entityType)
      .in('locale', ['km', 'zh'])
      .range(from, from + 999)
    if (error) throw new Error(`content_translations(${entityType}): ${error.message}`)
    for (const r of data) {
      const k = `${r.entity_id}|${r.locale}`
      if (!map.has(k)) map.set(k, {})
      map.get(k)![r.field] = r.value
    }
    if (data.length < 1000) break
  }
  return map
}

const toArr = (v: unknown, key: string): { [k: string]: string }[] | undefined =>
  Array.isArray(v) && v.length ? v.filter((x) => typeof x === 'string' && x.trim()).map((x) => ({ [key]: x })) : undefined

async function run() {
  const { default: config } = await import('../src/payload.config')
  const payload = await getPayload({ config })

  // ── tenant #1: Roomchang ──
  let tenant = (
    await payload.find({ collection: 'tenants', where: { slug: { equals: 'roomchang' } }, limit: 1 })
  ).docs[0]
  if (!tenant) {
    tenant = await payload.create({
      collection: 'tenants',
      data: {
        name: 'Roomchang Dental Hospital',
        slug: 'roomchang',
        domains: [{ domain: 'roomchang.com' }],
      },
    })
    console.log('✓ created tenant: roomchang')
  }
  const tenantId = tenant.id

  // Generic upsert: create/update EN, then per-locale updates for KM/ZH.
  async function upsert(
    collection: 'services' | 'doctors',
    sourceId: string,
    en: Record<string, unknown>,
    km: Record<string, unknown>,
    zh: Record<string, unknown>,
  ) {
    const existing = (
      await payload.find({ collection, where: { sourceId: { equals: sourceId } }, limit: 1 })
    ).docs[0]
    const base = { ...en, sourceId, tenant: tenantId }
    const doc = existing
      ? await payload.update({ collection, id: existing.id, data: base, locale: 'en' })
      : await payload.create({ collection, data: base as never, locale: 'en' })
    if (Object.keys(km).length) await payload.update({ collection, id: doc.id, data: km, locale: 'km' })
    if (Object.keys(zh).length) await payload.update({ collection, id: doc.id, data: zh, locale: 'zh' })
    return existing ? 'updated' : 'created'
  }

  // ── services ──
  const { data: services, error: sErr } = await supabase.from('services').select('*').order('order')
  if (sErr) throw new Error(`services: ${sErr.message}`)
  const sTr = await loadTranslations('service')
  let sC = 0
  for (const s of services!) {
    const trOf = (loc: string) => sTr.get(`${s.id}|${loc}`) ?? {}
    const locData = (t: Record<string, unknown>) => {
      const d: Record<string, unknown> = {}
      if (typeof t.name === 'string') d.name = t.name
      if (typeof t.description === 'string') d.description = t.description
      if (typeof t.eyebrow === 'string') d.eyebrow = t.eyebrow
      if (typeof t.heroDescription === 'string') d.heroDescription = t.heroDescription
      const f = toArr(t.features, 'feature')
      if (f) d.features = f
      if (t.content && typeof t.content === 'object') d.content = t.content
      return d
    }
    await upsert(
      'services',
      String(s.id),
      {
        name: s.name,
        slug: s.slug,
        description: s.description ?? undefined,
        eyebrow: s.eyebrow ?? undefined,
        heroDescription: s.heroDescription ?? undefined,
        category: s.category ?? undefined,
        icon: s.icon ?? undefined,
        isFeatured: s.isFeatured ?? false,
        features: toArr(s.features, 'feature'),
        imageUrl: s.imageSrc ?? undefined,
        content: s.content ?? undefined,
        order: s.order ?? 0,
        published: s.published ?? true,
      },
      locData(trOf('km')),
      locData(trOf('zh')),
    )
    sC++
  }
  console.log(`✓ services synced: ${sC}`)

  // ── doctors ──
  const { data: doctors, error: dErr } = await supabase.from('doctors').select('*').order('order')
  if (dErr) throw new Error(`doctors: ${dErr.message}`)
  const dTr = await loadTranslations('doctor')
  let dC = 0
  for (const d of doctors!) {
    const trOf = (loc: string) => dTr.get(`${d.id}|${loc}`) ?? {}
    const locData = (t: Record<string, unknown>) => {
      const o: Record<string, unknown> = {}
      if (typeof t.role === 'string') o.role = t.role
      if (typeof t.bio === 'string') o.bio = t.bio
      if (typeof t.note === 'string') o.note = t.note
      const sp = toArr(t.specialty, 'value')
      if (sp) o.specialty = sp
      const lg = toArr(t.languages, 'value')
      if (lg) o.languages = lg
      return o
    }
    await upsert(
      'doctors',
      String(d.id),
      {
        name: d.name,
        credentials: d.credentials ?? undefined,
        role: d.role ?? undefined,
        department: d.department ?? undefined,
        specialty: toArr(d.specialty, 'value'),
        languages: toArr(d.languages, 'value'),
        bio: d.bio ?? undefined,
        note: d.note ?? undefined,
        initials: d.initials ?? undefined,
        photoUrl: d.photoUrl ?? undefined,
        order: d.order ?? 0,
        published: d.published ?? true,
      },
      locData(trOf('km')),
      locData(trOf('zh')),
    )
    dC++
  }
  console.log(`✓ doctors synced: ${dC}`)
  console.log('Done — live site untouched; Payload now mirrors Supabase content.')
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
