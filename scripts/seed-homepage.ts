import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'
import { getPayload } from 'payload'

const dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(dirname, '../.env') })
dotenv.config({ path: path.resolve(dirname, '../../roomchang/.env') })

/**
 * Focused seed: (1) re-save the roomchang tenant so enabledCollections
 * recomputes (hero-slides → homepage), (2) create/update the homepage doc
 * from the live published hero_slides + seed pill/buttons EN/KH/CN.
 * Avoids the full 28-collection sync (which times out on the pooler).
 */
async function run() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  const { default: config } = await import('../src/payload.config')
  const payload = await getPayload({ config })

  const tenant = (
    await payload.find({ collection: 'tenants', where: { slug: { equals: 'roomchang' } }, limit: 1, depth: 0 })
  ).docs[0] as { id: number | string }
  if (!tenant) throw new Error('roomchang tenant not found')

  // 1. recompute enabledCollections via a touch-update (beforeChange hook)
  await payload.update({ collection: 'tenants', id: tenant.id, data: {} as never })
  console.log('✓ tenant enabledCollections recomputed')

  // 2. homepage doc
  const { data: heroSlides, error } = await supabase
    .from('hero_slides')
    .select('*')
    .eq('published', true)
    .order('order')
  if (error) throw new Error(`hero_slides: ${error.message}`)
  const slides = (heroSlides ?? []).map((h) => ({
    imageUrl: h.imageSrc ?? undefined,
    imagePosition: h.imagePosition ?? undefined,
    imageSize: h.imageSize ?? undefined,
    preserveFullImage: h.preserveFullImage ?? false,
    eyebrow: h.eyebrow ?? undefined,
    title: h.title,
    subtitle: h.subtitle ?? undefined,
    description: h.description ?? undefined,
    ctaText: h.ctaText ?? undefined,
    ctaUrl: h.ctaUrl ?? undefined,
  }))

  const found = await payload.find({ collection: 'homepage', where: { tenant: { equals: tenant.id } }, limit: 1 })
  let hpId: number | string
  if (found.docs[0]) {
    hpId = found.docs[0].id
    await payload.update({ collection: 'homepage', id: hpId, data: { slides } as never, locale: 'en' })
  } else {
    const created = await payload.create({
      collection: 'homepage',
      data: {
        tenant: tenant.id,
        slides,
        heroPill: 'Trusted Since 1996',
        heroButtons: [
          { label: 'Request An Appointment', url: '/contact' },
          { label: 'Explore Services', url: '/services' },
          { label: 'Our Doctors', url: '/team' },
        ],
      } as never,
      locale: 'en',
    })
    hpId = created.id
  }
  await payload.update({
    collection: 'homepage',
    id: hpId,
    data: {
      heroPill: 'ទំនុកចិត្តចាប់តាំងពីឆ្នាំ ១៩៩៦',
      heroButtons: [
        { label: 'ស្នើសុំការណាត់ជួប', url: '/contact' },
        { label: 'ស្វែងរកសេវាកម្ម', url: '/services' },
        { label: 'ទន្តបណ្ឌិតរបស់យើងខ្ញុំ', url: '/team' },
      ],
    } as never,
    locale: 'kh' as never,
  })
  await payload.update({
    collection: 'homepage',
    id: hpId,
    data: {
      heroPill: '始创于1996年',
      heroButtons: [
        { label: '预约挂号', url: '/contact' },
        { label: '浏览诊疗项目', url: '/services' },
        { label: '医生团队', url: '/team' },
      ],
    } as never,
    locale: 'cn' as never,
  })
  console.log(`✓ homepage doc seeded: ${slides.length} slides + 3 buttons`)
  process.exit(0)
}
run().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
