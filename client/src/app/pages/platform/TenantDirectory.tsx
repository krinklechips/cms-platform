import { useState } from 'react'
import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Badge } from '@/app/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table'
import { Plus, Search, ExternalLink } from 'lucide-react'

interface Tenant {
  id: number
  name: string
  slug: string
  status: string
  cmsDomain?: string | null
  publicSiteUrl?: string | null
  createdAt?: string
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700 hover:bg-green-100',
  pending: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
  inactive: 'bg-gray-100 text-gray-600 hover:bg-gray-100',
  suspended: 'bg-red-100 text-red-700 hover:bg-red-100',
}

export function TenantDirectory() {
  const [search, setSearch] = useState('')

  const { data: rawTenants, isLoading } = useQuery({
    queryKey: ['platform', 'tenants'],
    queryFn: () => api<Tenant[]>('/api/platform/tenants'),
  })
  const tenants = Array.isArray(rawTenants) ? rawTenants : []

  const filtered = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="flex h-full flex-col">
      <div className="bg-white border-b border-gray-200 px-8 pt-6">
        <PageHeader
          title="Tenant Directory"
          subtitle="Manage all customer tenants"
          breadcrumbs={[{label:'Dashboard', href:'/'}, {label:'Tenants'}]}
          actions={
            <Button asChild className="gap-2 bg-[#7c3aed] hover:bg-[#6d28d9]">
              <Link to="/tenants/create">
                <Plus className="h-4 w-4" />
                Create Tenant
              </Link>
            </Button>
          }
        />
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 p-8">
        {/* Toolbar */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search tenants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Slug</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">CMS Domain</TableHead>
                <TableHead className="font-semibold text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                    Loading tenants...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                    {search ? 'No tenants match your search.' : 'No tenants yet.'}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((tenant) => (
                  <TableRow key={tenant.id} className="hover:bg-gray-50/50">
                    <TableCell>
                      <Link
                        to={`/tenants/${tenant.id}`}
                        className="font-medium text-gray-900 hover:text-[#7c3aed]"
                      >
                        {tenant.name}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-gray-500">
                      {tenant.slug}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          statusColors[tenant.status] ??
                          'bg-gray-100 text-gray-600'
                        }
                      >
                        {tenant.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {tenant.cmsDomain || '--'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild className="gap-1.5">
                        <Link to={`/tenants/${tenant.id}`}>
                          <ExternalLink className="h-3.5 w-3.5" />
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
