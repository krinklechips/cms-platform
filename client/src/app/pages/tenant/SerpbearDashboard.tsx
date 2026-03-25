import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { Card, CardContent } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Badge } from '@/app/components/ui/badge'
import { Skeleton } from '@/app/components/ui/skeleton'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Plus,
  Trash2,
  Settings,
  BarChart2,
  Globe,
} from 'lucide-react'

interface SerpbearDomain {
  ID: string
  domain: string
  slug: string
  keywordCount?: number
}

interface SerpbearKeyword {
  ID: string
  keyword: string
  domain: string
  device: string
  country: string
  position: number
  lastUpdated: string
  history: Record<string, number>
  tags: string[]
}

function PositionBadge({ pos }: { pos: number }) {
  if (pos === 0) return <span className="text-xs text-gray-400">—</span>
  const cls =
    pos <= 3
      ? 'bg-green-100 text-green-700'
      : pos <= 10
        ? 'bg-blue-100 text-blue-700'
        : pos <= 20
          ? 'bg-amber-100 text-amber-700'
          : 'bg-gray-100 text-gray-600'
  return <Badge className={`text-xs tabular-nums ${cls}`}>{pos}</Badge>
}

function PositionChange({ kw }: { kw: SerpbearKeyword }) {
  const entries = Object.entries(kw.history || {}).sort(([a], [b]) => b.localeCompare(a))
  if (entries.length < 2) return <Minus className="h-3.5 w-3.5 text-gray-300" />

  const latest = entries[0][1]
  const prev = entries[1][1]
  if (!latest || !prev || latest === prev)
    return <Minus className="h-3.5 w-3.5 text-gray-300" />

  // Lower position number = better rank
  const improved = latest < prev
  const delta = Math.abs(latest - prev)
  return improved ? (
    <span className="flex items-center gap-0.5 text-xs text-green-600 font-medium">
      <TrendingUp className="h-3.5 w-3.5" />+{delta}
    </span>
  ) : (
    <span className="flex items-center gap-0.5 text-xs text-red-500 font-medium">
      <TrendingDown className="h-3.5 w-3.5" />-{delta}
    </span>
  )
}

