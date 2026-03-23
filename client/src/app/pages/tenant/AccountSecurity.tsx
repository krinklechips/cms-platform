import { useState, type FormEvent } from 'react'
import { api } from '@/lib/api'
import { useTenantAuth } from '@/lib/tenant-context'
import { toast } from 'sonner'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Separator } from '@/app/components/ui/separator'

export function AccountSecurity() {
  const { user } = useTenantAuth()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters')
      return
    }

    setSubmitting(true)
    try {
      await api('/api/tenant/auth/change-password', {
        method: 'PUT',
        body: {
          current_password: currentPassword,
          new_password: newPassword,
        },
      })
      toast.success('Password updated successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Failed to change password'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-2xl">
      <PageHeader
        title="Account Security"
        subtitle="Manage your password"
        breadcrumbs={[{label:'Overview', href:'/'}, {label:'Account'}]}
      />

      {/* User info */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-900">
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
            <span className="text-gray-500">Email</span>
            <span className="font-medium text-gray-900">{user?.email}</span>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
            <span className="text-gray-500">Role</span>
            <span className="font-medium text-gray-900 capitalize">{user?.role}</span>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Change password */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-900">
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <Button type="submit" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
