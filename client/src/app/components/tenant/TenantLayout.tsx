import { useEffect } from 'react'
import { Outlet, Navigate } from 'react-router'
import { Toaster } from 'sonner'
import { useTenantAuth } from '@/lib/tenant-context'
import { TenantSidebar } from './TenantSidebar'

export function TenantLayout() {
  const { isAuthenticated, isLoading, mustChangePassword, tenant } = useTenantAuth()

  useEffect(() => {
    if (!tenant) return
    // Set page title
    document.title = `${tenant.name} — CMS`
    // Set favicon from tenant logo
    const logoUrl = tenant.branding?.logo_url
    if (logoUrl) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      link.href = logoUrl
      link.type = logoUrl.endsWith('.svg') ? 'image/svg+xml' : 'image/png'
    }
  }, [tenant])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (mustChangePassword) {
    return <Navigate to="/change-password" replace />
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <TenantSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>

        <footer className="shrink-0 border-t border-gray-100 px-6 py-3">
          <p className="text-xs text-gray-400">Powered by CMS Platform</p>
        </footer>
      </div>

      <Toaster position="top-right" richColors closeButton />
    </div>
  )
}
