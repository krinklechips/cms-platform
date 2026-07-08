/**
 * One-way sync: roomchang production Supabase ──▶ this Payload CMS.
 *
 * The LIVE SITE keeps reading Supabase (source of truth). This pulls the
 * current content — services, doctors, and Wave 1 content collections — into
 * Payload so the team can edit here and the dummy site can render it.
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
type PayloadLocale = 'en' | 'kh' | 'cn'
type SyncCollection =
  | 'services'
  | 'doctors'
  | 'technology'
  | 'testimonials'
  | 'hero-slides'
  | 'branches'
  | 'site-stats'
  | 'feature-cards'
  | 'brand-logos'
  | 'pricing-categories'
  | 'pricing-items'
  | 'pricing-comparison-sets'
  | 'pricing-comparison-rows'
  | 'clinical-cases'
  | 'partner-categories'
  | 'partners'
  | 'faq-items'
  | 'timeline-events'
  | 'international-treatments'
  | 'international-steps'
  | 'international-why-items'
type SyncDoc = { id: string | number }
type SyncPayload = {
  find: (args: {
    collection: SyncCollection
    where: { sourceId: { equals: string } }
    limit: number
  }) => Promise<{ docs: SyncDoc[] }>
  create: (args: {
    collection: SyncCollection
    data: Record<string, unknown>
    locale: PayloadLocale
  }) => Promise<SyncDoc>
  update: (args: {
    collection: SyncCollection
    id: string | number
    data: Record<string, unknown>
    locale: PayloadLocale
  }) => Promise<SyncDoc>
}

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

const toJson = (v: unknown): object | undefined => (v && typeof v === 'object' ? v : undefined)

const sourceIdOf = (r: Record<string, unknown>): string => String(r.sourceId ?? r.id)

/** URL-safe slug from a name — used where the source row has no slug (branches). */
const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

