import { createBrowserRouter } from 'react-router'
import { PlatformLayout } from '@/app/components/platform/PlatformLayout'
import { PlatformLogin } from '@/app/pages/platform/PlatformLogin'
import { Dashboard } from '@/app/pages/platform/Dashboard'
import { TenantDirectory } from '@/app/pages/platform/TenantDirectory'
import { CreateTenant } from '@/app/pages/platform/CreateTenant'
import { TenantDetails } from '@/app/pages/platform/TenantDetails'
import { Operations } from '@/app/pages/platform/Operations'
import { Integrations } from '@/app/pages/platform/Integrations'

export const platformRouter = createBrowserRouter(
  [
    {
      path: '/login',
      element: <PlatformLogin />,
    },
    {
      path: '/',
      element: <PlatformLayout />,
      children: [
        { index: true, element: <Dashboard /> },
        { path: 'tenants', element: <TenantDirectory /> },
        { path: 'tenants/create', element: <CreateTenant /> },
        { path: 'tenants/:tenantId', element: <TenantDetails /> },
        { path: 'operations', element: <Operations /> },
        { path: 'integrations', element: <Integrations /> },
      ],
    },
  ],
  { basename: '/platform-admin' },
)
