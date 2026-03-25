import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { Loader2, KeyRound, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export function PlatformChangePassword() {
  const navigate = useNavigate()
  const { mustChangePassword, clearMustChangePassword } = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      await api('/api/platform/auth/change-password', {
        method: 'POST',
        body: { newPassword },
      })
      clearMustChangePassword()
      toast.success('Password updated successfully')
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Failed to change password.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const isForced = mustChangePassword

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {!isForced && (
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        )}

        {isForced && (
          <div className="mb-8 flex justify-center">
            <img src="/ep.svg" alt="EP CMS logo" className="h-24 w-auto object-contain" />
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
              <KeyRound className="h-6 w-6 text-amber-500" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              {isForced ? 'Set Your Password' : 'Change Password'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isForced
                ? "You're using a temporary password. Please set a new one to continue."
                : 'Choose a new password for your account.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="newPassword" className="text-sm font-medium text-gray-900">
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="mt-1.5"
                required
                autoFocus
              />
            </div>

            <div>
              <Label htmlFor="confirm" className="text-sm font-medium text-gray-900">
                Confirm Password
              </Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                className="mt-1.5"
                required
              />
            </div>

            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <Button
              type="submit"
              disabled={submitting || !newPassword || !confirm}
              className="w-full bg-[#7c3aed] hover:bg-[#6d28d9]"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Set Password & Continue
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
