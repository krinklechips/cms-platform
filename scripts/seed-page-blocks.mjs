#!/usr/bin/env node
/**
 * Seed Roomchang page content blocks.
 * Uses the internal seed endpoint to insert blocks directly.
 *
 * Usage: CMS_URL=https://cms-platform-ap62.onrender.com node scripts/seed-page-blocks.mjs
 */

const BASE = process.env.CMS_URL || 'http://localhost:4100';

// Map page slugs to their content blocks
const PAGE_BLOCKS = {
  home: [
    {
      blockType: 'hero',
      sortOrder: 0,
      blockData: {
        heroTitle: 'A Large Specialist Dental Team',
        heroSubtitle: 'Trusted since 1996 — Cambodia\'s leading dental hospital with 30+ specialist dentists across 5 branches in Phnom Penh.',
        heroImage: '/hero/roomchang-team-hero.jpg',
        ctaText: 'Request An Appointment',
        ctaUrl: '/contact',
      },
    },
    {
      blockType: 'html',
      sortOrder: 1,
      blockData: {
        html: '<div class="stats-band"><div class="stat"><strong>30</strong><span>yrs</span><p>Established Experience</p></div><div class="stat"><strong>30+</strong><p>Specialist Dentists</p></div><div class="stat"><strong>5</strong><p>Phnom Penh Branches</p></div><div class="stat"><strong>20+</strong><p>Countries Served</p></div><div class="stat"><strong>100,000+</strong><p>Patients Served</p></div></div>',
      },
    },
    {
      blockType: 'text',
      sortOrder: 2,
      blockData: {
        content: '<h2>Why Choose Roomchang</h2><p>Roomchang Dental Hospital offers hospital-level dental care across all major specialties. Whether you\'re visiting from Phnom Penh or travelling from overseas, our multilingual team is here to guide you through every step.</p><ul><li><strong>International Patients</strong> — Support for overseas visitors, treatment planning, and a smoother arrival experience for patients coming to Phnom Penh.</li><li><strong>Meet Our Team</strong> — Get a clearer picture of the doctors, specialists, and wider team behind Roomchang\'s hospital-level care model.</li><li><strong>Clear Aligner</strong> — Featured treatment spotlight for discreet alignment options, digital planning, and smile design with clear guidance.</li></ul>',
      },
    },
    {
      blockType: 'testimonials_block',
      sortOrder: 3,
      blockData: {
        testimonialsTitle: 'What Our Patients Say',
        testimonialsLimit: 6,
      },
    },
    {
      blockType: 'cta',
      sortOrder: 4,
      blockData: {
        buttonText: 'Explore All Services',
        buttonUrl: '/services',
      },
    },
  ],

  about: [
    {
      blockType: 'hero',
      sortOrder: 0,
      blockData: {
        heroTitle: 'About Roomchang',
        heroSubtitle: 'Founded in 1996 by a vision to bring specialist dental care to Cambodia, Roomchang has grown into the country\'s most trusted dental group — serving local families and international patients from across Asia, Australia, and beyond.',
        heroImage: '',
        ctaText: '',
        ctaUrl: '',
      },
    },
    {
      blockType: 'text',
      sortOrder: 1,
      blockData: {
        content: '<h2>A Hospital, Not Just a Clinic</h2><p>Roomchang Dental Hospital was built on the belief that Cambodian patients deserved access to the same quality of care available in the most advanced dental centres in the world — without having to travel abroad to get it.</p><p>Over nearly three decades, we\'ve grown from a single practice to a hospital-scale group with five branches across Phnom Penh, an in-house digital laboratory, and a specialist team covering every major dental discipline.</p><p>Today, Roomchang treats thousands of patients every month — from routine checkups to complex full-mouth reconstructions — and serves international visitors from more than 20 countries who choose Cambodia for high-quality, cost-effective dental care.</p><p>Roomchang was the first dental facility in Cambodia to achieve ISO 9001 certification — a standard independently audited by Bureau Veritas under UKAS accreditation.</p>',
      },
    },
    {
      blockType: 'html',
      sortOrder: 2,
      blockData: {
        html: '<div class="stats-band"><div class="stat"><strong>1996</strong><p>Year Established</p></div><div class="stat"><strong>5</strong><p>Phnom Penh Branches</p></div><div class="stat"><strong>30+</strong><p>Specialist Dentists</p></div><div class="stat"><strong>58</strong><p>Dental Chairs</p></div></div>',
      },
    },
    {
      blockType: 'text',
      sortOrder: 3,
      blockData: {
        content: '<h3>Our Facilities</h3><p>A purpose-built, 10-storey dental hospital with 58 chairs, 6 surgical theatres, an in-house CAD/CAM lab, and hospital-grade sterilisation.</p><h3>Vision, Mission &amp; Values</h3><p>Enriching lives with quality dentistry — guided by professionalism, honesty, teamwork, innovation, and excellence.</p><h3>Community &amp; Charity</h3><p>Free dental care for underserved communities — mobile clinics, blood drives, and oral health education across Cambodia.</p><h3>Corporate Partnerships</h3><p>Trusted by 50+ banks, schools, insurers, and organisations to deliver dental benefits for employees and members.</p>',
      },
    },
  ],

  services: [
    {
      blockType: 'hero',
      sortOrder: 0,
      blockData: {
        heroTitle: 'Dental Services',
        heroSubtitle: 'Roomchang offers hospital-level dental care across all major specialties. Whether you\'re visiting from Phnom Penh or travelling from overseas, our multilingual team is here to guide you through every step.',
        heroImage: '',
        ctaText: 'Request a Consultation',
        ctaUrl: '/contact',
      },
    },
    {
      blockType: 'pricing_block',
      sortOrder: 1,
      blockData: {
        pricingTitle: 'Our Services',
        pricingCategory: '',
      },
    },
    {
      blockType: 'cta',
      sortOrder: 2,
      blockData: {
        buttonText: 'Request a Consultation',
        buttonUrl: '/contact',
      },
    },
  ],

  team: [
    {
      blockType: 'hero',
      sortOrder: 0,
      blockData: {
        heroTitle: 'Our Doctors',
        heroSubtitle: 'Roomchang\'s clinical team combines decades of local experience with internationally trained specialists. All consultations are available in your language.',
        heroImage: '',
        ctaText: '',
        ctaUrl: '',
      },
    },
    {
      blockType: 'text',
      sortOrder: 1,
      blockData: {
        content: '<h3>Languages Supported</h3><p>Our team speaks Khmer, English, Mandarin, Japanese, Malay, and French — ensuring clear communication throughout your treatment.</p>',
      },
    },
    {
      blockType: 'cta',
      sortOrder: 2,
      blockData: {
        buttonText: 'Get Matched With a Specialist',
        buttonUrl: '/contact',
      },
    },
  ],

  technology: [
    {
      blockType: 'hero',
      sortOrder: 0,
      blockData: {
        heroTitle: 'Our Technology',
        heroSubtitle: 'Roomchang invests continuously in the tools and systems that make dental care safer, faster, and more precise. From in-house aligner fabrication to 3D surgical planning, technology is at the core of how we work.',
        heroImage: '',
        ctaText: 'Book a Consultation',
        ctaUrl: '/contact',
      },
    },
    {
      blockType: 'text',
      sortOrder: 1,
      blockData: {
        content: '<h3>CA® Clear Aligner System</h3><p>Roomchang\'s proprietary clear aligner brand — designed, planned, and fabricated entirely in-house using digital scanning and 3D printing. Faster turnaround, lower cost, and full clinical control.</p><h3>CAD/CAM Milling</h3><p>In-house digital design and milling for crowns, bridges, and veneers using E-Max and zirconia — completed in hours, not weeks.</p><h3>CBCT 3D Imaging</h3><p>Cone beam computed tomography for precise 3D mapping of bone, nerves, and teeth — critical for implant planning and complex cases.</p><h3>Digital Intraoral Scanning</h3><p>Impression-free scanning for a more comfortable patient experience — instant digital models for aligners, crowns, and treatment planning.</p><h3>Beyond® Whitening</h3><p>Professional in-clinic whitening system — up to 14 shades brighter in a single 45-minute session with no sensitivity.</p><h3>Sterilisation & Infection Control</h3><p>Hospital-grade autoclaving and instrument processing. Every tool individually packaged and sterilised — verified by Tuttnauer systems and ISO protocols.</p>',
      },
    },
    {
      blockType: 'cta',
      sortOrder: 2,
      blockData: {
        buttonText: 'Book a Consultation',
        buttonUrl: '/contact',
      },
    },
  ],

  international: [
    {
      blockType: 'hero',
      sortOrder: 0,
      blockData: {
        heroTitle: 'International Patients',
        heroSubtitle: 'Hundreds of patients travel from Australia, Japan, Singapore, and beyond to receive world-class dental care at Roomchang. We make the process simple, transparent, and as comfortable as possible.',
        heroImage: '',
        ctaText: 'Start Your Treatment Plan',
        ctaUrl: '/contact',
      },
    },
    {
      blockType: 'text',
      sortOrder: 1,
      blockData: {
        content: '<h2>Why Choose Roomchang</h2><ul><li><strong>Significant Cost Savings</strong> — Dental work in Phnom Penh can cost 40–70% less than equivalent treatment in Australia, Singapore, or the UK — without compromising on quality.</li><li><strong>Hospital-Grade Standards</strong> — Roomchang operates to international sterilisation and clinical protocols. Our lab, imaging, and materials meet the same standards you expect at home.</li><li><strong>Multilingual Team</strong> — Our staff speak Khmer, English, Mandarin, Japanese, Malay, and French.</li><li><strong>Flexible Scheduling</strong> — We work around your travel itinerary. Many treatments can be staged across a single trip, with digital follow-up when you return home.</li><li><strong>Digital Records</strong> — All imaging, treatment notes, and records are stored digitally and shared with you so your home dentist can continue your care seamlessly.</li><li><strong>Established Reputation</strong> — Since 1996, Roomchang has treated thousands of international patients from over 20 countries.</li></ul>',
      },
    },
    {
      blockType: 'text',
      sortOrder: 2,
      blockData: {
        content: '<h2>How It Works</h2><ol><li><strong>Send Us Your X-rays or Photos</strong> — Email or WhatsApp your dental records, existing X-rays, or clear photos of your teeth. Our team will review them and provide an initial assessment.</li><li><strong>Receive a Treatment Plan &amp; Quote</strong> — Within 1–2 business days, you\'ll receive a detailed treatment plan with costs, timelines, and what to expect at each visit.</li><li><strong>Book Your Dates</strong> — Once you\'re happy to proceed, we\'ll schedule your appointments around your travel dates and confirm everything in writing.</li><li><strong>Arrive — We Handle the Rest</strong> — Our team can assist with airport directions, accommodation recommendations near our clinic, and a warm welcome on arrival.</li><li><strong>Treatment &amp; Follow-up</strong> — Receive your treatment in a modern, hospital-standard facility. We\'ll provide digital records and a full report for your home dentist.</li></ol>',
      },
    },
    {
      blockType: 'cta',
      sortOrder: 3,
      blockData: {
        buttonText: 'Request a Free Plan',
        buttonUrl: '/contact',
      },
    },
  ],

  pricing: [
    {
      blockType: 'hero',
      sortOrder: 0,
      blockData: {
        heroTitle: 'Treatment Prices',
        heroSubtitle: 'We believe in clear, upfront pricing — no hidden fees. All prices below are in USD and reflect actual treatment costs. Your exact quote will be confirmed after consultation and X-rays.',
        heroImage: '',
        ctaText: 'Get a Personalised Quote',
        ctaUrl: '/contact',
      },
    },
    {
      blockType: 'pricing_block',
      sortOrder: 1,
      blockData: {
        pricingTitle: 'Treatment Pricing',
        pricingCategory: '',
      },
    },
    {
      blockType: 'text',
      sortOrder: 2,
      blockData: {
        content: '<p><em>All prices in USD. Final pricing confirmed after clinical assessment. Prices subject to change — please contact us for the latest quote.</em></p>',
      },
    },
    {
      blockType: 'cta',
      sortOrder: 3,
      blockData: {
        buttonText: 'Request a Free Quote',
        buttonUrl: '/contact',
      },
    },
  ],

  'clinical-results': [
    {
      blockType: 'hero',
      sortOrder: 0,
      blockData: {
        heroTitle: 'Clinical Results',
        heroSubtitle: 'A selection of cases from Roomchang\'s clinical team — covering implants, orthodontics, full mouth reconstructions, and cosmetic transformations. All cases are documented with clinical notes, photos, and patient consent.',
        heroImage: '',
        ctaText: 'Book a Consultation',
        ctaUrl: '/contact',
      },
    },
    {
      blockType: 'html',
      sortOrder: 1,
      blockData: {
        html: '<div class="stats-band"><div class="stat"><strong>10,000+</strong><p>Patients per month</p></div><div class="stat"><strong>20+</strong><p>Countries served</p></div><div class="stat"><strong>28</strong><span>yrs</span><p>Clinical experience</p></div><div class="stat"><strong>30+</strong><p>Specialist dentists</p></div></div>',
      },
    },
    {
      blockType: 'text',
      sortOrder: 2,
      blockData: {
        content: '<p><em>Patient images and full case photography available upon request in clinic. Cases shown with patient consent. Individual results may vary depending on oral health, bone density, and treatment complexity.</em></p>',
      },
    },
    {
      blockType: 'cta',
      sortOrder: 3,
      blockData: {
        buttonText: 'Book a Consultation',
        buttonUrl: '/contact',
      },
    },
  ],

  contact: [
    {
      blockType: 'hero',
      sortOrder: 0,
      blockData: {
        heroTitle: 'Contact & Appointments',
        heroSubtitle: 'Fill in the form and one of our team will be in touch within one business day. For urgent enquiries, call us directly — we have a 24/7 line.',
        heroImage: '',
        ctaText: '',
        ctaUrl: '',
      },
    },
    {
      blockType: 'text',
      sortOrder: 1,
      blockData: {
        content: '<h3>Contact Methods</h3><ul><li><strong>Phone:</strong> +855 23 211 338</li><li><strong>Mobile (24/7):</strong> +855 11 811 338</li><li><strong>Email:</strong> contact@roomchang.com</li></ul><h3>Messaging</h3><ul><li><strong>WhatsApp:</strong> +855 69 811 338</li><li><strong>Telegram:</strong> @roomchang</li><li><strong>Facebook Messenger:</strong> roomchangdental</li></ul>',
      },
    },
  ],
};

