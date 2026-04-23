import { NavLink, useLocation } from 'react-router'
import { useQuery } from '@tanstack/react-query'
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
  Menu,
  Users,
  MessageSquare,
  Briefcase,
  MapPin,
  Star,
  MonitorPlay,
  Plus,
  Minus,
  FileIcon,
  DollarSign,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/app/components/ui/utils'
import { useTenantAuth } from '@/lib/tenant-context'
import { api } from '@/lib/api'
import { Separator } from '@/app/components/ui/separator'

interface SidebarPage {
  id: number
  title: string
  slug: string
  navLabel: string | null
  parentId: number | null
  sortOrder: number
  status: string
}

interface NavItem {
  label: string
  to: string
  icon: React.ComponentType<{ className?: string }>
  moduleKey?: string
  children?: { label: string; to: string }[]
}

const navItems: NavItem[] = [
  { label: 'Articles', to: '/articles', icon: FileText, moduleKey: 'articles' },
  { label: 'Media', to: '/media', icon: Image, moduleKey: 'mediaLibrary' },
  { label: 'Hero Images', to: '/hero-images', icon: MonitorPlay, moduleKey: 'heroImages' },
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
  { label: 'Team Members', to: '/team', icon: Users, moduleKey: 'teamMembers' },
  { label: 'Testimonials', to: '/testimonials', icon: MessageSquare, moduleKey: 'testimonials' },
  { label: 'Services & Pricing', to: '/services', icon: Briefcase, moduleKey: 'services' },
  { label: 'Pricing Manager', to: '/pricing', icon: DollarSign, moduleKey: 'services' },
  { label: 'Featured Products', to: '/featured-products', icon: Star, moduleKey: 'featuredProducts' },
  { label: 'Contact Info', to: '/contact', icon: MapPin, moduleKey: 'contactInfo' },
  { label: 'Navigation', to: '/navigation', icon: Menu, moduleKey: 'navigation' },
  { label: 'Site Preview', to: '/preview', icon: Eye },
]

function SidebarNavLink({
  to,
  end,
  icon: Icon,
  children,
  indent,
}: {
  to: string
  end?: boolean
  icon?: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  indent?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors',
          'hover:bg-[#eaeff8]',
          isActive && 'bg-[#e8edf5] text-gray-900',
          indent && 'ml-4 gap-2',
        )
      }
    >
      {Icon && <Icon className={cn('shrink-0', indent ? 'h-3.5 w-3.5' : 'h-4 w-4')} />}
      <span className="truncate">{children}</span>
    </NavLink>
  )
}

