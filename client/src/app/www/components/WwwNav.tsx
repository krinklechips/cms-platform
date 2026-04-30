import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Menu, X } from 'lucide-react'
import { cn } from '@/app/components/ui/utils'

const NAV_LINKS = [
  { label: 'Features', to: '/#features' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Sign in', to: '/platform-admin' },
]

export function WwwNav() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const dark = pathname === '/'

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors',
        dark ? 'bg-transparent' : 'bg-white border-b border-gray-100',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold tracking-tight">SL</span>
          </div>
          <span
            className={cn(
              'text-sm font-semibold tracking-tight',
              dark ? 'text-white' : 'text-gray-900',
            )}
          >
            Serviette Labs
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.slice(0, -1).map((link) => (
            <a
              key={link.label}
              href={link.to}
              className={cn(
                'text-sm font-medium transition-colors',
                dark
                  ? 'text-white/70 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900',
              )}
            >
              {link.label}
            </a>
          ))}
          <a
            href="/platform-admin"
            className={cn(
              'text-sm font-medium transition-colors',
              dark ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900',
            )}
          >
            Sign in
          </a>
          <Link
            to="/pricing"
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
          >
            Get started
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          className={cn('md:hidden', dark ? 'text-white' : 'text-gray-700')}
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
          <a href="/#features" className="block text-sm font-medium text-gray-700" onClick={() => setOpen(false)}>Features</a>
          <Link to="/pricing" className="block text-sm font-medium text-gray-700" onClick={() => setOpen(false)}>Pricing</Link>
          <a href="/platform-admin" className="block text-sm font-medium text-gray-700">Sign in</a>
          <Link
            to="/pricing"
            className="block rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white text-center"
            onClick={() => setOpen(false)}
          >
            Get started
          </Link>
        </div>
      )}
    </header>
  )
}