// ── Seed endpoint for blocks ─────────────────────────────────────

async function seed() {
  console.log('Roomchang Page Content Seeder');
  console.log(`Target: ${BASE}`);
  console.log('');

  // First, get all pages to map slugs to IDs
  const pagesRes = await fetch(`${BASE}/api/public/pages?tenantSlug=roomchang`);
  const pagesData = await pagesRes.json();

  if (!pagesData.items) {
    console.error('Failed to fetch pages:', pagesData);
    return;
  }

  // Flatten page tree
  const allPages = [];
  function flatten(items) {
    for (const item of items) {
      allPages.push(item);
      if (item.children) flatten(item.children);
    }
  }
  flatten(pagesData.items);

  console.log(`Found ${allPages.length} pages`);

  // Seed blocks for each page
  let totalBlocks = 0;
  for (const [slug, blocks] of Object.entries(PAGE_BLOCKS)) {
    const page = allPages.find((p) => p.slug === slug);
    if (!page) {
      console.log(`  Skip "${slug}" — page not found`);
      continue;
    }

    // Check if page already has blocks
    const existingRes = await fetch(`${BASE}/api/public/pages/${slug}?tenantSlug=roomchang`);
    const existingData = await existingRes.json();
    if (existingData.page?.blocks?.length > 0) {
      console.log(`  Skip "${slug}" — already has ${existingData.page.blocks.length} blocks`);
      continue;
    }

    console.log(`  Seeding "${slug}" (${blocks.length} blocks)...`);

    // Use internal seed endpoint for blocks
    const res = await fetch(`${BASE}/api/internal/seed-blocks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantSlug: 'roomchang',
        pageId: page.id,
        blocks,
      }),
    });

    const result = await res.json();
    if (res.ok) {
      totalBlocks += result.inserted || 0;
      console.log(`    -> ${result.inserted} blocks inserted`);
    } else {
      console.error(`    -> Error: ${result.error}`);
    }
  }

  console.log('');
  console.log(`Done! ${totalBlocks} total blocks seeded.`);
}

seed().catch(console.error);
