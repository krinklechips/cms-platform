import type { CollectionConfig } from 'payload'

/**
 * Enquiries — operational snapshot of the live site's `enquiries` table (Supabase).
 */
export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  admin: {
    group: 'Inbox',
    useAsTitle: 'name',
    defaultColumns: ['name', 'treatment', 'branch', 'isRead', 'receivedAt'],
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
        description: 'Supabase enquiries.id — used by the sync for idempotent upserts.',
        readOnly: true,
      },
    },
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'country',
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
      name: 'date',
      type: 'text',
    },
    {
      name: 'message',
      type: 'textarea',
    },
    {
      name: 'isRead',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'agentCode',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'doctor',
      type: 'text',
    },
    {
      name: 'wechat',
      type: 'text',
    },
    {
      name: 'patientType',
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
