import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import {
  Search,
  LayoutDashboard,
  Database,
  Users,
  Settings,
  Plus,
  LogOut,
  ChevronDown,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export function PlatformSidebar() {
  const location = useLocation()
  const { user, logout } = useAuth()
  const [tenantsOpen, setTenantsOpen] = useState(true)

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  const isExact = (path: string) => location.pathname === path

  return (
    <aside className="flex h-screen w-[240px] max-w-full shrink-0 flex-col border-r border-[#d2d8e0] bg-[#f3f4f6] text-[#3e4a5d]">
      {/* Logo */}
      <div className="border-b border-[#d2d8e0] flex items-center justify-center p-3" style={{ minHeight: '80px' }}>
        <img
          src="/ep.svg"
          alt="EP CMS logo"
          className="w-full h-full max-h-[60px] object-contain"
        />
      </div>

      {/* Search */}
      <div className="border-b border-[#d2d8e0] px-3 py-3">
        <div className="relative rounded-[10px] border border-[#cfd5de] bg-[#f1f3f5] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa4b3]" />
          <input
            type="text"
            placeholder="Search modules..."
            className="w-full border-0 bg-transparent pl-7 text-[12px] leading-none font-medium tracking-[-0.01em] text-[#6d7488] outline-none placeholder:text-[#737b90]"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#677286]">
          Platform
        </p>

        <div className="space-y-1">
          {/* Dashboard */}
          <Link
            to="/"
            className={`group flex items-center gap-3 rounded-[10px] px-3 py-2 transition-all ${
              isExact('/')
                ? 'bg-[#e8edf5] text-[#1e293b]'
                : 'text-[#425066] hover:bg-[#f0f2f8] hover:text-[#2f3c52]'
            }`}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0 text-current" />
            <span className="text-[13px] font-semibold tracking-[-0.01em]">
              Dashboard
            </span>
          </Link>

          {/* Operations */}
          <Link
            to="/operations"
            className={`group flex items-start gap-3 rounded-[10px] px-3 py-2 transition-all ${
              isActive('/operations')
                ? 'bg-[#e8edf5] text-[#1e293b]'
                : 'text-[#425066] hover:bg-[#f0f2f8] hover:text-[#2f3c52]'
            }`}
          >
            <Database className="mt-0.5 h-4 w-4 shrink-0 text-current" />
            <div>
              <div className="text-[13px] leading-none font-semibold tracking-[-0.01em]">
                Operations
              </div>
              <div className="mt-1 text-[11px] leading-tight font-medium tracking-[-0.01em] text-[#5f6b7d]">
                Storage diagnostics and backups
              </div>
            </div>
          </Link>

          {/* Customers / Tenants (expandable) */}
          <div>
            <button
              onClick={() => setTenantsOpen(!tenantsOpen)}
              className={`group flex w-full items-start gap-3 rounded-[10px] px-3 py-2 text-left transition-all ${
                isActive('/tenants')
                  ? 'bg-[#e8edf5] text-[#1e293b]'
                  : 'text-[#425066] hover:bg-[#f0f2f8] hover:text-[#2f3c52]'
              }`}
            >
              <Users className="mt-0.5 h-4 w-4 shrink-0 text-current" />
              <div className="flex-1">
                <div className="text-[13px] leading-none font-semibold tracking-[-0.01em]">
                  Customers / Tenants
                </div>
                <div className="mt-1 text-[11px] leading-tight font-medium tracking-[-0.01em] text-[#5f6b7d]">
                  Onboarding, list and selection
                </div>
              </div>
              <ChevronDown
                className={`mt-0.5 h-4 w-4 shrink-0 text-[#9aa4b3] transition-transform ${
                  tenantsOpen ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </button>

            {tenantsOpen && (
              <div className="ml-7 mt-1 space-y-1">
                <Link
                  to="/tenants/create"
                  className={`flex items-center gap-2 rounded-[8px] px-2.5 py-1.5 text-[12px] font-medium tracking-[-0.01em] transition-all ${
                    isActive('/tenants/create')
                      ? 'bg-[#dfe6f2] text-[#1e293b]'
                      : 'text-[#465368] hover:bg-[#eaeff8] hover:text-[#2e3b50]'
                  }`}
                >
                  <Plus className="h-3.5 w-3.5 shrink-0 text-current" />
                  Create Tenant
                </Link>
                <Link
                  to="/tenants"
                  className={`block rounded-[8px] px-2.5 py-1.5 text-[12px] font-medium tracking-[-0.01em] transition-all ${
                    isExact('/tenants')
                      ? 'bg-[#dfe6f2] text-[#1e293b]'
                      : 'text-[#465368] hover:bg-[#eaeff8] hover:text-[#2e3b50]'
                  }`}
                >
                  Tenant Directory
                </Link>
              </div>
            )}
          </div>

          {/* Integrations */}
          <Link
            to="/integrations"
            className={`group flex items-start gap-3 rounded-[10px] px-3 py-2 transition-all ${
              isActive('/integrations')
                ? 'bg-[#e8edf5] text-[#1e293b]'
                : 'text-[#425066] hover:bg-[#f0f2f8] hover:text-[#2f3c52]'
            }`}
          >
            <Settings className="mt-0.5 h-4 w-4 shrink-0 text-current" />
            <div>
              <div className="text-[13px] leading-none font-semibold tracking-[-0.01em]">
                Integrations & Access
              </div>
              <div className="mt-1 text-[11px] leading-tight font-medium tracking-[-0.01em] text-[#5f6b7d]">
                Domains, modules, tenant access
              </div>
            </div>
          </Link>
        </div>
      </nav>

      {/* User info + sign out */}
      <div className="border-t border-[#d2d8e0] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <div className="truncate text-[12px] font-medium text-[#1e293b]">
              {user?.email ?? 'Unknown'}
            </div>
            <div className="text-[11px] text-[#677286]">
              {user?.platformRole ?? 'Admin'}
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="rounded-md p-1.5 text-[#677286] transition-colors hover:bg-[#e8edf5] hover:text-[#1e293b]"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
