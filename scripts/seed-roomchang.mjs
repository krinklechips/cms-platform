#!/usr/bin/env node
/**
 * Seed Roomchang tenant data into the CMS platform.
 *
 * Usage:
 *   node scripts/seed-roomchang.mjs
 *
 * Prerequisites:
 *   - Roomchang tenant must exist (slug: roomchang)
 *   - You must be logged into the platform admin (session cookie)
 *   - CMS must be running (production or local)
 *
 * This script uses the platform admin API to find the tenant,
 * then seeds data directly into the database via a custom
 * platform-level seed endpoint.
 *
 * Since we can't easily authenticate via script to the tenant API,
 * we'll add a temporary platform-level seed endpoint instead.
 */

const BASE = process.env.CMS_URL || 'http://localhost:4100';

// ── Services ──────────────────────────────────────────────────────
const SERVICES = [
  {
    name: "Dental Implants",
    slug: "dental-implants",
    description: "Permanent tooth replacement using titanium implants. Single implants, implant bridges, and All-on-4, 6 & 8 full-arch solutions available.",
    category: "Implants & Reconstruction",
    features: ["Single Implant", "Implant Bridge", "All-on-4", "All-on-6", "All-on-8"],
    isFeatured: true,
    sortOrder: 1,
  },
  {
    name: "Crowns & Bridges",
    slug: "dental-crowns",
    description: "High-strength E-Max and zirconia crowns with digital design and in-house milling for precision fit and natural appearance.",
    category: "Restorative",
    features: ["E-Max Crown", "Zirconia", "CAD/CAM Milled"],
    isFeatured: true,
    sortOrder: 2,
  },
  {
    name: "Orthodontics",
    slug: "orthodontics",
    description: "Straighten teeth discreetly with our CA® Clear Aligner, Invisalign, or traditional metal and ceramic braces.",
    category: "Orthodontics",
    features: ["CA® Clear Aligner", "Invisalign", "Metal Braces", "Ceramic Braces"],
    isFeatured: true,
    sortOrder: 3,
  },
  {
    name: "Cosmetic Dentistry",
    slug: "cosmetic-dentistry",
    description: "Transform your smile with porcelain veneers, teeth whitening, smile design, and aesthetic composite bonding.",
    category: "Cosmetic",
    features: ["Veneers", "Teeth Whitening", "Smile Design", "Bonding"],
    isFeatured: true,
    sortOrder: 4,
  },
  {
    name: "Full Mouth Reconstruction",
    slug: "full-mouth-reconstruction",
    description: "Comprehensive treatment planning for patients who need to restore or rebuild the entire mouth using a combination of advanced techniques.",
    category: "Implants & Reconstruction",
    features: ["Full Arch", "Combined Treatment", "Digital Planning"],
    isFeatured: true,
    sortOrder: 5,
  },
  {
    name: "Oral Surgery",
    slug: "oral-surgery",
    description: "Wisdom tooth extraction, bone grafting, sinus lifts, and other surgical procedures performed by our specialist oral surgeons.",
    category: "Surgery",
    features: ["Wisdom Tooth", "Bone Graft", "Sinus Lift", "Extraction"],
    sortOrder: 6,
  },
  {
    name: "Pediatric Dentistry",
    slug: "pediatric-dentistry",
    description: "Child-friendly dental care from infancy through adolescence. Preventive care, fillings, sealants, and early orthodontic assessment.",
    category: "Pediatric",
    features: ["Children", "Preventive", "Sealants", "Early Orthodontics"],
    sortOrder: 7,
  },
  {
    name: "Sleep Apnea & Snoring",
    slug: "sleep-apnea",
    description: "Non-surgical oral appliance therapy and splints to reduce snoring and treat mild-to-moderate obstructive sleep apnea.",
    category: "Specialist",
    features: ["Oral Appliance", "Sleep Splint", "Non-surgical"],
    sortOrder: 8,
  },
  {
    name: "Teeth Whitening",
    slug: "teeth-whitening",
    description: "Professional in-clinic whitening using Beyond® technology — up to 14 shades brighter in a single session.",
    category: "Cosmetic",
    features: ["Beyond® Whitening", "In-Clinic", "Single Session"],
    sortOrder: 9,
  },
];

