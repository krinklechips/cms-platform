/**
 * SITE PAGES INDEX — the map from "a page on our website" to "the things in
 * this CMS that edit it".
 *
 * Describes the website's CONTENT_SOURCE=payload rendering path, not proof
 * that a deployed live site consumes the CMS. Operational snapshots never
 * drive the contact form or booking system. Keep in sync with page consumers,
 * not just the presence of a collection or data-reader function.
 */

export type PagePart = { collection: string; controls: string }
export type SitePage = { page: string; path: string; parts: PagePart[] }

export const SITE_PAGES: SitePage[] = [
  {
    page: "Home page",
    path: "/en",
    parts: [
      { collection: "homepage", controls: "Hero slide images, anchor position, preserve-full-image option, trust pill and main CTA buttons. Slide captions (eyebrow, headline, subtitle, description and per-slide CTA) appear only when Show captions is enabled for the selected language; off by default. Slide membership, images, order and CTA URLs are shared by all languages. Legacy imageSize is retained but unused." },
      { collection: "brand-logos", controls: "The scrolling logo marquee band directly under the hero (partner/manufacturer logos). Each row = one logo; `order` sets marquee sequence." },
      { collection: "site-stats", controls: "The four count-up numbers band under the marquee. ONLY four keys are read here: years_experience, specialist_dentists, branches_count, patients_treated (see…" },
      { collection: "feature-cards", controls: "The large image \"highlight\" cards below the 6 service icons (title, description, image, link, CTA label)." },
      { collection: "testimonials", controls: "The homepage patient-quote carousel uses author name, title, photo, quote and star rating. It shows explicitly featured quotes when any exist; otherwise it shows all published quotes. The full Patient Testimonials quote wall is not filtered by isFeatured." },
    ],
  },
  {
    page: "Services page",
    path: "/en/services",
    parts: [
      { collection: "services", controls: "Visible overview cards use name, slug, description, image, overview-card tags and shared order. Hidden subservices such as implant-bridges and all-on-4 have no overview card, so their tags are not displayed. Icons, subservice links and navigation hierarchy remain in website code; isFeatured is unsupported and read-only." },
    ],
  },
  {
    page: "Service detail page (one per service, e.g. Dental Implants)",
    path: "/en/services/[slug]",
    parts: [
      { collection: "services", controls: "Service rows also supply detail pages, including subservices hidden from the overview grid. Name, eyebrow, heroDescription (or description), image and localized Page sections control the detail content; legacy content JSON is used only without Page sections. Overview-card tags do not appear here. Shared slug identifies the URL, not the website navigation hierarchy." },
    ],
  },
  {
    page: "Team page",
    path: "/en/team",
    parts: [
      { collection: "site-stats", controls: "The dentist, experience and branch figures use the same exact localized display text as the shared statistics. Language coverage is derived from the doctor's language fields." },
      { collection: "doctors", controls: "Every doctor card in the grid: name, credentials, role, department (the grouping heading the cards sit under), specialty list, languages, bio, short credential…" },
    ],
  },
  {
    page: "Technology page",
    path: "/en/technology",
    parts: [
      { collection: "technology", controls: "Every technology card: name, category label, description, highlight bullets, card image, order, published." },
    ],
  },
  {
    page: "Technology detail page (one per technology, e.g. CAD/CAM)",
    path: "/en/technology/[slug]",
    parts: [
      { collection: "technology", controls: "SAME rows as the /technology grid. The `content` JSON field is the whole detail-page body (text, card grids, steps, embedded YouTube video blocks, image pairs…" },
    ],
  },
  {
    page: "Pricing page",
    path: "/en/pricing",
    parts: [
      { collection: "pricing-categories", controls: "The collapsible section headers on the price list (title + icon name + order)." },
      { collection: "pricing-items", controls: "Every individual price row inside a category: treatment name, price, ADA code, AUS code, footnote." },
    ],
  },
  {
    page: "Implants price comparison page",
    path: "/en/pricing/implants-comparison",
    parts: [
      { collection: "pricing-comparison-sets", controls: "The set whose shared slug is implants-comparison identifies this table and supplies its own exchange rate, localized source note and shared last-updated date. In Payload mode, an empty CMS row list stays empty; bundled price rows are not restored." },
      { collection: "pricing-comparison-rows", controls: "Table rows belonging to the implants-comparison set (treatment, Roomchang price, Australia price and ADA code). Preview follows the row's set relationship, not the main price list." },
    ],
  },
  {
    page: "International patients page",
    path: "/en/international",
    parts: [
      { collection: "international-why-items", controls: "The \"Why choose Roomchang\" card grid in the middle of the page (title + description per card)." },
      { collection: "international-treatments", controls: "The savings rows inside the \"cost comparison\" band below the why-cards (treatment name + savings pill, e.g. \"Dental implant — save 60%\")." },
      { collection: "international-steps", controls: "The numbered \"How it works\" interactive step accordion near the bottom (step label, title, description)." },
    ],
  },
  {
    page: "Full price comparison page",
    path: "/en/international/price-comparison",
    parts: [
      { collection: "pricing-comparison-sets", controls: "The row whose shared slug is exactly full-comparison supplies its own exchange rate, localized source note and shared last-updated date. Each comparison page reads metadata from its own set." },
      { collection: "pricing-comparison-rows", controls: "Every row of the big country-by-country comparison table, filtered to the `full-comparison` set." },
    ],
  },
  {
    page: "Contact page",
    path: "/en/contact",
    parts: [
      { collection: "branches", controls: "TWO things on this page: the \"Preferred branch\" dropdown inside the enquiry form, and the branch info cards below/beside it (name, address, phone, mobile, email…" },
      { collection: "doctors", controls: "Same Doctors rows as the Team page — they populate the searchable \"request a specific doctor\" picker in the enquiry form." },
      { collection: "enquiries", controls: "Read-only snapshot from the last approved import, not the current inbox. Contact-form submissions and read-status changes remain in Supabase and the clinic dashboard; CMS snapshots may be stale and do not write back." },
      { collection: "booking-slots", controls: "Read-only snapshot from the last approved import, not the live date/time picker or booking manager. Availability, bookings and cancellations remain in Supabase and the clinic dashboard; CMS snapshots may be stale and do not write back." },
    ],
  },
  {
    page: "About page (hub)",
    path: "/en/about",
    parts: [
      { collection: "site-stats", controls: "The stats strip near the top of /about reads site_stats by key." },
      { collection: "timeline-events", controls: "The history timeline uses CMS events in Payload mode. Page headings, intro copy and shortcut tiles remain in the website's translation files and code." },
    ],
  },
  {
    page: "Our facilities page",
    path: "/en/about/facilities",
    parts: [
      { collection: "site-stats", controls: "Again the \"Home Page\" → Site Stats collection — only the numbers strip on this page." },
      { collection: "branches", controls: "Branch location cards use getBranchDetails() in Payload mode. Missing branch fields can still fall back to bundled branch content; general facility copy and photo sections remain in website code and translations." },
    ],
  },
  {
    page: "Branch detail page",
    path: "/en/about/branches/[slug]",
    parts: [
      { collection: "branches", controls: "The selected branch's details and photos gallery use getBranchDetails() in Payload mode, with bundled field fallbacks. Images and gallery photos are shared by all languages. Known source identities retain their canonical branch URLs even when the imported CMS slug differs. Other branches use their slug or source ID; unsaved records without either open Contact." },
    ],
  },
  {
    page: "News & events listing",
    path: "/en/about/news",
    parts: [
      { collection: "news-articles", controls: "Every news card in the listing (date, title, description, image + alt) and its `order`/`published`." },
    ],
  },
  {
    page: "News article detail",
    path: "/en/about/news/[slug]",
    parts: [
      { collection: "news-articles", controls: "The full article page — hero image, title, date, and the `body` paragraph array (one row per paragraph). Also drives the prev/next article links at the bottom." },
    ],
  },
  {
    page: "Community & charity listing",
    path: "/en/about/community",
    parts: [
      { collection: "community-articles", controls: "Every card in the community listing (title, description, image, link)." },
    ],
  },
  {
    page: "Community article detail",
    path: "/en/about/community/[slug]",
    parts: [
      { collection: "community-articles", controls: "The full community story — title, date, hero image, `body` paragraphs, plus the `images` array which becomes the photo gallery at the bottom (CommunityGallery)." },
    ],
  },
  {
    page: "Corporate partnerships page",
    path: "/en/about/partnerships",
    parts: [
      { collection: "partner-categories", controls: "The section headings that group the logos (e.g. insurers, embassies, corporates) and their order." },
      { collection: "partners", controls: "Each partner logo tile: name, logo URL, website link, and the `category` relationship that decides which heading it appears under." },
    ],
  },
  {
    page: "Patient testimonials page",
    path: "/en/about/testimonials",
    parts: [
      { collection: "testimonials", controls: "The full wall of all published text quotes, including author name, title and photo. Star ratings appear on the homepage carousel only. The isFeatured flag filters only the homepage carousel when featured quotes exist, not this wall." },
      { collection: "videos", controls: "Published videos whose category is exactly testimonial, with supported YouTube URLs, titles, descriptions and treatment labels. Optional custom posters provide video controls; without a poster, the YouTube iframe is displayed directly. Shared order sets their sequence; other video categories do not appear here." },
    ],
  },
  {
    page: "Clinical results gallery",
    path: "/en/clinical-results",
    parts: [
      { collection: "site-stats", controls: "\"Home Page\" → Site Stats: the small stat tiles above the case grid, looked up by key. Clinical experience and homepage years of experience are separate records." },
      { collection: "clinical-cases", controls: "Every before/after case card: title, canonical categoryKey (filter identity), localized category label, treatment, duration, description, tag and card image." },
    ],
  },
  {
    page: "Clinical case detail",
    path: "/en/clinical-results/[slug]",
    parts: [
      { collection: "clinical-cases", controls: "The full case page — hero, treatment/duration meta, `fullText` write-up, and the `images` JSON array (each entry = one zoomable photo with an optional caption)." },
    ],
  },
  {
    page: "Clinical results by category",
    path: "/en/clinical-results/category/[category]",
    parts: [
      { collection: "clinical-cases", controls: "Same Clinical Cases rows, filtered by canonical categoryKey; category is the localized display label. The category routes remain defined in website code, so adding a new category requires a website change." },
    ],
  },
  {
    page: "FAQ page",
    path: "/en/blog/faq",
    parts: [
      { collection: "faq-items", controls: "Every question/answer accordion row. The `category` field creates the section headings the questions are grouped under." },
    ],
  },
  {
    page: "Publications page",
    path: "/en/blog/publications",
    parts: [
      { collection: "publications", controls: "The publication list uses getPublications() in Payload mode: localized display title (or shared title), authors, journal, year, DOI/link and optional localized abstract. Years are newest first; shared order sorts within each year. Page headings and supporting copy remain in website translations; non-Payload deployments retain the bundled list." },
    ],
  },
  {
    page: "Careers listing and detail pages",
    path: "/en/about/careers",
    parts: [{ collection: "career-positions", controls: "Published positions, employment type, location, full descriptions, ordered requirements and benefits in the selected language. Unpublished or deleted positions do not fall back to bundled jobs in CMS mode." }],
  },
  {
    page: "Dentist Talks page",
    path: "/en/blog/dentist-talks",
    parts: [{ collection: "videos", controls: "Published videos whose category is exactly dentist-talk, with supported YouTube URLs, titles, descriptions, topics, presenters and treatment labels. Optional custom posters provide video controls; without a poster, the YouTube iframe is displayed directly. Shared order sets their sequence. Testimonial videos appear on Patient Testimonials instead; unknown categories have no connected page or preview. The playlist link and page introduction remain in website code." }],
  },
]

