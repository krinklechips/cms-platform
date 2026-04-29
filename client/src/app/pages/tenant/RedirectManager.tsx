import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { Plus, Pencil, Trash2, ArrowRightLeft, ExternalLink } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Badge } from '@/app/components/ui/badge'
import { Switch } from '@/app/components/ui/switch'
import { Card, CardContent } from '@/app/components/ui/card'
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

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SeoRedirect {
  id: number
  tenant_id: number
  source_path: string
  target_url: string
  status_code: number
  is_active: number
  hits: number
}

interface RedirectForm {
  source_path: string
  target_url: string
  status_code: string
}

const emptyForm: RedirectForm = {
  source_path: '',
  target_url: '',
  status_code: '301',
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

export function RedirectManager() {
  const queryClient = useQueryClient()
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<SeoRedirect | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SeoRedirect | null>(null)
  const [form, setForm] = useState<RedirectForm>(emptyForm)

  /* ---- Query ----------------------------------------------------- */

  const { data, isLoading } = useQuery({
    queryKey: ['seo-redirects'],
    queryFn: () => api<{ redirects: SeoRedirect[] }>('/api/tenant/seo/redirects'),
  })

  const redirects = data?.redirects ?? []
  const activeCount = redirects.filter((r) => r.is_active).length

  /* ---- Mutations ------------------------------------------------- */

  const createMutation = useMutation({
    mutationFn: (f: RedirectForm) =>
      api('/api/tenant/seo/redirects', {
        method: 'POST',
        body: {
          sourcePath: f.source_path,
          targetUrl: f.target_url,
          statusCode: Number(f.status_code),
        },
      }),
    onSuccess: () => {
      toast.success('Redirect created')
      queryClient.invalidateQueries({ queryKey: ['seo-redirects'] })
      setAddOpen(false)
      setForm(emptyForm)
    },
    onError: () => toast.error('Failed to create redirect'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      api(`/api/tenant/seo/redirects/${id}`, { method: 'PUT', body }),
    onSuccess: () => {
      toast.success('Redirect updated')
      queryClient.invalidateQueries({ queryKey: ['seo-redirects'] })
      setEditTarget(null)
    },
    onError: () => toast.error('Failed to update redirect'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      api(`/api/tenant/seo/redirects/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Redirect deleted')
      queryClient.invalidateQueries({ queryKey: ['seo-redirects'] })
      setDeleteTarget(null)
    },
    onError: () => toast.error('Failed to delete redirect'),
  })

  /* ---- Helpers --------------------------------------------------- */

  function openEdit(r: SeoRedirect) {
    setForm({
      source_path: r.source_path,
      target_url: r.target_url,
      status_code: String(r.status_code),
    })
    setEditTarget(r)
  }

  function toggleActive(r: SeoRedirect) {
    updateMutation.mutate({
      id: r.id,
      body: { isActive: !r.is_active },
    })
  }

  function handleSaveEdit() {
    if (!editTarget) return
    updateMutation.mutate({
      id: editTarget.id,
      body: {
        sourcePath: form.source_path,
        targetUrl: form.target_url,
        statusCode: Number(form.status_code),
      },
    })
  }

  /* ---- Render ---------------------------------------------------- */

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Redirects"
        subtitle="Manage URL redirects"
        breadcrumbs={[{label:'Overview', href:'/'}, {label:'SEO', href:'/seo'}, {label:'Redirects'}]}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Badge variant="secondary">{redirects.length} total</Badge>
              <Badge variant="outline" className="border-green-200 text-green-700">
                {activeCount} active
              </Badge>
            </div>
            <Button
              onClick={() => {
                setForm(emptyForm)
                setAddOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Redirect
            </Button>
          </div>
        }
      />

      {/* Table */}
      {isLoading ? (
        <div className="text-sm text-gray-500">Loading redirects...</div>
      ) : redirects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ArrowRightLeft className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-900">No redirects configured</p>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              Redirects let you send visitors from old URLs to new ones. Use 301 for permanent moves
              and 302 for temporary ones.
            </p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => {
                setForm(emptyForm)
                setAddOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add your first redirect
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source Path</TableHead>
                <TableHead>Target URL</TableHead>
                <TableHead className="w-[90px]">Status</TableHead>
                <TableHead className="w-[80px]">Active</TableHead>
                <TableHead className="w-[70px] text-right">Hits</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {redirects.map((r) => (
                <TableRow key={r.id} className={r.is_active ? '' : 'opacity-60'}>
                  <TableCell className="font-mono text-sm">{r.source_path}</TableCell>
                  <TableCell className="max-w-[280px] truncate text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      {r.target_url}
                      <ExternalLink className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={r.status_code === 301 ? 'default' : 'secondary'}
                      className={
                        r.status_code === 301
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                          : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                      }
                    >
                      {r.status_code}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={!!r.is_active}
                      onCheckedChange={() => toggleActive(r)}
                      disabled={updateMutation.isPending}
                    />
                  </TableCell>
                  <TableCell className="text-right text-sm text-gray-500 tabular-nums">
                    {r.hits.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(r)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Redirect</DialogTitle>
            <DialogDescription>
              Create a new URL redirect. Visitors will be automatically sent from the source path to
              the target URL.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Source Path</Label>
              <Input
                value={form.source_path}
                onChange={(e) => setForm((f) => ({ ...f, source_path: e.target.value }))}
                placeholder="/old-page"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Target URL</Label>
              <Input
                value={form.target_url}
                onChange={(e) => setForm((f) => ({ ...f, target_url: e.target.value }))}
                placeholder="https://example.com/new-page"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status Code</Label>
              <Select
                value={form.status_code}
                onValueChange={(v) => setForm((f) => ({ ...f, status_code: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="301">301 — Permanent Redirect</SelectItem>
                  <SelectItem value="302">302 — Temporary Redirect</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate(form)}
              disabled={!form.source_path.trim() || !form.target_url.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Redirect'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Redirect</DialogTitle>
            <DialogDescription>Update the redirect settings.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Source Path</Label>
              <Input
                value={form.source_path}
                onChange={(e) => setForm((f) => ({ ...f, source_path: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Target URL</Label>
              <Input
                value={form.target_url}
                onChange={(e) => setForm((f) => ({ ...f, target_url: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status Code</Label>
              <Select
                value={form.status_code}
                onValueChange={(v) => setForm((f) => ({ ...f, status_code: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="301">301 — Permanent Redirect</SelectItem>
                  <SelectItem value="302">302 — Temporary Redirect</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={!form.source_path.trim() || !form.target_url.trim() || updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Redirect</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the redirect from{' '}
              <span className="font-mono font-medium">{deleteTarget?.source_path}</span>? This
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
