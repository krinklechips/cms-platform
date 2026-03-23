import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { CardGridSkeleton } from '@/app/components/shared/CardGridSkeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Users, UserCheck, UsersRound, HardDrive, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatDistanceToNow, subMonths, format, startOfMonth, isAfter } from 'date-fns'

interface Tenant {
  id: number
  name: string
  slug?: string
  status: string
  createdAt?: string
  created_at?: string
}

export function Dashboard() {
  const { data: rawTenants, isLoading } = useQuery({
    queryKey: ['platform', 'tenants'],
    queryFn: () => api<Tenant[]>('/api/platform/tenants'),
  })

  const tenants = Array.isArray(rawTenants) ? rawTenants : []
  const totalTenants = tenants.length
  const activeTenants = tenants.filter((t) => t.status === 'active').length

  const stats = [
    {
      label: 'Total Tenants',
      value: isLoading ? '--' : String(totalTenants),
      icon: Users,
      iconColor: 'text-violet-600',
      iconBg: 'bg-violet-50',
    },
    {
      label: 'Active Tenants',
      value: isLoading ? '--' : String(activeTenants),
      icon: UserCheck,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-50',
    },
    {
      label: 'Total Users',
      value: '--',
      icon: UsersRound,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
    },
    {
      label: 'Last Backup',
      value: 'N/A',
      icon: HardDrive,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
    },
  ]

  // Bucket tenants by month for the last 6 months
  const chartData = useMemo(() => {
    const now = new Date()
    const months: { month: string; count: number }[] = []

    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i))
      const nextMonthStart = i > 0 ? startOfMonth(subMonths(now, i - 1)) : new Date(now.getFullYear(), now.getMonth() + 1, 1)
      const label = format(monthStart, 'MMM yyyy')
      const count = tenants.filter((t) => {
        const created = t.createdAt || t.created_at
        if (!created) return false
        const d = new Date(created)
        return isAfter(d, monthStart) && !isAfter(d, nextMonthStart)
      }).length
      months.push({ month: label, count })
    }

    return months
  }, [tenants])

  // Last 5 tenants sorted by creation date
  const recentTenants = useMemo(() => {
    return [...tenants]
      .sort((a, b) => {
        const aDate = a.createdAt || a.created_at || ''
        const bDate = b.createdAt || b.created_at || ''
        return new Date(bDate).getTime() - new Date(aDate).getTime()
      })
      .slice(0, 5)
  }, [tenants])

  return (
    <div className="flex h-full flex-col">
      <div className="bg-white border-b border-gray-200 px-8 pt-6">
        <PageHeader title="Dashboard" subtitle="Platform overview and quick actions" />
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 p-8">
        {/* Stat Cards */}
        {isLoading ? (
          <CardGridSkeleton cards={4} />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="border-gray-200">
                <CardContent className="flex items-center gap-4 p-6">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${stat.iconBg}`}
                  >
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold tracking-tight text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Charts & Recent Tenants */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Tenant Growth Chart */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-900">
                Tenant Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        fontSize: '13px',
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                      name="Tenants"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Tenants */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-900">
                Recent Tenants
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentTenants.length === 0 ? (
                <p className="text-sm text-gray-500">No tenants yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentTenants.map((tenant) => {
                    const created = tenant.createdAt || tenant.created_at
                    return (
                      <div
                        key={tenant.id}
                        className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {tenant.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            {tenant.slug && (
                              <span className="font-mono text-gray-400">{tenant.slug}</span>
                            )}
                            {created && !isNaN(new Date(created).getTime()) && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(created), { addSuffix: true })}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={tenant.status === 'active' ? 'default' : 'secondary'}
                          className="ml-4 shrink-0"
                        >
                          {tenant.status}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
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