// ── Testimonials ──────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    authorName: "Russell T.",
    authorTitle: "Melbourne, Australia — Full Mouth Reconstruction",
    quote: "I flew from Melbourne specifically for Roomchang. The full mouth reconstruction they did for me would have cost five times as much at home. The team was professional, warm, and communicated brilliantly throughout.",
    rating: 5,
    isFeatured: true,
    sortOrder: 1,
  },
  {
    authorName: "Keiko M.",
    authorTitle: "Osaka, Japan — Dental Implants",
    quote: "I was nervous about getting implants abroad, but the team put me completely at ease. The digital planning process was incredibly thorough and the result is perfect. I wouldn't hesitate to return.",
    rating: 5,
    isFeatured: true,
    sortOrder: 2,
  },
  {
    authorName: "Sarah L.",
    authorTitle: "Singapore — CA® Clear Aligner",
    quote: "My clear aligners were designed and made on-site — the turnaround was so much faster than I expected. The doctors took time to explain every stage. I'm so happy with my smile now.",
    rating: 5,
    isFeatured: true,
    sortOrder: 3,
  },
  {
    authorName: "David K.",
    authorTitle: "Perth, Australia — All-on-4 Implants",
    quote: "Exceptional care from start to finish. The clinic is spotless, the technology is impressive, and the price is genuinely hard to believe for the quality you get. I've already recommended Roomchang to three friends.",
    rating: 5,
    isFeatured: true,
    sortOrder: 4,
  },
];

// ── Team Members ──────────────────────────────────────────────────
const TEAM_MEMBERS = [
  {
    name: "Dr. Tith Hong Yoeu",
    title: "DDS, MSc. — Founder & Director",
    department: "Leadership",
    bio: "MSc. in Oral Implantology from Goethe University Frankfurt, Germany. Founded Roomchang in 1996 with the vision of bringing world-class dental care to Cambodia.",
    sortOrder: 1,
  },
  {
    name: "Dr. Lim Bunheng",
    title: "DDS — Orthodontist",
    department: "Orthodontics",
    bio: "Specialist in clear aligner therapy and traditional braces. Certified Invisalign provider and CA® Clear Aligner specialist.",
    sortOrder: 2,
  },
  {
    name: "Dr. Seng Sopheaktra",
    title: "DDS — Prosthodontist",
    department: "Prosthodontics",
    bio: "Expert in full-mouth reconstruction, implant-supported prosthetics, and digital smile design using CAD/CAM technology.",
    sortOrder: 3,
  },
  {
    name: "Dr. Chea Chanrath",
    title: "DDS — Oral Surgeon",
    department: "Oral Surgery",
    bio: "Specialist in dental implant placement, wisdom tooth extraction, bone grafting, and sinus lift procedures.",
    sortOrder: 4,
  },
  {
    name: "Dr. Keo Sokchea",
    title: "DDS — Endodontist",
    department: "Endodontics",
    bio: "Root canal specialist with advanced training in microscope-assisted endodontics and retreatment procedures.",
    sortOrder: 5,
  },
  {
    name: "Dr. Nhem Sothea",
    title: "DDS — Cosmetic Dentist",
    department: "Cosmetic Dentistry",
    bio: "Specialist in porcelain veneers, smile makeovers, and Beyond® professional whitening treatments.",
    sortOrder: 6,
  },
  {
    name: "Dr. Phan Sokunthea",
    title: "DDS — Pediatric Dentist",
    department: "Pediatric Dentistry",
    bio: "Dedicated to child-friendly dental care from infancy through adolescence. Preventive care, sealants, and early orthodontic screening.",
    sortOrder: 7,
  },
  {
    name: "Dr. Heng Kimhour",
    title: "DDS — Periodontist",
    department: "Periodontics",
    bio: "Specialist in gum disease treatment, crown lengthening, and soft tissue management for implant cases.",
    sortOrder: 8,
  },
];

