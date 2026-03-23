import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { api } from '@/lib/api'
import { PageHeader } from '@/app/components/shared/PageHeader'
import {
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  Info,
  ExternalLink,
  Wrench,
  FileText,
  Link2,
  Search,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AuditIssue {
  severity: 'critical' | 'warning' | 'info'
  type: string
  page: string
  message: string
}

interface AuditResult {
  score: number
  totalIssues: number
  criticalCount: number
  warningCount: number
  infoCount: number
  issues: AuditIssue[]
  stats: {
    publishedArticles?: number
    articlesWithSeo?: number
    pageMetaEntries?: number
    activeRedirects?: number
  }
}

/* ------------------------------------------------------------------ */
/*  Score Gauge                                                        */
/* ------------------------------------------------------------------ */

function ScoreGauge({ score }: { score: number }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const offset = circumference - progress

  const color =
    score > 80 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444'
  const bgColor =
    score > 80 ? 'bg-green-50' : score >= 50 ? 'bg-yellow-50' : 'bg-red-50'
  const textColor =
    score > 80 ? 'text-green-700' : score >= 50 ? 'text-yellow-700' : 'text-red-700'
  const label = score > 80 ? 'Good' : score >= 50 ? 'Needs Work' : 'Poor'

  return (
    <div className={`flex flex-col items-center justify-center rounded-xl p-6 ${bgColor}`}>
      <div className="relative h-32 w-32">
        <svg className="h-32 w-32 -rotate-90" viewBox="0 0 128 128">
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-gray-200"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${textColor}`}>{score}</span>
        </div>
      </div>
      <span className={`mt-2 text-sm font-medium ${textColor}`}>{label}</span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Severity config                                                    */
/* ------------------------------------------------------------------ */

const severityConfig = {
  critical: {
    icon: AlertCircle,
    badgeClass: 'bg-red-100 text-red-700 hover:bg-red-100',
    label: 'Critical',
    borderClass: 'border-l-red-500',
  },
  warning: {
    icon: AlertTriangle,
    badgeClass: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
    label: 'Warning',
    borderClass: 'border-l-amber-400',
  },
  info: {
    icon: Info,
    badgeClass: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
    label: 'Info',
    borderClass: 'border-l-blue-400',
  },
} as const

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

export function SeoAudit() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['seo-audit'],
    queryFn: () => api<AuditResult>('/api/tenant/seo/audit'),
  })

  function runAudit() {
    queryClient.invalidateQueries({ queryKey: ['seo-audit'] })
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <PageHeader
          title="SEO Audit"
          subtitle="Check your site's SEO health"
          breadcrumbs={[{label:'Overview', href:'/'}, {label:'SEO', href:'/seo'}, {label:'Audit'}]}
        />
        <p className="mt-2 text-sm text-gray-500">Running audit...</p>
      </div>
    )
  }

  const audit = data ?? {
    score: 0,
    totalIssues: 0,
    criticalCount: 0,
    warningCount: 0,
    infoCount: 0,
    issues: [],
    stats: {},
  }

  const stats = audit.stats ?? {}

  const criticalIssues = audit.issues.filter((i) => i.severity === 'critical')
  const warningIssues = audit.issues.filter((i) => i.severity === 'warning')
  const infoIssues = audit.issues.filter((i) => i.severity === 'info')

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="SEO Audit"
        subtitle="Check your site's SEO health"
        breadcrumbs={[{label:'Overview', href:'/'}, {label:'SEO', href:'/seo'}, {label:'Audit'}]}
        actions={
          <Button onClick={runAudit} disabled={isFetching} variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Running...' : 'Run Audit'}
          </Button>
        }
      />

      {/* Score + Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Score gauge */}
        <div className="md:col-span-1">
          <ScoreGauge score={audit.score} />
        </div>

        {/* Stats cards */}
        <div className="md:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-2.5">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.publishedArticles ?? 0}
                  </p>
                  <p className="text-xs text-gray-500">Published Articles</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-50 p-2.5">
                  <Search className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.articlesWithSeo ?? 0}
                  </p>
                  <p className="text-xs text-gray-500">Articles with SEO</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-50 p-2.5">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.pageMetaEntries ?? 0}
                  </p>
                  <p className="text-xs text-gray-500">Page Meta Entries</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-50 p-2.5">
                  <Link2 className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.activeRedirects ?? 0}
                  </p>
                  <p className="text-xs text-gray-500">Active Redirects</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Issue count badges */}
      <div className="flex items-center gap-3">
        <Badge className={severityConfig.critical.badgeClass}>
          <AlertCircle className="mr-1 h-3.5 w-3.5" />
          {audit.criticalCount} Critical
        </Badge>
        <Badge className={severityConfig.warning.badgeClass}>
          <AlertTriangle className="mr-1 h-3.5 w-3.5" />
          {audit.warningCount} Warnings
        </Badge>
        <Badge className={severityConfig.info.badgeClass}>
          <Info className="mr-1 h-3.5 w-3.5" />
          {audit.infoCount} Info
        </Badge>
      </div>

      {/* Issues list */}
      {audit.totalIssues === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-green-100 p-3 mb-3">
              <Search className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">No issues found</p>
            <p className="text-sm text-gray-500 mt-1">
              Your site's SEO looks great. Keep up the good work!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Critical */}
          {criticalIssues.length > 0 && (
            <IssueGroup
              title="Critical Issues"
              issues={criticalIssues}
              severity="critical"
              onFix={(page) => navigate(`../seo?page=${encodeURIComponent(page)}`)}
            />
          )}

          {/* Warnings */}
          {warningIssues.length > 0 && (
            <IssueGroup
              title="Warnings"
              issues={warningIssues}
              severity="warning"
              onFix={(page) => navigate(`../seo?page=${encodeURIComponent(page)}`)}
            />
          )}

          {/* Info */}
          {infoIssues.length > 0 && (
            <IssueGroup
              title="Informational"
              issues={infoIssues}
              severity="info"
              onFix={(page) => navigate(`../seo?page=${encodeURIComponent(page)}`)}
            />
          )}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Issue Group                                                        */
/* ------------------------------------------------------------------ */

function IssueGroup({
  title,
  issues,
  severity,
  onFix,
}: {
  title: string
  issues: AuditIssue[]
  severity: 'critical' | 'warning' | 'info'
  onFix: (page: string) => void
}) {
  const config = severityConfig[severity]
  const Icon = config.icon

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {title} ({issues.length})
      </h3>
      <div className="space-y-2">
        {issues.map((issue, idx) => (
          <div
            key={`${issue.page}-${idx}`}
            className={`flex items-start justify-between gap-4 rounded-lg border border-l-4 ${config.borderClass} bg-white p-4`}
          >
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-sm text-gray-900">{issue.message}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono text-xs">
                  {issue.page}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {issue.type}
                </Badge>
              </div>
            </div>
            {issue.page && (
              <Button
                variant="outline"
                size="sm"
                className="flex-shrink-0"
                onClick={() => onFix(issue.page)}
              >
                <Wrench className="mr-1.5 h-3.5 w-3.5" />
                Fix
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
