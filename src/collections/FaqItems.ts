import type { CollectionConfig } from 'payload'

/**
 * FaqItems — mirrors the live site's `faq_items` table (Supabase).
 * Localized fields are EN-only on initial sync but editable per locale later.
 */
export const FaqItems: CollectionConfig = {
  slug: 'faq-items',
  admin: {
    group: 'FAQs',
    useAsTitle: 'question',
    defaultColumns: ['question', 'category', 'published', 'order'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'sourceId',
      type: 'text',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Supabase faq_items.id — used by the sync for idempotent upserts.',
        readOnly: true,
      },
    },
    {
      name: 'question',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'answer',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'category',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
}
