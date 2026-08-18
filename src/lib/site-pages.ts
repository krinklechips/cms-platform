/**
 * SITE PAGES INDEX — the map from "a page on our website" to "the things in
 * this CMS that edit it".
 *
 * Generated from an audit of the live site (roomchang.com) against
 * src/lib/payload-source.ts on the site side. Keep in sync when a collection
 * starts (or stops) feeding a page.
 */

export type PagePart = { collection: string; controls: string }
export type SitePage = { page: string; path: string; parts: PagePart[] }

export const SITE_PAGES: SitePage[] = [
  {
    page: "Home page",
    path: "/en",
    parts: [
      { collection: "homepage", controls: "The entire top hero: every carousel slide (image picked from Media Library or an image URL, crop/anchor position, eyebrow, headline, description), the small rounded trust pill abov" },
      { collection: "brand-logos", controls: "The scrolling logo marquee band directly under the hero (partner/manufacturer logos). Each row = one logo; `order` sets marquee sequence" },
      { collection: "site-stats", controls: "The four count-up numbers band under the marquee. ONLY four keys are read here: years_experience, specialist_dentists, branches_count, patients_treated (see src/components/sections" },
      { collection: "feature-cards", controls: "The large image \"highlight\" cards below the 6 service icons (title, description, image, link, CTA label)" },
      { collection: "testimonials", controls: "The patient-quote carousel at the bottom of the home page (author name, title, photo, quote, star rating). The SAME collection also drives the whole /en/about/testimonials page" },
    ],
  },
  {
    page: "Services page",
    path: "/en/services",
    parts: [
      { collection: "services", controls: "Every card in the 13-service grid: name, slug, short description, icon name, card image, feature bullets, category, `isFeatured`, `order` (grid sequence) and `published` (show/hide" },
    ],
  },
  {
    page: "Service detail page (one per service, e.g. Dental Implants)",
    path: "/en/services/[slug]",
    parts: [
      { collection: "services", controls: "SAME rows as the /services grid — one row = one detail page. The `eyebrow` field is the small uppercase label above the hero title, `heroDescription` is the long hero paragraph, `i" },
    ],
  },
  {
    page: "Team page",
    path: "/en/team",
    parts: [
      { collection: "doctors", controls: "Every doctor card in the grid: name, credentials, role, department (the grouping heading the cards sit under), specialty list, languages, bio, short credential note, initials (avat" },
    ],
  },
  {
    page: "Technology page",
    path: "/en/technology",
    parts: [
      { collection: "technology", controls: "Every technology card: name, category label, description, highlight bullets, card image, order, published" },
    ],
  },
  {
    page: "Technology detail page (one per technology, e.g. CAD/CAM)",
    path: "/en/technology/[slug]",
    parts: [
      { collection: "technology", controls: "SAME rows as the /technology grid. The `content` JSON field is the whole detail-page body (text, card grids, steps, embedded YouTube video blocks, image pairs, self-hosted video). " },
    ],
  },
  {
    page: "Pricing page",
    path: "/en/pricing",
    parts: [
      { collection: "pricing-categories", controls: "The collapsible section headers on the price list (title + icon name + order)" },
      { collection: "pricing-items", controls: "Every individual price row inside a category: treatment name, price, ADA code, AUS code, footnote. Each row is joined to its section via the `category` relationship (or the legacy " },
    ],
  },
  {
    page: "Implants price comparison page",
    path: "/en/pricing/implants-comparison",
    parts: [
      { collection: "pricing-comparison-sets", controls: "The row whose `slug` is exactly `implants-comparison` — its exchange rate and the small source/disclaimer note under the table. Wrong slug = blank page" },
      { collection: "pricing-comparison-rows", controls: "Every table row (treatment, Roomchang price, Australia price, Singapore price, ADA code). Rows belong to a set via the `set` relationship — the SAME collection also feeds /en/inter" },
    ],
  },
  {
    page: "International patients page",
    path: "/en/international",
    parts: [
      { collection: "international-why-items", controls: "The \"Why choose Roomchang\" card grid in the middle of the page (title + description per card)" },
      { collection: "international-treatments", controls: "The savings rows inside the \"cost comparison\" band below the why-cards (treatment name + savings pill, e.g. \"Dental implant — save 60%\")" },
      { collection: "international-steps", controls: "The numbered \"How it works\" interactive step accordion near the bottom (step label, title, description)" },
    ],
  },
  {
    page: "Full price comparison page",
    path: "/en/international/price-comparison",
    parts: [
      { collection: "pricing-comparison-sets", controls: "The row whose `slug` is exactly `full-comparison` — exchange rate + source note" },
      { collection: "pricing-comparison-rows", controls: "Every row of the big country-by-country comparison table, filtered to the `full-comparison` set." },
    ],
  },
  {
    page: "Contact page",
    path: "/en/contact",
    parts: [
      { collection: "branches", controls: "TWO things on this page: the \"Preferred branch\" dropdown inside the enquiry form, and the branch info cards below/beside it (name, address, phone, mobile, email, opening hours, Goo" },
      { collection: "doctors", controls: "Same Doctors rows as the Team page — they populate the searchable \"request a specific doctor\" picker in the enquiry form." },
      { collection: "enquiries", controls: "Where submitted contact-form enquiries are READ (name, email, phone, country, treatment, branch, preferred date, message, read flag). This is a read-only mirror — the live form pos" },
      { collection: "booking-slots", controls: "The appointment slots and bookings behind the contact page's date/time picker (date, time, duration, availability, who booked, status). Also a mirror — live reads/writes go to Supa" },
    ],
  },
  {
    page: "About page (hub)",
    path: "/en/about",
    parts: [
      { collection: "site-stats", controls: "The stats strip near the top of /about reads site_stats by key" },
    ],
  },
  {
    page: "Our facilities page",
    path: "/en/about/facilities",
    parts: [
      { collection: "site-stats", controls: "Again the \"Home Page\" → Site Stats collection — only the numbers strip on this page. Everything else on /about/facilities (copy, facility photos, the per-branch location cards) is " },
    ],
  },
  {
    page: "News & events listing",
    path: "/en/about/news",
    parts: [
      { collection: "news-articles", controls: "Every news card in the listing (date, title, description, image + alt) and its `order`/`published`" },
    ],
  },
  {
    page: "News article detail",
    path: "/en/about/news/[slug]",
    parts: [
      { collection: "news-articles", controls: "The full article page — hero image, title, date, and the `body` paragraph array (one row per paragraph). Also drives the prev/next article links at the bottom" },
    ],
  },
  {
    page: "Community & charity listing",
    path: "/en/about/community",
    parts: [
      { collection: "community-articles", controls: "Every card in the community listing (title, description, image, link)" },
    ],
  },
  {
    page: "Community article detail",
    path: "/en/about/community/[slug]",
    parts: [
      { collection: "community-articles", controls: "The full community story — title, date, hero image, `body` paragraphs, plus the `images` array which becomes the photo gallery at the bottom (CommunityGallery). Also the prev/next " },
    ],
  },
  {
    page: "Corporate partnerships page",
    path: "/en/about/partnerships",
    parts: [
      { collection: "partner-categories", controls: "The section headings that group the logos (e.g. insurers, embassies, corporates) and their order" },
      { collection: "partners", controls: "Each partner logo tile: name, logo URL, website link, and the `category` relationship that decides which heading it appears under." },
    ],
  },
  {
    page: "Patient testimonials page",
    path: "/en/about/testimonials",
    parts: [
      { collection: "testimonials", controls: "The full wall of testimonial cards on this page — same rows as the home-page carousel" },
    ],
  },
  {
    page: "Clinical results gallery",
    path: "/en/clinical-results",
    parts: [
      { collection: "site-stats", controls: "\"Home Page\" → Site Stats: the small stat tiles above the case grid, looked up by key (falls back to bundled FALLBACK_STATS)." },
      { collection: "clinical-cases", controls: "Every before/after case card: title, category (drives the filter chips), treatment, duration, description, tag, card image" },
    ],
  },
  {
    page: "Clinical case detail",
    path: "/en/clinical-results/[slug]",
    parts: [
      { collection: "clinical-cases", controls: "The full case page — hero, treatment/duration meta, `fullText` write-up, and the `images` JSON array (each entry = one zoomable photo with an optional caption). Also the prev/next " },
    ],
  },
  {
    page: "Clinical results by category",
    path: "/en/clinical-results/category/[category]",
    parts: [
      { collection: "clinical-cases", controls: "Same Clinical Cases rows, filtered by the `category` field. The category list itself is hardcoded in src/lib/clinical-categories.ts — adding a new category value in the CMS will NO" },
    ],
  },
  {
    page: "FAQ page",
    path: "/en/blog/faq",
    parts: [
      { collection: "faq-items", controls: "Every question/answer accordion row. The `category` field creates the section headings the questions are grouped under" },
    ],
  },
]

