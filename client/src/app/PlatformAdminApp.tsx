import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { PlatformAuthProvider } from '@/lib/auth-context'
import { RouterProvider } from 'react-router'
import { platformRouter } from './routers/platform-admin-router'

export function PlatformAdminApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <PlatformAuthProvider>
        <RouterProvider router={platformRouter} />
      </PlatformAuthProvider>
    </QueryClientProvider>
  )
}
