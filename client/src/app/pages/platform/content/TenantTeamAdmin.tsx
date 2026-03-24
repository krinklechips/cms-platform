import { useParams, Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { api, tenantApi } from '@/lib/api'
import { PageHeader } from '@/app/components/shared/PageHeader'
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
import { Button } from '@/app/components/ui/button'

interface Tenant {
  id: number
  name: string
  slug: string
}

interface TeamMember {
  id: number
  name: string
  title?: string | null
  department?: string | null
  status: string
  sortOrder: number
}

export function TenantTeamAdmin() {
  const { tenantId } = useParams<{ tenantId: string }>()

  const { data: tenant } = useQuery<Tenant>({
    queryKey: ['platform', 'tenant', tenantId],
    queryFn: () => api(`/api/platform/tenants/${tenantId}`),
    enabled: !!tenantId,
  })

  const { data: members = [], isLoading } = useQuery<TeamMember[]>({
    queryKey: ['platform', 'tenant-team', tenantId],
    queryFn: () => tenantApi(tenantId!, '/api/tenant/team-members'),
    enabled: !!tenantId,
  })

  const tenantName = tenant?.name ?? `Tenant ${tenantId}`

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Team Members"
        subtitle={`Managing team members for ${tenantName}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Tenants', href: '/tenants' },
          { label: tenantName, href: `/tenants/${tenantId}` },
          { label: 'Team Members' },
        ]}
        actions={
          <Button size="sm" asChild>
            <Link to={`/tenants/${tenantId}`} state={{ openTab: 'content' }}>
              <Plus className="mr-1.5 h-4 w-4" />
              Back to Tenant
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-500">Loading...</div>
      ) : members.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-500">No team members found.</div>
      ) : (
        <div className="rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium text-gray-900">{member.name}</TableCell>
                  <TableCell className="text-gray-500">{member.title || '--'}</TableCell>
                  <TableCell className="text-gray-500">{member.department || '--'}</TableCell>
                  <TableCell>
                    <Badge variant={member.status === 'published' ? 'default' : 'secondary'}>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500">{member.sortOrder}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
