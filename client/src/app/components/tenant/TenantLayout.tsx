import { Outlet, Navigate } from 'react-router'
import { Toaster } from 'sonner'
import { useTenantAuth } from '@/lib/tenant-context'
import { TenantSidebar } from './TenantSidebar'

export function TenantLayout() {
  const { isAuthenticated, isLoading } = useTenantAuth()

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

  return (
    <div className="flex h-screen bg-white">
      <TenantSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        <footer className="shrink-0 border-t border-gray-100 px-6 py-3">
          <p className="text-xs text-gray-400">Powered by CMS Platform</p>
        </footer>
      </div>

      <Toaster position="top-right" richColors closeButton />
    </div>
  )
}
