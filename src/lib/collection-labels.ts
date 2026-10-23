import type { CollectionConfig } from 'payload'

/**
 * HUMAN LABELS — what the editor sees in the sidebar and at the top of a list.
 *
 * The collection slugs are database names ('international-why-items',
 * 'pricing-comparison-rows'), which told a clinic editor nothing about which
 * part of which page they edit. Each entry below renames the collection after
 * the thing it controls ON THE LIVE SITE and adds a one-line description shown
 * under the list heading.
 *
 * Applied centrally by withHumanLabels() in payload.config.ts so the 33
 * collection files stay untouched — one place to edit the wording.
 */
type LabelEntry = { singular: string; plural: string; description: string }

export const COLLECTION_LABELS: Record<string, LabelEntry> = {
  'pages': {
    singular: "Page",
    plural: "Custom Pages",
    description:
      "Extra website pages you create yourself — title, sections, publish. Live at roomchang.com/en/<web address>.",
  },
  'homepage': {
    singular: "Home Hero",
    plural: "Home Hero",
    description:
      "The home page banner: shared slide images and order, the trust pill and main buttons. Slide captions and per-slide buttons are optional, off by default, and enabled per selected language.",
  },
  'brand-logos': {
    singular: "Logo Strip Item",
    plural: "Logo Strip",
    description:
      "The grey band of partner logos that scrolls sideways directly under the home page hero.",
  },
  'site-stats': {
    singular: "Website Statistic",
    plural: "Stats Band",
    description:
      "Statistics for Home page, Our Team, About Roomchang, Our Facilities and Clinical Results.",
  },
  'feature-cards': {
    singular: "Highlight Card",
    plural: "Highlight Cards",
    description:
      "The three large picture cards near the bottom of the home page — photo, heading, blurb and the link button on each.",
  },
  'testimonials': {
    singular: "Patient Testimonial",
    plural: "Patient Testimonials",
    description:
      "Patient quotes and author photos, with star ratings on the homepage carousel. The homepage shows featured quotes when any exist, otherwise all published quotes; Patient Testimonials always includes all published quotes.",
  },
  'services': {
    singular: "Service",
    plural: "Services",
    description:
      "Service detail pages and visible Services overview cards. Hidden subservices have no overview card; the navigation hierarchy stays in website code.",
  },
  'doctors': {
    singular: "Doctor",
    plural: "Doctors",
    description:
      "The dentist profiles shown on the Our Team page and in the doctor picker on the Contact form.",
  },
  'technology': {
    singular: "Technology",
    plural: "Technology & Equipment",
    description:
      "Every item in the Technology menu — its card on the Technology page and its own detail page.",
  },
  'pricing-categories': {
    singular: "Price List Section",
    plural: "Price List Sections",
    description:
      "The headed groups on the Treatment Prices page (Implants, Crowns, Orthodontics…), their icons and the order they appear in.",
  },
  'pricing-items': {
    singular: "Price List Row",
    plural: "Price List Rows",
    description:
      "Each treatment line inside a Treatment Prices section — the name, the USD price and the small note underneath.",
  },
  'pricing-comparison-sets': {
    singular: "Comparison Table",
    plural: "Comparison Tables",
    description:
      "Identifies each comparison table through its shared slug and row relationships. Both comparison pages use their own set's exchange rate, localized source note and shared last-updated date.",
  },
  'pricing-comparison-rows': {
    singular: "Comparison Row",
    plural: "Comparison Table Rows",
    description:
      "One treatment line inside a comparison table — the Roomchang, Australia and Singapore prices shown side by side.",
  },
  'international-why-items': {
    singular: "Why-Choose Card",
    plural: "Why Choose Roomchang",
    description:
      "The cards under the \"Why Choose Roomchang?\" heading, the first section on the International Patients page.",
  },
  'international-treatments': {
    singular: "Cost Comparison Row",
    plural: "Cost Comparison",
    description:
      "The treatment-and-saving lines inside the \"Cost Comparison\" panel in the middle of the International Patients page.",
  },
  'international-steps': {
    singular: "How-It-Works Step",
    plural: "How It Works Steps",
    description:
      "The numbered steps under \"How It Works\" near the bottom of the International Patients page.",
  },
  'timeline-events': {
    singular: "Timeline Milestone",
    plural: "Our Story Timeline",
    description:
      "The year-by-year story that scrolls down the middle of the About Roomchang page — year, heading, paragraph and photo.",
  },
  'news-articles': {
    singular: "News Article",
    plural: "News & Events Articles",
    description:
      "The articles listed on About → News & Events and the full article page each one opens.",
  },
  'community-articles': {
    singular: "Community Story",
    plural: "Roomchang in the Community",
    description:
      "The charity and outreach stories on About → Roomchang in the Community and the detail page behind each one.",
  },
  'publications': {
    singular: "Publication",
    plural: "Publications & Research",
    description:
      "Papers and optional localized abstracts on Publication & Research. Years are newest first; shared order sorts papers within each year.",
  },
  'videos': {
    singular: "Video",
    plural: "Videos",
    description:
      "Video cards on Dentist Talks (category dentist-talk) and Patient Testimonials (category testimonial). Other categories have no connected website page or preview.",
  },
  'faq-items': {
    singular: "FAQ",
    plural: "FAQ Page Questions",
    description:
      "The question-and-answer list on the Frequently Asked Questions page, grouped under whatever category you type on each one.",
  },
  'partner-categories': {
    singular: "Partner Group",
    plural: "Partner Groups",
    description:
      "The headed sections on the Corporate Partnerships page — Banks, International Schools, Insurance and so on — and the order they run in.",
  },
  'partners': {
    singular: "Partner",
    plural: "Partner Logos",
    description:
      "Each partner logo tile on the Corporate Partnerships page and which group section it sits inside.",
  },
  'career-positions': {
    singular: "Job Opening",
    plural: "Job Openings",
    description:
      "Vacancies on About → Employment Opportunities, including employment type, location, descriptions, requirements and benefits on each opening's page.",
  },
  'branches': {
    singular: "Branch",
    plural: "Branches",
    description:
      "Branch details on Contact, facility location cards and branch detail pages, including their shared photo galleries. General Facilities photo sections stay in website code.",
  },
  'clinical-cases': {
    singular: "Clinical Case",
    plural: "Before & After Cases",
    description:
      "The before-and-after cases on the Clinical Results page and the full case page each card opens.",
  },
  'media': {
    singular: "Image or File",
    plural: "Images & Files",
    description:
      "Every photo and file you upload for use elsewhere on the site — upload here first, then pick the image from the page you are editing.",
  },
  'enquiries': {
    singular: "Enquiry",
    plural: "Website Enquiries",
    description:
      "Messages patients sent through the Contact page form — a read-only inbox; nothing here is published on the website.",
  },
  'booking-slots': {
    singular: "Appointment Slot",
    plural: "Appointment Bookings",
    description:
      "Appointment requests made through the online booking widget — a read-only list; nothing here is published on the website.",
  },
  'users': {
    singular: "User",
    plural: "CMS Logins",
    description:
      "Who can sign in to this CMS and what they are allowed to edit — changes nothing on the public website.",
  },
  'tenants': {
    singular: "Customer Site",
    plural: "Customer Sites",
    description:
      "Each customer whose website this CMS runs — their domains, logo, and which modules they subscribe to.",
  },
  'modules': {
    singular: "Module",
    plural: "Modules",
    description:
      "The feature catalogue sold to customers; a module decides which page groups show up in that customer's sidebar.",
  },
  'invoices': {
    singular: "Invoice",
    plural: "Invoices",
    description:
      "Monthly bills built from a customer's active module subscriptions — internal billing only, never shown on any website.",
  },
}