export function SerpbearDashboard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [selectedDomain, setSelectedDomain] = useState<string>('')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newKeyword, setNewKeyword] = useState('')
  const [newDevice, setNewDevice] = useState('desktop')
  const [newCountry, setNewCountry] = useState('us')

  // Check if Serpbear is configured
  const { data: statusData, isLoading: statusLoading } = useQuery<{
    ok: boolean
    configured: boolean
    url: string | null
  }>({
    queryKey: ['serpbear', 'status'],
    queryFn: () => api('/api/tenant/serpbear/status'),
  })

  const configured = statusData?.configured ?? false

  // Fetch domains
  const { data: domainsData, isLoading: domainsLoading } = useQuery<{
    ok: boolean
    domains: SerpbearDomain[]
  }>({
    queryKey: ['serpbear', 'domains'],
    queryFn: () => api('/api/tenant/serpbear/domains'),
    enabled: configured,
  })

  const domains = domainsData?.domains ?? []

  // Auto-select first domain
  const activeDomain = selectedDomain || domains[0]?.ID || ''

  // Fetch keywords for selected domain
  const { data: keywordsData, isLoading: keywordsLoading, refetch: refetchKeywords } = useQuery<{
    ok: boolean
    keywords: SerpbearKeyword[]
  }>({
    queryKey: ['serpbear', 'keywords', activeDomain],
    queryFn: () => api(`/api/tenant/serpbear/keywords?domainID=${activeDomain}`),
    enabled: configured && !!activeDomain,
  })

  const keywords = keywordsData?.keywords ?? []

  const addMutation = useMutation({
    mutationFn: () =>
      api('/api/tenant/serpbear/keywords', {
        method: 'POST',
        body: {
          domainID: activeDomain,
          keyword: newKeyword.trim(),
          device: newDevice,
          country: newCountry,
          tags: [],
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serpbear', 'keywords', activeDomain] })
      toast.success('Keyword added to Serpbear')
      setNewKeyword('')
      setAddDialogOpen(false)
    },
    onError: () => toast.error('Failed to add keyword'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api(`/api/tenant/serpbear/keywords/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serpbear', 'keywords', activeDomain] })
      toast.success('Keyword removed')
    },
    onError: () => toast.error('Failed to remove keyword'),
  })

  const scrapeMutation = useMutation({
    mutationFn: () =>
      api('/api/tenant/serpbear/scrape', {
        method: 'POST',
        body: { domainID: activeDomain },
      }),
    onSuccess: () => {
      toast.success('Rank check triggered — results update shortly')
      setTimeout(() => refetchKeywords(), 5000)
    },
    onError: () => toast.error('Failed to trigger rank check'),
  })

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Rankings"
        subtitle="Track keyword positions in Google search results via Serpbear."
        breadcrumbs={[
          { label: 'Overview', href: '/' },
          { label: 'SEO', href: '/seo' },
          { label: 'Rankings' },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/seo/integrations')}>
            <Settings className="mr-1.5 h-3.5 w-3.5" />
            Integrations
          </Button>
        }
      />

      {/* Not configured */}
      {!configured && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-14 text-center">
            <div className="rounded-full bg-violet-100 p-4 mb-4">
              <BarChart2 className="h-8 w-8 text-violet-600" />
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Serpbear not connected</p>
            <p className="text-sm text-gray-500 max-w-sm mb-5">
              Connect your self-hosted Serpbear instance to track keyword rankings directly in
              your CMS dashboard.
            </p>
            <Button onClick={() => navigate('/seo/integrations')}>
              <Settings className="mr-2 h-4 w-4" />
              Configure Serpbear
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Configured state */}
      {configured && (
        <>
          {/* Domain selector + actions */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {domainsLoading ? (
              <Skeleton className="h-9 w-48" />
            ) : domains.length === 0 ? (
              <p className="text-sm text-gray-500">
                No domains found in Serpbear. Add a domain there first.
              </p>
            ) : (
              <Select
                value={activeDomain}
                onValueChange={setSelectedDomain}
              >
                <SelectTrigger className="w-64">
                  <Globe className="mr-2 h-4 w-4 text-gray-400" />
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  {domains.map((d) => (
                    <SelectItem key={d.ID} value={d.ID}>
                      {d.domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="flex items-center gap-2 sm:ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => scrapeMutation.mutate()}
                disabled={!activeDomain || scrapeMutation.isPending}
              >
                <RefreshCw
                  className={`mr-1.5 h-3.5 w-3.5 ${scrapeMutation.isPending ? 'animate-spin' : ''}`}
                />
                Refresh ranks
              </Button>
              <Button
                size="sm"
                onClick={() => setAddDialogOpen(true)}
                disabled={!activeDomain}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Add keyword
              </Button>
            </div>
          </div>

          {/* Stats */}
          {!keywordsLoading && keywords.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Keywords', value: keywords.length },
                { label: 'Top 3', value: keywords.filter((k) => k.position > 0 && k.position <= 3).length },
                { label: 'Top 10', value: keywords.filter((k) => k.position > 0 && k.position <= 10).length },
                { label: 'Not ranked', value: keywords.filter((k) => !k.position).length },
              ].map((s) => (
                <Card key={s.label}>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Keywords table */}
          {keywordsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : keywords.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <BarChart2 className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">
                  No keywords tracked for this domain. Add some above.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Keyword</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keywords
                    .slice()
                    .sort((a, b) => {
                      if (!a.position) return 1
                      if (!b.position) return -1
                      return a.position - b.position
                    })
                    .map((kw) => (
                      <TableRow key={kw.ID}>
                        <TableCell>
                          <span className="text-sm font-medium text-gray-900">{kw.keyword}</span>
                          {kw.tags?.length > 0 && (
                            <div className="flex gap-1 mt-0.5">
                              {kw.tags.map((t) => (
                                <Badge key={t} variant="secondary" className="text-xs py-0">
                                  {t}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <PositionBadge pos={kw.position} />
                        </TableCell>
                        <TableCell>
                          <PositionChange kw={kw} />
                        </TableCell>
                        <TableCell className="text-xs text-gray-500 capitalize">
                          {kw.device}
                        </TableCell>
                        <TableCell className="text-xs text-gray-500 uppercase">
                          {kw.country}
                        </TableCell>
                        <TableCell className="text-xs text-gray-400">
                          {kw.lastUpdated
                            ? new Date(kw.lastUpdated).toLocaleDateString()
                            : '—'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
                            onClick={() => deleteMutation.mutate(kw.ID)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}

      {/* Add keyword dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Keyword to Serpbear</DialogTitle>
            <DialogDescription>
              Serpbear will start tracking this keyword's ranking in Google.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Keyword</Label>
              <Input
                placeholder="e.g. managed IT services Sydney"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newKeyword.trim()) addMutation.mutate()
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Device</Label>
                <Select value={newDevice} onValueChange={setNewDevice}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Select value={newCountry} onValueChange={setNewCountry}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">US</SelectItem>
                    <SelectItem value="au">AU</SelectItem>
                    <SelectItem value="gb">GB</SelectItem>
                    <SelectItem value="ca">CA</SelectItem>
                    <SelectItem value="sg">SG</SelectItem>
                    <SelectItem value="nz">NZ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => addMutation.mutate()}
              disabled={!newKeyword.trim() || addMutation.isPending}
            >
              {addMutation.isPending ? 'Adding...' : 'Add Keyword'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
