import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { api } from '@/lib/api'
import { SeoScoreGauge } from '@/app/components/shared/SeoScoreGauge'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Separator } from '@/app/components/ui/separator'
import { Skeleton } from '@/app/components/ui/skeleton'
import {
  FileText,
  Search,
  ArrowRightLeft,
  AlertTriangle,
  AlertCircle,
  Info,
  Wrench,
  ArrowRight,
  BarChart3,
  FileCode,
  Bot,
  PlayCircle,
  Map,
  Target,
} from 'lucide-react'

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

interface KeywordRow {
  page_path: string
  keyword: string
  is_primary: number
  created_at: string
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

/* ------------------------------------------------------------------ */
/*  Quick action definitions                                           */
/* ------------------------------------------------------------------ */

const quickActions = [
  {
    label: 'Edit Page Meta',
    description: 'Configure title, description & OG tags per page',
    href: '/seo/pages',
    icon: FileText,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    label: 'Manage Redirects',
    description: 'Create and manage 301/302 URL redirects',
    href: '/seo/redirects',
    icon: ArrowRightLeft,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    label: 'Keyword Tracking',
    description: 'Track primary and secondary keywords per page',
    href: '/seo/keywords',
    icon: Target,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    label: 'Run Full Audit',
    description: 'Comprehensive SEO health check with scoring',
    href: '/seo/audit',
    icon: PlayCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    label: 'View Sitemap',
    description: 'Preview your auto-generated XML sitemap',
    href: '/sitemap.xml',
    icon: Map,
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    external: true,
  },
  {
    label: 'View robots.txt',
    description: 'Check your robots.txt crawling rules',
    href: '/robots.txt',
    icon: Bot,
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    external: true,
  },
]

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

export function SeoDashboard() {
  const navigate = useNavigate()

  const { data: auditData, isLoading: auditLoading } = useQuery({
    queryKey: ['seo-audit'],
    queryFn: () => api<AuditResult>('/api/tenant/seo/audit'),
  })

  const { data: keywordsData, isLoading: keywordsLoading } = useQuery({
    queryKey: ['seo-keywords'],
    queryFn: () => api<{ keywords: KeywordRow[] }>('/api/tenant/seo/keywords'),
  })

  const audit = auditData ?? {
    score: 0,
    totalIssues: 0,
    criticalCount: 0,
    warningCount: 0,
    infoCount: 0,
    issues: [],
    stats: {},
  }

  const keywords = keywordsData?.keywords ?? []
  const stats = audit.stats ?? {}
  const topIssues = audit.issues.slice(0, 5)

  const statCards = [
    {
      label: 'Pages Configured',
      value: stats.pageMetaEntries ?? 0,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Keywords Tracked',
      value: keywords.length,
      icon: Target,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
    {
      label: 'Active Redirects',
      value: stats.activeRedirects ?? 0,
      icon: ArrowRightLeft,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Issues Found',
      value: audit.totalIssues,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ]

  const isLoading = auditLoading || keywordsLoading

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="SEO Suite"
        subtitle="Monitor, optimize, and manage your site's search engine presence."
        breadcrumbs={[
          { label: 'Overview', href: '/' },
          { label: 'SEO' },
        ]}
      />

      {/* ── Score + Stat Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {/* Score gauge — spans 2 cols on lg */}
        <Card className="lg:col-span-2 flex items-center justify-center">
          <CardContent className="py-8">
            {isLoading ? (
              <div className="flex flex-col items-center gap-3">
                <Skeleton className="h-40 w-40 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <SeoScoreGauge score={audit.score} size="lg" />
            )}
          </CardContent>
        </Card>

        {/* Stat cards — 2x2 grid spanning 4 cols */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${stat.bg}`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  {isLoading ? (
                    <>
                      <Skeleton className="h-7 w-12 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Top Issues ────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Top Issues</h2>
            {!isLoading && audit.totalIssues > 0 && (
              <Badge variant="secondary" className="text-xs">
                {audit.totalIssues} total
              </Badge>
            )}
          </div>
          {audit.totalIssues > 5 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => navigate('audit')}
            >
              View all
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : topIssues.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <div className="rounded-full bg-green-100 p-3 mb-3">
                <Search className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">No issues found</p>
              <p className="text-sm text-gray-500 mt-1">
                Your site's SEO looks great. Keep it up!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {topIssues.map((issue, idx) => {
              const config = severityConfig[issue.severity]
              return (
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
                      <Badge className={`text-xs ${config.badgeClass}`}>
                        {config.label}
                      </Badge>
                    </div>
                  </div>
                  {issue.page && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0"
                      onClick={() => navigate(`../seo?page=${encodeURIComponent(issue.page)}`)}
                    >
                      <Wrench className="mr-1.5 h-3.5 w-3.5" />
                      Fix
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Separator />

      {/* ── Quick Actions ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Quick Actions</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Card
              key={action.label}
              className="group cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => {
                if (action.external) {
                  window.open(action.href, '_blank')
                } else {
                  navigate(action.href)
                }
              }}
            >
              <CardContent className="flex items-start gap-4 p-5">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${action.bg}`}
                >
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                    {action.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                    {action.description}
                  </p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
