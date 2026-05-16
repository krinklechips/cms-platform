import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { api } from '@/lib/api'
import { useTenantAuth } from '@/lib/tenant-context'
import { getTenantPublicSiteUrl } from './page-preview-url'
import { toast } from 'sonner'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Badge } from '@/app/components/ui/badge'
import { Skeleton } from '@/app/components/ui/skeleton'
import { Separator } from '@/app/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import {
  PlayCircle,
  History,
  AlertTriangle,
  Settings,
  Smartphone,
  Monitor,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface LighthouseAudit {
  id: number
  url: string
  strategy: string
  performanceScore: number
  accessibilityScore: number
  bestPracticesScore: number
  seoScore: number
  opportunities?: Opportunity[]
  diagnostics?: Opportunity[]
  createdAt: string
}

interface Opportunity {
  id: string
  title: string
  description: string
  score: number | null
  displayValue: string | null
}

interface HistoryRow {
  id: number
  url: string
  strategy: string
  performance_score: number
  accessibility_score: number
  best_practices_score: number
  seo_score: number
  created_at: string
}

function scoreColor(score: number) {
  if (score >= 90) return 'text-green-600'
  if (score >= 50) return 'text-amber-500'
  return 'text-red-500'
}

function scoreBg(score: number) {
  if (score >= 90) return 'bg-green-50 border-green-200'
  if (score >= 50) return 'bg-amber-50 border-amber-200'
  return 'bg-red-50 border-red-200'
}

function ScoreCircle({ score, label }: { score: number; label: string }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 90 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626'

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-20 w-20">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
          <circle
            cx="36"
            cy="36"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-lg font-bold"
          style={{ color }}
        >
          {score}
        </span>
      </div>
      <span className="text-xs font-medium text-gray-500">{label}</span>
    </div>
  )
}

function OpportunityRow({ item }: { item: Opportunity }) {
  const [open, setOpen] = useState(false)
  const score = item.score ?? 0
  const color =
    score >= 0.9
      ? 'bg-green-100 text-green-700'
      : score >= 0.5
        ? 'bg-amber-100 text-amber-700'
        : 'bg-red-100 text-red-700'

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
        onClick={() => setOpen(!open)}
      >
        <Badge className={`shrink-0 text-xs ${color}`}>
          {Math.round(score * 100)}
        </Badge>
        <span className="flex-1 text-sm font-medium text-gray-800">{item.title}</span>
        {item.displayValue && (
          <span className="text-xs text-gray-400 mr-2">{item.displayValue}</span>
        )}
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
        )}
      </button>
      {open && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
          <p className="text-xs text-gray-600">{item.description}</p>
        </div>
      )}
    </div>
  )
}