/** sourceId is sync plumbing (Supabase upsert key) — 27 collections carry it
 *  in the edit sidebar, where it read as jargon to clinic editors (UX audit).
 *  Hide it from everyone but super-admins; hidden condition fields keep their
 *  stored value on save. Recurses because some collections nest fields in
 *  tabs/rows. */
type AnyField = { name?: string; admin?: Record<string, unknown>; fields?: AnyField[]; tabs?: { fields: AnyField[] }[] }

const hideSourceIdFromTenants = (fields: AnyField[]): AnyField[] =>
  fields.map((f) => {
    if (f.name === 'sourceId') {
      return {
        ...f,
        admin: {
          ...f.admin,
          condition: (_data: unknown, _sibling: unknown, ctx: { user?: { roles?: string[] } | null }) =>
            Boolean(ctx?.user?.roles?.includes('super-admin')),
        },
      }
    }
    if (Array.isArray(f.fields)) return { ...f, fields: hideSourceIdFromTenants(f.fields) }
    if (Array.isArray(f.tabs))
      return { ...f, tabs: f.tabs.map((t) => ({ ...t, fields: hideSourceIdFromTenants(t.fields) })) }
    return f
  })

/** Apply the human label + description for this collection, if we have one. */
export const withHumanLabels = (config: CollectionConfig): CollectionConfig => {
  const entry = COLLECTION_LABELS[config.slug]
  const fields = Array.isArray(config.fields)
    ? (hideSourceIdFromTenants(config.fields as AnyField[]) as CollectionConfig['fields'])
    : config.fields
  if (!entry) return { ...config, fields }
  return {
    ...config,
    fields,
    labels: { singular: entry.singular, plural: entry.plural },
    admin: {
      ...config.admin,
      // Keep any hand-written description; otherwise use the page-oriented one.
      description: config.admin?.description ?? entry.description,
    },
  }
}
