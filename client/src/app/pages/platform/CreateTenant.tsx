import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/query-client'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface TenantPayload {
  name: string
  slug: string
  status: string
  branding: {
    primaryColor: string
    logoUrl: string
    supportEmail: string
    publicSiteUrl: string
    cmsDomain: string
  }
}

interface CreatedTenant {
  id: number
  name: string
  slug: string
}

export function CreateTenant() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [status, setStatus] = useState('active')
  const [primaryColor, setPrimaryColor] = useState('#2563EB')
  const [logoUrl, setLogoUrl] = useState('')
  const [supportEmail, setSupportEmail] = useState('')
  const [publicSiteUrl, setPublicSiteUrl] = useState('')
  const [cmsDomain, setCmsDomain] = useState('')

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

  const handleNameChange = (value: string) => {
    setName(value)
    setSlug(slugify(value))
  }

  const createMutation = useMutation({
    mutationFn: (payload: TenantPayload) =>
      api<CreatedTenant>('/api/platform/tenants', {
        method: 'POST',
        body: payload,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'tenants'] })
      toast.success('Tenant created successfully')
      navigate(`/tenants/${data.id}`)
    },
    onError: (err: unknown) => {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Failed to create tenant'
      toast.error(message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      name,
      slug,
      status,
      branding: {
        primaryColor,
        logoUrl,
        supportEmail,
        publicSiteUrl,
        cmsDomain,
      },
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
    <div className="flex h-full flex-col">
      <div className="bg-white border-b border-gray-200 px-8 pt-6">
        <PageHeader
          title="Create Tenant"
          subtitle="Set up a new customer tenant"
          breadcrumbs={[{label:'Dashboard', href:'/'}, {label:'Tenants', href:'/tenants'}, {label:'Create'}]}
        />
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 p-8">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Create New Tenant
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Set up a new customer workspace
            </p>
          </div>

          {/* Basic Information */}
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-1 text-lg font-semibold text-gray-900">
              Basic Information
            </h3>
            <p className="mb-6 text-sm text-gray-600">
              Core details for the new tenant
            </p>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-900"
                  >
                    Tenant name *
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g., Acme Corporation"
                    className="mt-1.5"
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor="slug"
                    className="text-sm font-medium text-gray-900"
                  >
                    Slug *
                  </Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="acmecorp"
                    className="mt-1.5"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Lowercase letters, numbers, and hyphens only
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="status"
                    className="text-sm font-medium text-gray-900"
                  >
                    Status
                  </Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label
                    htmlFor="primaryColor"
                    className="text-sm font-medium text-gray-900"
                  >
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
                      id="primaryColor"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="max-w-[120px]"
                      placeholder="#2563EB"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Branding & URLs */}
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-1 text-lg font-semibold text-gray-900">
              Branding & URLs
            </h3>
            <p className="mb-6 text-sm text-gray-600">
              Logo, support contact, and domains
            </p>

            <div className="space-y-6">
              <div>
                <Label
                  htmlFor="logoUrl"
                  className="text-sm font-medium text-gray-900"
                >
                  Logo URL
                </Label>
                <Input
                  id="logoUrl"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label
                  htmlFor="supportEmail"
                  className="text-sm font-medium text-gray-900"
                >
                  Support email
                </Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="support@example.com"
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="publicSiteUrl"
                    className="text-sm font-medium text-gray-900"
                  >
                    Public site URL
                  </Label>
                  <Input
                    id="publicSiteUrl"
                    value={publicSiteUrl}
                    onChange={(e) => setPublicSiteUrl(e.target.value)}
                    placeholder="https://www.example.com"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="cmsDomain"
                    className="text-sm font-medium text-gray-900"
                  >
                    CMS domain
                  </Label>
                  <Input
                    id="cmsDomain"
                    value={cmsDomain}
                    onChange={(e) => setCmsDomain(e.target.value)}
                    placeholder="cms.example.com"
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/tenants')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || !name || !slug}
              className="bg-[#7c3aed] hover:bg-[#6d28d9]"
            >
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Tenant
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
