import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { TenantAuthProvider } from '@/lib/tenant-context'
import { RouterProvider } from 'react-router'
import { tenantRouter } from './routers/tenant-dashboard-router'

export function TenantDashboardApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <TenantAuthProvider>
        <RouterProvider router={tenantRouter} />
      </TenantAuthProvider>
    </QueryClientProvider>
  )
}
