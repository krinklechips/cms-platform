import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api, tenantApi } from '@/lib/api'
import { queryClient } from '@/lib/query-client'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Badge } from '@/app/components/ui/badge'
import { Switch } from '@/app/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table'
import {
  ExternalLink,
  Loader2,
  Plus,
  Globe,
  CheckCircle2,
  AlertCircle,
  FileText,
  Files,
  Image,
  Search,
  BarChart3,
  Menu,
  Layout,
  Users,
  Palette,
  Settings2,
  Package,
  ListChecks,
} from 'lucide-react'
import { toast } from 'sonner'
import { TenantOnboarding } from './TenantOnboarding'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Tenant {
  id: number
  name: string
  slug: string
  status: string
  primaryColor?: string | null
  logoUrl?: string | null
  supportEmail?: string | null
  publicSiteUrl?: string | null
  cmsDomain?: string | null
  domainVerified?: boolean
  dnsRecords?: DnsRecord[]
  createdAt?: string
  updatedAt?: string
}

interface DnsRecord {
  type: string
  name: string
  value: string
  verified?: boolean
}

interface TenantUser {
  id: number
  email: string
  role: string
  status?: string
  createdAt?: string
}

interface ModuleSettings {
  articles?: boolean
  libraries?: boolean
  annualReports?: boolean
  navigationTabs?: boolean
  homepagePlacements?: boolean
  pages?: boolean
  seo?: boolean
  mediaLibrary?: boolean
  navigation?: boolean
}

/* ------------------------------------------------------------------ */
/*  Status colors                                                      */
/* ------------------------------------------------------------------ */

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700 hover:bg-green-100',
  pending: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
  inactive: 'bg-gray-100 text-gray-600 hover:bg-gray-100',
  suspended: 'bg-red-100 text-red-700 hover:bg-red-100',
}

