import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { Badge } from '@/app/components/ui/badge'
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

interface AnnualReport {
  id: number
  year: number
  title: string
  summary: string
  file_url: string
  status: string
}

interface ReportForm {
  year: string
  title: string
  summary: string
  file_url: string
  status: string
}

const emptyForm: ReportForm = {
  year: new Date().getFullYear().toString(),
  title: '',
  summary: '',
  file_url: '',
  status: 'draft',
}

export function AnnualReports() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AnnualReport | null>(null)
  const [form, setForm] = useState<ReportForm>(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<AnnualReport | null>(null)

  const { data: reports = [], isLoading } = useQuery<AnnualReport[]>({
    queryKey: ['tenant', 'annual-reports'],
    queryFn: () => api('/api/tenant/annual-reports'),
  })

  const saveMutation = useMutation({
    mutationFn: (data: ReportForm) => {
      const payload = { ...data, year: parseInt(data.year, 10) }
      if (editing) {
        return api(`/api/tenant/annual-reports/${editing.id}`, { method: 'PUT', body: payload })
      }
      return api('/api/tenant/annual-reports', { method: 'POST', body: payload })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'annual-reports'] })
      toast.success(editing ? 'Report updated' : 'Report created')
      closeDialog()
    },
    onError: () => {
      toast.error('Failed to save report')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      api(`/api/tenant/annual-reports/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'annual-reports'] })
      toast.success('Report deleted')
      setDeleteTarget(null)
    },
    onError: () => {
      toast.error('Failed to delete report')
    },
  })

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (report: AnnualReport) => {
    setEditing(report)
    setForm({
      year: report.year.toString(),
      title: report.title,
      summary: report.summary || '',
      file_url: report.file_url || '',
      status: report.status,
    })
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditing(null)
    setForm(emptyForm)
  }

  const updateField = (key: keyof ReportForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Annual Reports"
        subtitle="Manage published annual reports"
        breadcrumbs={[{label:'Overview', href:'/'}, {label:'Annual Reports'}]}
        actions={
          <Button onClick={openCreate} size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Add Report
          </Button>
        }
      />

      {/* Table */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-500">Loading...</div>
      ) : reports.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-500">
          No annual reports yet.
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>File</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium text-gray-900">
                    {report.year}
                  </TableCell>
                  <TableCell className="text-gray-700">{report.title}</TableCell>
                  <TableCell>
                    <Badge
                      variant={report.status === 'published' ? 'default' : 'secondary'}
                    >
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {report.file_url ? (
                      <a
                        href={report.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View file
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">--</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(report)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(report)}
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

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Report' : 'Add Report'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update the annual report details.' : 'Create a new annual report entry.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={form.year}
                  onChange={(e) => updateField('year', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => updateField('status', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-title">Title</Label>
              <Input
                id="report-title"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Annual Report 2025"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-summary">Summary</Label>
              <Textarea
                id="report-summary"
                value={form.summary}
                onChange={(e) => updateField('summary', e.target.value)}
                placeholder="Brief description..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file_url">File URL</Label>
              <Input
                id="file_url"
                value={form.file_url}
                onChange={(e) => updateField('file_url', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              disabled={saveMutation.isPending || !form.title || !form.year}
              onClick={() => saveMutation.mutate(form)}
            >
              {saveMutation.isPending ? 'Saving...' : editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete report</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the {deleteTarget?.year} report? This
              action cannot be undone.
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
