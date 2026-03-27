import { NavLink } from 'react-router'
import {
  LayoutDashboard,
  FileText,
  Image,
  FileBarChart,
  Search,
  Eye,
  Shield,
  LogOut,
  ChevronDown,
  Files,
  Menu,
  Users,
  MessageSquare,
  Briefcase,
  MapPin,
  Star,
  MonitorPlay,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/app/components/ui/utils'
import { useTenantAuth } from '@/lib/tenant-context'
import { Separator } from '@/app/components/ui/separator'

interface NavItem {
  label: string
  to: string
  icon: React.ComponentType<{ className?: string }>
  moduleKey?: string
  children?: { label: string; to: string }[]
}

const navItems: NavItem[] = [
  { label: 'Overview', to: '/', icon: LayoutDashboard },
  { label: 'Articles', to: '/articles', icon: FileText, moduleKey: 'articles' },
  { label: 'Pages', to: '/pages', icon: Files, moduleKey: 'pages' },
  { label: 'Media', to: '/media', icon: Image, moduleKey: 'mediaLibrary' },
  { label: 'Hero Images', to: '/hero-images', icon: MonitorPlay },
  { label: 'Annual Reports', to: '/annual-reports', icon: FileBarChart, moduleKey: 'annualReports' },
  {
    label: 'SEO',
    to: '/seo',
    icon: Search,
    moduleKey: 'seo',
    children: [
      { label: 'Dashboard', to: '/seo' },
      { label: 'Pages', to: '/seo/pages' },
      { label: 'Keywords', to: '/seo/keywords' },
      { label: 'Rankings', to: '/seo/rankings' },
      { label: 'Performance', to: '/seo/performance' },
      { label: 'Redirects', to: '/seo/redirects' },
      { label: 'Audit', to: '/seo/audit' },
      { label: 'Integrations', to: '/seo/integrations' },
    ],
  },
  { label: 'Team Members', to: '/team', icon: Users },
  { label: 'Testimonials', to: '/testimonials', icon: MessageSquare },
  { label: 'Services & Pricing', to: '/services', icon: Briefcase },
  { label: 'Featured Products', to: '/featured-products', icon: Star },
  { label: 'Contact Info', to: '/contact', icon: MapPin },
  { label: 'Navigation', to: '/navigation', icon: Menu, moduleKey: 'navigation' },
  { label: 'Site Preview', to: '/preview', icon: Eye },
]

export function TenantSidebar() {
  const { tenant, user, moduleAccess, logout } = useTenantAuth()
  const [seoOpen, setSeoOpen] = useState(false)

  const filteredItems = navItems.filter((item) => {
    if (!item.moduleKey) return true
    return moduleAccess[item.moduleKey] !== false
  })

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-gray-50">
      {/* Branding */}
      <div className="flex h-16 items-center gap-3 px-5">
        {tenant?.branding.logo_url ? (
          <img
            src={tenant.branding.logo_url}
            alt={tenant.name}
            className="h-8 max-w-[140px] object-contain"
          />
        ) : (
          <span className="text-base font-semibold text-gray-900 truncate">
            {tenant?.name ?? 'Dashboard'}
          </span>
        )}
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {/* Overview */}
        <div className="space-y-1">
          {filteredItems
            .filter((item) => item.to === '/')
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors',
                    'hover:bg-[#eaeff8]',
                    isActive && 'bg-[#e8edf5] text-gray-900',
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            ))}
        </div>

        {/* CONTENT section */}
        <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase px-3 mb-1 mt-5">
          Content
        </p>
        <div className="space-y-1">
          {filteredItems
            .filter((item) =>
              ['/articles', '/pages', '/media', '/hero-images', '/annual-reports'].includes(item.to),
            )
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors',
                    'hover:bg-[#eaeff8]',
                    isActive && 'bg-[#e8edf5] text-gray-900',
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            ))}
        </div>

        {/* PEOPLE section */}
        <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase px-3 mb-1 mt-5">
          People
        </p>
        <div className="space-y-1">
          {filteredItems
            .filter((item) => ['/team'].includes(item.to))
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors',
                    'hover:bg-[#eaeff8]',
                    isActive && 'bg-[#e8edf5] text-gray-900',
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            ))}
        </div>

        {/* MARKETING section */}
        <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase px-3 mb-1 mt-5">
          Marketing
        </p>
        <div className="space-y-1">
          {filteredItems
            .filter((item) =>
              ['/testimonials', '/services', '/contact', '/featured-products'].includes(item.to),
            )
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors',
                    'hover:bg-[#eaeff8]',
                    isActive && 'bg-[#e8edf5] text-gray-900',
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            ))}
        </div>

        {/* SEO & MARKETING section */}
        <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase px-3 mb-1 mt-5">
          SEO & Marketing
        </p>
        <div className="space-y-1">
          {filteredItems
            .filter((item) => item.children)
            .map((item) => (
              <div key={item.label}>
                <button
                  onClick={() => setSeoOpen(!seoOpen)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors',
                    'hover:bg-[#eaeff8]',
                    seoOpen && 'bg-[#e8edf5] text-gray-900',
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 transition-transform',
                      seoOpen && 'rotate-180',
                    )}
                  />
                </button>

                <div
                  className={cn(
                    'transition-all duration-200 overflow-hidden',
                    seoOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
                  )}
                >
                  <div className="ml-7 mt-1 space-y-0.5">
                    {item.children!.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        end={child.to === '/seo'}
                        className={({ isActive }) =>
                          cn(
                            'block rounded-lg px-3 py-1.5 text-sm text-gray-500 transition-colors',
                            'hover:bg-[#eaeff8] hover:text-gray-700',
                            isActive && 'bg-[#dfe6f2] text-gray-900 font-medium',
                          )
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* SITE section */}
        <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase px-3 mb-1 mt-5">
          Site
        </p>
        <div className="space-y-1">
          {filteredItems
            .filter((item) => ['/navigation', '/preview'].includes(item.to))
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors',
                    'hover:bg-[#eaeff8]',
                    isActive && 'bg-[#e8edf5] text-gray-900',
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            ))}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="mt-auto border-t border-gray-200 px-3 py-3 space-y-1">
        <NavLink
          to="/account"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors',
              'hover:bg-[#eaeff8]',
              isActive && 'bg-[#e8edf5] text-gray-900',
            )
          }
        >
          <Shield className="h-4 w-4 shrink-0" />
          Account Security
        </NavLink>

        <Separator className="my-2" />

        <div className="flex items-center justify-between px-3 py-1">
          <span className="truncate text-xs text-gray-500">{user?.email}</span>
          <button
            onClick={() => logout()}
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
