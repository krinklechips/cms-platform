import type { CollectionConfig } from 'payload'

/**
 * Doctors — mirrors the live site's `doctors` table (Supabase).
 * Names are NOT localized (they stay identical across locales, matching the
 * live site). Role / specialty / languages / bio / note are localized.
 */
export const Doctors: CollectionConfig = {
  slug: 'doctors',
  admin: {
    group: 'Main Pages',
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'department', 'published', 'order'],
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
        description: 'Supabase doctors.id (e.g. "dr-tak") — sync upsert key.',
        readOnly: true,
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'credentials',
      type: 'text',
      admin: { description: 'e.g. "DDS, MSc."' },
    },
    {
      name: 'role',
      type: 'text',
      localized: true,
      admin: { description: 'e.g. "Orthodontist"' },
    },
    {
      // Was free text: raw enum values leaked into the list view and a typo
      // silently dropped a doctor from the Team-page grouping (UX audit).
      // Values stay the live-site enum; labels are what editors read.
      name: 'department',
      type: 'select',
      index: true,
      options: [
        { label: 'General', value: 'GENERAL' },
        { label: 'Orthodontics', value: 'ORTHODONTICS' },
        { label: 'Implantology', value: 'IMPLANTOLOGY' },
        { label: 'Cosmetic', value: 'COSMETIC' },
        { label: 'Pediatrics', value: 'PEDIATRICS' },
        { label: 'Senior Consultant', value: 'SENIOR_CONSULTANT' },
        { label: 'Director', value: 'DIRECTOR' },
      ],
      admin: { description: 'Which heading the doctor is grouped under on the Team page.' },
    },
    {
      name: 'specialty',
      type: 'array',
      localized: true,
      fields: [{ name: 'value', type: 'text', required: true }],
    },
    {
      name: 'languages',
      type: 'array',
      localized: true,
      fields: [{ name: 'value', type: 'text', required: true }],
    },
    {
      name: 'bio',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'note',
      type: 'text',
      localized: true,
      admin: { description: 'Short credential highlight, e.g. "MSc. in Orthodontics — Germany, 2019"' },
    },
    {
      name: 'initials',
      type: 'text',
      admin: { position: 'sidebar', description: 'Avatar fallback when no photo.' },
    },
    {
      name: 'photoUrl',
      type: 'text',
      admin: {
        components: { afterInput: ['/components/ImageUrlPreview#ImageUrlPreview'], Cell: '/components/ImageCell#ImageCell' }, description: 'R2 photo URL (carried from the live site).' },
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
