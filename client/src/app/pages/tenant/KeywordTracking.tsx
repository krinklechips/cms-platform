import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { Card, CardContent } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Switch } from '@/app/components/ui/switch'
import { Skeleton } from '@/app/components/ui/skeleton'
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
  DialogTrigger,
} from '@/app/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import {
  Target,
  FileText,
  Plus,
  Trash2,
  Star,
  Hash,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface KeywordRow {
  id: number
  page_path: string
  keyword: string
  is_primary: number
  created_at: string
}

interface SeoPage {
  page_path: string
  title?: string
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

export function KeywordTracking() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newPagePath, setNewPagePath] = useState('')
  const [newKeyword, setNewKeyword] = useState('')
  const [newIsPrimary, setNewIsPrimary] = useState(false)

  /* ── Queries ──────────────────────────────────────────────────────── */

  const { data: keywordsData, isLoading: keywordsLoading } = useQuery({
    queryKey: ['seo-keywords'],
    queryFn: () => api<{ keywords: KeywordRow[] }>('/api/tenant/seo/keywords'),
  })

  const { data: pagesData } = useQuery({
    queryKey: ['seo-pages'],
    queryFn: () => api<{ pages: SeoPage[] }>('/api/tenant/seo/pages'),
  })

  const keywords = keywordsData?.keywords ?? []
  const pages = pagesData?.pages ?? []

  /* ── Mutations ────────────────────────────────────────────────────── */

  const createMutation = useMutation({
    mutationFn: (body: { pagePath: string; keyword: string; isPrimary: boolean }) =>
      api<{ ok: boolean; keyword: KeywordRow }>('/api/tenant/seo/keywords', {
        method: 'POST',
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-keywords'] })
      resetForm()
      setDialogOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      api<{ ok: boolean }>(`/api/tenant/seo/keywords/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-keywords'] })
    },
  })

  /* ── Helpers ──────────────────────────────────────────────────────── */

  function resetForm() {
    setNewPagePath('')
    setNewKeyword('')
    setNewIsPrimary(false)
  }

  function handleCreate() {
    if (!newPagePath || !newKeyword.trim()) return
    createMutation.mutate({
      pagePath: newPagePath,
      keyword: newKeyword.trim(),
      isPrimary: newIsPrimary,
    })
  }

  /* ── Computed ─────────────────────────────────────────────────────── */

  const grouped = useMemo(() => {
    const map = new Map<string, KeywordRow[]>()
    for (const kw of keywords) {
      const existing = map.get(kw.page_path)
      if (existing) {
        existing.push(kw)
      } else {
        map.set(kw.page_path, [kw])
      }
    }
    return map
  }, [keywords])

  const uniquePages = new Set(keywords.map((k) => k.page_path))

  /* ── Render ──────────────────────────────────────────────────────── */

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Keyword Tracking"
        subtitle="Track primary and secondary keywords assigned to each page."
        breadcrumbs={[
          { label: 'Dashboard', href: '../..' },
          { label: 'SEO Suite', href: '..' },
          { label: 'Keywords' },
        ]}
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Keyword
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Keyword</DialogTitle>
                <DialogDescription>
                  Associate a keyword with a page for SEO tracking.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* Page selector */}
                <div className="space-y-2">
                  <Label htmlFor="page-select">Page</Label>
                  <Select value={newPagePath} onValueChange={setNewPagePath}>
                    <SelectTrigger id="page-select">
                      <SelectValue placeholder="Select a page" />
                    </SelectTrigger>
                    <SelectContent>
                      {pages.map((page) => (
                        <SelectItem key={page.page_path} value={page.page_path}>
                          {page.page_path}
                          {page.title ? ` - ${page.title}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Keyword input */}
                <div className="space-y-2">
                  <Label htmlFor="keyword-input">Keyword</Label>
                  <Input
                    id="keyword-input"
                    placeholder="e.g. managed IT services"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreate()
                    }}
                  />
                </div>

                {/* Primary toggle */}
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="primary-toggle" className="text-sm font-medium">
                      Primary Keyword
                    </Label>
                    <p className="text-xs text-gray-500">
                      Mark as the main keyword for this page
                    </p>
                  </div>
                  <Switch
                    id="primary-toggle"
                    checked={newIsPrimary}
                    onCheckedChange={setNewIsPrimary}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm()
                    setDialogOpen(false)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!newPagePath || !newKeyword.trim() || createMutation.isPending}
                >
                  {createMutation.isPending ? 'Adding...' : 'Add Keyword'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* ── Stats ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50">
              <Hash className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              {keywordsLoading ? (
                <>
                  <Skeleton className="h-7 w-12 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-gray-900">{keywords.length}</p>
                  <p className="text-xs text-gray-500">Total Keywords</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              {keywordsLoading ? (
                <>
                  <Skeleton className="h-7 w-12 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-gray-900">{uniquePages.size}</p>
                  <p className="text-xs text-gray-500">Pages with Keywords</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Table grouped by page_path ──────────────────────────────── */}
      {keywordsLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : keywords.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-violet-100 p-3 mb-3">
              <Target className="h-6 w-6 text-violet-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">No keywords tracked yet</p>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              Start tracking keywords by clicking "Add Keyword" above. Keywords help you monitor
              your SEO performance per page.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([pagePath, pageKeywords]) => (
            <Card key={pagePath}>
              <div className="flex items-center gap-2 border-b px-4 py-3">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900 font-mono">
                  {pagePath}
                </span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {pageKeywords.length} keyword{pageKeywords.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Keyword</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageKeywords.map((kw) => (
                    <TableRow key={kw.id}>
                      <TableCell>
                        <span className="text-sm font-medium text-gray-900">
                          {kw.keyword}
                        </span>
                      </TableCell>
                      <TableCell>
                        {kw.is_primary ? (
                          <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100">
                            <Star className="mr-1 h-3 w-3" />
                            Primary
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Secondary
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(kw.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                          onClick={() => deleteMutation.mutate(kw.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
