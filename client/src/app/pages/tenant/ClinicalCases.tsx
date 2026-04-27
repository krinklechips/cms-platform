import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { Plus, Trash2, X, Save, Activity } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Badge } from '@/app/components/ui/badge'
import { Textarea } from '@/app/components/ui/textarea'
import { Separator } from '@/app/components/ui/separator'
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

interface GalleryImage {
  src: string
  caption: string
}

interface ClinicalCase {
  id: string
  slug: string
  title: string
  category: string | null
  tag: string | null
  treatment: string | null
  duration: string | null
  description: string | null
  fullText: string | null
  cardImage: string | null
  images: GalleryImage[]
  sortOrder: number
  status: string
}

interface CaseFormData {
  title: string
  slug: string
  category: string
  tag: string
  treatment: string
  duration: string
  description: string
  cardImage: string
  status: string
  sortOrder: string
  fullText: string
  images: GalleryImage[]
}

const emptyForm: CaseFormData = {
  title: '',
  slug: '',
  category: '',
  tag: '',
  treatment: '',
  duration: '',
  description: '',
  cardImage: '',
  status: 'published',
  sortOrder: '0',
  fullText: '',
  images: [],
}

function slugify(v = '') {
  return String(v || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function caseToForm(c: ClinicalCase): CaseFormData {
  return {
    title: c.title ?? '',
    slug: c.slug ?? '',
    category: c.category ?? '',
    tag: c.tag ?? '',
    treatment: c.treatment ?? '',
    duration: c.duration ?? '',
    description: c.description ?? '',
    cardImage: c.cardImage ?? '',
    status: c.status ?? 'published',
    sortOrder: String(c.sortOrder ?? 0),
    fullText: c.fullText ?? '',
    images: Array.isArray(c.images) ? c.images : [],
  }
}

// ─── Full-page Case Editor ────────────────────────────────────────────────────

function CaseEditor({
  clinicalCase,
  onClose,
  onSaved,
}: {
  clinicalCase: ClinicalCase | null
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<CaseFormData>(
    clinicalCase ? caseToForm(clinicalCase) : emptyForm,
  )
  const [activeTab, setActiveTab] = useState<'details' | 'gallery' | 'notes'>('details')
  const [isSaving, setIsSaving] = useState(false)

  function handleTitleChange(title: string) {
    setForm((prev) => ({
      ...prev,
      title,
      slug: clinicalCase ? prev.slug : slugify(title),
    }))
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }
    setIsSaving(true)
    try {
      const body = {
        title: form.title,
        slug: form.slug || slugify(form.title),
        category: form.category || null,
        tag: form.tag || null,
        treatment: form.treatment || null,
        duration: form.duration || null,
        description: form.description || null,
        cardImage: form.cardImage || null,
        status: form.status,
        sortOrder: Number(form.sortOrder) || 0,
        fullText: form.fullText || null,
        images: form.images,
      }
      if (clinicalCase) {
        await api(`/api/tenant/clinical-cases/${clinicalCase.id}`, { method: 'PUT', body })
      } else {
        await api('/api/tenant/clinical-cases', { method: 'POST', body })
      }
      toast.success(clinicalCase ? 'Case updated' : 'Case added')
      onSaved()
    } catch {
      toast.error('Failed to save clinical case')
    } finally {
      setIsSaving(false)
    }
  }

  function addImage() {
    setForm((prev) => ({ ...prev, images: [...prev.images, { src: '', caption: '' }] }))
  }

  function updateImage(i: number, patch: Partial<GalleryImage>) {
    setForm((prev) => {
      const imgs = [...prev.images]
      imgs[i] = { ...imgs[i], ...patch }
      return { ...prev, images: imgs }
    })
  }

  function removeImage(i: number) {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, j) => j !== i) }))
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              {clinicalCase ? 'Edit Clinical Case' : 'New Clinical Case'}
            </p>
            <p className="text-sm font-semibold text-gray-900">
              {form.title || 'Untitled Case'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={isSaving} onClick={handleSave}>
            <Save className="mr-1.5 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 px-6 shrink-0">
        <div className="flex gap-6">
          {(['details', 'gallery', 'notes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'gallery' ? `Gallery${form.images.length > 0 ? ` (${form.images.length})` : ''}` : tab === 'notes' ? 'Clinical Notes' : 'Details'}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'details' && (
          <div className="mx-auto max-w-2xl px-6 py-8 space-y-6">
            {/* Title & Status */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="cc-title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cc-title"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Full Smile Restoration"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cc-status">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger id="cc-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <Label htmlFor="cc-slug">Slug</Label>
              <Input
                id="cc-slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="full-smile-restoration"
              />
              <p className="text-xs text-gray-400">Auto-generated from title, editable</p>
            </div>

            <Separator />

            {/* Category & Tag */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="cc-category">Category</Label>
                <Input
                  id="cc-category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Implants & Crowns"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cc-tag">Tag</Label>
                <Input
                  id="cc-tag"
                  value={form.tag}
                  onChange={(e) => setForm({ ...form, tag: e.target.value })}
                  placeholder="Before & After"
                />
              </div>
            </div>

            {/* Treatment & Duration */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="cc-treatment">Treatment</Label>
                <Input
                  id="cc-treatment"
                  value={form.treatment}
                  onChange={(e) => setForm({ ...form, treatment: e.target.value })}
                  placeholder="Dental Implants + Porcelain Crowns"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cc-duration">Duration</Label>
                <Input
                  id="cc-duration"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  placeholder="4–6 months"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="cc-description">
                Description
                <span className="text-gray-400 text-xs ml-1">(short card summary)</span>
              </Label>
              <Textarea
                id="cc-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description shown on the case card..."
                rows={3}
              />
            </div>

            {/* Card Image */}
            <div className="space-y-1.5">
              <Label htmlFor="cc-card-image">Card Image URL</Label>
              <Input
                id="cc-card-image"
                value={form.cardImage}
                onChange={(e) => setForm({ ...form, cardImage: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <Separator />

            {/* Sort Order */}
            <div className="space-y-1.5 max-w-[160px]">
              <Label htmlFor="cc-sort-order">Sort Order</Label>
              <Input
                id="cc-sort-order"
                type="number"
                min="0"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              />
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="mx-auto max-w-2xl px-6 py-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Gallery Images</h2>
                <p className="text-sm text-gray-500 mt-0.5">Manage the before/after and procedure images for this case.</p>
              </div>
              <Button size="sm" variant="outline" onClick={addImage}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Image
              </Button>
            </div>

            {form.images.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
                <p className="text-sm font-medium text-gray-500">No gallery images yet</p>
                <p className="mt-1 text-xs text-gray-400">Click "Add Image" to add the first one.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {form.images.map((img, i) => (
                  <div key={i} className="rounded-lg border border-gray-200 p-4 bg-gray-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500">Image {i + 1}</span>
                      <button
                        onClick={() => removeImage(i)}
                        className="text-gray-400 hover:text-red-500"
                        title="Remove image"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Image URL</Label>
                      <Input
                        value={img.src}
                        onChange={(e) => updateImage(i, { src: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Caption (optional)</Label>
                      <Input
                        value={img.caption}
                        onChange={(e) => updateImage(i, { caption: e.target.value })}
                        placeholder="Before treatment"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="mx-auto max-w-2xl px-6 py-8 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Clinical Notes</h2>
              <p className="text-sm text-gray-500 mt-0.5">Full case description, patient history, and treatment details.</p>
            </div>
            <Textarea
              value={form.fullText}
              onChange={(e) => setForm({ ...form, fullText: e.target.value })}
              placeholder="Detailed clinical notes about this case..."
              rows={20}
              className="font-mono text-sm"
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Clinical Cases List ─────────────────────────────────────────────────

export function ClinicalCases() {
  const queryClient = useQueryClient()

  const [editorTarget, setEditorTarget] = useState<ClinicalCase | null | 'new'>(null)
  const [deleteTarget, setDeleteTarget] = useState<ClinicalCase | null>(null)

  const { data: cases = [], isLoading } = useQuery<ClinicalCase[]>({
    queryKey: ['tenant', 'clinical-cases'],
    queryFn: () => api('/api/tenant/clinical-cases'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api(`/api/tenant/clinical-cases/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'clinical-cases'] })
      toast.success('Case deleted')
      setDeleteTarget(null)
    },
    onError: () => toast.error('Failed to delete case'),
  })

  // Full-page editor is open
  if (editorTarget !== null) {
    return (
      <CaseEditor
        clinicalCase={editorTarget === 'new' ? null : editorTarget}
        onClose={() => setEditorTarget(null)}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ['tenant', 'clinical-cases'] })
          setEditorTarget(null)
        }}
      />
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Clinical Cases"
        subtitle="Manage before & after case studies shown on the website"
        breadcrumbs={[{ label: 'Overview', href: '/' }, { label: 'Clinical Cases' }]}
        actions={
          <Button onClick={() => setEditorTarget('new')} size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Add Case
          </Button>
        }
      />

      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-500">Loading...</div>
      ) : cases.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <Activity className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-600">No clinical cases yet</p>
          <p className="mt-1 text-xs text-gray-400">Use the button above to add your first case.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[220px]">Title</TableHead>
                <TableHead className="min-w-[140px]">Category</TableHead>
                <TableHead className="min-w-[120px]">Tag</TableHead>
                <TableHead className="w-28">Status</TableHead>
                <TableHead className="w-24">Sort</TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer"
                  onClick={() => setEditorTarget(c)}
                >
                  <TableCell>
                    <div className="font-medium text-gray-900">{c.title}</div>
                    {c.treatment && (
                      <div className="mt-0.5 text-xs text-gray-400 line-clamp-1">{c.treatment}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-500 whitespace-nowrap">{c.category || '--'}</TableCell>
                  <TableCell className="text-gray-500 whitespace-nowrap">{c.tag || '--'}</TableCell>
                  <TableCell>
                    <Badge variant={c.status === 'published' ? 'default' : 'secondary'}>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500">{c.sortOrder}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(c) }}
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

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete clinical case</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.title}&rdquo;? This action cannot be undone.
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
