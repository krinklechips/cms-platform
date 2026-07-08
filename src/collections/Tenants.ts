import type { CollectionBeforeChangeHook, CollectionConfig, Where } from 'payload'

const isSuperAdmin = (user: unknown): boolean =>
  Boolean((user as { roles?: string[] } | null)?.roles?.includes('super-admin'))

/** Tenant ids a user belongs to (shape injected by the multi-tenant plugin). */
const userTenantIds = (user: unknown): (number | string)[] => {
  const rows = (user as { tenants?: { tenant?: number | string | { id: number | string } }[] } | null)
    ?.tenants
  return (rows ?? [])
    .map((r) => (typeof r.tenant === 'object' && r.tenant !== null ? r.tenant.id : r.tenant))
    .filter((v): v is number | string => v !== undefined && v !== null)
}

type SubscriptionRow = {
  active?: boolean | null
  module?: number | string | { id?: number | string | null } | null
}

type ModuleDoc = {
  contentCollections?: unknown
}

const recomputeEnabledCollections: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
}) => {
  const subscriptions =
    ((data?.subscriptions ?? originalDoc?.subscriptions ?? []) as SubscriptionRow[]) ?? []
  const enabled = new Set<string>()

  for (const sub of subscriptions) {
    if (sub?.active === false || !sub?.module) continue

    const moduleId =
      typeof sub.module === 'object' && sub.module !== null ? sub.module.id : sub.module
    if (moduleId === undefined || moduleId === null) continue

    const mod = (await req.payload.findByID({
      collection: 'modules',
      id: moduleId,
      depth: 0,
      overrideAccess: true,
    })) as ModuleDoc

    if (!Array.isArray(mod.contentCollections)) continue
    for (const slug of mod.contentCollections) {
      if (typeof slug === 'string') enabled.add(slug)
    }
  }

  return { ...data, enabledCollections: [...enabled].sort() }
}

/**
 * Tenants — one per customer site. Roomchang is tenant #1.
 * `domains` powers host-based routing (branded landing/login per host);
 * `logo` brands their portal; `subscriptions` is the billing heart:
 * which modules this customer pays for and at what price.
 *
 * Only platform staff (super-admin) manage tenants. Tenant users can read
 * ONLY their own tenant (needed for the tenant selector + their branding) —
 * never the rest of the customer list.
 */
export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    group: 'Platform',
    useAsTitle: 'name',
    hidden: ({ user }) => !isSuperAdmin(user),
  },
  access: {
    read: ({ req: { user } }): boolean | Where => {
      if (isSuperAdmin(user)) return true
      const ids = userTenantIds(user)
      return ids.length ? { id: { in: ids } } : false
    },
    create: ({ req: { user } }) => isSuperAdmin(user),
    update: ({ req: { user } }) => isSuperAdmin(user),
    delete: ({ req: { user } }) => isSuperAdmin(user),
  },
  hooks: {
    beforeChange: [recomputeEnabledCollections],
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
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Tenant logo — shown on their branded landing page and admin login (upload to the Media library first, under this tenant).',
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
    {
      name: 'subscriptions',
      type: 'array',
      validate: (rows: unknown) => {
        const active = (Array.isArray(rows) ? rows : []).filter(
          (r: { active?: boolean }) => r?.active !== false,
        )
        const ids = active.map((r: { module?: number | string | { id: number | string } }) =>
          typeof r.module === 'object' && r.module !== null ? r.module.id : r.module,
        )
        return new Set(ids).size === ids.length || 'Duplicate active subscription for the same module.'
      },
      admin: {
        description:
          'Modules this tenant pays for. Price override falls back to the module’s default. Invoices auto-fill from active rows.',
      },
      fields: [
        {
          name: 'module',
          type: 'relationship',
          relationTo: 'modules',
          required: true,
        },
        {
          name: 'monthlyPrice',
          type: 'number',
          min: 0,
          admin: {
            description: 'USD/month for THIS tenant. Empty = module default price.',
          },
        },
        {
          name: 'active',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Uncheck to switch the module off for this tenant (e.g. AI Chatbot).',
          },
        },
        {
          name: 'startedAt',
          type: 'date',
        },
      ],
    },
    {
      name: 'enabledCollections',
      type: 'json',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
}
