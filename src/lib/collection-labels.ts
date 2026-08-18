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
  'homepage': {
    singular: "Home Hero",
    plural: "Home Hero",
    description:
      "The big rotating banner at the very top of the home page — its slides, the small badge on the left, and the buttons over the image.",
  },
  'brand-logos': {
    singular: "Logo Strip Item",
    plural: "Logo Strip",
    description:
      "The grey band of partner logos that scrolls sideways directly under the home page hero.",
  },
  'site-stats': {
    singular: "Stat",
    plural: "Stats Band",
    description:
      "The row of big numbers under the logo strip on the home page — the same figures also appear on About Roomchang, Our Facilities and Clinical Results.",
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
      "The patient quotes in the carousel at the foot of the home page and the full list on the Patient Testimonials page.",
  },
  'services': {
    singular: "Service",
    plural: "Services",
    description:
      "Every treatment in the Services menu — its card on the Services page and the whole of its own detail page.",
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
      "The two price-comparison tables as a whole — the exchange rate and the source note printed under the International Price Comparison and Dental Implants Price Comparison pages.",
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
      "The peer-reviewed papers listed on the Publication & Research page under the Education Blog.",
  },
  'videos': {
    singular: "Video",
    plural: "Dentist Talks Videos",
    description:
      "The video cards on the Dentist Talks page — title, thumbnail and the YouTube link each card opens.",
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
      "The vacancies listed on About → Employment Opportunities, plus the requirements and benefits shown on each opening's own page.",
  },
  'branches': {
    singular: "Branch",
    plural: "Branches",
    description:
      "The branch panels on the Contact page — address, phone, opening hours, photo and map link for each location.",
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

/** Apply the human label + description for this collection, if we have one. */
export const withHumanLabels = (config: CollectionConfig): CollectionConfig => {
  const entry = COLLECTION_LABELS[config.slug]
  if (!entry) return config
  return {
    ...config,
    labels: { singular: entry.singular, plural: entry.plural },
    admin: {
      ...config.admin,
      // Keep any hand-written description; otherwise use the page-oriented one.
      description: config.admin?.description ?? entry.description,
    },
  }
}
