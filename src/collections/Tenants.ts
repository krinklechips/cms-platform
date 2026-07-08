import type { CollectionConfig } from 'payload'

/**
 * Tenants — one per customer site. Roomchang is tenant #1.
 * `domains` powers host-based routing later (same model as the old
 * cms-platform's cms_domain), when tenant dashboards get their own hosts.
 */
export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
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
