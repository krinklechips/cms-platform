import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useTenantAuth } from '@/lib/tenant-context'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { FileText, Image, FileBarChart, Layers, Users, Briefcase, MessageSquare } from 'lucide-react'
import { Card, CardContent } from '@/app/components/ui/card'
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

interface Service {
  id: number
  name: string
  status: string
}

interface TeamMember {
  id: number
}

interface Testimonial {
  id: number
}

export function TenantOverview() {
  const { moduleAccess } = useTenantAuth()

  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: ['tenant', 'articles'],
    queryFn: () => api('/api/tenant/articles'),
    enabled: moduleAccess.articles !== false,
  })

  const { data: media = [] } = useQuery<MediaItem[]>({
    queryKey: ['tenant', 'media'],
    queryFn: () => api('/api/tenant/media'),
    enabled: moduleAccess.mediaLibrary !== false,
  })

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ['tenant', 'services'],
    queryFn: () => api('/api/tenant/services'),
  })

  const { data: team = [] } = useQuery<TeamMember[]>({
    queryKey: ['tenant', 'team'],
    queryFn: () => api('/api/tenant/team'),
  })

  const { data: testimonials = [] } = useQuery<Testimonial[]>({
    queryKey: ['tenant', 'testimonials'],
    queryFn: () => api('/api/tenant/testimonials'),
  })

  const publishedCount = articles.filter((a) => a.status === 'published').length
  const draftCount = articles.filter((a) => a.status === 'draft').length
  const publishedServices = services.filter((s: any) => s.status === 'published').length

  const recentArticles = [...articles]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)

  // Build stats dynamically based on moduleAccess
  const stats: {
    label: string
    value: number
    icon: typeof FileText
    color: string
    bg: string
    href?: string
  }[] = []

  if (moduleAccess.articles !== false) {
    stats.push({
      label: 'Published Articles',
      value: publishedCount,
      icon: FileText,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      href: '/articles',
    })
    stats.push({
      label: 'Draft Articles',
      value: draftCount,
      icon: FileText,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      href: '/articles',
    })
  }

  stats.push({
    label: 'Services',
    value: publishedServices,
    icon: Briefcase,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    href: '/services',
  })

  stats.push({
    label: 'Team Members',
    value: team.length,
    icon: Users,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    href: '/team',
  })

  stats.push({
    label: 'Testimonials',
    value: testimonials.length,
    icon: MessageSquare,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    href: '/testimonials',
  })

  if (moduleAccess.mediaLibrary !== false) {
    stats.push({
      label: 'Media Files',
      value: media.length,
      icon: Image,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
      href: '/media',
    })
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader title="Overview" subtitle="Your content dashboard" />

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stats.map((stat) => {
          const content = (
            <Card key={stat.label} className="border-gray-200 transition-colors hover:border-gray-300">
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
          )
          return stat.href ? (
            <a key={stat.label} href={stat.href} className="block">
              {content}
            </a>
          ) : (
            <div key={stat.label}>{content}</div>
          )
        })}
      </div>

      <Separator />

      {/* Recent activity */}
      {moduleAccess.articles !== false && (
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
      )}
    </div>
  )
}
