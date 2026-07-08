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

type LineItem = { moduleKey?: string | null; description: string; amount: number }

/**
 * On create with no line items: auto-populate from the tenant's active module
 * subscriptions, SNAPSHOTTING module key/name/price at that moment (per Codex
 * review: historical invoices must not drift when catalog prices change).
 * Always recompute total. Lock everything but status/notes once sent.
 */
const buildInvoice: CollectionBeforeChangeHook = async ({ data, originalDoc, operation, req }) => {
  // Immutability: once sent/paid, only status transitions + notes are allowed
  // (sent → paid to settle, sent → draft as an explicit super-admin unlock).
  if (operation === 'update' && originalDoc?.status && originalDoc.status !== 'draft') {
    return {
      ...originalDoc,
      status: data?.status ?? originalDoc.status,
      notes: data?.notes ?? originalDoc.notes,
    }
  }

  let lineItems: LineItem[] = (data?.lineItems as LineItem[] | undefined) ?? []

  if (operation === 'create' && lineItems.length === 0 && data?.tenant) {
    const tenantId = typeof data.tenant === 'object' ? data.tenant.id : data.tenant
    // depth:0 — relationship values are plain ids; each module is fetched
    // explicitly (array relationships may arrive as ids OR docs otherwise).
    const tenant = (await req.payload.findByID({
      collection: 'tenants',
      id: tenantId,
      depth: 0,
      overrideAccess: true,
    })) as { subscriptions?: { module?: number | string | { id: number | string }; monthlyPrice?: number | null; active?: boolean | null }[] }

    for (const sub of tenant.subscriptions ?? []) {
      if (sub.active === false || !sub.module) continue
      const moduleId = typeof sub.module === 'object' ? sub.module.id : sub.module
      const mod = (await req.payload.findByID({
        collection: 'modules',
        id: moduleId,
        depth: 0,
        overrideAccess: true,
      })) as { name?: string; key?: string; defaultMonthlyPrice?: number }
      lineItems.push({
        moduleKey: mod.key ?? null,
        description: `${mod.name ?? mod.key ?? 'Module'} — monthly subscription`,
        amount: sub.monthlyPrice ?? mod.defaultMonthlyPrice ?? 0,
      })
    }
  }

  const total = lineItems.reduce((sum, li) => sum + (Number(li.amount) || 0), 0)
  return { ...data, lineItems, total }
}

/**
 * Invoices — generated per tenant from their module subscriptions.
 * Super-admin manages; tenant users can read their own tenant's invoices.
 * (Deliberately not registered with the multi-tenant plugin: access is
 * hand-rolled so billing stays platform-controlled.)
 */
export const Invoices: CollectionConfig = {
  slug: 'invoices',
  admin: {
    useAsTitle: 'id',
    hidden: ({ user }) => !isSuperAdmin(user),
    description:
      'Create an invoice with an empty line-item list to auto-fill it from the tenant’s active subscriptions.',
    defaultColumns: ['tenant', 'periodStart', 'status', 'total'],
  },
  access: {
    read: ({ req: { user } }): boolean | Where => {
      if (isSuperAdmin(user)) return true
      const ids = userTenantIds(user)
      return ids.length ? { tenant: { in: ids } } : false
    },
    create: ({ req: { user } }) => isSuperAdmin(user),
    update: ({ req: { user } }) => isSuperAdmin(user),
    delete: ({ req: { user } }) => isSuperAdmin(user),
  },
  hooks: {
    beforeChange: [buildInvoice],
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
    },
    {
      name: 'periodStart',
      type: 'date',
      required: true,
    },
    {
      name: 'periodEnd',
      type: 'date',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Sent', value: 'sent' },
        { label: 'Paid', value: 'paid' },
      ],
      admin: {
        description: 'Once an invoice leaves Draft, its line items are locked.',
      },
    },
    {
      name: 'lineItems',
      type: 'array',
      admin: {
        description: 'Leave empty on create to auto-fill from the tenant’s active subscriptions.',
      },
      fields: [
        {
          name: 'moduleKey',
          type: 'text',
          admin: { description: 'Snapshot of the module key at invoicing time (audit trail).' },
        },
        { name: 'description', type: 'text', required: true },
        { name: 'amount', type: 'number', required: true, min: 0 },
      ],
    },
    {
      name: 'total',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Computed from line items.',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
    },
  ],
}
