import { Navigate, Outlet } from 'react-router'
import { Toaster } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import { PlatformSidebar } from './PlatformSidebar'

export function PlatformLayout() {
  const { isAuthenticated, isLoading, mustChangePassword } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#7c3aed]" />
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
      <PlatformSidebar />
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>
      <Toaster position="bottom-right" richColors />
    </div>
  )
}
