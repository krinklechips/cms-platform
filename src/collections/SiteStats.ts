import type { CollectionConfig } from 'payload'
import { getStatRecordHref } from '../lib/stat-pages'

/**
 * SiteStats — mirrors the live site's `site_stats` table (Supabase).
 * The source table has no id column; sourceId is the source `key`.
 */
export const SiteStats: CollectionConfig = {
  slug: 'site-stats',
  admin: {
    group: 'Home Page',
    useAsTitle: 'key',
    defaultColumns: ['key', 'displayValue', 'label', 'published', 'order'],
    formatDocURL: ({ defaultURL, doc, req, viewType }) => {
      if (viewType === 'trash' || typeof doc.key !== 'string' || (typeof doc.id !== 'string' && typeof doc.id !== 'number')) return defaultURL
      const adminRoute = req.payload.config.routes.admin
      let page = req.query?.statPage
      // Table preference refreshes use a server action with the list in its referrer.
      if (typeof page !== 'string') {
        try {
          const referrer = req.headers.get('referer')
          const url = referrer ? new URL(referrer) : null
          if (url?.pathname === `${adminRoute}/collections/site-stats`) page = url.searchParams.get('statPage')
        } catch {
          // Missing or malformed referrers use the statistic's primary page.
        }
      }
      return getStatRecordHref(doc.key, doc.id, page, adminRoute)
    },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'statUsage',
      type: 'ui',
      admin: { components: { Field: '/components/StatUsage#StatUsage' } },
    },
    {
      name: 'sourceId',
      type: 'text',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Supabase site_stats.key — used by the sync for idempotent upserts.',
        readOnly: true,
      },
    },
    {
      name: 'key',
      label: 'Statistic',
      type: 'text',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
        components: { Cell: '/components/StatUsage#StatNameCell' },
      },
    },
    {
      name: 'displayValue',
      type: 'text',
      localized: true,
    },
    {
      name: 'originalDisplayValue',
      type: 'text',
      localized: true,
      admin: { hidden: true },
      access: { create: () => false, update: () => false },
    },
    {
      name: 'numericValue',
      label: 'Number (all languages)',
      type: 'number',
      admin: { position: 'sidebar' },
    },
    {
      name: 'suffix',
      type: 'text',
      localized: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'label',
      type: 'text',
      localized: true,
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', readOnly: true, description: 'Legacy list order; does not reorder website statistics. Each page uses fixed statistic positions.' },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
}