async function run() {
  const { default: config } = await import('../src/payload.config')
  const payload = await getPayload({ config })
  const syncPayload = payload as unknown as SyncPayload

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
    collection: SyncCollection,
    sourceId: string,
    en: Record<string, unknown>,
    km: Record<string, unknown>,
    zh: Record<string, unknown>,
  ) {
    const existing = (
      await syncPayload.find({ collection, where: { sourceId: { equals: sourceId } }, limit: 1 })
    ).docs[0]
    const base = { ...en, sourceId, tenant: tenantId }
    const doc = existing
      ? await syncPayload.update({ collection, id: existing.id, data: base, locale: 'en' })
      : await syncPayload.create({ collection, data: base, locale: 'en' })
    // Supabase content_translations uses ISO km/zh; Payload locales follow the
    // site's URL segments kh/cn (Enoch's convention).
    if (Object.keys(km).length) await syncPayload.update({ collection, id: doc.id, data: km, locale: 'kh' })
    if (Object.keys(zh).length) await syncPayload.update({ collection, id: doc.id, data: zh, locale: 'cn' })
    return doc.id
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

  // ── technology ──
  const { data: technology, error: tErr } = await supabase.from('technology').select('*').order('order')
  if (tErr) throw new Error(`technology: ${tErr.message}`)
  const tTr = await loadTranslations('technology')
  let tC = 0
  for (const t of technology!) {
    const trOf = (loc: string) => tTr.get(`${sourceIdOf(t)}|${loc}`) ?? {}
    const locData = (tr: Record<string, unknown>) => {
      const o: Record<string, unknown> = {}
      if (typeof tr.name === 'string') o.name = tr.name
      if (typeof tr.description === 'string') o.description = tr.description
      const highlights = toArr(tr.highlights, 'value')
      if (highlights) o.highlights = highlights
      const content = toJson(tr.content)
      if (content) o.content = content
      return o
    }
    await upsert(
      'technology',
      sourceIdOf(t),
      {
        name: t.name,
        slug: t.slug,
        category: t.category ?? undefined,
        description: t.description ?? undefined,
        highlights: toArr(t.highlights, 'value'),
        imageUrl: t.imageSrc ?? undefined,
        content: toJson(t.content),
        order: t.order ?? 0,
        published: t.published ?? true,
      },
      locData(trOf('km')),
      locData(trOf('zh')),
    )
    tC++
  }
  console.log(`✓ technology synced: ${tC}`)

  // ── testimonials ──
  const { data: testimonials, error: tmErr } = await supabase.from('testimonials').select('*').order('order')
  if (tmErr) throw new Error(`testimonials: ${tmErr.message}`)
  const tmTr = await loadTranslations('testimonial')
  let tmC = 0
  for (const tm of testimonials!) {
    const trOf = (loc: string) => tmTr.get(`${sourceIdOf(tm)}|${loc}`) ?? {}
    const locData = (tr: Record<string, unknown>) => {
      const o: Record<string, unknown> = {}
      if (typeof tr.authorTitle === 'string') o.authorTitle = tr.authorTitle
      if (typeof tr.quote === 'string') o.quote = tr.quote
      return o
    }
    await upsert(
      'testimonials',
      sourceIdOf(tm),
      {
        authorName: tm.authorName,
        authorTitle: tm.authorTitle ?? undefined,
        authorPhotoUrl: tm.authorPhotoUrl ?? undefined,
        quote: tm.quote ?? undefined,
        rating: tm.rating ?? 5,
        isFeatured: tm.isFeatured ?? false,
        order: tm.order ?? 0,
        published: tm.published ?? true,
      },
      locData(trOf('km')),
      locData(trOf('zh')),
    )
    tmC++
  }
  console.log(`✓ testimonials synced: ${tmC}`)

  // ── hero slides ──
  const { data: heroSlides, error: hErr } = await supabase.from('hero_slides').select('*').order('order')
  if (hErr) throw new Error(`hero_slides: ${hErr.message}`)
  let hC = 0
  for (const h of heroSlides!) {
    await upsert(
      'hero-slides',
      sourceIdOf(h),
      {
        eyebrow: h.eyebrow ?? undefined,
        title: h.title,
        subtitle: h.subtitle ?? undefined,
        description: h.description ?? undefined,
        imageUrl: h.imageSrc ?? undefined,
        imageAlt: h.imageAlt ?? undefined,
        imagePosition: h.imagePosition ?? undefined,
        imageSize: h.imageSize ?? undefined,
        preserveFullImage: h.preserveFullImage ?? false,
        ctaText: h.ctaText ?? undefined,
        ctaUrl: h.ctaUrl ?? undefined,
        order: h.order ?? 0,
        published: h.published ?? true,
      },
      {},
      {},
    )
    hC++
  }
  console.log(`✓ hero-slides synced: ${hC}`)

  // ── branches ──
  const { data: branches, error: bErr } = await supabase.from('branches').select('*').order('order')
  if (bErr) throw new Error(`branches: ${bErr.message}`)
  const bTr = await loadTranslations('branch')
  let bC = 0
  for (const b of branches!) {
    const trOf = (loc: string) => bTr.get(`${sourceIdOf(b)}|${loc}`) ?? {}
    const locData = (tr: Record<string, unknown>) => {
      const o: Record<string, unknown> = {}
      if (typeof tr.address === 'string') o.address = tr.address
      if (typeof tr.badge === 'string') o.badge = tr.badge
      if (typeof tr.description === 'string') o.description = tr.description
      if (typeof tr.hours === 'string') o.hours = tr.hours
      return o
    }
    await upsert(
      'branches',
      sourceIdOf(b),
      {
        name: b.name,
        slug: b.slug ?? (b.name ? slugify(String(b.name)) : undefined),
        shortName: b.shortName ?? undefined,
        badge: b.badge ?? undefined,
        description: b.description ?? undefined,
        address: b.address ?? undefined,
        phone: b.phone ?? undefined,
        mobile: b.mobile ?? undefined,
        email: b.email ?? undefined,
        hours: b.hours ?? undefined,
        imageUrl: b.imageSrc ?? undefined,
        mapQuery: b.mapQuery ?? undefined,
        mapUrl: b.mapUrl ?? undefined,
        mapPlaceUrl: b.map_place_url ?? undefined,
        photos: toJson(b.photos),
        order: b.order ?? 0,
        published: b.published ?? true,
      },
      locData(trOf('km')),
      locData(trOf('zh')),
    )
    bC++
  }
  console.log(`✓ branches synced: ${bC}`)

  // ── site stats ──
  const { data: siteStats, error: stErr } = await supabase.from('site_stats').select('*').order('sort_order')
  if (stErr) throw new Error(`site_stats: ${stErr.message}`)
  let stC = 0
  for (const st of siteStats!) {
    await upsert(
      'site-stats',
      String(st.key),
      {
        key: st.key,
        displayValue: st.display_value ?? undefined,
        numericValue: st.numeric_value ?? undefined,
        suffix: st.suffix ?? undefined,
        label: st.label ?? undefined,
        order: st.sort_order ?? 0,
        published: true,
      },
      {},
      {},
    )
    stC++
  }
  console.log(`✓ site-stats synced: ${stC}`)

  // ── feature cards ──
  const { data: featureCards, error: fErr } = await supabase
    .from('homepage_feature_cards')
    .select('*')
    .order('sort_order')
  if (fErr) throw new Error(`homepage_feature_cards: ${fErr.message}`)
  const fTr = await loadTranslations('homepage_feature_card')
  let fC = 0
  for (const f of featureCards!) {
    const sourceId = String(f.id)
    const trOf = (loc: string) => fTr.get(`${sourceId}|${loc}`) ?? {}
    const locData = (tr: Record<string, unknown>) => {
      const o: Record<string, unknown> = {}
      if (typeof tr.title === 'string') o.title = tr.title
      if (typeof tr.description === 'string') o.description = tr.description
      if (typeof tr.image_alt === 'string') o.imageAlt = tr.image_alt
      if (typeof tr.cta === 'string') o.cta = tr.cta
      return o
    }
    await upsert(
      'feature-cards',
      sourceId,
      {
        slug: f.slug,
        title: f.title,
        description: f.description ?? undefined,
        imageUrl: f.image_src ?? undefined,
        imageAlt: f.image_alt ?? undefined,
        href: f.href ?? undefined,
        cta: f.cta ?? undefined,
        order: f.sort_order ?? 0,
      },
      locData(trOf('km')),
      locData(trOf('zh')),
    )
    fC++
  }
  console.log(`✓ feature-cards synced: ${fC}`)

  // ── brand logos ──
  const { data: brandLogos, error: blErr } = await supabase.from('brand_logos').select('*').order('sort_order')
  if (blErr) throw new Error(`brand_logos: ${blErr.message}`)
  let blC = 0
  for (const bl of brandLogos!) {
    await upsert(
      'brand-logos',
      String(bl.id),
      {
        slug: bl.slug,
        name: bl.name,
        logoUrl: bl.logo_src ?? undefined,
        order: bl.sort_order ?? 0,
      },
      {},
      {},
    )
    blC++
  }
  console.log(`✓ brand-logos synced: ${blC}`)

  // ── pricing categories ──
  const { data: pricingCategories, error: pcErr } = await supabase
    .from('pricing_categories')
    .select('id,title,icon,order')
    .order('order')
  if (pcErr) throw new Error(`pricing_categories: ${pcErr.message}`)
  const pcTr = await loadTranslations('pricing_category')
  const pricingCategoryIds = new Map<string, string | number>()
  let pcC = 0
  for (const pc of pricingCategories!) {
    const sourceId = String(pc.id)
    const trOf = (loc: string) => pcTr.get(`${sourceId}|${loc}`) ?? {}
    const locData = (tr: Record<string, unknown>) => {
      const o: Record<string, unknown> = {}
      if (typeof tr.title === 'string') o.title = tr.title
      return o
    }
    const docId = await upsert(
      'pricing-categories',
      sourceId,
      {
        title: pc.title,
        icon: pc.icon ?? undefined,
        order: pc.order ?? 0,
      },
      locData(trOf('km')),
      locData(trOf('zh')),
    )
    pricingCategoryIds.set(sourceId, docId)
    pcC++
  }
  console.log(`✓ pricing-categories synced: ${pcC}`)

  // ── pricing comparison sets ──
  const { data: pricingComparisonSets, error: pcsErr } = await supabase
    .from('pricing_comparison_sets')
    .select('id,slug,exchange_rate,source_note,last_updated')
    .order('id')
  if (pcsErr) throw new Error(`pricing_comparison_sets: ${pcsErr.message}`)
  const pricingComparisonSetIds = new Map<string, string | number>()
  let pcsC = 0
  for (const pcs of pricingComparisonSets!) {
    const sourceId = String(pcs.id)
    const docId = await upsert(
      'pricing-comparison-sets',
      sourceId,
      {
        slug: pcs.slug,
        exchangeRate: pcs.exchange_rate ?? undefined,
        sourceNote: pcs.source_note ?? undefined,
        lastUpdated: pcs.last_updated ?? undefined,
      },
      {},
      {},
    )
    pricingComparisonSetIds.set(sourceId, docId)
    pcsC++
  }
  console.log(`✓ pricing-comparison-sets synced: ${pcsC}`)

  // ── partner categories ──
  const { data: partnerCategories, error: pacErr } = await supabase
    .from('partner_categories')
    .select('id,name,sort_order')
    .order('sort_order')
  if (pacErr) throw new Error(`partner_categories: ${pacErr.message}`)
  const partnerCategoryIds = new Map<string, string | number>()
  let pacC = 0
  for (const pac of partnerCategories!) {
    const sourceId = String(pac.id)
    const docId = await upsert(
      'partner-categories',
      sourceId,
      {
        name: pac.name,
        order: pac.sort_order ?? 0,
      },
      {},
      {},
    )
    partnerCategoryIds.set(sourceId, docId)
    pacC++
  }
  console.log(`✓ partner-categories synced: ${pacC}`)

  // ── pricing items ──
  const { data: pricingItems, error: piErr } = await supabase
    .from('pricing_items')
    .select('id,name,price,ada,aus,order,categoryId,note')
    .order('order')
  if (piErr) throw new Error(`pricing_items: ${piErr.message}`)
  const piTr = await loadTranslations('pricing_item')
  let piC = 0
  for (const pi of pricingItems!) {
    const sourceId = String(pi.id)
    const sourceCategoryId = pi.categoryId == null ? undefined : String(pi.categoryId)
    const categoryId = sourceCategoryId ? pricingCategoryIds.get(sourceCategoryId) : undefined
    if (sourceCategoryId && !categoryId) {
      console.warn(`⚠ pricing-items ${sourceId}: missing pricing-categories sourceId ${sourceCategoryId}`)
    }
    const trOf = (loc: string) => piTr.get(`${sourceId}|${loc}`) ?? {}
    const locData = (tr: Record<string, unknown>) => {
      const o: Record<string, unknown> = {}
      if (typeof tr.name === 'string') o.name = tr.name
      if (typeof tr.note === 'string') o.note = tr.note
      return o
    }
    await upsert(
      'pricing-items',
      sourceId,
      {
        name: pi.name,
        price: pi.price ?? undefined,
        ada: pi.ada ?? undefined,
        aus: pi.aus ?? undefined,
        note: pi.note ?? undefined,
        order: pi.order ?? 0,
        sourceCategoryId,
        ...(categoryId ? { category: categoryId } : {}),
      },
      locData(trOf('km')),
      locData(trOf('zh')),
    )
    piC++
  }
  console.log(`✓ pricing-items synced: ${piC}`)

  // ── pricing comparison rows ──
  const { data: pricingComparisonRows, error: pcrErr } = await supabase
    .from('pricing_comparison_rows')
    .select('id,set_id,ada,treatment,roomchang_price,australia_price,singapore_price,sort_order')
    .order('sort_order')
  if (pcrErr) throw new Error(`pricing_comparison_rows: ${pcrErr.message}`)
  let pcrC = 0
  for (const pcr of pricingComparisonRows!) {
    const sourceId = String(pcr.id)
    const sourceSetId = pcr.set_id == null ? undefined : String(pcr.set_id)
    const setId = sourceSetId ? pricingComparisonSetIds.get(sourceSetId) : undefined
    if (sourceSetId && !setId) {
      console.warn(`⚠ pricing-comparison-rows ${sourceId}: missing pricing-comparison-sets sourceId ${sourceSetId}`)
    }
    await upsert(
      'pricing-comparison-rows',
      sourceId,
      {
        sourceSetId,
        ada: pcr.ada ?? undefined,
        treatment: pcr.treatment,
        roomchangPrice: pcr.roomchang_price ?? undefined,
        australiaPrice: pcr.australia_price ?? undefined,
        singaporePrice: pcr.singapore_price ?? undefined,
        order: pcr.sort_order ?? 0,
        ...(setId ? { set: setId } : {}),
      },
      {},
      {},
    )
    pcrC++
  }
  console.log(`✓ pricing-comparison-rows synced: ${pcrC}`)

  // ── partners ──
  const { data: partners, error: pErr } = await supabase
    .from('partners')
    .select('id,name,logo_src,website,sort_order,category_id')
    .order('sort_order')
  if (pErr) throw new Error(`partners: ${pErr.message}`)
  let pC = 0
  for (const p of partners!) {
    const sourceId = String(p.id)
    const sourceCategoryId = p.category_id == null ? undefined : String(p.category_id)
    const categoryId = sourceCategoryId ? partnerCategoryIds.get(sourceCategoryId) : undefined
    if (sourceCategoryId && !categoryId) {
      console.warn(`⚠ partners ${sourceId}: missing partner-categories sourceId ${sourceCategoryId}`)
    }
    await upsert(
      'partners',
      sourceId,
      {
        name: p.name,
        logoUrl: p.logo_src ?? undefined,
        website: p.website ?? undefined,
        order: p.sort_order ?? 0,
        sourceCategoryId,
        ...(categoryId ? { category: categoryId } : {}),
      },
      {},
      {},
    )
    pC++
  }
  console.log(`✓ partners synced: ${pC}`)

  // ── clinical cases ──
  const { data: clinicalCases, error: ccErr } = await supabase
    .from('clinical_cases')
    .select('id,title,slug,category,treatment,duration,description,tag,fullText,imageUrl,images,order,published')
    .order('order')
  if (ccErr) throw new Error(`clinical_cases: ${ccErr.message}`)
  const ccTr = await loadTranslations('clinical_case')
  let ccC = 0
  for (const cc of clinicalCases!) {
    const sourceId = String(cc.id)
    const trOf = (loc: string) => ccTr.get(`${sourceId}|${loc}`) ?? {}
    const locData = (tr: Record<string, unknown>) => {
      const o: Record<string, unknown> = {}
      if (typeof tr.title === 'string') o.title = tr.title
      if (typeof tr.category === 'string') o.category = tr.category
      if (typeof tr.treatment === 'string') o.treatment = tr.treatment
      if (typeof tr.duration === 'string') o.duration = tr.duration
      if (typeof tr.description === 'string') o.description = tr.description
      if (typeof tr.fullText === 'string') o.fullText = tr.fullText
      if (typeof tr.tag === 'string') o.tag = tr.tag
      return o
    }
    await upsert(
      'clinical-cases',
      sourceId,
      {
        title: cc.title,
        slug: cc.slug,
        category: cc.category ?? undefined,
        treatment: cc.treatment ?? undefined,
        duration: cc.duration ?? undefined,
        description: cc.description ?? undefined,
        tag: cc.tag ?? undefined,
        fullText: cc.fullText ?? undefined,
        imageUrl: cc.imageUrl ?? undefined,
        images: toJson(cc.images),
        order: cc.order ?? 0,
        published: cc.published ?? true,
      },
      locData(trOf('km')),
      locData(trOf('zh')),
    )
    ccC++
  }
  console.log(`✓ clinical-cases synced: ${ccC}`)

  // ── faq items ──
  const { data: faqItems, error: faqErr } = await supabase
    .from('faq_items')
    .select('id,question,answer,category,sort_order,published')
    .order('sort_order')
  if (faqErr) throw new Error(`faq_items: ${faqErr.message}`)
  let faqC = 0
  for (const faq of faqItems!) {
    await upsert(
      'faq-items',
      String(faq.id),
      {
        question: faq.question,
        answer: faq.answer ?? undefined,
        category: faq.category ?? undefined,
        order: faq.sort_order ?? 0,
        published: faq.published ?? true,
      },
      {},
      {},
    )
    faqC++
  }
  console.log(`✓ faq-items synced: ${faqC}`)

  // ── timeline events ──
  const { data: timelineEvents, error: teErr } = await supabase
    .from('timeline_events')
    .select('id,year,caption,heading,body,imageSrc,imageAlt,imagePosition,order,published')
    .order('order')
  if (teErr) throw new Error(`timeline_events: ${teErr.message}`)
  let teC = 0
  for (const te of timelineEvents!) {
    await upsert(
      'timeline-events',
      String(te.id),
      {
        year: String(te.year),
        caption: te.caption ?? undefined,
        heading: te.heading,
        body: te.body ?? undefined,
        imageUrl: te.imageSrc ?? undefined,
        imageAlt: te.imageAlt ?? undefined,
        imagePosition: te.imagePosition ?? undefined,
        order: te.order ?? 0,
        published: te.published ?? true,
      },
      {},
      {},
    )
    teC++
  }
  console.log(`✓ timeline-events synced: ${teC}`)

  // ── international treatments ──
  const { data: internationalTreatments, error: itErr } = await supabase
    .from('international_popular_treatments')
    .select('id,name,saving,sort_order')
    .order('sort_order')
  if (itErr) throw new Error(`international_popular_treatments: ${itErr.message}`)
  const itTr = await loadTranslations('international_popular_treatment')
  let itC = 0
  for (const it of internationalTreatments!) {
    const sourceId = String(it.id)
    const trOf = (loc: string) => itTr.get(`${sourceId}|${loc}`) ?? {}
    const locData = (tr: Record<string, unknown>) => {
      const o: Record<string, unknown> = {}
      if (typeof tr.name === 'string') o.name = tr.name
      if (typeof tr.saving === 'string') o.saving = tr.saving
      return o
    }
    await upsert(
      'international-treatments',
      sourceId,
      {
        name: it.name,
        saving: it.saving ?? undefined,
        order: it.sort_order ?? 0,
      },
      locData(trOf('km')),
      locData(trOf('zh')),
    )
    itC++
  }
  console.log(`✓ international-treatments synced: ${itC}`)

  // ── international steps ──
  const { data: internationalSteps, error: isErr } = await supabase
    .from('international_steps')
    .select('id,step_label,title,description,sort_order')
    .order('sort_order')
  if (isErr) throw new Error(`international_steps: ${isErr.message}`)
  const isTr = await loadTranslations('international_step')
  let isC = 0
  for (const step of internationalSteps!) {
    const sourceId = String(step.id)
    const trOf = (loc: string) => isTr.get(`${sourceId}|${loc}`) ?? {}
    const locData = (tr: Record<string, unknown>) => {
      const o: Record<string, unknown> = {}
      if (typeof tr.title === 'string') o.title = tr.title
      if (typeof tr.description === 'string') o.description = tr.description
      return o
    }
    await upsert(
      'international-steps',
      sourceId,
      {
        stepLabel: step.step_label ?? undefined,
        title: step.title,
        description: step.description ?? undefined,
        order: step.sort_order ?? 0,
      },
      locData(trOf('km')),
      locData(trOf('zh')),
    )
    isC++
  }
  console.log(`✓ international-steps synced: ${isC}`)

  // ── international why items ──
  const { data: internationalWhyItems, error: iwErr } = await supabase
    .from('international_why_items')
    .select('id,title,description,sort_order')
    .order('sort_order')
  if (iwErr) throw new Error(`international_why_items: ${iwErr.message}`)
  const iwTr = await loadTranslations('international_why_item')
  let iwC = 0
  for (const iw of internationalWhyItems!) {
    const sourceId = String(iw.id)
    const trOf = (loc: string) => iwTr.get(`${sourceId}|${loc}`) ?? {}
    const locData = (tr: Record<string, unknown>) => {
      const o: Record<string, unknown> = {}
      if (typeof tr.title === 'string') o.title = tr.title
      if (typeof tr.description === 'string') o.description = tr.description
      return o
    }
    await upsert(
      'international-why-items',
      sourceId,
      {
        title: iw.title,
        description: iw.description ?? undefined,
        order: iw.sort_order ?? 0,
      },
      locData(trOf('km')),
      locData(trOf('zh')),
    )
    iwC++
  }
  console.log(`✓ international-why-items synced: ${iwC}`)

  console.log('Done — live site untouched; Payload now mirrors Supabase content.')
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
