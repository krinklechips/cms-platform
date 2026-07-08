import type { CollectionConfig } from 'payload'

/**
 * Users — platform staff (super-admin, sees all tenants) vs tenant staff
 * (tenant-admin / editor, scoped to their tenant by the multi-tenant plugin,
 * which injects the tenant relationship field automatically).
 */
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
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
    },
  ],
  versions: false,
}
