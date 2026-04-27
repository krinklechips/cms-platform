import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { Plus, Trash2, Pencil, Building2 } from 'lucide-react'
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface Branch {
  id: string
  name: string
  address: string
  phone: string
  mobile: string | null
  email: string | null
  hours: string
  sortOrder: number
  published: boolean
}

interface BranchFormData {
  name: string
  address: string
  phone: string
  mobile: string
  email: string
  hours: string
  sortOrder: string
  published: boolean
}

const emptyForm: BranchFormData = {
  name: '',
  address: '',
  phone: '',
  mobile: '',
  email: '',
  hours: '',
  sortOrder: '0',
  published: true,
}

function branchToForm(b: Branch): BranchFormData {
  return {
    name: b.name ?? '',
    address: b.address ?? '',
    phone: b.phone ?? '',
    mobile: b.mobile ?? '',
    email: b.email ?? '',
    hours: b.hours ?? '',
    sortOrder: String(b.sortOrder ?? 0),
    published: b.published ?? true,
  }
}

// ─── Main Branches Page ───────────────────────────────────────────────────────

export function Branches() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Branch | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null)
  const [form, setForm] = useState<BranchFormData>(emptyForm)

  const { data: branches = [], isLoading } = useQuery<Branch[]>({
    queryKey: ['tenant', 'branches'],
    queryFn: () => api('/api/tenant/branches'),
  })

  function buildPayload(f: BranchFormData) {
    return {
      name: f.name,
      address: f.address,
      phone: f.phone,
      mobile: f.mobile || null,
      email: f.email || null,
      hours: f.hours,
      sortOrder: Number(f.sortOrder) || 0,
      published: f.published,
    }
  }

  const createMutation = useMutation({
    mutationFn: (payload: ReturnType<typeof buildPayload>) =>
      api('/api/tenant/branches', { method: 'POST', body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'branches'] })
      toast.success('Branch added')
      closeDialog()
    },
    onError: () => toast.error('Failed to add branch'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReturnType<typeof buildPayload> }) =>
      api(`/api/tenant/branches/${id}`, { method: 'PUT', body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'branches'] })
      toast.success('Branch updated')
      closeDialog()
    },
    onError: () => toast.error('Failed to update branch'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api(`/api/tenant/branches/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'branches'] })
      toast.success('Branch deleted')
      setDeleteTarget(null)
    },
    onError: () => toast.error('Failed to delete branch'),
  })

  function openAdd() {
    setEditTarget(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(b: Branch) {
    setEditTarget(b)
    setForm(branchToForm(b))
    setDialogOpen(true)
  }

  function closeDialog() {
    setDialogOpen(false)
    setEditTarget(null)
    setForm(emptyForm)
  }

  function handleSubmit() {
    if (!form.name.trim()) { toast.error('Name is required'); return }
    if (!form.address.trim()) { toast.error('Address is required'); return }
    if (!form.phone.trim()) { toast.error('Phone is required'); return }
    if (!form.hours.trim()) { toast.error('Hours is required'); return }
    const payload = buildPayload(form)
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  function field<K extends keyof BranchFormData>(key: K, val: BranchFormData[K]) {
    setForm({ ...form, [key]: val })
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Branches"
        subtitle="Manage clinic branches and their contact information"
        breadcrumbs={[{ label: 'Overview', href: '/' }, { label: 'Branches' }]}
      />

      <div className="flex justify-end">
        <Button size="sm" onClick={openAdd}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Branch
        </Button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-gray-500">Loading...</div>
      ) : branches.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
          <Building2 className="mb-3 h-8 w-8 text-gray-300" />
          <p className="text-sm font-medium text-gray-600">No branches yet</p>
          <p className="mt-1 text-xs text-gray-400">Add one to get started</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[160px]">Name</TableHead>
                <TableHead className="min-w-[140px]">Phone</TableHead>
                <TableHead className="min-w-[160px]">Hours</TableHead>
                <TableHead className="w-24">Published</TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium text-gray-900">{b.name}</TableCell>
                  <TableCell className="text-sm text-gray-600">{b.phone}</TableCell>
                  <TableCell className="text-sm text-gray-500 max-w-xs truncate">{b.hours}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        b.published
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {b.published ? 'Published' : 'Draft'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(b)}
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

      {/* Add / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => { if (!open) closeDialog() }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Branch' : 'Add Branch'}</DialogTitle>
            <DialogDescription>
              {editTarget ? 'Update this branch.' : 'Add a new clinic branch.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="branch-name">Name <span className="text-red-500">*</span></Label>
              <Input
                id="branch-name"
                value={form.name}
                onChange={(e) => field('name', e.target.value)}
                placeholder="Main Branch"
              />
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label htmlFor="branch-address">Address <span className="text-red-500">*</span></Label>
              <Textarea
                id="branch-address"
                value={form.address}
                onChange={(e) => field('address', e.target.value)}
                placeholder="123 Street Name, City"
                rows={2}
              />
            </div>

            {/* Phone + Mobile */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="branch-phone">Phone <span className="text-red-500">*</span></Label>
                <Input
                  id="branch-phone"
                  value={form.phone}
                  onChange={(e) => field('phone', e.target.value)}
                  placeholder="+855 23 000 000"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="branch-mobile">Mobile</Label>
                <Input
                  id="branch-mobile"
                  value={form.mobile}
                  onChange={(e) => field('mobile', e.target.value)}
                  placeholder="+855 69 000 000"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="branch-email">Email</Label>
              <Input
                id="branch-email"
                type="email"
                value={form.email}
                onChange={(e) => field('email', e.target.value)}
                placeholder="branch@example.com"
              />
            </div>

            {/* Hours */}
            <div className="space-y-1.5">
              <Label htmlFor="branch-hours">Hours <span className="text-red-500">*</span></Label>
              <Input
                id="branch-hours"
                value={form.hours}
                onChange={(e) => field('hours', e.target.value)}
                placeholder="Mon–Sat 8am–6pm"
              />
            </div>

            {/* Sort Order + Published */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="branch-sort">Sort Order</Label>
                <Input
                  id="branch-sort"
                  type="number"
                  min="0"
                  value={form.sortOrder}
                  onChange={(e) => field('sortOrder', e.target.value)}
                />
              </div>
              <div className="flex items-end gap-3 pb-1">
                <input
                  type="checkbox"
                  id="branch-published"
                  checked={form.published}
                  onChange={(e) => field('published', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="branch-published" className="cursor-pointer">Published</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? 'Saving...' : editTarget ? 'Save Changes' : 'Add Branch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete branch</DialogTitle>
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
