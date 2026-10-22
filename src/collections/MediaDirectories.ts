import { APIError, type Access, type CollectionConfig, type Where } from 'payload'
import { getHostTenant } from '../lib/host-scope'
import { assertFolderWriteOrigin, mediaFolderTenant } from '../lib/media-folder-catalog'
import { mediaID } from '../lib/media-validation'
import { isUploadFolder } from '../lib/media-folders'

const staff = (user: unknown) => {
  const actor = user as { collection?: string; roles?: string[] } | null
  return actor?.collection === 'users' && actor.roles?.some(role => ['super-admin', 'tenant-admin', 'editor'].includes(role))
}
const readDirectories: Access = async ({ req }): Promise<boolean | Where> => {
  if (!staff(req.user)) return false
  const user = req.user as { roles: string[]; tenants?: { tenant?: unknown }[] }
  const host = await getHostTenant(req)
  const hostFilter: Where | undefined = host ? { tenant: { equals: host.id } } : undefined
  if (user.roles.includes('super-admin')) return hostFilter ?? true
  const ids = (user.tenants ?? []).map(row => mediaID(row.tenant)).filter(id => id !== null)
  if (!ids.length) return false
  const memberships: Where = { tenant: { in: ids } }
  return hostFilter ? { and: [memberships, hostFilter] } : memberships
}

/** Empty-folder metadata only. Existing media identities and storage keys are never rewritten. */
export const MediaDirectories: CollectionConfig = {
  slug: 'media-directories', lockDocuments: false, versions: false,
  admin: { hidden: true, useAsTitle: 'path' },
  indexes: [{ fields: ['tenant', 'path'], unique: true }],
  access: {
    read: readDirectories,
    create: async ({ req, data }) => {
      if (!staff(req.user)) return false
      try { await mediaFolderTenant(req, data?.tenant); return true } catch { return false }
    },
    update: () => false, delete: () => false,
  },
  hooks: {
    beforeValidate: [async ({ data, req, operation }) => {
      if (operation !== 'create') throw new APIError('Existing folders cannot be renamed or moved.', 409)
      assertFolderWriteOrigin(req)
      if (!data?.path || !isUploadFolder(data.path)) throw new APIError('Choose a valid folder path.', 400)
      const tenant = await mediaFolderTenant(req, data.tenant)
      return { ...data, tenant: tenant.id }
    }],
    beforeDelete: [() => { throw new APIError('Folder deletion requires a reviewed maintenance operation.', 409) }],
  },
  fields: [
    { name: 'tenant', type: 'relationship', relationTo: 'tenants', required: true, index: true },
    { name: 'path', type: 'text', required: true, maxLength: 300 },
  ],
}
