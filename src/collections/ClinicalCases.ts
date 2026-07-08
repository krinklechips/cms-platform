import type { CollectionConfig } from 'payload'

/**
 * ClinicalCases — mirrors the live site's `clinical_cases` table (Supabase).
 * Text fields are localized from content_translations.
 */
export const ClinicalCases: CollectionConfig = {
  slug: 'clinical-cases',
  admin: {
    group: 'Website Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'category', 'published', 'order'],
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
        description: 'Supabase clinical_cases.id — used by the sync for idempotent upserts.',
        readOnly: true,
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'category',
      type: 'text',
      localized: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'treatment',
      type: 'text',
      localized: true,
    },
    {
      name: 'duration',
      type: 'text',
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'tag',
      type: 'text',
      localized: true,
    },
    {
      name: 'fullText',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'imageUrl',
      type: 'text',
      admin: {
        description: 'R2 image URL (carried from clinical_cases.imageUrl).',
      },
    },
    {
      name: 'images',
      type: 'json',
      admin: {
        description: 'Clinical case images JSON — carried from the live site losslessly.',
      },
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
