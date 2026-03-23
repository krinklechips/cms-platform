import { createBrowserRouter } from 'react-router'
import { TenantLayout } from '@/app/components/tenant/TenantLayout'
import { TenantLogin } from '@/app/pages/tenant/TenantLogin'
import { TenantOverview } from '@/app/pages/tenant/TenantOverview'
import { ArticlesList } from '@/app/pages/tenant/ArticlesList'
import { ArticleEditor } from '@/app/pages/tenant/ArticleEditor'
import { MediaLibrary } from '@/app/pages/tenant/MediaLibrary'
import { AnnualReports } from '@/app/pages/tenant/AnnualReports'
import { SitePreview } from '@/app/pages/tenant/SitePreview'
import { AccountSecurity } from '@/app/pages/tenant/AccountSecurity'
import { SeoEditor } from '@/app/pages/tenant/SeoEditor'
import { SeoDashboard } from '@/app/pages/tenant/SeoDashboard'
import { KeywordTracking } from '@/app/pages/tenant/KeywordTracking'
import { RedirectManager } from '@/app/pages/tenant/RedirectManager'
import { SeoAudit } from '@/app/pages/tenant/SeoAudit'

export const tenantRouter = createBrowserRouter(
  [
    {
      path: '/login',
      element: <TenantLogin />,
    },
    {
      path: '/',
      element: <TenantLayout />,
      children: [
        { index: true, element: <TenantOverview /> },
        { path: 'articles', element: <ArticlesList /> },
        { path: 'articles/new', element: <ArticleEditor /> },
        { path: 'articles/:id', element: <ArticleEditor /> },
        { path: 'media', element: <MediaLibrary /> },
        { path: 'annual-reports', element: <AnnualReports /> },
        { path: 'preview', element: <SitePreview /> },
        { path: 'account', element: <AccountSecurity /> },
        { path: 'seo', element: <SeoDashboard /> },
        { path: 'seo/pages', element: <SeoEditor /> },
        { path: 'seo/keywords', element: <KeywordTracking /> },
        { path: 'seo/redirects', element: <RedirectManager /> },
        { path: 'seo/audit', element: <SeoAudit /> },
      ],
    },
  ],
  { basename: '/tenant-dashboard' },
)
