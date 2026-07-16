import type { CollectionConfig } from 'payload'

/**
 * BookingSlots — operational snapshot of the live site's `booking_slots` table (Supabase).
 */
export const BookingSlots: CollectionConfig = {
  slug: 'booking-slots',
  admin: {
    group: 'Inbox',
    useAsTitle: 'date',
    defaultColumns: ['date', 'time', 'branch', 'doctor', 'status'],
  },
  access: {
    // Patient booking data — NEVER public. Require a logged-in user; the
    // multi-tenant plugin scopes reads to the user's own tenant, super-admins
    // see all. No public consumer reads booking slots from the CMS.
    read: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'sourceId',
      type: 'text',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Supabase booking_slots.id — used by the sync for idempotent upserts.',
        readOnly: true,
      },
    },
    {
      name: 'date',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'time',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'durationMinutes',
      type: 'number',
      admin: { position: 'sidebar' },
    },
    {
      name: 'isAvailable',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'bookedByName',
      type: 'text',
    },
    {
      name: 'bookedByEmail',
      type: 'email',
    },
    {
      name: 'bookedByPhone',
      type: 'text',
    },
    {
      name: 'bookedByTelegram',
      type: 'text',
    },
    {
      name: 'treatment',
      type: 'text',
    },
    {
      name: 'branch',
      type: 'text',
    },
    {
      name: 'doctor',
      type: 'text',
    },
    {
      name: 'notes',
      type: 'textarea',
    },
    {
      name: 'status',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'receivedAt',
      type: 'date',
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
