import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { Plus, Trash2, Pencil, Globe } from 'lucide-react'
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

interface Step {
  id: number
  step_label: string | null
  title: string
  description: string | null
  sort_order: number
}

interface WhyItem {
  id: number
  title: string
  description: string | null
  sort_order: number
}

interface PopularTreatment {
  id: number
  name: string
  saving: string | null
  sort_order: number
}

// ─── Steps Tab ────────────────────────────────────────────────────────────────

interface StepFormData {
  step_label: string
  title: string
  description: string
  sort_order: string
}

const emptyStepForm: StepFormData = {
  step_label: '',
  title: '',
  description: '',
  sort_order: '0',
}

function stepToForm(s: Step): StepFormData {
  return {
    step_label: s.step_label ?? '',
    title: s.title ?? '',
    description: s.description ?? '',
    sort_order: String(s.sort_order ?? 0),
  }
}

function StepsTab() {
  const queryClient = useQueryClient()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Step | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Step | null>(null)
  const [form, setForm] = useState<StepFormData>(emptyStepForm)

  const { data: steps = [], isLoading } = useQuery<Step[]>({
    queryKey: ['tenant', 'international', 'steps'],
    queryFn: () => api('/api/tenant/international/steps'),
  })

  const createMutation = useMutation({
    mutationFn: (data: StepFormData) =>
      api('/api/tenant/international/steps', {
        method: 'POST',
        body: {
          step_label: data.step_label || null,
          title: data.title,
          description: data.description || null,
          sort_order: Number(data.sort_order) || 0,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'international', 'steps'] })
      toast.success('Step added')
      setSheetOpen(false)
      setForm(emptyStepForm)
    },
    onError: () => toast.error('Failed to add step'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: StepFormData }) =>
      api(`/api/tenant/international/steps/${id}`, {
        method: 'PUT',
        body: {
          step_label: data.step_label || null,
          title: data.title,
          description: data.description || null,
          sort_order: Number(data.sort_order) || 0,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'international', 'steps'] })
      toast.success('Step updated')
      setSheetOpen(false)
      setEditTarget(null)
      setForm(emptyStepForm)
    },
    onError: () => toast.error('Failed to update step'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      api(`/api/tenant/international/steps/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'international', 'steps'] })
      toast.success('Step deleted')
      setDeleteTarget(null)
    },
    onError: () => toast.error('Failed to delete step'),
  })

  function openAdd() {
    setEditTarget(null)
    setForm(emptyStepForm)
    setSheetOpen(true)
  }

  function openEdit(s: Step) {
    setEditTarget(s)
    setForm(stepToForm(s))
    setSheetOpen(true)
  }

  function handleSubmit() {
    if (!form.title.trim()) {
      toast.error('Title is required')
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
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openAdd}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Step
        </Button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-gray-500">Loading...</div>
      ) : steps.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
          <Globe className="mb-3 h-8 w-8 text-gray-300" />
          <p className="text-sm font-medium text-gray-600">No steps yet</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Label</TableHead>
                <TableHead className="min-w-[160px]">Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-20">Sort</TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {steps.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-gray-500">{s.step_label || '--'}</TableCell>
                  <TableCell className="font-medium text-gray-900">{s.title}</TableCell>
                  <TableCell className="text-sm text-gray-500 max-w-xs truncate">{s.description || '--'}</TableCell>
                  <TableCell className="text-gray-500">{s.sort_order}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(s)}
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

      {/* Add / Edit Dialog */}
      <Dialog open={sheetOpen} onOpenChange={(open) => { setSheetOpen(open); if (!open) { setEditTarget(null); setForm(emptyStepForm) } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Step' : 'Add Step'}</DialogTitle>
            <DialogDescription>
              {editTarget ? 'Update this how-it-works step.' : 'Add a new how-it-works step.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="step-label">Label</Label>
                <Input
                  id="step-label"
                  value={form.step_label}
                  onChange={(e) => setForm({ ...form, step_label: e.target.value })}
                  placeholder="01"
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="step-sort">Sort Order</Label>
                <Input
                  id="step-sort"
                  type="number"
                  min="0"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="step-title">Title <span className="text-red-500">*</span></Label>
              <Input
                id="step-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Contact & Consultation"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="step-desc">Description</Label>
              <Textarea
                id="step-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe this step..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? 'Saving...' : editTarget ? 'Save Changes' : 'Add Step'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete step</DialogTitle>
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

// ─── Why Items Tab ────────────────────────────────────────────────────────────

interface WhyItemFormData {
  title: string
  description: string
  sort_order: string
}

const emptyWhyForm: WhyItemFormData = {
  title: '',
  description: '',
  sort_order: '0',
}

function whyToForm(w: WhyItem): WhyItemFormData {
  return {
    title: w.title ?? '',
    description: w.description ?? '',
    sort_order: String(w.sort_order ?? 0),
  }
}

function WhyItemsTab() {
  const queryClient = useQueryClient()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<WhyItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<WhyItem | null>(null)
  const [form, setForm] = useState<WhyItemFormData>(emptyWhyForm)

  const { data: items = [], isLoading } = useQuery<WhyItem[]>({
    queryKey: ['tenant', 'international', 'why-items'],
    queryFn: () => api('/api/tenant/international/why-items'),
  })

  const createMutation = useMutation({
    mutationFn: (data: WhyItemFormData) =>
      api('/api/tenant/international/why-items', {
        method: 'POST',
        body: {
          title: data.title,
          description: data.description || null,
          sort_order: Number(data.sort_order) || 0,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'international', 'why-items'] })
      toast.success('Item added')
      setSheetOpen(false)
      setForm(emptyWhyForm)
    },
    onError: () => toast.error('Failed to add item'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: WhyItemFormData }) =>
      api(`/api/tenant/international/why-items/${id}`, {
        method: 'PUT',
        body: {
          title: data.title,
          description: data.description || null,
          sort_order: Number(data.sort_order) || 0,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'international', 'why-items'] })
      toast.success('Item updated')
      setSheetOpen(false)
      setEditTarget(null)
      setForm(emptyWhyForm)
    },
    onError: () => toast.error('Failed to update item'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      api(`/api/tenant/international/why-items/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'international', 'why-items'] })
      toast.success('Item deleted')
      setDeleteTarget(null)
    },
    onError: () => toast.error('Failed to delete item'),
  })

  function openAdd() {
    setEditTarget(null)
    setForm(emptyWhyForm)
    setSheetOpen(true)
  }

  function openEdit(w: WhyItem) {
    setEditTarget(w)
    setForm(whyToForm(w))
    setSheetOpen(true)
  }

  function handleSubmit() {
    if (!form.title.trim()) {
      toast.error('Title is required')
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
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openAdd}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-gray-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
          <Globe className="mb-3 h-8 w-8 text-gray-300" />
          <p className="text-sm font-medium text-gray-600">No items yet</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-20">Sort</TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="font-medium text-gray-900">{w.title}</TableCell>
                  <TableCell className="text-sm text-gray-500 max-w-xs truncate">{w.description || '--'}</TableCell>
                  <TableCell className="text-gray-500">{w.sort_order}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(w)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(w)}
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

      {/* Add / Edit Dialog */}
      <Dialog open={sheetOpen} onOpenChange={(open) => { setSheetOpen(open); if (!open) { setEditTarget(null); setForm(emptyWhyForm) } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Item' : 'Add Item'}</DialogTitle>
            <DialogDescription>
              {editTarget ? 'Update this reason to choose us.' : 'Add a new reason to choose us.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label htmlFor="why-title">Title <span className="text-red-500">*</span></Label>
                <Input
                  id="why-title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="World-Class Surgeons"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="why-sort">Sort Order</Label>
                <Input
                  id="why-sort"
                  type="number"
                  min="0"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="why-desc">Description</Label>
              <Textarea
                id="why-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe this benefit..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? 'Saving...' : editTarget ? 'Save Changes' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete item</DialogTitle>
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

// ─── Popular Treatments Tab ───────────────────────────────────────────────────

interface TreatmentFormData {
  name: string
  saving: string
  sort_order: string
}

const emptyTreatmentForm: TreatmentFormData = {
  name: '',
  saving: '',
  sort_order: '0',
}

function treatmentToForm(t: PopularTreatment): TreatmentFormData {
  return {
    name: t.name ?? '',
    saving: t.saving ?? '',
    sort_order: String(t.sort_order ?? 0),
  }
}

function PopularTreatmentsTab() {
  const queryClient = useQueryClient()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<PopularTreatment | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PopularTreatment | null>(null)
  const [form, setForm] = useState<TreatmentFormData>(emptyTreatmentForm)

  const { data: treatments = [], isLoading } = useQuery<PopularTreatment[]>({
    queryKey: ['tenant', 'international', 'popular-treatments'],
    queryFn: () => api('/api/tenant/international/popular-treatments'),
  })

  const createMutation = useMutation({
    mutationFn: (data: TreatmentFormData) =>
      api('/api/tenant/international/popular-treatments', {
        method: 'POST',
        body: {
          name: data.name,
          saving: data.saving || null,
          sort_order: Number(data.sort_order) || 0,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'international', 'popular-treatments'] })
      toast.success('Treatment added')
      setSheetOpen(false)
      setForm(emptyTreatmentForm)
    },
    onError: () => toast.error('Failed to add treatment'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TreatmentFormData }) =>
      api(`/api/tenant/international/popular-treatments/${id}`, {
        method: 'PUT',
        body: {
          name: data.name,
          saving: data.saving || null,
          sort_order: Number(data.sort_order) || 0,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'international', 'popular-treatments'] })
      toast.success('Treatment updated')
      setSheetOpen(false)
      setEditTarget(null)
      setForm(emptyTreatmentForm)
    },
    onError: () => toast.error('Failed to update treatment'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      api(`/api/tenant/international/popular-treatments/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'international', 'popular-treatments'] })
      toast.success('Treatment deleted')
      setDeleteTarget(null)
    },
    onError: () => toast.error('Failed to delete treatment'),
  })

  function openAdd() {
    setEditTarget(null)
    setForm(emptyTreatmentForm)
    setSheetOpen(true)
  }

  function openEdit(t: PopularTreatment) {
    setEditTarget(t)
    setForm(treatmentToForm(t))
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
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openAdd}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Treatment
        </Button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-gray-500">Loading...</div>
      ) : treatments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
          <Globe className="mb-3 h-8 w-8 text-gray-300" />
          <p className="text-sm font-medium text-gray-600">No treatments yet</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Treatment Name</TableHead>
                <TableHead className="min-w-[120px]">Saving</TableHead>
                <TableHead className="w-20">Sort</TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {treatments.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium text-gray-900">{t.name}</TableCell>
                  <TableCell className="text-sm text-gray-500">{t.saving || '--'}</TableCell>
                  <TableCell className="text-gray-500">{t.sort_order}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(t)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(t)}
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

      {/* Add / Edit Dialog */}
      <Dialog open={sheetOpen} onOpenChange={(open) => { setSheetOpen(open); if (!open) { setEditTarget(null); setForm(emptyTreatmentForm) } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Treatment' : 'Add Treatment'}</DialogTitle>
            <DialogDescription>
              {editTarget ? 'Update this popular treatment.' : 'Add a new popular treatment.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="treat-name">Treatment Name <span className="text-red-500">*</span></Label>
              <Input
                id="treat-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Dental Implants"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="treat-saving">Saving</Label>
                <Input
                  id="treat-saving"
                  value={form.saving}
                  onChange={(e) => setForm({ ...form, saving: e.target.value })}
                  placeholder="Save ~50%"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="treat-sort">Sort Order</Label>
                <Input
                  id="treat-sort"
                  type="number"
                  min="0"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? 'Saving...' : editTarget ? 'Save Changes' : 'Add Treatment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete treatment</DialogTitle>
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

// ─── Main International Page ──────────────────────────────────────────────────

export function International() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="International Page"
        subtitle="Manage content for the international patients section"
        breadcrumbs={[{ label: 'Overview', href: '/' }, { label: 'International' }]}
      />

      <Tabs defaultValue="steps">
        <TabsList>
          <TabsTrigger value="steps">How It Works</TabsTrigger>
          <TabsTrigger value="why">Why Choose Us</TabsTrigger>
          <TabsTrigger value="treatments">Popular Treatments</TabsTrigger>
        </TabsList>

        <TabsContent value="steps" className="mt-6">
          <StepsTab />
        </TabsContent>

        <TabsContent value="why" className="mt-6">
          <WhyItemsTab />
        </TabsContent>

        <TabsContent value="treatments" className="mt-6">
          <PopularTreatmentsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
