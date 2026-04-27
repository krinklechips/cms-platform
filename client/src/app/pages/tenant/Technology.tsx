import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { Plus, Trash2, Pencil, Cpu, X } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TechnologyItem {
  id: string
  name: string
  slug: string | null
  category: string
  description: string | null
  highlights: string[]
  imageSrc: string | null
  sortOrder: number
  published: boolean
  content: unknown | null
}

interface TechFormData {
  name: string
  slug: string
  category: string
  description: string
  imageSrc: string
  sortOrder: string
  published: boolean
  highlights: string[]
  contentJson: string
}

const CATEGORY_OPTIONS = [
  'Orthodontics',
  'Lab & Restoration',
  'Cosmetic',
  'Infection Control',
  'Diagnostics',
]

const emptyForm: TechFormData = {
  name: '',
  slug: '',
  category: '',
  description: '',
  imageSrc: '',
  sortOrder: '0',
  published: true,
  highlights: [],
  contentJson: '',
}

function itemToForm(item: TechnologyItem): TechFormData {
  return {
    name: item.name ?? '',
    slug: item.slug ?? '',
    category: item.category ?? '',
    description: item.description ?? '',
    imageSrc: item.imageSrc ?? '',
    sortOrder: String(item.sortOrder ?? 0),
    published: item.published ?? true,
    highlights: Array.isArray(item.highlights) ? item.highlights : [],
    contentJson: item.content != null ? JSON.stringify(item.content, null, 2) : '',
  }
}

// ─── Highlights Editor ────────────────────────────────────────────────────────

