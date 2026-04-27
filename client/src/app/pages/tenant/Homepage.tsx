import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { Plus, Trash2, Pencil, Home } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SiteStat {
  key: string
  displayValue: string
  numericValue: number | null
  suffix: string | null
  label: string
  sortOrder: number
}

interface BrandLogo {
  id: number
  slug: string
  name: string
  logoSrc: string
  sortOrder: number
}

interface FeatureCard {
  id: number
  slug: string
  title: string
  description: string
  imageSrc: string
  imageAlt: string
  href: string
  cta: string
  sortOrder: number
}

// ─── Site Stats Tab ───────────────────────────────────────────────────────────

interface StatFormData {
  key: string
  label: string
  displayValue: string
  numericValue: string
  suffix: string
  sortOrder: string
}

const emptyStatForm: StatFormData = {
  key: '',
  label: '',
  displayValue: '',
  numericValue: '',
  suffix: '',
  sortOrder: '0',
}

function statToForm(s: SiteStat): StatFormData {
  return {
    key: s.key,
    label: s.label,
    displayValue: s.displayValue,
    numericValue: s.numericValue != null ? String(s.numericValue) : '',
    suffix: s.suffix ?? '',
    sortOrder: String(s.sortOrder),
  }
}

function StatDialog({
  editTarget,
  onClose,
}: {
  editTarget: SiteStat | null
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<StatFormData>(
    editTarget ? statToForm(editTarget) : emptyStatForm,
  )

  const createMutation = useMutation({
    mutationFn: (data: StatFormData) =>
      api('/api/tenant/homepage/stats', {
        method: 'POST',
        body: {
          key: data.key.trim(),
          label: data.label,
          display_value: data.displayValue,
          numeric_value: data.numericValue !== '' ? Number(data.numericValue) : null,
          suffix: data.suffix || null,
          sort_order: Number(data.sortOrder) || 0,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'homepage', 'stats'] })
      toast.success('Stat added')
      onClose()
    },
    onError: () => toast.error('Failed to add stat'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ key, data }: { key: string; data: StatFormData }) =>
      api(`/api/tenant/homepage/stats/${encodeURIComponent(key)}`, {
        method: 'PUT',
        body: {
          label: data.label,
          display_value: data.displayValue,
          numeric_value: data.numericValue !== '' ? Number(data.numericValue) : null,
          suffix: data.suffix || null,
          sort_order: Number(data.sortOrder) || 0,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'homepage', 'stats'] })
      toast.success('Stat updated')
      onClose()
    },
    onError: () => toast.error('Failed to update stat'),
  })

  function handleSubmit() {
    if (!form.label.trim()) { toast.error('Label is required'); return }
    if (!form.displayValue.trim()) { toast.error('Display Value is required'); return }
    if (!editTarget && !form.key.trim()) { toast.error('Key is required'); return }
    if (editTarget) {
      updateMutation.mutate({ key: editTarget.key, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editTarget ? 'Edit Stat' : 'Add Stat'}</DialogTitle>
          <DialogDescription>
            {editTarget ? 'Update this site statistic.' : 'Add a new site statistic.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {!editTarget && (
            <div className="space-y-1.5">
              <Label htmlFor="stat-key">
                Key <span className="text-red-500">*</span>
                <span className="ml-1 text-xs text-gray-400">(no spaces)</span>
              </Label>
              <Input
                id="stat-key"
                value={form.key}
                onChange={(e) => setForm({ ...form, key: e.target.value.replace(/\s/g, '_') })}
                placeholder="years_experience"
              />
            </div>
          )}
          {editTarget && (
            <div className="space-y-1.5">
              <Label>Key</Label>
              <Input value={form.key} disabled className="bg-gray-50 text-gray-500" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="stat-label">Label <span className="text-red-500">*</span></Label>
            <Input
              id="stat-label"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="Years of Experience"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="stat-display">Display Value <span className="text-red-500">*</span></Label>
              <Input
                id="stat-display"
                value={form.displayValue}
                onChange={(e) => setForm({ ...form, displayValue: e.target.value })}
                placeholder="20+"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stat-numeric">Numeric Value</Label>
              <Input
                id="stat-numeric"
                type="number"
                value={form.numericValue}
                onChange={(e) => setForm({ ...form, numericValue: e.target.value })}
                placeholder="20"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="stat-suffix">Suffix</Label>
              <Input
                id="stat-suffix"
                value={form.suffix}
                onChange={(e) => setForm({ ...form, suffix: e.target.value })}
                placeholder="+"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stat-sort">Sort Order</Label>
              <Input
                id="stat-sort"
                type="number"
                min="0"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Saving...' : editTarget ? 'Save Changes' : 'Add Stat'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SiteStatsTab() {
  const queryClient = useQueryClient()
  const [dialog, setDialog] = useState<SiteStat | 'new' | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SiteStat | null>(null)

  const { data: stats = [], isLoading } = useQuery<SiteStat[]>({
    queryKey: ['tenant', 'homepage', 'stats'],
    queryFn: () => api('/api/tenant/homepage/stats'),
  })

  const deleteMutation = useMutation({
    mutationFn: (key: string) =>
      api(`/api/tenant/homepage/stats/${encodeURIComponent(key)}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'homepage', 'stats'] })
      toast.success('Stat deleted')
      setDeleteTarget(null)
    },
    onError: () => toast.error('Failed to delete stat'),
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setDialog('new')}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Stat
        </Button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-gray-500">Loading...</div>
      ) : stats.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
          <Home className="mb-3 h-8 w-8 text-gray-300" />
          <p className="text-sm font-medium text-gray-600">No stats yet</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[140px]">Label</TableHead>
                <TableHead className="w-32">Key</TableHead>
                <TableHead className="w-28">Display Value</TableHead>
                <TableHead className="w-28">Numeric Value</TableHead>
                <TableHead className="w-20">Suffix</TableHead>
                <TableHead className="w-20">Sort</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((s) => (
                <TableRow key={s.key}>
                  <TableCell className="font-medium text-gray-900">{s.label}</TableCell>
                  <TableCell className="font-mono text-xs text-gray-500">{s.key}</TableCell>
                  <TableCell className="text-gray-700">{s.displayValue}</TableCell>
                  <TableCell className="text-gray-500">{s.numericValue ?? '--'}</TableCell>
                  <TableCell className="text-gray-500">{s.suffix || '--'}</TableCell>
                  <TableCell className="text-gray-500">{s.sortOrder}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setDialog(s)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(s)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {dialog !== null && (
        <StatDialog
          editTarget={dialog === 'new' ? null : dialog}
          onClose={() => setDialog(null)}
        />
      )}

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete stat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.label}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.key)}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Brand Logos Tab ──────────────────────────────────────────────────────────

interface BrandLogoFormData {
  slug: string
  name: string
  logoSrc: string
  sortOrder: string
}

const emptyBrandForm: BrandLogoFormData = {
  slug: '',
  name: '',
  logoSrc: '',
  sortOrder: '0',
}

function brandToForm(b: BrandLogo): BrandLogoFormData {
  return {
    slug: b.slug,
    name: b.name,
    logoSrc: b.logoSrc,
    sortOrder: String(b.sortOrder),
  }
}

function BrandLogoDialog({
  editTarget,
  onClose,
}: {
  editTarget: BrandLogo | null
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<BrandLogoFormData>(
    editTarget ? brandToForm(editTarget) : emptyBrandForm,
  )

  const createMutation = useMutation({
    mutationFn: (data: BrandLogoFormData) =>
      api('/api/tenant/homepage/brand-logos', {
        method: 'POST',
        body: {
          slug: data.slug,
          name: data.name,
          logo_src: data.logoSrc,
          sort_order: Number(data.sortOrder) || 0,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'homepage', 'brand-logos'] })
      toast.success('Brand logo added')
      onClose()
    },
    onError: () => toast.error('Failed to add brand logo'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BrandLogoFormData }) =>
      api(`/api/tenant/homepage/brand-logos/${id}`, {
        method: 'PUT',
        body: {
          slug: data.slug,
          name: data.name,
          logo_src: data.logoSrc,
          sort_order: Number(data.sortOrder) || 0,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'homepage', 'brand-logos'] })
      toast.success('Brand logo updated')
      onClose()
    },
    onError: () => toast.error('Failed to update brand logo'),
  })

  function handleSubmit() {
    if (!form.slug.trim()) { toast.error('Slug is required'); return }
    if (!form.name.trim()) { toast.error('Name is required'); return }
    if (!form.logoSrc.trim()) { toast.error('Logo URL is required'); return }
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editTarget ? 'Edit Brand Logo' : 'Add Brand Logo'}</DialogTitle>
          <DialogDescription>
            {editTarget ? 'Update this brand logo.' : 'Add a new brand logo to the marquee.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="brand-name">Name <span className="text-red-500">*</span></Label>
              <Input
                id="brand-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Invisalign"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="brand-slug">Slug <span className="text-red-500">*</span></Label>
              <Input
                id="brand-slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="invisalign"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="brand-logo">Logo URL <span className="text-red-500">*</span></Label>
            <Input
              id="brand-logo"
              value={form.logoSrc}
              onChange={(e) => setForm({ ...form, logoSrc: e.target.value })}
              placeholder="https://..."
            />
            {form.logoSrc && (
              <div className="mt-2 flex items-center gap-2">
                <img
                  src={form.logoSrc}
                  alt={form.name || 'preview'}
                  className="h-8 max-w-[120px] object-contain rounded border border-gray-200 bg-gray-50 p-1"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
                <span className="text-xs text-gray-400">Preview</span>
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="brand-sort">Sort Order</Label>
            <Input
              id="brand-sort"
              type="number"
              min="0"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Saving...' : editTarget ? 'Save Changes' : 'Add Logo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function BrandLogosTab() {
  const queryClient = useQueryClient()
  const [dialog, setDialog] = useState<BrandLogo | 'new' | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BrandLogo | null>(null)

  const { data: logos = [], isLoading } = useQuery<BrandLogo[]>({
    queryKey: ['tenant', 'homepage', 'brand-logos'],
    queryFn: () => api('/api/tenant/homepage/brand-logos'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      api(`/api/tenant/homepage/brand-logos/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'homepage', 'brand-logos'] })
      toast.success('Brand logo deleted')
      setDeleteTarget(null)
    },
    onError: () => toast.error('Failed to delete brand logo'),
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setDialog('new')}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Logo
        </Button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-gray-500">Loading...</div>
      ) : logos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
          <Home className="mb-3 h-8 w-8 text-gray-300" />
          <p className="text-sm font-medium text-gray-600">No brand logos yet</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[140px]">Name</TableHead>
                <TableHead className="w-32">Slug</TableHead>
                <TableHead className="min-w-[100px]">Logo</TableHead>
                <TableHead className="w-20">Sort</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logos.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium text-gray-900">{b.name}</TableCell>
                  <TableCell className="font-mono text-xs text-gray-500">{b.slug}</TableCell>
                  <TableCell>
                    <img
                      src={b.logoSrc}
                      alt={b.name}
                      className="h-7 max-w-[100px] object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  </TableCell>
                  <TableCell className="text-gray-500">{b.sortOrder}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setDialog(b)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(b)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {dialog !== null && (
        <BrandLogoDialog
          editTarget={dialog === 'new' ? null : dialog}
          onClose={() => setDialog(null)}
        />
      )}

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete brand logo</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Feature Cards Tab ────────────────────────────────────────────────────────

interface FeatureCardFormData {
  slug: string
  title: string
  description: string
  imageSrc: string
  imageAlt: string
  href: string
  cta: string
  sortOrder: string
}

const emptyCardForm: FeatureCardFormData = {
  slug: '',
  title: '',
  description: '',
  imageSrc: '',
  imageAlt: '',
  href: '',
  cta: '',
  sortOrder: '0',
}

function cardToForm(c: FeatureCard): FeatureCardFormData {
  return {
    slug: c.slug,
    title: c.title,
    description: c.description,
    imageSrc: c.imageSrc,
    imageAlt: c.imageAlt,
    href: c.href,
    cta: c.cta,
    sortOrder: String(c.sortOrder),
  }
}

function FeatureCardDialog({
  editTarget,
  onClose,
}: {
  editTarget: FeatureCard | null
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<FeatureCardFormData>(
    editTarget ? cardToForm(editTarget) : emptyCardForm,
  )

  const createMutation = useMutation({
    mutationFn: (data: FeatureCardFormData) =>
      api('/api/tenant/homepage/feature-cards', {
        method: 'POST',
        body: {
          slug: data.slug,
          title: data.title,
          description: data.description,
          image_src: data.imageSrc,
          image_alt: data.imageAlt,
          href: data.href,
          cta: data.cta,
          sort_order: Number(data.sortOrder) || 0,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'homepage', 'feature-cards'] })
      toast.success('Feature card added')
      onClose()
    },
    onError: () => toast.error('Failed to add feature card'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FeatureCardFormData }) =>
      api(`/api/tenant/homepage/feature-cards/${id}`, {
        method: 'PUT',
        body: {
          slug: data.slug,
          title: data.title,
          description: data.description,
          image_src: data.imageSrc,
          image_alt: data.imageAlt,
          href: data.href,
          cta: data.cta,
          sort_order: Number(data.sortOrder) || 0,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'homepage', 'feature-cards'] })
      toast.success('Feature card updated')
      onClose()
    },
    onError: () => toast.error('Failed to update feature card'),
  })

  function handleSubmit() {
    if (!form.slug.trim()) { toast.error('Slug is required'); return }
    if (!form.title.trim()) { toast.error('Title is required'); return }
    if (!form.description.trim()) { toast.error('Description is required'); return }
    if (!form.imageSrc.trim()) { toast.error('Image URL is required'); return }
    if (!form.imageAlt.trim()) { toast.error('Image Alt is required'); return }
    if (!form.href.trim()) { toast.error('Href is required'); return }
    if (!form.cta.trim()) { toast.error('CTA text is required'); return }
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editTarget ? 'Edit Feature Card' : 'Add Feature Card'}</DialogTitle>
          <DialogDescription>
            {editTarget ? 'Update this homepage feature card.' : 'Add a new homepage feature card.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="card-slug">Slug <span className="text-red-500">*</span></Label>
              <Input
                id="card-slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="implants"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="card-sort">Sort Order</Label>
              <Input
                id="card-sort"
                type="number"
                min="0"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="card-title">Title <span className="text-red-500">*</span></Label>
            <Input
              id="card-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Dental Implants"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="card-desc">Description <span className="text-red-500">*</span></Label>
            <Textarea
              id="card-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Permanent, natural-looking tooth replacements..."
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="card-image">Image URL <span className="text-red-500">*</span></Label>
            <Input
              id="card-image"
              value={form.imageSrc}
              onChange={(e) => setForm({ ...form, imageSrc: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="card-alt">Image Alt <span className="text-red-500">*</span></Label>
            <Input
              id="card-alt"
              value={form.imageAlt}
              onChange={(e) => setForm({ ...form, imageAlt: e.target.value })}
              placeholder="Dental implant procedure"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="card-href">Href <span className="text-red-500">*</span></Label>
              <Input
                id="card-href"
                value={form.href}
                onChange={(e) => setForm({ ...form, href: e.target.value })}
                placeholder="/services/implants"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="card-cta">CTA Text <span className="text-red-500">*</span></Label>
              <Input
                id="card-cta"
                value={form.cta}
                onChange={(e) => setForm({ ...form, cta: e.target.value })}
                placeholder="Learn more"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Saving...' : editTarget ? 'Save Changes' : 'Add Card'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function FeatureCardsTab() {
  const queryClient = useQueryClient()
  const [dialog, setDialog] = useState<FeatureCard | 'new' | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<FeatureCard | null>(null)

  const { data: cards = [], isLoading } = useQuery<FeatureCard[]>({
    queryKey: ['tenant', 'homepage', 'feature-cards'],
    queryFn: () => api('/api/tenant/homepage/feature-cards'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      api(`/api/tenant/homepage/feature-cards/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'homepage', 'feature-cards'] })
      toast.success('Feature card deleted')
      setDeleteTarget(null)
    },
    onError: () => toast.error('Failed to delete feature card'),
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setDialog('new')}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Card
        </Button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-gray-500">Loading...</div>
      ) : cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
          <Home className="mb-3 h-8 w-8 text-gray-300" />
          <p className="text-sm font-medium text-gray-600">No feature cards yet</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[160px]">Title</TableHead>
                <TableHead className="w-32">Slug</TableHead>
                <TableHead className="w-28">CTA</TableHead>
                <TableHead className="w-20">Sort</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cards.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium text-gray-900">{c.title}</TableCell>
                  <TableCell className="font-mono text-xs text-gray-500">{c.slug}</TableCell>
                  <TableCell className="text-sm text-gray-500">{c.cta}</TableCell>
                  <TableCell className="text-gray-500">{c.sortOrder}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setDialog(c)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(c)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {dialog !== null && (
        <FeatureCardDialog
          editTarget={dialog === 'new' ? null : dialog}
          onClose={() => setDialog(null)}
        />
      )}

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete feature card</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.title}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Main Homepage Page ───────────────────────────────────────────────────────

export function Homepage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Homepage"
        subtitle="Manage site stats, brand logos, and featured cards shown on the homepage"
        breadcrumbs={[{ label: 'Overview', href: '/' }, { label: 'Homepage' }]}
      />

      <Tabs defaultValue="stats">
        <TabsList>
          <TabsTrigger value="stats">Site Stats</TabsTrigger>
          <TabsTrigger value="brand-logos">Brand Logos</TabsTrigger>
          <TabsTrigger value="feature-cards">Feature Cards</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="mt-6">
          <SiteStatsTab />
        </TabsContent>

        <TabsContent value="brand-logos" className="mt-6">
          <BrandLogosTab />
        </TabsContent>

        <TabsContent value="feature-cards" className="mt-6">
          <FeatureCardsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
