import type { Access, CollectionConfig, Where } from 'payload'
import { denyEditorialAuditDelete, requireEditorialAuditAppend } from '../lib/editorial-audit'
import { getHostTenant, withHostScope } from '../lib/host-scope'

const staff = (user: unknown) => {
  const actor = user as { collection?: string; roles?: string[] } | null
  return actor?.collection === 'users' && actor.roles?.some(role => ['super-admin', 'tenant-admin', 'editor'].includes(role))
}
const readAudit: Access = async ({ req }): Promise<boolean | Where> => {
  if (!staff(req.user)) return false
  const user = req.user as unknown as { roles: string[]; tenants?: { tenant?: string | number | { id: string | number } }[] }
  const host = await getHostTenant(req)
  const hostFilter: Where | undefined = host ? { tenant: { equals: host.id } } : undefined
  if (user.roles.includes('super-admin')) return hostFilter ?? true
  const ids = (user.tenants ?? []).map(row => typeof row.tenant === 'object' && row.tenant ? row.tenant.id : row.tenant)
    .filter((id): id is string | number => typeof id === 'string' || typeof id === 'number')
  if (!ids.length) return false
  const assigned: Where = { tenant: { in: ids } }
  return hostFilter ? { and: [assigned, hostFilter] } : assigned
}

/** Explicitly NOT a multiTenantPlugin collection. Starts at deploy; no historical actor backfill. */
export const EditorialAudit: CollectionConfig = withHostScope({
  slug: 'editorial-audit',
  labels: { singular: 'Editorial audit entry', plural: 'Editorial audit' },
  timestamps: false, versions: false, lockDocuments: false, defaultSort: '-timestamp',
  admin: {
    group: 'Activity', useAsTitle: 'docLabel', hideAPIURL: true,
    description: 'Editorial activity recorded since audit logging was deployed. Earlier actor identities are not inferred.',
    defaultColumns: ['timestamp', 'actorLabel', 'action', 'docLabel', 'locale'],
    hidden: ({ user }) => !staff(user),
  },
  access: { read: readAudit, create: () => false, update: () => false, delete: () => false },
  hooks: { beforeChange: [requireEditorialAuditAppend], beforeDelete: [denyEditorialAuditDelete] },
  fields: [
    { name: 'tenant', type: 'relationship', relationTo: 'tenants', required: true, index: true, admin: { readOnly: true } },
    { name: 'actorLabel', label: 'Updated by', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'actorID', label: 'Staff account ID', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'action', type: 'select', required: true, options: ['create', 'update', 'draft', 'publish', 'unpublish', 'restore', 'delete'], admin: { readOnly: true } },
    { name: 'locale', label: 'Language', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'docCollection', label: 'CMS section', type: 'text', required: true, index: true, admin: { readOnly: true } },
    { name: 'documentID', label: 'Record ID', type: 'text', required: true, index: true, admin: { readOnly: true } },
    { name: 'docLabel', label: 'Content', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'timestamp', label: 'When', type: 'date', required: true, index: true, admin: { readOnly: true } },
    { name: 'changedFields', type: 'json', required: true, admin: { readOnly: true } },
    { name: 'diffs', type: 'json', required: true, admin: { readOnly: true,
      components: { Field: '/components/AuditChanges#AuditChanges' },
    } },
    { name: 'truncated', type: 'checkbox', defaultValue: false, admin: { readOnly: true } },
    { name: 'versionID', label: 'Saved version', type: 'text', admin: { readOnly: true } },
    { name: 'restoredFromVersionID', label: 'Restored from version', type: 'text', admin: { readOnly: true } },
  ],
})
