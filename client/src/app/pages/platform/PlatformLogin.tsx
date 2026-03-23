import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { Loader2 } from 'lucide-react'

export function PlatformLogin() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading, login, bootstrapLogin } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [secret, setSecret] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isDev = import.meta.env.DEV

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#7c3aed]" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (isDev) {
        await bootstrapLogin(email, secret || 'dev')
      } else {
        await login(email, password)
      }
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Login failed. Please try again.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img
            src="/ep.svg"
            alt="Think logo"
            className="h-16 object-contain"
          />
        </div>

        {/* Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              {isDev ? 'Dev Login' : 'Platform Admin'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isDev
                ? 'Quick access for development'
                : 'Sign in to your admin account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-900">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="mt-1.5"
                required
                autoFocus
              />
            </div>

            {isDev ? (
              <div>
                <Label htmlFor="secret" className="text-sm font-medium text-gray-900">
                  Bootstrap secret
                </Label>
                <Input
                  id="secret"
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Leave blank for default"
                  className="mt-1.5"
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-900">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="mt-1.5"
                  required
                />
              </div>
            )}

            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={submitting || !email}
              className="w-full bg-[#7c3aed] hover:bg-[#6d28d9]"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDev ? 'Dev Login' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
