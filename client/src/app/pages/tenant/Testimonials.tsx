import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { Plus, Trash2, Pencil, MessageSquare } from 'lucide-react'
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

interface Testimonial {
  id: number
  authorName: string
  authorTitle?: string | null
  authorPhotoUrl?: string | null
  quote: string
  youtubeUrl?: string | null
  rating: number
  isFeatured: boolean
  sortOrder: number
  status: string
  createdAt?: string
  updatedAt?: string
}

interface TestimonialFormData {
  authorName: string
  authorTitle: string
  authorPhotoUrl: string
  quote: string
  youtubeUrl: string
  rating: string
  isFeatured: boolean
  sortOrder: string
  status: string
}

const emptyForm: TestimonialFormData = {
  authorName: '',
  authorTitle: '',
  authorPhotoUrl: '',
  quote: '',
  youtubeUrl: '',
  rating: '5',
  isFeatured: false,
  sortOrder: '0',
  status: 'published',
}

function testimonialToForm(t: Testimonial): TestimonialFormData {
  return {
    authorName: t.authorName ?? '',
    authorTitle: t.authorTitle ?? '',
    authorPhotoUrl: t.authorPhotoUrl ?? '',
    quote: t.quote ?? '',
    youtubeUrl: t.youtubeUrl ?? '',
    rating: String(t.rating ?? 5),
    isFeatured: Boolean(t.isFeatured),
    sortOrder: String(t.sortOrder ?? 0),
    status: t.status ?? 'published',
  }
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400 text-sm">
      {'★'.repeat(Math.max(0, Math.min(5, rating)))}
      {'☆'.repeat(Math.max(0, 5 - Math.min(5, rating)))}
    </span>
  )
}