/** Live pages with NO CMS collection behind them yet — shown so an editor
 *  stops hunting for a screen that does not exist (fail loud, not silent). */
export const UNMODELED_PAGES: { path: string; whatsThere: string; source: string }[] = [
  { path: "/en (home) — the 6-icon service shortcut row between the stats band and the feature cards", whatsThere: "Six fixed shortcut tiles (Implants, Crowns, Aligners, Cosmetic, Whitening, Surgery) with hardcoded hrefs and Phosphor icons. Looks like it c", source: "Hardcoded SERVICES array in src/components/sections/home-services.tsx + labels from the `homeServices` namespace in mess" },
  { path: "/en/team — the stat strip above the doctor grid", whatsThere: "Numbers/labels above the doctor cards", source: "messages/*.json, `team.stat.*` namespace (NOT site-stats)" },
  { path: "/en/about — everything except the stat band", whatsThere: "Page headline and intro copy, the 9 section shortcut tiles (Facilities, Vision & Mission, Director's Message, Doctors, Community, Partnershi", source: "messages/*.json (`about.*` and `aboutTimeline.*`) + hardcoded SECTION_DEFS in src/app/[locale]/about/page.tsx + hardcode" },
  { path: "/en/about/vision-mission-values", whatsThere: "Whole page — vision, mission, and the five value cards", source: "messages/*.json, `visionMission` namespace. No CMS collection at all." },
  { path: "/en/about/director-message", whatsThere: "Whole page — the director's portrait and full letter", source: "messages/*.json, `directorMessage` namespace + a hardcoded <Image> path. No CMS collection at all." },
  { path: "/en/about/facilities — everything except the stat band", whatsThere: "All facility copy, the facility photo blocks, and the per-branch location cards at the bottom", source: "messages/*.json (`facilities` namespace) + the hardcoded BRANCHES array in src/lib/branches.ts" },
  { path: "/en/about/careers  AND  /en/about/careers/[slug]", whatsThere: "The whole jobs listing and every job detail page (title, description, requirements, benefits)", source: "Hardcoded POSITIONS array in src/lib/careers.ts. The CMS \"Careers\" group → `career-positions` collection exists and is f" },
  { path: "/en/about/branches/[slug] — the branch detail pages", whatsThere: "Each branch's hero photo, badge, long description, opening hours, phone, embedded Google Map and directions link", source: "Hardcoded BRANCHES array in src/lib/branches.ts (slug, badge, image, coords, mapEmbedSrc, description). The CMS `branche" },
  { path: "/en/blog (blog hub)", whatsThere: "The three-card hub linking to FAQ, Dentist Talks and Publications", source: "messages/*.json, `blogIndex` namespace. No CMS collection." },
  { path: "/en/blog/dentist-talks", whatsThere: "Every embedded YouTube video card and the playlist link", source: "Hardcoded DENTIST_TALKS array + YOUTUBE_PLAYLIST_ID constant in src/app/[locale]/blog/dentist-talks/page.tsx. The CMS \"E" },
  { path: "/en/blog/publications", whatsThere: "The full academic publication list with authors, journals, years and DOI links", source: "Hardcoded JSX literals inside src/app/[locale]/blog/publications/page.tsx (each citation is handwritten markup). The CMS" },
  { path: "/en/pricing/warranty", whatsThere: "The whole warranty page — coverage table, covered/not-covered lists, validity conditions, post-warranty terms, limitation of liability, cont", source: "Supabase table `warranty_terms` via getWarrantyTerms() in src/lib/data.ts (English-only, no i18n overlay). There is NO P" },
  { path: "/en/privacy-policy, /en/terms-of-service, /en/cookie-policy, /en/disclaimer, /en/booking-cancellation-policy", whatsThere: "All five legal pages, in full", source: "messages/en.json | km.json | zh.json namespaces `privacyPolicy`, `termsOfService`, `cookiePolicy`, `disclaimer`, `bookin" },
  { path: "Site header / main navigation (every page)", whatsThere: "The whole nav tree including the Services dropdown's 13 links and the Technology dropdown's links, the logo, and the language switcher", source: "Hardcoded NAV_ITEMS array in src/components/site/site-header.tsx + labels from the `nav`/`header` namespaces in messages" },
  { path: "Site footer (every page)", whatsThere: "All four footer columns, the social links (Facebook, YouTube, Instagram, Telegram, TikTok, LinkedIn), the legal link row, and the address/ph", source: "Hardcoded FOOTER_STRUCTURE, SOCIAL and LEGAL_LINKS arrays in src/components/site/site-footer.tsx + `footer`/`nav` namesp" },
  { path: "Floating contact widget + cookie/consent banner (every page)", whatsThere: "The bottom-right WhatsApp/Telegram/Messenger/phone buttons and the consent banner text", source: "src/components/site/floating-contact.tsx and consent-banner.tsx, with copy from the `floatingContact` and `consent` name" },
  { path: "SEO — page titles, descriptions, OG/Twitter cards, canonical URLs, noindex (all pages)", whatsThere: "Per-page metadata overrides", source: "Supabase table `seo_page_meta` via getSeoPageMeta() in src/lib/data.ts (only /services/[slug], /technology/[slug] and /c" },
  { path: "/en/[slug] catch-all and /en/preview/*", whatsThere: "A block-based page renderer (hero, stats, timeline, pricing, team grid, FAQ, carousel, ~27 block types in src/components/blocks/)", source: "The OLD cms-platform block API via src/lib/cms.ts (env CMS_API_URL + CMS_TENANT_SLUG) — a DIFFERENT system from the Payl" },
  { path: "Language versions (kh / cn) of every page", whatsThere: "Khmer and Chinese translations of all content", source: "Two parallel mechanisms: Payload's own localized fields (locales en/kh/cn) for CMS content, and the Supabase `content_tr" },
]
