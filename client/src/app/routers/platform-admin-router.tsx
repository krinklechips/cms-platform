import { createBrowserRouter } from 'react-router'
import { PlatformLayout } from '@/app/components/platform/PlatformLayout'
import { PlatformLogin } from '@/app/pages/platform/PlatformLogin'
import { Dashboard } from '@/app/pages/platform/Dashboard'
import { TenantDirectory } from '@/app/pages/platform/TenantDirectory'
import { CreateTenant } from '@/app/pages/platform/CreateTenant'
import { TenantDetails } from '@/app/pages/platform/TenantDetails'
import { Operations } from '@/app/pages/platform/Operations'
import { Integrations } from '@/app/pages/platform/Integrations'
import { TenantArticlesAdmin } from '@/app/pages/platform/content/TenantArticlesAdmin'
import { TenantArticleEditor } from '@/app/pages/platform/content/TenantArticleEditor'
import { TenantPagesAdmin } from '@/app/pages/platform/content/TenantPagesAdmin'
import { TenantTeamAdmin } from '@/app/pages/platform/content/TenantTeamAdmin'
import { TenantPageEditor } from '@/app/pages/platform/content/TenantPageEditor'

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
        { path: 'tenants/:tenantId/content/articles', element: <TenantArticlesAdmin /> },
        { path: 'tenants/:tenantId/content/articles/new', element: <TenantArticleEditor /> },
        { path: 'tenants/:tenantId/content/articles/:articleId', element: <TenantArticleEditor /> },
        { path: 'tenants/:tenantId/content/pages', element: <TenantPagesAdmin /> },
        { path: 'tenants/:tenantId/content/pages/new', element: <TenantPageEditor /> },
        { path: 'tenants/:tenantId/content/pages/:pageId', element: <TenantPageEditor /> },
        { path: 'tenants/:tenantId/content/team', element: <TenantTeamAdmin /> },
        { path: 'operations', element: <Operations /> },
        { path: 'integrations', element: <Integrations /> },
      ],
    },
  ],
  { basename: '/platform-admin' },
)
