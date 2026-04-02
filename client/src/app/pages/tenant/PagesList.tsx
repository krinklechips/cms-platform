import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { PageHeader } from '@/app/components/shared/PageHeader'
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  FileText,
  Eye,
  EyeOff,
  CornerDownRight,
  SearchCheck,
} from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog'

interface Page {
  id: number
  title: string
  slug: string
  status: string
  parentId: number | null
  showInNav: boolean
  sortOrder: number
  updatedAt: string
}

export function PagesList() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [deleteTarget, setDeleteTarget] = useState<Page | null>(null)

  const { data: pages = [], isLoading } = useQuery<Page[]>({
    queryKey: ['tenant', 'pages'],
    queryFn: () => api('/api/tenant/pages'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      api(`/api/tenant/pages/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'pages'] })
      toast.success('Page deleted')
      setDeleteTarget(null)
    },
    onError: () => {
      toast.error('Failed to delete page')
    },
  })

  // Compute the full URL path by walking up the parent chain
  function fullPath(page: Page, allPages: Page[]): string {
    const byId = new Map(allPages.map((p) => [p.id, p]))
    const parts: string[] = [page.slug]
    const visited = new Set<number>([page.id])
    let cur: Page | undefined = page
    while (cur?.parentId) {
      if (visited.has(cur.parentId)) break
      visited.add(cur.parentId)
      const parent = byId.get(cur.parentId)
      if (!parent) break
      parts.unshift(parent.slug)
      cur = parent
    }
    return '/' + parts.join('/')
  }

  // Build tree structure for display
  function buildTree(items: Page[]): (Page & { depth: number })[] {
    const result: (Page & { depth: number })[] = []
    const childrenMap = new Map<number | null, Page[]>()

    for (const page of items) {
      const parentId = page.parentId ?? null
      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, [])
      }
      childrenMap.get(parentId)!.push(page)
    }

    function addChildren(parentId: number | null, depth: number) {
      const children = childrenMap.get(parentId) || []
      children
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .forEach((child) => {
          result.push({ ...child, depth })
          addChildren(child.id, depth + 1)
        })
    }

    addChildren(null, 0)
    return result
  }

  const filtered = pages.filter((p) => {
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const treePages = buildTree(filtered)

  const allCount = pages.length
  const publishedCount = pages.filter((p) => p.status === 'published').length
  const draftCount = pages.filter((p) => p.status === 'draft').length

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Pages"
        subtitle="Manage your website pages and navigation"
        breadcrumbs={[{ label: 'Overview', href: '/' }, { label: 'Pages' }]}
        actions={
          <Button onClick={() => navigate('/pages/new')} size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            New Page
          </Button>
        }
      />

      {/* Status filter tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200">
        {([
          { key: 'all' as const, label: 'All', count: allCount },
          { key: 'published' as const, label: 'Published', count: publishedCount },
          { key: 'draft' as const, label: 'Draft', count: draftCount },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`relative pb-3 text-sm font-medium transition-colors ${
              statusFilter === tab.key
                ? 'text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs text-gray-400">({tab.count})</span>
            {statusFilter === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search pages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-500">
          <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
          Loading pages...
        </div>
      ) : treePages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
            <FileText className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900">No pages found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {search || statusFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Get started by creating your first page.'}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Nav</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-28 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {treePages.map((page) => (
                <TableRow
                  key={page.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/pages/${page.id}`)}
                >
                  <TableCell className="font-medium text-gray-900">
                    <div className="flex items-center gap-1.5" style={{ paddingLeft: `${page.depth * 24}px` }}>
                      {page.depth > 0 && (
                        <CornerDownRight className="h-3.5 w-3.5 shrink-0 text-gray-300" />
                      )}
                      {page.title || 'Untitled'}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-500 font-mono text-xs">
                    {fullPath(page, pages)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={page.status === 'published' ? 'default' : 'secondary'}
                    >
                      {page.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {page.showInNav ? (
                      <Eye className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-300" />
                    )}
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : '--'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/pages/${page.id}`)
                        }}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        title="Edit page"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/seo/pages?path=${fullPath(page, pages)}`)
                        }}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-violet-50 hover:text-violet-600"
                        title="Edit SEO for this page"
                      >
                        <SearchCheck className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteTarget(page)
                        }}
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

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete page</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.title}&rdquo;? This
              action cannot be undone. Any child pages will become top-level pages.
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