function HighlightsEditor({
  value,
  onChange,
}: {
  value: string[]
  onChange: (next: string[]) => void
}) {
  const [newItem, setNewItem] = useState('')

  function addItem() {
    const trimmed = newItem.trim()
    if (!trimmed) return
    onChange([...value, trimmed])
    setNewItem('')
  }

  function removeItem(idx: number) {
    onChange(value.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add a highlight..."
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem() } }}
        />
        <Button type="button" size="sm" variant="outline" onClick={addItem}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {value.length > 0 && (
        <ul className="space-y-1">
          {value.map((item, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm"
            >
              <span className="text-gray-700">{item}</span>
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="ml-2 text-gray-400 hover:text-red-500"
                title="Remove"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Editor Dialog ────────────────────────────────────────────────────────────

function TechEditorDialog({
  open,
  editTarget,
  form,
  setForm,
  onClose,
  onSubmit,
  isPending,
}: {
  open: boolean
  editTarget: TechnologyItem | null
  form: TechFormData
  setForm: (f: TechFormData) => void
  onClose: () => void
  onSubmit: () => void
  isPending: boolean
}) {
  function field<K extends keyof TechFormData>(key: K, val: TechFormData[K]) {
    setForm({ ...form, [key]: val })
  }

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editTarget ? 'Edit Technology' : 'Add Technology'}</DialogTitle>
          <DialogDescription>
            {editTarget ? 'Update this technology item.' : 'Add a new technology item.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="tech-name">Name <span className="text-red-500">*</span></Label>
              <Input
                id="tech-name"
                value={form.name}
                onChange={(e) => field('name', e.target.value)}
                placeholder="Digital X-Ray"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tech-category">Category <span className="text-red-500">*</span></Label>
              <Select value={form.category} onValueChange={(v) => field('category', v)}>
                <SelectTrigger id="tech-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                  {form.category && !CATEGORY_OPTIONS.includes(form.category) && (
                    <SelectItem value={form.category}>{form.category}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Slug + Sort Order */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="tech-slug">Slug</Label>
              <Input
                id="tech-slug"
                value={form.slug}
                onChange={(e) => field('slug', e.target.value)}
                placeholder="digital-x-ray"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tech-sort">Sort Order</Label>
              <Input
                id="tech-sort"
                type="number"
                min="0"
                value={form.sortOrder}
                onChange={(e) => field('sortOrder', e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="tech-desc">Description</Label>
            <Textarea
              id="tech-desc"
              value={form.description}
              onChange={(e) => field('description', e.target.value)}
              placeholder="Describe this technology..."
              rows={3}
            />
          </div>

          {/* Image URL */}
          <div className="space-y-1.5">
            <Label htmlFor="tech-img">Image URL</Label>
            <Input
              id="tech-img"
              value={form.imageSrc}
              onChange={(e) => field('imageSrc', e.target.value)}
              placeholder="https://..."
            />
          </div>

          {/* Published */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="tech-published"
              checked={form.published}
              onChange={(e) => field('published', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="tech-published" className="cursor-pointer">Published</Label>
          </div>

          {/* Highlights */}
          <div className="space-y-1.5">
            <Label>Highlights</Label>
            <HighlightsEditor
              value={form.highlights}
              onChange={(next) => field('highlights', next)}
            />
          </div>

          {/* Content JSON */}
          <div className="space-y-1.5">
            <Label htmlFor="tech-content">Content JSON</Label>
            <p className="text-xs text-gray-500">Advanced — JSON content for detail page sections. Leave blank to save null.</p>
            <Textarea
              id="tech-content"
              value={form.contentJson}
              onChange={(e) => field('contentJson', e.target.value)}
              placeholder='{"sections": []}'
              rows={5}
              className="font-mono text-xs"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onSubmit} disabled={isPending}>
            {isPending ? 'Saving...' : editTarget ? 'Save Changes' : 'Add Technology'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Technology Page ─────────────────────────────────────────────────────

export function Technology() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<TechnologyItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TechnologyItem | null>(null)
  const [form, setForm] = useState<TechFormData>(emptyForm)

  const { data: items = [], isLoading } = useQuery<TechnologyItem[]>({
    queryKey: ['tenant', 'technology'],
    queryFn: () => api('/api/tenant/technology'),
  })

  function buildPayload(f: TechFormData) {
    let content: unknown = null
    if (f.contentJson.trim()) {
      try {
        content = JSON.parse(f.contentJson)
      } catch {
        throw new Error('Content JSON is invalid. Please fix it before saving.')
      }
    }
    return {
      name: f.name,
      slug: f.slug || null,
      category: f.category,
      description: f.description || null,
      highlights: f.highlights,
      imageSrc: f.imageSrc || null,
      sortOrder: Number(f.sortOrder) || 0,
      published: f.published,
      content,
    }
  }

  const createMutation = useMutation({
    mutationFn: (payload: ReturnType<typeof buildPayload>) =>
      api('/api/tenant/technology', { method: 'POST', body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'technology'] })
      toast.success('Technology item added')
      closeDialog()
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to add technology item'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReturnType<typeof buildPayload> }) =>
      api(`/api/tenant/technology/${id}`, { method: 'PUT', body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'technology'] })
      toast.success('Technology item updated')
      closeDialog()
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update technology item'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api(`/api/tenant/technology/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'technology'] })
      toast.success('Technology item deleted')
      setDeleteTarget(null)
    },
    onError: () => toast.error('Failed to delete technology item'),
  })

  function openAdd() {
    setEditTarget(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(item: TechnologyItem) {
    setEditTarget(item)
    setForm(itemToForm(item))
    setDialogOpen(true)
  }

  function closeDialog() {
    setDialogOpen(false)
    setEditTarget(null)
    setForm(emptyForm)
  }

  function handleSubmit() {
    if (!form.name.trim()) { toast.error('Name is required'); return }
    if (!form.category.trim()) { toast.error('Category is required'); return }
    let payload: ReturnType<typeof buildPayload>
    try {
      payload = buildPayload(form)
    } catch (err) {
      toast.error((err as Error).message)
      return
    }
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Technology"
        subtitle="Manage dental technology items shown on the technology page"
        breadcrumbs={[{ label: 'Overview', href: '/' }, { label: 'Technology' }]}
      />

      <div className="flex justify-end">
        <Button size="sm" onClick={openAdd}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Technology
        </Button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-gray-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
          <Cpu className="mb-3 h-8 w-8 text-gray-300" />
          <p className="text-sm font-medium text-gray-600">No technology items yet</p>
          <p className="mt-1 text-xs text-gray-400">Add one to get started</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Name</TableHead>
                <TableHead className="min-w-[140px]">Category</TableHead>
                <TableHead className="min-w-[120px]">Slug</TableHead>
                <TableHead className="w-24">Published</TableHead>
                <TableHead className="w-20">Sort</TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-gray-900">{item.name}</TableCell>
                  <TableCell className="text-sm text-gray-600">{item.category}</TableCell>
                  <TableCell className="font-mono text-xs text-gray-500">{item.slug || '--'}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.published
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {item.published ? 'Published' : 'Draft'}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-500">{item.sortOrder}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(item)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item)}
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

      <TechEditorDialog
        open={dialogOpen}
        editTarget={editTarget}
        form={form}
        setForm={setForm}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        isPending={isPending}
      />

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete technology item</DialogTitle>
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
