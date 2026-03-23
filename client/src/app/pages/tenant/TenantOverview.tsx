import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { FileText, Image, FileBarChart, Layers, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Separator } from '@/app/components/ui/separator'
import { formatDistanceToNow } from 'date-fns'

interface Article {
  id: number
  title: string
  status: string
  updated_at: string
  category?: string
}

interface MediaItem {
  id: number
}

interface AnnualReport {
  id: number
}

interface SeoAudit {
  score?: number
  [key: string]: unknown
}

export function TenantOverview() {
  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: ['tenant', 'articles'],
    queryFn: () => api('/api/tenant/articles'),
  })

  const { data: media = [] } = useQuery<MediaItem[]>({
    queryKey: ['tenant', 'media'],
    queryFn: () => api('/api/tenant/media'),
  })

  const { data: reports = [] } = useQuery<AnnualReport[]>({
    queryKey: ['tenant', 'annual-reports'],
    queryFn: () => api('/api/tenant/annual-reports'),
  })

  const { data: seoAudit } = useQuery<SeoAudit>({
    queryKey: ['seo-audit'],
    queryFn: () => api('/api/tenant/seo/audit'),
  })

  const publishedCount = articles.filter((a) => a.status === 'published').length
  const draftCount = articles.filter((a) => a.status === 'draft').length
  const seoScore = seoAudit?.score

  const recentArticles = [...articles]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)

  // Determine SEO score color
  function seoColor(score: number | undefined) {
    if (score === undefined) return { text: 'text-gray-400', bg: 'bg-gray-50', indicator: 'bg-gray-300' }
    if (score >= 80) return { text: 'text-emerald-600', bg: 'bg-emerald-50', indicator: 'bg-emerald-500' }
    if (score >= 50) return { text: 'text-amber-600', bg: 'bg-amber-50', indicator: 'bg-amber-500' }
    return { text: 'text-red-600', bg: 'bg-red-50', indicator: 'bg-red-500' }
  }

  const seoColors = seoColor(seoScore)

  const stats = [
    {
      label: 'Published Articles',
      value: publishedCount,
      icon: FileText,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Draft Articles',
      value: draftCount,
      icon: FileText,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Media Files',
      value: media.length,
      icon: Image,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Annual Reports',
      value: reports.length,
      icon: FileBarChart,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader title="Overview" subtitle="Your content dashboard" />

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-gray-200">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* SEO Health Score Card */}
        <a href="/seo" className="block">
          <Card className="border-gray-200 transition-colors hover:border-gray-300 h-full">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${seoColors.bg}`}>
                <ShieldCheck className={`h-5 w-5 ${seoColors.text}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-semibold text-gray-900">
                    {seoScore !== undefined ? seoScore : '--'}
                  </p>
                  {seoScore !== undefined && (
                    <span className={`inline-block h-2.5 w-2.5 rounded-full ${seoColors.indicator}`} />
                  )}
                </div>
                <p className="text-xs text-gray-500">SEO Health Score</p>
              </div>
            </CardContent>
          </Card>
        </a>
      </div>

      <Separator />

      {/* Recent activity */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Layers className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
        </div>

        {recentArticles.length === 0 ? (
          <p className="text-sm text-gray-500">No articles yet.</p>
        ) : (
          <div className="space-y-3">
            {recentArticles.map((article) => {
              const borderColor =
                article.status === 'published'
                  ? 'border-l-green-500'
                  : 'border-l-amber-500'

              return (
                <Card
                  key={article.id}
                  className={`border-gray-100 border-l-4 ${borderColor}`}
                >
                  <CardContent className="flex items-center justify-between px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {article.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {article.category && `${article.category} · `}
                        {article.updated_at && !isNaN(new Date(article.updated_at).getTime())
                          ? formatDistanceToNow(new Date(article.updated_at), { addSuffix: true })
                          : 'Recently'}
                      </p>
                    </div>
                    <Badge
                      variant={article.status === 'published' ? 'default' : 'secondary'}
                      className="ml-4 shrink-0"
                    >
                      {article.status}
                    </Badge>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
