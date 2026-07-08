'use client'

import React from 'react'
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'

/**
 * "Manage content" — rendered on the Tenant edit view (super-admin's entry
 * point into a tenant's content, since content collections are hidden from
 * the platform nav). Each button:
 *   1. sets the multi-tenant plugin's selector cookie to THIS tenant, so
 *      every list view scopes to it,
 *   2. navigates to the collection's list view (reachable by URL even
 *      though it's hidden from the nav).
 */

const LABELS: Record<string, string> = {
  'hero-slides': 'Hero Slides',
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

const humanize = (slug: string): string =>
  LABELS[slug] ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

const S: Record<string, React.CSSProperties> = {
  wrap: { marginBottom: 24 },
  h: { fontSize: 14, fontWeight: 600, margin: '0 0 4px' },
  sub: { fontSize: 12, color: 'var(--theme-elevation-500)', margin: '0 0 10px' },
  grid: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  btn: {
    padding: '6px 14px',
    borderRadius: 6,
    border: '1px solid var(--theme-elevation-200)',
    background: 'var(--theme-elevation-50)',
    color: 'var(--theme-text)',
    fontSize: 13,
    cursor: 'pointer',
  },
}

export const ManageTenantContent: React.FC = () => {
  const { id } = useDocumentInfo()
  const enabled = useFormFields(([fields]) => fields?.enabledCollections?.value)

  if (!id) return null

  const slugs: string[] = Array.isArray(enabled) ? (enabled as string[]) : []
  // Media is always available; content collections follow the subscriptions.
  const all = [...slugs, 'media']

  const open = (slug: string) => {
    document.cookie = `payload-tenant=${id};path=/;max-age=${60 * 60 * 24 * 30}`
    window.location.href = `/admin/collections/${slug}`
  }

  return (
    <div style={S.wrap}>
      <h4 style={S.h}>Manage content</h4>
      <p style={S.sub}>
        {slugs.length
          ? 'Opens the collection scoped to this tenant (sets the tenant selector).'
          : 'No modules subscribed yet — add subscriptions below, save, and the content areas appear here.'}
      </p>
      <div style={S.grid}>
        {all.map((slug) => (
          <button key={slug} type="button" style={S.btn} onClick={() => open(slug)}>
            {humanize(slug)} →
          </button>
        ))}
      </div>
    </div>
  )
}
