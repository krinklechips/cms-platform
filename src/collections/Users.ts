import type { CollectionConfig } from 'payload'

const isSuperAdmin = (user: unknown): boolean =>
  Boolean((user as { roles?: string[] } | null)?.roles?.includes('super-admin'))

/**
 * Users — platform staff (super-admin, sees all tenants) vs tenant staff
 * (tenant-admin / editor, scoped to their tenant by the multi-tenant plugin,
 * which injects the tenant relationship field automatically).
 *
 * Access: only super-admins (Serviette Labs) manage accounts. Tenant users
 * can see/update only themselves and don't get the Users nav item at all —
 * this is what makes "your view" vs "the tenant's view".
 */
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    group: 'Platform',
    useAsTitle: 'email',
    hidden: ({ user }) => !isSuperAdmin(user),
  },
  auth: { depth: 2 },
  access: {
    read: ({ req: { user } }) => (isSuperAdmin(user) ? true : { id: { equals: user?.id ?? '' } }),
    create: ({ req: { user } }) => isSuperAdmin(user),
    update: ({ req: { user } }) => (isSuperAdmin(user) ? true : { id: { equals: user?.id ?? '' } }),
    delete: ({ req: { user } }) => isSuperAdmin(user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      defaultValue: ['editor'],
      required: true,
      options: [
        { label: 'Super Admin (Serviette Labs)', value: 'super-admin' },
        { label: 'Tenant Admin', value: 'tenant-admin' },
        { label: 'Editor', value: 'editor' },
      ],
      access: {
        // Only platform staff may change roles (a tenant admin must never
        // promote themselves to super-admin).
        update: ({ req: { user } }) => isSuperAdmin(user),
      },
    },
  ],
  versions: false,
}
