import type { CollectionConfig } from 'payload'

/**
 * Videos — mirrors the live site's `videos` table (Supabase).
 * Localized fields sync EN only initially and remain editable per locale.
 */
export const Videos: CollectionConfig = {
  slug: 'videos',
  admin: {
    group: 'Education & News',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'doctor', 'published', 'order'],
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
        description: 'Supabase videos.id — used by the sync for idempotent upserts.',
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
      name: 'url',
      type: 'text',
      required: true,
      admin: { description: 'Shared by all languages. Supported YouTube video URL; videos without a valid YouTube destination are not displayed.' },
    },
    {
      name: 'thumbnail',
      label: 'Thumbnail (All languages)',
      type: 'text',
      admin: { components: { afterInput: ['/components/ImageUrlPreview#ImageUrlPreview'], Cell: '/components/ImageCell#ImageCell' }, description: 'Shared by all languages. Optional custom video poster. When empty, the website displays the YouTube iframe directly, without a custom poster.' },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'category',
      type: 'text',
      admin: { position: 'sidebar', description: 'Shared by all languages. Use exactly dentist-talk for Dentist Talks or testimonial for Patient Testimonials. Other values have no connected website page or preview.' },
    },
    {
      name: 'doctor',
      type: 'text',
      admin: { position: 'sidebar', description: 'Shared presenter name for Dentist Talks videos; this is text, not a Doctor relationship.' },
    },
    {
      name: 'topic',
      type: 'text',
      localized: true,
      admin: { position: 'sidebar', description: 'Topic label for Dentist Talks in the selected language.' },
    },
    {
      name: 'treatment',
      type: 'text',
      localized: true,
      admin: { position: 'sidebar', description: 'Treatment label in the selected language, displayed on both Dentist Talks and Patient Testimonials videos.' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Shared by all languages. Sets the video sequence within the selected category\'s website page.' },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
}
