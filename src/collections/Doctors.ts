import type { CollectionConfig } from 'payload'

/**
 * Doctors — mirrors the live site's `doctors` table (Supabase).
 * Names are NOT localized (they stay identical across locales, matching the
 * live site). Role / specialty / languages / bio / note are localized.
 */
export const Doctors: CollectionConfig = {
  slug: 'doctors',
  admin: {
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
      name: 'department',
      type: 'text',
      index: true,
      admin: { description: 'Team grouping, e.g. ORTHODONTICS (matches the live site enum).' },
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
      admin: { description: 'R2 photo URL (carried from the live site).' },
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
