'use client'

import React from 'react'

/**
 * "Open content" dropdown on each HQ cockpit tenant row: pick a content area
 * → the multi-tenant selector cookie is set to that tenant and the collection
 * list opens, already scoped. (Cleaner than a wall of buttons — per Enoch.)
 */

const LABELS: Record<string, string> = {
  homepage: 'Homepage (Hero)',
  'site-stats': 'Site Stats',
  'feature-cards': 'Feature Cards',
  'brand-logos': 'Brand Logos',
  testimonials: 'Testimonials',
  services: 'Services',
  doctors: 'Doctors',
  technology: 'Technology',
  'pricing-categories': 'Pricing Categories',
  'pricing-items': 'Pricing Items',
  'pricing-comparison-sets': 'Price Comparison Sets',
  'pricing-comparison-rows': 'Price Comparison Rows',
  'international-treatments': 'International Treatments',
  'international-steps': 'International Steps',
  'international-why-items': 'International Why Items',
  'timeline-events': 'Timeline',
  branches: 'Branches',
  'clinical-cases': 'Clinical Cases',
  partners: 'Partners',
  'partner-categories': 'Partner Categories',
  'faq-items': 'FAQs',
  'news-articles': 'News Articles',
  'community-articles': 'Community Articles',
  publications: 'Publications',
  videos: 'Videos',
  'career-positions': 'Career Positions',
  enquiries: 'Enquiries Inbox',
  'booking-slots': 'Booking Slots',
  media: 'Media Library',
}

const label = (slug: string): string =>
  LABELS[slug] ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

export const OpenTenantContent: React.FC<{
  tenantId: number | string
  collections: string[]
}> = ({ tenantId, collections }) => {
  const all = [...collections, 'media']

  if (!collections.length) {
    return <span style={{ color: 'var(--theme-elevation-400)', fontSize: 12 }}>no modules</span>
  }

  return (
    <select
      defaultValue=""
      style={{
        padding: '4px 8px',
        borderRadius: 6,
        border: '1px solid var(--theme-elevation-200)',
        background: 'var(--theme-input-bg, var(--theme-elevation-0))',
        color: 'var(--theme-text)',
        fontSize: 13,
        maxWidth: 190,
      }}
      onChange={(e) => {
        const slug = e.target.value
        if (!slug) return
        document.cookie = `payload-tenant=${tenantId};path=/;max-age=${60 * 60 * 24 * 30}`
        window.location.href = `/admin/collections/${slug}`
      }}
    >
      <option value="" disabled>
        Open content…
      </option>
      {all.sort((a, b) => label(a).localeCompare(label(b))).map((slug) => (
        <option key={slug} value={slug}>
          {label(slug)}
        </option>
      ))}
    </select>
  )
}