/** Website sections not yet rendered from CMS content. Some have collections
 *  and readers already, but their page consumers are still unwired. */
export const UNMODELED_PAGES: { path: string; whatsThere: string; source: string }[] = [
  { path: "/en (home) — the 6-icon service shortcut row between the stats band and the feature cards", whatsThere: "Six fixed shortcut tiles (Implants, Crowns, Aligners, Cosmetic, Whitening, Surgery) with hardcoded hrefs and Phosphor icons.", source: "Hardcoded SERVICES array in src/components/sections/home-services.tsx + labels from the `homeServices` namespa" },
  { path: "/en/about — headings, intro and section shortcuts", whatsThere: "Page headline, intro copy and the section shortcut tiles; the stats band and history timeline are CMS-fed in Payload mode.", source: "messages/*.json (`about.*`) + SECTION_DEFS in src/app/[locale]/about/page.tsx. Timeline events are separate CMS records." },
  { path: "/en/about/vision-mission-values", whatsThere: "Whole page — vision, mission, and the five value cards.", source: "messages/*.json, `visionMission` namespace. No CMS collection at all." },
  { path: "/en/about/director-message", whatsThere: "Whole page — the director's portrait and full letter.", source: "messages/*.json, `directorMessage` namespace + a hardcoded <Image> path. No CMS collection at all." },
  { path: "/en/about/facilities — general copy and facility photo blocks", whatsThere: "General facility copy and facility photo sections, excluding the CMS-fed stat strip and branch location cards.", source: "messages/*.json (`facilities` namespace) + page code. Branch cards use getBranchDetails() in Payload mode with bundled field fallbacks." },
  { path: "/en/blog (blog hub)", whatsThere: "The three-card hub linking to FAQ, Dentist Talks and Publications.", source: "messages/*.json, `blogIndex` namespace. No CMS collection." },
  { path: "/en/pricing/warranty", whatsThere: "The whole warranty page — coverage table, covered/not-covered lists, validity conditions, post-warranty terms, limitation of liability, contact block.", source: "Supabase table `warranty_terms` via getWarrantyTerms() in src/lib/data.ts (English-only, no i18n overlay). The" },
  { path: "/en/privacy-policy, /en/terms-of-service, /en/cookie-policy, /en/disclaimer, /en/booking-cancellation-policy", whatsThere: "All five legal pages, in full.", source: "messages/en.json | km.json | zh.json namespaces `privacyPolicy`, `termsOfService`, `cookiePolicy`, `disclaimer" },
  { path: "Site header / main navigation (every page)", whatsThere: "The whole nav tree including the Services dropdown's 13 links and the Technology dropdown's links, the logo, and the language switcher.", source: "Hardcoded NAV_ITEMS array in src/components/site/site-header.tsx + labels from the `nav`/`header` namespaces i" },
  { path: "Site footer (every page)", whatsThere: "All four footer columns, the social links (Facebook, YouTube, Instagram, Telegram, TikTok, LinkedIn), the legal link row, and the address/phone block.", source: "Hardcoded FOOTER_STRUCTURE, SOCIAL and LEGAL_LINKS arrays in src/components/site/site-footer.tsx + `footer`/`n" },
  { path: "Floating contact widget + cookie/consent banner (every page)", whatsThere: "The bottom-right WhatsApp/Telegram/Messenger/phone buttons and the consent banner text.", source: "src/components/site/floating-contact.tsx and consent-banner.tsx, with copy from the `floatingContact` and `con" },
  { path: "SEO — global/static page metadata", whatsThere: "Static page metadata remains in website code and translations. Custom pages have CMS SEO fields; content-detail metadata follows its selected content source.", source: "getSeoPageMeta() in src/lib/data.ts does not overlay Supabase metadata in CMS mode. Non-CMS deployments retain the legacy seo_page_meta table." },
]