// ── Pages (Website Structure) ────────────────────────────────────
const PAGES = [
  {
    title: 'Home',
    slug: 'home',
    status: 'published',
    template: 'home',
    sortOrder: 0,
    showInNav: true,
    navLabel: 'Home',
    seoTitle: 'Roomchang Dental Hospital — International Dental Care in Cambodia',
    seoDescription: 'Cambodia\'s leading international dental hospital. World-class implants, orthodontics, cosmetic dentistry, and full mouth reconstruction at affordable prices.',
  },
  {
    title: 'Services',
    slug: 'services',
    status: 'published',
    template: 'default',
    sortOrder: 1,
    showInNav: true,
    navLabel: 'Services',
    seoTitle: 'Dental Services — Roomchang Dental Hospital',
    seoDescription: 'Full range of dental services: implants, crowns, orthodontics, cosmetic dentistry, oral surgery, pediatric care, and more.',
  },
  // Sub-service pages under Services
  {
    title: 'Dental Implants',
    slug: 'services/dental-implants',
    status: 'published',
    template: 'service-detail',
    sortOrder: 0,
    showInNav: true,
    navLabel: 'Dental Implants',
    parentSlug: 'services',
    seoTitle: 'Dental Implants — Roomchang Dental Hospital',
    seoDescription: 'Permanent tooth replacement with titanium implants. Single implants, implant bridges, and All-on-4/6/8 full-arch solutions.',
  },
  {
    title: 'Crowns & Bridges',
    slug: 'services/dental-crowns',
    status: 'published',
    template: 'service-detail',
    sortOrder: 1,
    showInNav: true,
    navLabel: 'Crowns & Bridges',
    parentSlug: 'services',
    seoTitle: 'Dental Crowns & Bridges — Roomchang Dental Hospital',
    seoDescription: 'High-strength E-Max and zirconia crowns with digital design and in-house CAD/CAM milling.',
  },
  {
    title: 'Orthodontics',
    slug: 'services/orthodontics',
    status: 'published',
    template: 'service-detail',
    sortOrder: 2,
    showInNav: true,
    navLabel: 'Orthodontics',
    parentSlug: 'services',
    seoTitle: 'Orthodontics — Roomchang Dental Hospital',
    seoDescription: 'Clear aligners, Invisalign, metal and ceramic braces for all ages.',
  },
  {
    title: 'Cosmetic Dentistry',
    slug: 'services/cosmetic-dentistry',
    status: 'published',
    template: 'service-detail',
    sortOrder: 3,
    showInNav: true,
    navLabel: 'Cosmetic Dentistry',
    parentSlug: 'services',
    seoTitle: 'Cosmetic Dentistry — Roomchang Dental Hospital',
    seoDescription: 'Veneers, teeth whitening, smile design, and aesthetic bonding.',
  },
  {
    title: 'Full Mouth Reconstruction',
    slug: 'services/full-mouth-reconstruction',
    status: 'published',
    template: 'service-detail',
    sortOrder: 4,
    showInNav: true,
    navLabel: 'Full Mouth Reconstruction',
    parentSlug: 'services',
    seoTitle: 'Full Mouth Reconstruction — Roomchang Dental Hospital',
    seoDescription: 'Comprehensive treatment planning for complete mouth restoration using advanced techniques.',
  },
  {
    title: 'Oral Surgery',
    slug: 'services/oral-surgery',
    status: 'published',
    template: 'service-detail',
    sortOrder: 5,
    showInNav: true,
    navLabel: 'Oral Surgery',
    parentSlug: 'services',
    seoTitle: 'Oral Surgery — Roomchang Dental Hospital',
    seoDescription: 'Wisdom tooth extraction, bone grafting, sinus lifts, and surgical procedures.',
  },
  {
    title: 'Pediatric Dentistry',
    slug: 'services/pediatric-dentistry',
    status: 'published',
    template: 'service-detail',
    sortOrder: 6,
    showInNav: true,
    navLabel: 'Pediatric Dentistry',
    parentSlug: 'services',
    seoTitle: 'Pediatric Dentistry — Roomchang Dental Hospital',
    seoDescription: 'Child-friendly dental care from infancy through adolescence.',
  },
  {
    title: 'Sleep Apnea & Snoring',
    slug: 'services/sleep-apnea',
    status: 'published',
    template: 'service-detail',
    sortOrder: 7,
    showInNav: true,
    navLabel: 'Sleep Apnea',
    parentSlug: 'services',
    seoTitle: 'Sleep Apnea Treatment — Roomchang Dental Hospital',
    seoDescription: 'Non-surgical oral appliance therapy for snoring and obstructive sleep apnea.',
  },
  {
    title: 'Teeth Whitening',
    slug: 'services/teeth-whitening',
    status: 'published',
    template: 'service-detail',
    sortOrder: 8,
    showInNav: true,
    navLabel: 'Teeth Whitening',
    parentSlug: 'services',
    seoTitle: 'Professional Teeth Whitening — Roomchang Dental Hospital',
    seoDescription: 'Beyond professional whitening — up to 14 shades brighter in a single session.',
  },
  // Top-level pages
  {
    title: 'About',
    slug: 'about',
    status: 'published',
    template: 'default',
    sortOrder: 2,
    showInNav: true,
    navLabel: 'About',
    seoTitle: 'About Roomchang Dental Hospital',
    seoDescription: 'Founded in 1996, Roomchang is Cambodia\'s leading international dental hospital with 6 branches and 40+ dentists.',
  },
  {
    title: 'Our Team',
    slug: 'team',
    status: 'published',
    template: 'default',
    sortOrder: 3,
    showInNav: true,
    navLabel: 'Our Team',
    seoTitle: 'Our Dental Team — Roomchang Dental Hospital',
    seoDescription: 'Meet our team of 40+ specialist dentists and support staff.',
  },
  {
    title: 'Technology',
    slug: 'technology',
    status: 'published',
    template: 'default',
    sortOrder: 4,
    showInNav: true,
    navLabel: 'Technology',
    seoTitle: 'Dental Technology — Roomchang Dental Hospital',
    seoDescription: 'CBCT imaging, CAD/CAM milling, digital smile design, and in-house dental lab.',
  },
  {
    title: 'International Patients',
    slug: 'international',
    status: 'published',
    template: 'default',
    sortOrder: 5,
    showInNav: true,
    navLabel: 'International Patients',
    seoTitle: 'International Patients — Roomchang Dental Hospital',
    seoDescription: 'Dental tourism in Cambodia. Cost comparison, treatment planning, and patient coordination for international visitors.',
  },
  {
    title: 'Pricing',
    slug: 'pricing',
    status: 'published',
    template: 'default',
    sortOrder: 6,
    showInNav: true,
    navLabel: 'Pricing',
    seoTitle: 'Dental Pricing — Roomchang Dental Hospital',
    seoDescription: 'Transparent pricing for all dental treatments. Compare with international rates.',
  },
  {
    title: 'Clinical Results',
    slug: 'clinical-results',
    status: 'published',
    template: 'default',
    sortOrder: 7,
    showInNav: true,
    navLabel: 'Clinical Results',
    seoTitle: 'Clinical Results & Case Gallery — Roomchang Dental Hospital',
    seoDescription: 'Before and after dental treatment photos showcasing our clinical results.',
  },
  {
    title: 'Contact',
    slug: 'contact',
    status: 'published',
    template: 'default',
    sortOrder: 8,
    showInNav: true,
    navLabel: 'Contact',
    seoTitle: 'Contact Roomchang Dental Hospital',
    seoDescription: 'Book an appointment or enquire about treatment. 6 branches across Phnom Penh and Siem Reap.',
  },
];

// ── Main ──────────────────────────────────────────────────────────

console.log('Roomchang CMS Seed Script');
console.log(`   Target: ${BASE}`);
console.log('');

console.log('Data to seed:');
console.log(`   ${PAGES.length} pages`);
console.log('');

async function seed() {
  const payload = {
    tenantSlug: 'roomchang',
    pages: PAGES,
  };

  console.log('Seeding pages...');

  const res = await fetch(`${BASE}/api/platform/seed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (res.ok) {
    console.log('Seed complete!');
    console.log(`   Pages: ${data.pages ?? 0}`);
  } else {
    console.error('Seed failed:', data.error || res.statusText);
  }
}

seed().catch(console.error);