export function Testimonials() {
  const queryClient = useQueryClient()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Testimonial | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null)
  const [form, setForm] = useState<TestimonialFormData>(emptyForm)

  const { data: testimonials = [], isLoading } = useQuery<Testimonial[]>({
    queryKey: ['tenant', 'testimonials'],
    queryFn: () => api('/api/tenant/testimonials'),
  })

  const createMutation = useMutation({
    mutationFn: (data: TestimonialFormData) =>
      api('/api/tenant/testimonials', {
        method: 'POST',
        body: {
          authorName: data.authorName,
          authorTitle: data.authorTitle || null,
          authorPhotoUrl: data.authorPhotoUrl || null,
          quote: data.quote,
          youtubeUrl: data.youtubeUrl || null,
          rating: Number(data.rating) || 5,
          isFeatured: data.isFeatured,
          sortOrder: Number(data.sortOrder) || 0,
          status: data.status,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'testimonials'] })
      toast.success('Testimonial added')
      setSheetOpen(false)
      setForm(emptyForm)
    },
    onError: () => toast.error('Failed to add testimonial'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TestimonialFormData }) =>
      api(`/api/tenant/testimonials/${id}`, {
        method: 'PUT',
        body: {
          authorName: data.authorName,
          authorTitle: data.authorTitle || null,
          authorPhotoUrl: data.authorPhotoUrl || null,
          quote: data.quote,
          youtubeUrl: data.youtubeUrl || null,
          rating: Number(data.rating) || 5,
          isFeatured: data.isFeatured,
          sortOrder: Number(data.sortOrder) || 0,
          status: data.status,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'testimonials'] })
      toast.success('Testimonial updated')
      setSheetOpen(false)
      setEditTarget(null)
      setForm(emptyForm)
    },
    onError: () => toast.error('Failed to update testimonial'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      api(`/api/tenant/testimonials/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'testimonials'] })
      toast.success('Testimonial deleted')
      setDeleteTarget(null)
    },
    onError: () => toast.error('Failed to delete testimonial'),
  })

  function openAdd() {
    setEditTarget(null)
    setForm(emptyForm)
    setSheetOpen(true)
  }

  function openEdit(t: Testimonial) {
    setEditTarget(t)
    setForm(testimonialToForm(t))
    setSheetOpen(true)
  }

  function handleSubmit() {
    if (!form.authorName.trim()) {
      toast.error('Author name is required')
      return
    }
    if (!form.quote.trim()) {
      toast.error('Quote is required')
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
      <PageHeader
        title="Testimonials"
        subtitle="Manage customer testimonials and reviews"
        breadcrumbs={[{ label: 'Overview', href: '/' }, { label: 'Testimonials' }]}
        actions={
          <Button onClick={openAdd} size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Add Testimonial
          </Button>
        }
      />

      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-500">Loading...</div>
      ) : testimonials.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <MessageSquare className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-600">No testimonials yet</p>
          <p className="mt-1 text-xs text-gray-400">Use the button above to add your first testimonial.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead>Quote</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Video</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testimonials.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{t.authorName}</p>
                      {t.authorTitle && (
                        <p className="text-xs text-gray-500">{t.authorTitle}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-gray-600 truncate">{t.quote}</p>
                  </TableCell>
                  <TableCell>
                    <RatingStars rating={t.rating} />
                  </TableCell>
                  <TableCell>
                    {t.youtubeUrl ? (
                      <Badge variant="secondary" className="text-xs">YouTube</Badge>
                    ) : (
                      <span className="text-gray-400 text-xs">--</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={t.status === 'published' ? 'default' : 'secondary'}>
                      {t.status}
                    </Badge>
                  </TableCell>
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

      {/* Add / Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={(open) => { setSheetOpen(open); if (!open) { setEditTarget(null); setForm(emptyForm) } }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editTarget ? 'Edit Testimonial' : 'Add Testimonial'}</SheetTitle>
            <SheetDescription>
              {editTarget ? 'Update testimonial details.' : 'Fill in the details for the new testimonial.'}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="tm-author-name">Author Name <span className="text-red-500">*</span></Label>
              <Input
                id="tm-author-name"
                value={form.authorName}
                onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                placeholder="Jane Smith"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tm-author-title">Author Title</Label>
              <Input
                id="tm-author-title"
                value={form.authorTitle}
                onChange={(e) => setForm({ ...form, authorTitle: e.target.value })}
                placeholder="CEO, Acme Corp"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tm-author-photo">Author Photo URL</Label>
              <Input
                id="tm-author-photo"
                value={form.authorPhotoUrl}
                onChange={(e) => setForm({ ...form, authorPhotoUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tm-quote">Quote <span className="text-red-500">*</span></Label>
              <Textarea
                id="tm-quote"
                value={form.quote}
                onChange={(e) => setForm({ ...form, quote: e.target.value })}
                placeholder="What the customer said..."
                rows={4}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tm-youtube">YouTube URL</Label>
              <Input
                id="tm-youtube"
                value={form.youtubeUrl}
                onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
              />
              <p className="text-xs text-gray-400">e.g. https://youtube.com/watch?v=...</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="tm-rating">Rating</Label>
                <Select value={form.rating} onValueChange={(v) => setForm({ ...form, rating: v })}>
                  <SelectTrigger id="tm-rating">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 ★</SelectItem>
                    <SelectItem value="2">2 ★★</SelectItem>
                    <SelectItem value="3">3 ★★★</SelectItem>
                    <SelectItem value="4">4 ★★★★</SelectItem>
                    <SelectItem value="5">5 ★★★★★</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tm-sort-order">Sort Order</Label>
                <Input
                  id="tm-sort-order"
                  type="number"
                  min="0"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="tm-featured"
                checked={form.isFeatured}
                onCheckedChange={(checked) => setForm({ ...form, isFeatured: Boolean(checked) })}
              />
              <Label htmlFor="tm-featured" className="cursor-pointer">Featured testimonial</Label>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tm-status">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger id="tm-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? 'Saving...' : editTarget ? 'Save Changes' : 'Add Testimonial'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete testimonial</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the testimonial from &ldquo;{deleteTarget?.authorName}&rdquo;? This action cannot be undone.
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
