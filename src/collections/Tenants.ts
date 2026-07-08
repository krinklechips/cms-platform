import type { CollectionConfig } from 'payload'

const isSuperAdmin = (user: unknown): boolean =>
  Boolean((user as { roles?: string[] } | null)?.roles?.includes('super-admin'))

/**
 * Tenants — one per customer site. Roomchang is tenant #1.
 * `domains` powers host-based routing later (same model as the old
 * cms-platform's cms_domain), when tenant dashboards get their own hosts.
 *
 * Only platform staff (super-admin) manage tenants; tenant users can read
 * (the tenant selector needs it) but never see the nav item or edit.
 */
export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    hidden: ({ user }) => !isSuperAdmin(user),
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => isSuperAdmin(user),
    update: ({ req: { user } }) => isSuperAdmin(user),
    delete: ({ req: { user } }) => isSuperAdmin(user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL-safe identifier, e.g. "roomchang"',
      },
    },
    {
      name: 'domains',
      type: 'array',
      admin: {
        description: 'Hostnames that resolve to this tenant (host-based routing).',
      },
      fields: [
        {
          name: 'domain',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
