import { createBrowserRouter } from 'react-router'
import { TenantLayout } from '@/app/components/tenant/TenantLayout'
import { TenantLogin } from '@/app/pages/tenant/TenantLogin'
import { ForceChangePassword } from '@/app/pages/tenant/ForceChangePassword'
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
import { PagesList } from '@/app/pages/tenant/PagesList'
import { PageEditor } from '@/app/pages/tenant/PageEditor'
import { NavigationEditor } from '@/app/pages/tenant/NavigationEditor'
import { TeamMembers } from '@/app/pages/tenant/TeamMembers'
import { Testimonials } from '@/app/pages/tenant/Testimonials'
import { Services } from '@/app/pages/tenant/Services'
import { Pricing } from '@/app/pages/tenant/Pricing'
import { ContactSettings } from '@/app/pages/tenant/ContactSettings'
import { FeaturedProducts } from '@/app/pages/tenant/FeaturedProducts'
import { SerpbearDashboard } from '@/app/pages/tenant/SerpbearDashboard'
import { LighthouseAudit } from '@/app/pages/tenant/LighthouseAudit'
import { IntegrationSettings } from '@/app/pages/tenant/IntegrationSettings'
import { HeroImages } from '@/app/pages/tenant/HeroImages'

export const tenantRouter = createBrowserRouter(
  [
    {
      path: '/login',
      element: <TenantLogin />,
    },
    {
      path: '/change-password',
      element: <ForceChangePassword />,
    },
    {
      path: '/',
      element: <TenantLayout />,
      children: [
        { index: true, element: <TenantOverview /> },
        { path: 'articles', element: <ArticlesList /> },
        { path: 'articles/new', element: <ArticleEditor /> },
        { path: 'articles/:id', element: <ArticleEditor /> },
        { path: 'pages', element: <PagesList /> },
        { path: 'pages/new', element: <PageEditor /> },
        { path: 'pages/:id', element: <PageEditor /> },
        { path: 'navigation', element: <NavigationEditor /> },
        { path: 'media', element: <MediaLibrary /> },
        { path: 'hero-images', element: <HeroImages /> },
        { path: 'annual-reports', element: <AnnualReports /> },
        { path: 'preview', element: <SitePreview /> },
        { path: 'account', element: <AccountSecurity /> },
        { path: 'seo', element: <SeoDashboard /> },
        { path: 'seo/pages', element: <SeoEditor /> },
        { path: 'seo/keywords', element: <KeywordTracking /> },
        { path: 'seo/redirects', element: <RedirectManager /> },
        { path: 'seo/audit', element: <SeoAudit /> },
        { path: 'seo/rankings', element: <SerpbearDashboard /> },
        { path: 'seo/performance', element: <LighthouseAudit /> },
        { path: 'seo/integrations', element: <IntegrationSettings /> },
        { path: 'team', element: <TeamMembers /> },
        { path: 'testimonials', element: <Testimonials /> },
        { path: 'services', element: <Services /> },
        { path: 'pricing', element: <Pricing /> },
        { path: 'contact', element: <ContactSettings /> },
        { path: 'featured-products', element: <FeaturedProducts /> },
      ],
    },
  ],
  { basename: '/tenant-dashboard' },
)