export function TenantSidebar() {
  const { tenant, user, moduleAccess, logout } = useTenantAuth()
  const location = useLocation()
  const [seoOpen, setSeoOpen] = useState(false)
  const [expandedParents, setExpandedParents] = useState<Set<number>>(new Set())

  const { data: pages = [] } = useQuery<SidebarPage[]>({
    queryKey: ['tenant', 'pages-sidebar'],
    queryFn: () => api('/api/tenant/pages'),
    enabled: moduleAccess.pages !== false,
  })

  const filteredItems = navItems.filter((item) => {
    if (!item.moduleKey) return true
    return moduleAccess[item.moduleKey] !== false
  })

  // Build page tree: top-level pages sorted by sortOrder
  const topPages = pages
    .filter((p) => !p.parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  const childPages = (parentId: number) =>
    pages
      .filter((p) => p.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)

  const toggleParent = (id: number) => {
    setExpandedParents((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

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
        <div className="space-y-0.5">
          <SidebarNavLink to="/" end icon={LayoutDashboard}>Overview</SidebarNavLink>
        </div>

        {/* PAGES — the main website pages, always visible */}
        {moduleAccess.pages !== false && (
          <>
            <div className="flex items-center justify-between px-3 mt-5 mb-1">
              <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                Pages
              </p>
              <div className="flex items-center gap-0.5">
                <NavLink
                  to="/pages/new"
                  className="rounded p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                  title="Add page"
                >
                  <Plus className="h-3.5 w-3.5" />
                </NavLink>
                <NavLink
                  to="/pages"
                  className="rounded p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                  title="Manage all pages"
                >
                  <Minus className="h-3.5 w-3.5" />
                </NavLink>
              </div>
            </div>
            <div className="space-y-0.5">
              {topPages.map((page) => {
                const children = childPages(page.id)
                const hasChildren = children.length > 0
                const isExpanded = expandedParents.has(page.id)

                return (
                  <div key={page.id}>
                    <div className="flex items-center">
                      <NavLink
                        to={`/pages/${page.id}`}
                        className={({ isActive }) =>
                          cn(
                            'flex flex-1 items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors',
                            'hover:bg-[#eaeff8]',
                            isActive && 'bg-[#e8edf5] text-gray-900',
                          )
                        }
                      >
                        <span className="truncate">{page.navLabel || page.title}</span>
                      </NavLink>
                      {hasChildren && (
                        <button
                          onClick={() => toggleParent(page.id)}
                          className="rounded p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors mr-1 cursor-pointer"
                        >
                          <ChevronDown className={cn('h-3 w-3 transition-transform', !isExpanded && '-rotate-90')} />
                        </button>
                      )}
                    </div>
                    {hasChildren && isExpanded && (
                      <div className="ml-3 mt-0.5 space-y-0.5 border-l border-gray-200 pl-2">
                        {children.map((child) => (
                          <NavLink
                            key={child.id}
                            to={`/pages/${child.id}`}
                            className={({ isActive }) =>
                              cn(
                                'block rounded-lg px-2.5 py-1 text-[13px] text-gray-500 transition-colors',
                                'hover:bg-[#eaeff8] hover:text-gray-700',
                                isActive && 'bg-[#dfe6f2] text-gray-900 font-medium',
                              )
                            }
                          >
                            {child.navLabel || child.title}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* CONTENT section */}
        {filteredItems.some((item) =>
          ['/articles', '/media', '/hero-images', '/annual-reports'].includes(item.to),
        ) && (
          <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase px-3 mb-1 mt-5">
            Content
          </p>
        )}
        <div className="space-y-0.5">
          {filteredItems
            .filter((item) =>
              ['/articles', '/media', '/hero-images', '/annual-reports'].includes(item.to),
            )
            .map((item) => (
              <SidebarNavLink key={item.to} to={item.to} icon={item.icon}>
                {item.label}
              </SidebarNavLink>
            ))}
        </div>

        {/* PEOPLE section */}
        {filteredItems.some((item) => item.to === '/team') && (
          <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase px-3 mb-1 mt-5">
            People
          </p>
        )}
        <div className="space-y-0.5">
          {filteredItems
            .filter((item) => ['/team'].includes(item.to))
            .map((item) => (
              <SidebarNavLink key={item.to} to={item.to} icon={item.icon}>
                {item.label}
              </SidebarNavLink>
            ))}
        </div>

        {/* MARKETING section */}
        {filteredItems.some((item) =>
          ['/testimonials', '/services', '/pricing', '/contact', '/featured-products'].includes(item.to),
        ) && (
          <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase px-3 mb-1 mt-5">
            Marketing
          </p>
        )}
        <div className="space-y-0.5">
          {filteredItems
            .filter((item) =>
              ['/testimonials', '/services', '/pricing', '/contact', '/featured-products'].includes(item.to),
            )
            .map((item) => (
              <SidebarNavLink key={item.to} to={item.to} icon={item.icon}>
                {item.label}
              </SidebarNavLink>
            ))}
        </div>

        {/* SEO & MARKETING section */}
        {filteredItems.some((item) => item.children) && (
          <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase px-3 mb-1 mt-5">
            SEO & Marketing
          </p>
        )}
        <div className="space-y-0.5">
          {filteredItems
            .filter((item) => item.children)
            .map((item) => (
              <div key={item.label}>
                <button
                  onClick={() => setSeoOpen(!seoOpen)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors cursor-pointer',
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
        {filteredItems.some((item) => ['/navigation', '/preview'].includes(item.to)) && (
          <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase px-3 mb-1 mt-5">
            Site
          </p>
        )}
        <div className="space-y-0.5">
          {filteredItems
            .filter((item) => ['/navigation', '/preview'].includes(item.to))
            .map((item) => (
              <SidebarNavLink key={item.to} to={item.to} icon={item.icon}>
                {item.label}
              </SidebarNavLink>
            ))}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="mt-auto border-t border-gray-200 px-3 py-3 space-y-1">
        <SidebarNavLink to="/account" icon={Shield}>Account Security</SidebarNavLink>

        <Separator className="my-2" />

        <div className="flex items-center justify-between px-3 py-1">
          <span className="truncate text-xs text-gray-500">{user?.email}</span>
          <button
            onClick={() => logout()}
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 cursor-pointer"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
