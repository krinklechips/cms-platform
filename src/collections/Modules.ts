import type { CollectionConfig } from 'payload'

const isSuperAdmin = (user: unknown): boolean =>
  Boolean((user as { roles?: string[] } | null)?.roles?.includes('super-admin'))

/**
 * Modules — the platform's sellable feature catalog (NOT tenant-scoped).
 * Each module has a default monthly price; a tenant's subscription may
 * override it. Module keys are what the public site checks via
 * /api/feature-flags (e.g. the AI chatbot renders only when its tenant
 * has 'ai-chatbot' active).
 */
export const Modules: CollectionConfig = {
  slug: 'modules',
  admin: {
    useAsTitle: 'name',
    hidden: ({ user }) => !isSuperAdmin(user),
    description: 'Sellable platform modules. Subscribe tenants to these on the Tenant document.',
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
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Stable slug used by sites to check the feature, e.g. "ai-chatbot".',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'defaultMonthlyPrice',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'USD per month. Can be overridden per tenant subscription.',
      },
    },
  ],
}
