import { useState, type FormEvent } from 'react'
import { useNavigate, Navigate } from 'react-router'
import { useTenantAuth } from '@/lib/tenant-context'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'

export function TenantLogin() {
  const { tenant, isAuthenticated, isLoading, login, mustChangePassword } = useTenantAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    )
  }

  if (isAuthenticated) {
    if (mustChangePassword) {
      return <Navigate to="/change-password" replace />
    }
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const needsChange = await login(email, password)
      navigate(needsChange ? '/change-password' : '/', { replace: true })
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'message' in err
        ? (err as { message: string }).message
        : 'Invalid email or password'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const primaryColor = tenant?.branding.primary_color ?? '#2563eb'

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="mb-8 text-center">
          {tenant?.branding.logo_url ? (
            <img
              src={tenant.branding.logo_url}
              alt={tenant.name}
              className="mx-auto h-12 object-contain"
            />
          ) : (
            <h1 className="text-xl font-semibold text-gray-900">
              {tenant?.name ?? 'Dashboard'}
            </h1>
          )}
          <p className="mt-2 text-sm text-gray-500">
            Sign in to your content dashboard
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            className="w-full text-white"
            disabled={submitting}
            style={{ backgroundColor: primaryColor }}
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-400">
          Powered by <span className="font-medium">Serviette Lab CMS</span>
          <span className="mx-1.5">·</span>© 2026
        </p>
      </div>
    </div>
  )
}
