import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { api } from '@/lib/api'
import { useTenantAuth } from '@/lib/tenant-context'
import { toast } from 'sonner'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { ShieldAlert } from 'lucide-react'

export function ForceChangePassword() {
  const { user, tenant, clearMustChangePassword } = useTenantAuth()
  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const primaryColor = tenant?.branding.primary_color ?? '#2563eb'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setSubmitting(true)
    try {
      await api('/api/tenant/auth/force-change-password', {
        method: 'POST',
        body: { newPassword },
      })
      clearMustChangePassword()
      toast.success('Password updated. Welcome!')
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Failed to update password'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

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
        </div>

        <div className="rounded-xl border border-amber-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex flex-col items-center text-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
              <ShieldAlert className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Set Your Password</h2>
              <p className="mt-1 text-sm text-gray-500">
                You're signed in as <strong>{user?.email}</strong>. Please set a permanent password before continuing.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                autoComplete="new-password"
                autoFocus
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your new password"
                required
                autoComplete="new-password"
              />
            </div>

            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full text-white"
              disabled={submitting}
              style={{ backgroundColor: primaryColor }}
            >
              {submitting ? 'Saving...' : 'Set Password & Continue'}
            </Button>
          </form>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">Powered by CMS Platform</p>
      </div>
    </div>
  )
}