export function LighthouseAudit() {
  const navigate = useNavigate()
  const { tenant } = useTenantAuth()
  const queryClient = useQueryClient()

  const [url, setUrl] = useState(getTenantPublicSiteUrl(tenant) || '')
  const [strategy, setStrategy] = useState<'mobile' | 'desktop'>('mobile')
  const [latestAudit, setLatestAudit] = useState<LighthouseAudit | null>(null)

  const { data: historyData, isLoading: historyLoading } = useQuery<{ audits: HistoryRow[] }>({
    queryKey: ['lighthouse', 'history'],
    queryFn: () => api('/api/tenant/lighthouse/history'),
  })

  const runMutation = useMutation({
    mutationFn: () =>
      api<{ ok: boolean; audit: LighthouseAudit }>('/api/tenant/lighthouse/run', {
        method: 'POST',
        body: { url, strategy },
      }),
    onSuccess: (data) => {
      setLatestAudit(data.audit)
      queryClient.invalidateQueries({ queryKey: ['lighthouse', 'history'] })
      toast.success('Audit complete')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Audit failed')
    },
  })

  const history = historyData?.audits ?? []
  const displayAudit = latestAudit

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Performance Audit"
        subtitle="Run Lighthouse audits via Google PageSpeed Insights to measure your site's performance, SEO, and accessibility."
        breadcrumbs={[
          { label: 'Overview', href: '/' },
          { label: 'SEO', href: '/seo' },
          { label: 'Performance' },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/seo/integrations')}>
            <Settings className="mr-1.5 h-3.5 w-3.5" />
            Integrations
          </Button>
        }
      />

      {/* Run panel */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 space-y-1.5">
              <label className="text-sm font-medium text-gray-700">URL to audit</label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://yoursite.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Device</label>
              <Select value={strategy} onValueChange={(v) => setStrategy(v as 'mobile' | 'desktop')}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mobile">
                    <span className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Mobile
                    </span>
                  </SelectItem>
                  <SelectItem value="desktop">
                    <span className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      Desktop
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => runMutation.mutate()}
              disabled={runMutation.isPending || !url.trim()}
              className="self-end"
            >
              {runMutation.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Auditing...
                </>
              ) : (
                <>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Run Audit
                </>
              )}
            </Button>
          </div>
          {runMutation.isPending && (
            <p className="mt-2 text-xs text-gray-400">
              This takes 10–30 seconds. Google is running Lighthouse against your URL.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Scores */}
      {displayAudit && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-900">
                  Scores — {displayAudit.url}
                </CardTitle>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  {displayAudit.strategy === 'mobile' ? (
                    <Smartphone className="h-3.5 w-3.5" />
                  ) : (
                    <Monitor className="h-3.5 w-3.5" />
                  )}
                  {displayAudit.strategy}
                  <span className="ml-2">
                    {new Date(displayAudit.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap justify-around gap-6 py-2">
                <ScoreCircle score={displayAudit.performanceScore} label="Performance" />
                <ScoreCircle score={displayAudit.accessibilityScore} label="Accessibility" />
                <ScoreCircle score={displayAudit.bestPracticesScore} label="Best Practices" />
                <ScoreCircle score={displayAudit.seoScore} label="SEO" />
              </div>
              <Separator className="my-4" />
              <div className="flex items-center gap-6 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500 inline-block" />
                  90–100 Good
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400 inline-block" />
                  50–89 Needs work
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500 inline-block" />
                  0–49 Poor
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Opportunities */}
          {(displayAudit.opportunities?.length ?? 0) > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Opportunities
              </h3>
              <div className="space-y-2">
                {displayAudit.opportunities!.map((o) => (
                  <OpportunityRow key={o.id} item={o} />
                ))}
              </div>
            </div>
          )}

          {/* Diagnostics */}
          {(displayAudit.diagnostics?.length ?? 0) > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Diagnostics
              </h3>
              <div className="space-y-2">
                {displayAudit.diagnostics!.map((d) => (
                  <OpportunityRow key={d.id} item={d} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Audit history */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <History className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Audit History</h2>
        </div>

        {historyLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <PlayCircle className="h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No audits run yet. Enter a URL above to start.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">URL</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Device</th>
                  <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Perf</th>
                  <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">A11y</th>
                  <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">BP</th>
                  <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">SEO</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      setLatestAudit({
                        id: row.id,
                        url: row.url,
                        strategy: row.strategy,
                        performanceScore: row.performance_score,
                        accessibilityScore: row.accessibility_score,
                        bestPracticesScore: row.best_practices_score,
                        seoScore: row.seo_score,
                        createdAt: row.created_at,
                      })
                    }
                  >
                    <td className="px-4 py-2.5 max-w-xs truncate text-gray-700 font-mono text-xs">
                      {row.url}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">
                      {row.strategy === 'mobile' ? (
                        <span className="flex items-center gap-1">
                          <Smartphone className="h-3.5 w-3.5" />
                          Mobile
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Monitor className="h-3.5 w-3.5" />
                          Desktop
                        </span>
                      )}
                    </td>
                    <td className={`px-3 py-2.5 text-center font-semibold text-sm ${scoreColor(row.performance_score)}`}>
                      {row.performance_score}
                    </td>
                    <td className={`px-3 py-2.5 text-center font-semibold text-sm ${scoreColor(row.accessibility_score)}`}>
                      {row.accessibility_score}
                    </td>
                    <td className={`px-3 py-2.5 text-center font-semibold text-sm ${scoreColor(row.best_practices_score)}`}>
                      {row.best_practices_score}
                    </td>
                    <td className={`px-3 py-2.5 text-center font-semibold text-sm ${scoreColor(row.seo_score)}`}>
                      {row.seo_score}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-400">
                      {new Date(row.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
