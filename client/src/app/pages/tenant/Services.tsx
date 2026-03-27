import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { Plus, Trash2, Pencil, Briefcase, FileText } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Badge } from '@/app/components/ui/badge'
import { Textarea } from '@/app/components/ui/textarea'
import { Checkbox } from '@/app/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table'
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/app/components/ui/sheet'
import { ServiceContentEditor, type ServiceSection } from './ServiceContentEditor'

interface Service {
  id: string
  name: string
  slug: string
  eyebrow?: string | null
  description?: string | null
  heroDescription?: string | null
  features: string[]
  category?: string | null
  isFeatured: boolean
  content: { sections: ServiceSection[] }
  sortOrder: number
  status: string
  createdAt?: string
  updatedAt?: string
}

interface ServiceFormData {
  name: string
  eyebrow: string
  description: string
  heroDescription: string
  featuresInput: string
  category: string
  isFeatured: boolean
  sortOrder: string
  status: string
}

const emptyForm: ServiceFormData = {
  name: '',
  eyebrow: '',
  description: '',
  heroDescription: '',
  featuresInput: '',
  category: '',
  isFeatured: false,
  sortOrder: '0',
  status: 'published',
}

function serviceToForm(s: Service): ServiceFormData {
  return {
    name: s.name ?? '',
    eyebrow: s.eyebrow ?? '',
    description: s.description ?? '',
    heroDescription: s.heroDescription ?? '',
    featuresInput: Array.isArray(s.features) ? s.features.join(', ') : '',
    category: s.category ?? '',
    isFeatured: Boolean(s.isFeatured),
    sortOrder: String(s.sortOrder ?? 0),
    status: s.status ?? 'published',
  }
}

function parseFeatures(input: string): string[] {
  return input.split(',').map((f) => f.trim()).filter(Boolean)
}

