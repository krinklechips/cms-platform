import { LogOut } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar'
import { useAuth } from '@/lib/auth-context'

interface PlatformHeaderProps {
  title: string
  subtitle?: string
}

export function PlatformHeader({ title, subtitle }: PlatformHeaderProps) {
  const { user, logout } = useAuth()

  const initials = user?.email
    ? user.email.charAt(0).toUpperCase()
    : '?'

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-purple-100 text-purple-700 text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <div className="text-xs font-medium text-gray-900">
                {user?.email ?? 'Unknown'}
              </div>
              <div className="text-[10px] text-gray-500">
                {user?.platformRole ?? 'Admin'}
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-7 px-2.5"
            onClick={() => logout()}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </Button>
        </div>
      </div>
    </header>
  )
}