const tabTriggerClass =
  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 data-[state=active]:bg-[#7c3aed]/10 data-[state=active]:text-[#7c3aed] data-[state=active]:shadow-none'

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function TenantDetails() {
  const { tenantId } = useParams<{ tenantId: string }>()

  /* ---- Tenant data ---- */
  const {
    data: tenant,
    isLoading,
  } = useQuery({
    queryKey: ['platform', 'tenant', tenantId],
    queryFn: () => api<Tenant>(`/api/platform/tenants/${tenantId}`),
    enabled: !!tenantId,
  })

  if (isLoading || !tenant) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#7c3aed]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header card */}
      <div className="border-b border-gray-200 bg-white px-8 py-6">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-gray-400">
          <Link to="/" className="hover:text-gray-600">Dashboard</Link>
          <span>/</span>
          <Link to="/tenants" className="hover:text-gray-600">Tenants</Link>
          <span>/</span>
          <span className="text-gray-700">{tenant.name}</span>
        </nav>

        <div className="flex items-start justify-between">
          {/* Tenant identity */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#7c3aed]/10 text-lg font-bold text-[#7c3aed]">
              {tenant.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-gray-900">{tenant.name}</h1>
                <Badge className={statusColors[tenant.status] ?? 'bg-gray-100 text-gray-600'}>
                  {tenant.status}
                </Badge>
              </div>
              <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-600">{tenant.slug}</code>
                {tenant.cmsDomain && <span className="text-gray-300">·</span>}
                {tenant.cmsDomain && <span>{tenant.cmsDomain}</span>}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {tenant.cmsDomain && (
              <Button variant="outline" size="sm" className="gap-1.5" asChild>
                <a href={`https://${tenant.cmsDomain}/tenant-dashboard`} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open CMS
                </a>
              </Button>
            )}
            {tenant.publicSiteUrl && (
              <Button variant="outline" size="sm" className="gap-1.5" asChild>
                <a href={tenant.publicSiteUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Public Site
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="branding" className="w-full">
        {/* Tab bar */}
        <div className="border-b border-gray-200 bg-white px-6">
          <TabsList className="h-12 gap-1 bg-transparent p-1">
            <TabsTrigger value="branding" className={tabTriggerClass}>
              <Palette className="h-3.5 w-3.5" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="users" className={tabTriggerClass}>
              <Users className="h-3.5 w-3.5" />
              Users
            </TabsTrigger>
            <TabsTrigger value="domains" className={tabTriggerClass}>
              <Globe className="h-3.5 w-3.5" />
              Domains
            </TabsTrigger>
            <TabsTrigger value="modules" className={tabTriggerClass}>
              <Settings2 className="h-3.5 w-3.5" />
              Modules
            </TabsTrigger>
            <TabsTrigger value="content" className={tabTriggerClass}>
              <Package className="h-3.5 w-3.5" />
              Content
            </TabsTrigger>
            <TabsTrigger value="onboarding" className={tabTriggerClass}>
              <ListChecks className="h-3.5 w-3.5" />
              Onboarding
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="branding" className="mt-0 p-8">
          <BrandingTab tenant={tenant} />
        </TabsContent>
        <TabsContent value="users" className="mt-0 p-8">
          <UsersTab tenantId={tenant.id} />
        </TabsContent>
        <TabsContent value="domains" className="mt-0 p-8">
          <DomainsTab tenant={tenant} />
        </TabsContent>
        <TabsContent value="modules" className="mt-0 p-8">
          <ModulesTab tenantId={tenant.id} />
        </TabsContent>
        <TabsContent value="content" className="mt-0 p-8">
          <ContentTab tenant={tenant} />
        </TabsContent>
        <TabsContent value="onboarding" className="mt-0 p-8">
          <TenantOnboarding tenantId={tenant.id} cmsDomain={tenant.cmsDomain} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

/* ================================================================== */
/*  BRANDING TAB                                                       */
/* ================================================================== */

function BrandingTab({ tenant }: { tenant: Tenant }) {
  const [name, setName] = useState(tenant.name)
  const [status, setStatus] = useState(tenant.status)
  const [primaryColor, setPrimaryColor] = useState(tenant.primaryColor ?? '#2563EB')
  const [logoUrl, setLogoUrl] = useState(tenant.logoUrl ?? '')
  const [supportEmail, setSupportEmail] = useState(tenant.supportEmail ?? '')
  const [publicSiteUrl, setPublicSiteUrl] = useState(tenant.publicSiteUrl ?? '')
  const [cmsDomain, setCmsDomain] = useState(tenant.cmsDomain ?? '')

  const saveMutation = useMutation({
    mutationFn: (payload: Partial<Tenant>) =>
      api<Tenant>(`/api/platform/tenants/${tenant.id}`, {
        method: 'PUT',
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['platform', 'tenant', String(tenant.id)],
      })
      queryClient.invalidateQueries({ queryKey: ['platform', 'tenants'] })
      toast.success('Tenant updated')
    },
    onError: () => toast.error('Failed to update tenant'),
  })

  const handleSave = () => {
    saveMutation.mutate({
      name,
      status,
      primaryColor,
      logoUrl,
      supportEmail,
      publicSiteUrl,
      cmsDomain,
    })
  }

  const colorPresets = [
    { name: 'Blue', value: '#2563EB' },
    { name: 'Purple', value: '#9F76E6' },
    { name: 'Violet', value: '#7C3AED' },
    { name: 'Cyan', value: '#0EA5E9' },
    { name: 'Dark', value: '#111827' },
  ]

  return (
    <div className="max-w-4xl">
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-1 text-lg font-semibold text-gray-900">
          Basic Tenant Setup
        </h3>
        <p className="mb-6 text-sm text-gray-600">
          Core business details and branding
        </p>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-900">
                Tenant name
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-900">
                Slug (read-only)
              </Label>
              <Input value={tenant.slug} disabled className="mt-1.5 bg-gray-50" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-900">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-900">
                Primary color
              </Label>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex gap-1.5">
                  {colorPresets.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setPrimaryColor(c.value)}
                      className={`h-8 w-8 rounded-md border-2 transition-all ${
                        primaryColor === c.value
                          ? 'border-blue-600 scale-110'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="max-w-[120px]"
                />
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-900">
              Logo URL
            </Label>
            <div className="mt-1.5 flex items-center gap-4">
              <Input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="flex-1"
              />
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt="Logo preview"
                  className="h-10 w-auto rounded border border-gray-200 object-contain"
                />
              )}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-900">
              Support email
            </Label>
            <Input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              placeholder="support@example.com"
              className="mt-1.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-900">
                Public site URL
              </Label>
              <Input
                value={publicSiteUrl}
                onChange={(e) => setPublicSiteUrl(e.target.value)}
                placeholder="https://www.example.com"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-900">
                CMS domain
              </Label>
              <Input
                value={cmsDomain}
                onChange={(e) => setCmsDomain(e.target.value)}
                placeholder="cms.example.com"
                className="mt-1.5"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3 border-t border-gray-200 pt-6">
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="bg-[#7c3aed] hover:bg-[#6d28d9]"
          >
            {saveMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save changes
          </Button>
        </div>
      </div>

      {tenant.createdAt && (
        <p className="text-sm text-gray-500">
          Created: {new Date(tenant.createdAt).toLocaleString()}
          {tenant.updatedAt &&
            ` | Updated: ${new Date(tenant.updatedAt).toLocaleString()}`}
        </p>
      )}
    </div>
  )
}

/* ================================================================== */
/*  USERS TAB                                                          */
/* ================================================================== */

function UsersTab({ tenantId }: { tenantId: number }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState('editor')

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['platform', 'tenant-users', tenantId],
    queryFn: () =>
      api<{ users: TenantUser[] }>(`/api/platform/tenant-users?tenantId=${tenantId}`)
        .then((r) => (Array.isArray(r.users) ? r.users : [])),
  })

  const createUserMutation = useMutation({
    mutationFn: (payload: {
      email: string
      password: string
      role: string
      tenantId: number
    }) =>
      api<TenantUser>('/api/platform/tenant-users', {
        method: 'POST',
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['platform', 'tenant-users', tenantId],
      })
      toast.success('User added')
      setDialogOpen(false)
      setNewEmail('')
      setNewPassword('')
      setNewRole('editor')
    },
    onError: () => toast.error('Failed to add user'),
  })

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    createUserMutation.mutate({
      email: newEmail,
      password: newPassword,
      role: newRole,
      tenantId,
    })
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Tenant Users</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 bg-[#7c3aed] hover:bg-[#6d28d9]">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddUser} className="space-y-4 pt-2">
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Role</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createUserMutation.isPending}
                  className="bg-[#7c3aed] hover:bg-[#6d28d9]"
                >
                  {createUserMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add User
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Role</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-gray-500">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-gray-500">
                  No users yet
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{u.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        u.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }
                    >
                      {u.status ?? 'active'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

/* ================================================================== */
/*  DOMAINS TAB                                                        */
/* ================================================================== */

function DomainsTab({ tenant }: { tenant: Tenant }) {
  const provisionMutation = useMutation({
    mutationFn: () =>
      api(`/api/platform/tenants/${tenant.id}/domain/provision`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['platform', 'tenant', String(tenant.id)],
      })
      toast.success('Domain provisioned')
    },
    onError: () => toast.error('Provisioning failed'),
  })

  const verifyMutation = useMutation({
    mutationFn: () =>
      api(`/api/platform/tenants/${tenant.id}/domain/verify`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['platform', 'tenant', String(tenant.id)],
      })
      toast.success('Domain verified')
    },
    onError: () => toast.error('Verification failed'),
  })

  return (
    <div className="max-w-4xl space-y-6">
      {/* Domain config */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="h-5 w-5 text-[#7c3aed]" />
          <h3 className="text-lg font-semibold text-gray-900">
            Domain Configuration
          </h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">CMS Domain</p>
              <p className="text-sm text-gray-500">
                {tenant.cmsDomain || 'Not configured'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {tenant.domainVerified ? (
                <Badge className="gap-1 bg-green-100 text-green-700">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </Badge>
              ) : (
                <Badge className="gap-1 bg-yellow-100 text-yellow-700">
                  <AlertCircle className="h-3 w-3" />
                  Unverified
                </Badge>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => provisionMutation.mutate()}
              disabled={provisionMutation.isPending}
            >
              {provisionMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Provision Domain
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => verifyMutation.mutate()}
              disabled={verifyMutation.isPending}
            >
              {verifyMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Verify Domain
            </Button>
          </div>
        </div>
      </div>

      {/* DNS Records */}
      {tenant.dnsRecords && tenant.dnsRecords.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            DNS Records
          </h3>
          <div className="space-y-3">
            {tenant.dnsRecords.map((record, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {record.type} &mdash; {record.name}
                  </p>
                  <p className="font-mono text-xs text-gray-500">
                    {record.value}
                  </p>
                </div>
                {record.verified ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ================================================================== */
/*  MODULES TAB                                                        */
/* ================================================================== */

function ModulesTab({ tenantId }: { tenantId: number }) {
  const [modules, setModules] = useState<ModuleSettings>({})
  const [savedSnapshot, setSavedSnapshot] = useState<string>('')

  const { isLoading } = useQuery({
    queryKey: ['tenant', 'settings', tenantId],
    queryFn: async () => {
      const data = await tenantApi<{ moduleAccess?: ModuleSettings }>(
        tenantId,
        '/api/tenant/settings',
      )
      const ma = data.moduleAccess ?? {}
      setModules(ma)
      setSavedSnapshot(JSON.stringify(ma))
      return data
    },
  })

  const saveMutation = useMutation({
    mutationFn: () =>
      tenantApi(tenantId, '/api/tenant/settings', {
        method: 'PUT',
        body: { moduleAccess: modules },
      }),
    onSuccess: () => {
      setSavedSnapshot(JSON.stringify(modules))
      toast.success('Module settings saved')
    },
    onError: () => toast.error('Failed to save module settings'),
  })

  const isDirty = JSON.stringify(modules) !== savedSnapshot

  const toggleModule = (key: keyof ModuleSettings) => {
    setModules((prev) => ({ ...prev, [key]: prev[key] === false ? true : prev[key] ? false : true }))
  }

  const moduleList: {
    key: keyof ModuleSettings
    label: string
    description: string
    icon: React.ComponentType<{ className?: string }>
  }[] = [
    {
      key: 'articles',
      label: 'Articles',
      description: 'Blog posts and news content',
      icon: FileText,
    },
    {
      key: 'pages',
      label: 'Pages',
      description: 'Custom website pages with block editor',
      icon: Files,
    },
    {
      key: 'mediaLibrary',
      label: 'Media Library',
      description: 'File uploads and media management',
      icon: Image,
    },
    {
      key: 'seo',
      label: 'SEO Suite',
      description: 'SEO tools, audits, and keyword tracking',
      icon: Search,
    },
    {
      key: 'annualReports',
      label: 'Annual Reports',
      description: 'Annual report management',
      icon: BarChart3,
    },
    {
      key: 'navigation',
      label: 'Navigation',
      description: 'Custom site navigation editor',
      icon: Menu,
    },
    {
      key: 'homepagePlacements',
      label: 'Homepage Placements',
      description: 'Content slot management',
      icon: Layout,
    },
  ]

  return (
    <div className="max-w-4xl">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-1 text-lg font-semibold text-gray-900">
          Module Access
        </h3>
        <p className="mb-6 text-sm text-gray-600">
          Control which features this tenant can access
        </p>

        {isLoading ? (
          <div className="flex h-24 items-center justify-center text-gray-500">
            Loading...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {moduleList.map((mod) => {
              const Icon = mod.icon
              const checked = modules[mod.key] !== false
              return (
                <div
                  key={mod.key}
                  className="flex items-start gap-4 rounded-lg border border-gray-100 bg-gray-50 px-4 py-4"
                >
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#7c3aed]/10">
                    <Icon className="h-4.5 w-4.5 text-[#7c3aed]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {mod.label}
                    </p>
                    <p className="text-xs text-gray-500">{mod.description}</p>
                  </div>
                  <Switch
                    checked={checked}
                    onCheckedChange={() => toggleModule(mod.key)}
                    className="shrink-0"
                  />
                </div>
              )
            })}
          </div>
        )}

        {isDirty && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="bg-[#7c3aed] hover:bg-[#6d28d9]"
            >
              {saveMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Module Settings
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ================================================================== */
/*  CONTENT TAB                                                        */
/* ================================================================== */

function ContentTab({ tenant }: { tenant: Tenant }) {
  const tenantId = tenant.id

  const { data: articles = [] } = useQuery<unknown[]>({
    queryKey: ['platform', 'content-count', tenantId, 'articles'],
    queryFn: () => tenantApi(tenantId, '/api/tenant/articles'),
  })

  const { data: pages = [] } = useQuery<unknown[]>({
    queryKey: ['platform', 'content-count', tenantId, 'pages'],
    queryFn: () => tenantApi(tenantId, '/api/tenant/pages'),
  })

  const { data: teamMembers = [] } = useQuery<unknown[]>({
    queryKey: ['platform', 'content-count', tenantId, 'team'],
    queryFn: () => tenantApi(tenantId, '/api/tenant/team-members'),
  })

  return (
    <div className="max-w-4xl space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{Array.isArray(articles) ? articles.length : 0}</p>
              <p className="text-xs text-gray-500">Articles</p>
            </div>
          </div>
          <div className="mt-4">
            <Button size="sm" variant="outline" className="w-full" asChild>
              <Link to={`/tenants/${tenantId}/content/articles`}>Manage Articles</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
              <Files className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{Array.isArray(pages) ? pages.length : 0}</p>
              <p className="text-xs text-gray-500">Pages</p>
            </div>
          </div>
          <div className="mt-4">
            <Button size="sm" variant="outline" className="w-full" asChild>
              <Link to={`/tenants/${tenantId}/content/pages`}>Manage Pages</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{Array.isArray(teamMembers) ? teamMembers.length : 0}</p>
              <p className="text-xs text-gray-500">Team Members</p>
            </div>
          </div>
          <div className="mt-4">
            <Button size="sm" variant="outline" className="w-full" asChild>
              <Link to={`/tenants/${tenantId}/content/team`}>Manage Team</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Add */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Add</h3>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link to={`/tenants/${tenantId}/content/articles/new`}>
              <Plus className="mr-1.5 h-4 w-4" />
              New Article
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link to={`/tenants/${tenantId}/content/pages`}>
              <Plus className="mr-1.5 h-4 w-4" />
              New Page
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link to={`/tenants/${tenantId}/content/team`}>
              <Plus className="mr-1.5 h-4 w-4" />
              New Team Member
            </Link>
          </Button>
        </div>
      </div>

      {/* External link fallback */}
      {tenant.cmsDomain && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 text-center">
          <p className="text-sm text-gray-500 mb-3">Or manage content directly in the tenant workspace</p>
          <Button variant="outline" className="gap-2" asChild>
            <a
              href={`https://${tenant.cmsDomain}/tenant-dashboard`}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
              Open Tenant Workspace
            </a>
          </Button>
        </div>
      )}
    </div>
  )
}
