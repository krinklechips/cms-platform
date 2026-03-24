import { useParams, Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { api, tenantApi } from '@/lib/api'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table'
import { Pencil, Plus } from 'lucide-react'

interface Tenant {
  id: number
  name: string
  slug: string
}

interface Page {
  id: number
  title: string
  slug: string
  status: string
  showInNav?: boolean
  show_in_nav?: number
  updatedAt?: string
  updated_at?: string
}

export function TenantPagesAdmin() {
  const { tenantId } = useParams<{ tenantId: string }>()

  const { data: tenant } = useQuery<Tenant>({
    queryKey: ['platform', 'tenant', tenantId],
    queryFn: () => api(`/api/platform/tenants/${tenantId}`),
    enabled: !!tenantId,
  })

  const { data: pages = [], isLoading } = useQuery<Page[]>({
    queryKey: ['platform', 'tenant-pages', tenantId],
    queryFn: () => tenantApi(tenantId!, '/api/tenant/pages'),
    enabled: !!tenantId,
  })

  const tenantName = tenant?.name ?? `Tenant ${tenantId}`

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Pages"
        subtitle={`Managing pages for ${tenantName}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Tenants', href: '/tenants' },
          { label: tenantName, href: `/tenants/${tenantId}` },
          { label: 'Pages' },
        ]}
        actions={
          <Button size="sm" asChild>
            <Link to={`/tenants/${tenantId}/content/pages/new`}>
              <Plus className="mr-1.5 h-4 w-4" />
              New Page
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-500">Loading...</div>
      ) : pages.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-500">No pages yet. Click "New Page" to create the first one.</div>
      ) : (
        <div className="rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>In Nav</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-20 text-right">Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => {
                const inNav = page.showInNav ?? Boolean(page.show_in_nav)
                return (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium text-gray-900">{page.title}</TableCell>
                    <TableCell className="text-gray-500 font-mono text-xs">/{page.slug}</TableCell>
                    <TableCell>
                      <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                        {page.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {inNav ? (
                        <Badge variant="outline" className="text-green-600 border-green-300">Yes</Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-400">No</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {page.updatedAt || page.updated_at
                        ? new Date(page.updatedAt ?? page.updated_at!).toLocaleDateString()
                        : '--'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        to={`/tenants/${tenantId}/content/pages/${page.id}`}
                        className="inline-flex items-center gap-1 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
