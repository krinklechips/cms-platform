import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { Plus, Trash2, Pencil, Users } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Badge } from '@/app/components/ui/badge'
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

interface TeamMember {
  id: number
  name: string
  title?: string | null
  department?: string | null
  bio?: string | null
  photoUrl?: string | null
  email?: string | null
  linkedinUrl?: string | null
  sortOrder: number
  status: string
  createdAt?: string
  updatedAt?: string
}

interface MemberFormData {
  name: string
  title: string
  department: string
  bio: string
  photoUrl: string
  email: string
  linkedinUrl: string
  sortOrder: string
  status: string
}

const emptyForm: MemberFormData = {
  name: '',
  title: '',
  department: '',
  bio: '',
  photoUrl: '',
  email: '',
  linkedinUrl: '',
  sortOrder: '0',
  status: 'published',
}

function memberToForm(m: TeamMember): MemberFormData {
  return {
    name: m.name ?? '',
    title: m.title ?? '',
    department: m.department ?? '',
    bio: m.bio ?? '',
    photoUrl: m.photoUrl ?? '',
    email: m.email ?? '',
    linkedinUrl: m.linkedinUrl ?? '',
    sortOrder: String(m.sortOrder ?? 0),
    status: m.status ?? 'published',
  }
}

export function TeamMembers() {
  const queryClient = useQueryClient()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<TeamMember | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null)
  const [form, setForm] = useState<MemberFormData>(emptyForm)

  const { data: members = [], isLoading } = useQuery<TeamMember[]>({
    queryKey: ['tenant', 'team-members'],
    queryFn: () => api('/api/tenant/team-members'),
  })

  const createMutation = useMutation({
    mutationFn: (data: MemberFormData) =>
      api('/api/tenant/team-members', {
        method: 'POST',
        body: {
          ...data,
          sortOrder: Number(data.sortOrder) || 0,
          title: data.title || null,
          department: data.department || null,
          bio: data.bio || null,
          photoUrl: data.photoUrl || null,
          email: data.email || null,
          linkedinUrl: data.linkedinUrl || null,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'team-members'] })
      toast.success('Team member added')
      setSheetOpen(false)
      setForm(emptyForm)
    },
    onError: () => toast.error('Failed to add team member'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: MemberFormData }) =>
      api(`/api/tenant/team-members/${id}`, {
        method: 'PUT',
        body: {
          ...data,
          sortOrder: Number(data.sortOrder) || 0,
          title: data.title || null,
          department: data.department || null,
          bio: data.bio || null,
          photoUrl: data.photoUrl || null,
          email: data.email || null,
          linkedinUrl: data.linkedinUrl || null,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'team-members'] })
      toast.success('Team member updated')
      setSheetOpen(false)
      setEditTarget(null)
      setForm(emptyForm)
    },
    onError: () => toast.error('Failed to update team member'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      api(`/api/tenant/team-members/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'team-members'] })
      toast.success('Team member deleted')
      setDeleteTarget(null)
    },
    onError: () => toast.error('Failed to delete team member'),
  })

  function openAdd() {
    setEditTarget(null)
    setForm(emptyForm)
    setSheetOpen(true)
  }

  function openEdit(member: TeamMember) {
    setEditTarget(member)
    setForm(memberToForm(member))
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
      <PageHeader
        title="Team Members"
        subtitle="Manage your team and staff profiles"
        breadcrumbs={[{ label: 'Overview', href: '/' }, { label: 'Team Members' }]}
        actions={
          <Button onClick={openAdd} size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Add Member
          </Button>
        }
      />

      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-500">Loading...</div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <Users className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-600">No team members yet</p>
          <p className="mt-1 text-xs text-gray-400">Use the button above to add your first team member.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    {member.photoUrl ? (
                      <img
                        src={member.photoUrl}
                        alt={member.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-500">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">{member.name}</TableCell>
                  <TableCell className="text-gray-500">{member.title || '--'}</TableCell>
                  <TableCell className="text-gray-500">{member.department || '--'}</TableCell>
                  <TableCell className="text-gray-500">{member.sortOrder}</TableCell>
                  <TableCell>
                    <Badge variant={member.status === 'published' ? 'default' : 'secondary'}>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(member)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(member)}
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
            <SheetTitle>{editTarget ? 'Edit Team Member' : 'Add Team Member'}</SheetTitle>
            <SheetDescription>
              {editTarget ? 'Update team member details.' : 'Fill in the details for the new team member.'}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="tm-name">Name <span className="text-red-500">*</span></Label>
              <Input
                id="tm-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jane Smith"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tm-title">Job Title</Label>
              <Input
                id="tm-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Chief Executive Officer"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tm-department">Department</Label>
              <Input
                id="tm-department"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                placeholder="Leadership"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tm-bio">Bio</Label>
              <Textarea
                id="tm-bio"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Short biography..."
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tm-photo">Photo URL</Label>
              <Input
                id="tm-photo"
                value={form.photoUrl}
                onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tm-email">Email</Label>
              <Input
                id="tm-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jane@company.com"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tm-linkedin">LinkedIn URL</Label>
              <Input
                id="tm-linkedin"
                value={form.linkedinUrl}
                onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="tm-order">Sort Order</Label>
                <Input
                  id="tm-order"
                  type="number"
                  min="0"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                />
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
          </div>

          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? 'Saving...' : editTarget ? 'Save Changes' : 'Add Member'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete team member</DialogTitle>
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
