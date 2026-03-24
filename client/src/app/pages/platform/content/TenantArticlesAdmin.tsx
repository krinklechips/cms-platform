import { useParams, Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { api, tenantApi } from '@/lib/api'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table'
import { Plus, Pencil } from 'lucide-react'

interface Tenant {
  id: number
  name: string
  slug: string
}

interface Article {
  id: number
  title: string
  slug: string
  status: string
  category: string
  updatedAt?: string
  updated_at?: string
}

export function TenantArticlesAdmin() {
  const { tenantId } = useParams<{ tenantId: string }>()

  const { data: tenant } = useQuery<Tenant>({
    queryKey: ['platform', 'tenant', tenantId],
    queryFn: () => api(`/api/platform/tenants/${tenantId}`),
    enabled: !!tenantId,
  })

  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ['platform', 'tenant-articles', tenantId],
    queryFn: () => tenantApi(tenantId!, '/api/tenant/articles'),
    enabled: !!tenantId,
  })

  const tenantName = tenant?.name ?? `Tenant ${tenantId}`

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Articles"
        subtitle={`Managing articles for ${tenantName}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Tenants', href: '/tenants' },
          { label: tenantName, href: `/tenants/${tenantId}` },
          { label: 'Articles' },
        ]}
        actions={
          <Button size="sm" asChild>
            <Link to={`/tenants/${tenantId}/content/articles/new`}>
              <Plus className="mr-1.5 h-4 w-4" />
              New Article
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-500">Loading...</div>
      ) : articles.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-500">No articles found.</div>
      ) : (
        <div className="rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-20 text-right">Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium text-gray-900">{article.title}</TableCell>
                  <TableCell className="text-gray-500">{article.category || '--'}</TableCell>
                  <TableCell>
                    <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                      {article.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {article.updatedAt || article.updated_at
                      ? new Date(article.updatedAt ?? article.updated_at!).toLocaleDateString()
                      : '--'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      to={`/tenants/${tenantId}/content/articles/${article.id}`}
                      className="inline-flex items-center gap-1 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
