import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { PlatformHeader } from '@/app/components/platform/PlatformHeader'
import { Users, UserCheck, Shield, Archive } from 'lucide-react'

interface Tenant {
  id: number
  name: string
  status: string
}

export function Dashboard() {
  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['platform', 'tenants'],
    queryFn: () => api<Tenant[]>('/api/platform/tenants'),
  })

  const totalTenants = tenants.length
  const activeTenants = tenants.filter((t) => t.status === 'active').length

  const stats = [
    {
      label: 'Total Tenants',
      value: isLoading ? '--' : String(totalTenants),
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Active Tenants',
      value: isLoading ? '--' : String(activeTenants),
      icon: UserCheck,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Total Users',
      value: '--',
      icon: Shield,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      label: 'Last Backup',
      value: 'N/A',
      icon: Archive,
      color: 'bg-amber-100 text-amber-600',
    },
  ]

  return (
    <div className="flex h-full flex-col">
      <PlatformHeader title="Dashboard" subtitle="Platform overview" />

      <div className="flex-1 overflow-auto bg-gray-50 p-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-200 bg-white p-6"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold tracking-tight text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <a
              href="/tenants/create"
              className="rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300"
            >
              <h3 className="font-semibold text-gray-900">Create Tenant</h3>
              <p className="mt-1 text-sm text-gray-500">
                Onboard a new customer
              </p>
            </a>
            <a
              href="/operations"
              className="rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300"
            >
              <h3 className="font-semibold text-gray-900">Run Backup</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create a database backup
              </p>
            </a>
            <a
              href="/tenants"
              className="rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300"
            >
              <h3 className="font-semibold text-gray-900">View Tenants</h3>
              <p className="mt-1 text-sm text-gray-500">
                Browse all tenants
              </p>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
