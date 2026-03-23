import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { FileText, Image, FileBarChart, Layers } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Separator } from '@/app/components/ui/separator'

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

  const publishedCount = articles.filter((a) => a.status === 'published').length
  const draftCount = articles.filter((a) => a.status === 'draft').length

  const recentArticles = [...articles]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)

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
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          A snapshot of your content and assets.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            {recentArticles.map((article) => (
              <div
                key={article.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {article.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {article.category && `${article.category} · `}
                    Updated {new Date(article.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  variant={article.status === 'published' ? 'default' : 'secondary'}
                  className="ml-4 shrink-0"
                >
                  {article.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
