import { readFileSync } from 'node:fs'
import { getPayload } from 'payload'
import config from '../src/payload.config'

/**
 * The live site's hero copy in Khmer/Chinese comes from messages/{km,zh}.json;
 * the CMS homepage carried its own translations. Align the CMS kh/cn locales
 * to the live language files (slides matched by their English title).
 */
const REPO = process.env.ROOMCHANG_REPO ?? '/Users/enochphan/Desktop/Desktop - Silver Edge/ENOCH/Businesses/roomchang'
const msgs = (loc: string) => JSON.parse(readFileSync(`${REPO}/messages/${loc}.json`, 'utf8')).homeHero as Record<string, unknown>
type Slide = { eyebrow?: string; title?: string; description?: string; alt?: string }

async function main() {
  const payload = await getPayload({ config })
  const en = msgs('en'), km = msgs('km'), zh = msgs('zh')
  const enSlides = en.slide as Record<string, Slide>
  const home = (await payload.find({ collection: 'homepage', limit: 1, depth: 0, overrideAccess: true, locale: 'en' })).docs[0] as {
    id: number; heroButtons?: { id?: string; label?: string; url?: string }[]; slides?: { id?: string; title?: string }[]
  }
  for (const [loc, m] of [['kh', km], ['cn', zh]] as const) {
    const slides = (home.slides ?? []).map((s) => {
      const key = Object.keys(enSlides).find((k) => enSlides[k].title === s.title)
      const t = key ? ((m.slide as Record<string, Slide>)[key] ?? {}) : {}
      return { id: s.id, ...(t.eyebrow ? { eyebrow: t.eyebrow } : {}), ...(t.title ? { title: t.title } : {}), ...(t.description ? { description: t.description } : {}) }
    })
    const ctas = [m.ctaPrimary, m.ctaSecondary, m.ctaTertiary] as string[]
    const heroButtons = (home.heroButtons ?? []).map((b, i) => ({ id: b.id, url: b.url, label: ctas[i] ?? b.label }))
    await payload.update({ collection: 'homepage', id: home.id, data: { heroPill: m.trustPill, heroButtons, slides } as never, draft: false, overrideAccess: true, locale: loc })
    console.log(`✓ homepage ${loc}: pill + ${heroButtons.length} buttons + ${slides.filter((s) => s.title).length}/${slides.length} slides matched`)
  }
  process.exit(0)
}
main().catch((e) => { console.error('ALIGN FAILED:', e.message); process.exit(1) })