export function Services() {
  const queryClient = useQueryClient()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Service | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null)
  const [contentTarget, setContentTarget] = useState<Service | null>(null)
  const [form, setForm] = useState<ServiceFormData>(emptyForm)

  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ['tenant', 'services'],
    queryFn: () => api('/api/tenant/services'),
  })

  const createMutation = useMutation({
    mutationFn: (data: ServiceFormData) =>
      api('/api/tenant/services', {
        method: 'POST',
        body: {
          name: data.name,
          eyebrow: data.eyebrow || null,
          description: data.description || null,
          heroDescription: data.heroDescription || null,
          features: parseFeatures(data.featuresInput),
          category: data.category || null,
          isFeatured: data.isFeatured,
          sortOrder: Number(data.sortOrder) || 0,
          status: data.status,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'services'] })
      toast.success('Service added')
      setSheetOpen(false)
      setForm(emptyForm)
    },
    onError: () => toast.error('Failed to add service'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ServiceFormData }) =>
      api(`/api/tenant/services/${id}`, {
        method: 'PUT',
        body: {
          name: data.name,
          eyebrow: data.eyebrow || null,
          description: data.description || null,
          heroDescription: data.heroDescription || null,
          features: parseFeatures(data.featuresInput),
          category: data.category || null,
          isFeatured: data.isFeatured,
          sortOrder: Number(data.sortOrder) || 0,
          status: data.status,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'services'] })
      toast.success('Service updated')
      setSheetOpen(false)
      setEditTarget(null)
      setForm(emptyForm)
    },
    onError: () => toast.error('Failed to update service'),
  })

  const contentMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: { sections: ServiceSection[] } }) =>
      api(`/api/tenant/services/${id}`, {
        method: 'PUT',
        body: { content },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'services'] })
      toast.success('Page content saved')
      setContentTarget(null)
    },
    onError: () => toast.error('Failed to save content'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api(`/api/tenant/services/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'services'] })
      toast.success('Service deleted')
      setDeleteTarget(null)
    },
    onError: () => toast.error('Failed to delete service'),
  })

  function openAdd() {
    setEditTarget(null)
    setForm(emptyForm)
    setSheetOpen(true)
  }

  function openEdit(s: Service) {
    setEditTarget(s)
    setForm(serviceToForm(s))
    setSheetOpen(true)
  }

  function handleSubmit() {
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Full-screen content editor overlay */}
      {contentTarget && (
        <ServiceContentEditor
          serviceName={contentTarget.name}
          initialContent={contentTarget.content ?? { sections: [] }}
          isSaving={contentMutation.isPending}
          onSave={(content) => contentMutation.mutate({ id: contentTarget.id, content })}
          onClose={() => setContentTarget(null)}
        />
      )}

      <PageHeader
        title="Services & Pricing"
        subtitle="Manage the services listed on the website"
        breadcrumbs={[{ label: 'Overview', href: '/' }, { label: 'Services & Pricing' }]}
        actions={
          <Button onClick={openAdd} size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Add Service
          </Button>
        }
      />

      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-500">Loading...</div>
      ) : services.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <Briefcase className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-600">No services yet</p>
          <p className="mt-1 text-xs text-gray-400">Use the button above to add your first service.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="font-medium text-gray-900">{s.name}</div>
                    {s.description && (
                      <div className="mt-0.5 text-xs text-gray-400 line-clamp-1">{s.description}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-500">{s.category || '--'}</TableCell>
                  <TableCell>
                    {s.isFeatured ? (
                      <Badge variant="secondary" className="text-xs">Featured</Badge>
                    ) : (
                      <span className="text-gray-400 text-xs">--</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.status === 'published' ? 'default' : 'secondary'}>
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setContentTarget(s)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-purple-50 hover:text-purple-600"
                        title="Edit page content"
                      >
                        <FileText className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => openEdit(s)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        title="Edit details"
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

      {/* Add / Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={(open) => { setSheetOpen(open); if (!open) { setEditTarget(null); setForm(emptyForm) } }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editTarget ? 'Edit Service' : 'Add Service'}</SheetTitle>
            <SheetDescription>
              {editTarget ? 'Update service details.' : 'Add a new service to the website.'}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="svc-name">Name <span className="text-red-500">*</span></Label>
              <Input
                id="svc-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Dental Implants"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="svc-eyebrow">Eyebrow Label <span className="text-gray-400 text-xs">(small text above title on page)</span></Label>
              <Input
                id="svc-eyebrow"
                value={form.eyebrow}
                onChange={(e) => setForm({ ...form, eyebrow: e.target.value })}
                placeholder="IMPLANTOLOGY"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="svc-description">Short Description <span className="text-gray-400 text-xs">(used in service cards)</span></Label>
              <Textarea
                id="svc-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of this service..."
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="svc-hero-desc">Hero Description <span className="text-gray-400 text-xs">(longer intro shown at top of service page)</span></Label>
              <Textarea
                id="svc-hero-desc"
                value={form.heroDescription}
                onChange={(e) => setForm({ ...form, heroDescription: e.target.value })}
                placeholder="Dental implants are currently the best treatment option for a lost tooth..."
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="svc-features">Key Features</Label>
              <Input
                id="svc-features"
                value={form.featuresInput}
                onChange={(e) => setForm({ ...form, featuresInput: e.target.value })}
                placeholder="Single Implant, Implant Bridge, All-on-4"
              />
              <p className="text-xs text-gray-400">Separate features with commas</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="svc-category">Category</Label>
              <Input
                id="svc-category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Implants & Reconstruction, Cosmetic, Orthodontics..."
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="svc-featured"
                checked={form.isFeatured}
                onCheckedChange={(checked) => setForm({ ...form, isFeatured: Boolean(checked) })}
              />
              <Label htmlFor="svc-featured" className="cursor-pointer">Featured service</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="svc-sort-order">Sort Order</Label>
                <Input
                  id="svc-sort-order"
                  type="number"
                  min="0"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="svc-status">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger id="svc-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? 'Saving...' : editTarget ? 'Save Changes' : 'Add Service'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
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
