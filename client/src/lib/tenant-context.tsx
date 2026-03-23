import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { api } from './api'

interface TenantBranding {
  logo_url: string | null
  primary_color: string | null
  support_email: string | null
  public_site_url: string | null
  cms_domain: string | null
}

interface Tenant {
  id: number
  slug: string
  name: string
  status: string
  branding: TenantBranding
}

interface TenantUser {
  id: number
  email: string
  role: string
}

interface TenantAuthState {
  tenant: Tenant | null
  user: TenantUser | null
  moduleAccess: Record<string, boolean>
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const TenantAuthContext = createContext<TenantAuthState | null>(null)

export function TenantAuthProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [user, setUser] = useState<TenantUser | null>(null)
  const [moduleAccess, setModuleAccess] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)

  const loadHostContext = useCallback(async () => {
    try {
      const res = await api<{ mode: string; tenant: Tenant | null }>('/api/platform/host-context')
      if (res.tenant) {
        setTenant(res.tenant)
      }
    } catch {
      // Not on a tenant host
    }
  }, [])

  const checkSession = useCallback(async () => {
    try {
      const res = await api<{
        authenticated: boolean
        user?: TenantUser
        tenant?: Tenant
        moduleAccess?: Record<string, boolean>
      }>('/api/tenant/auth/me')

      if (res.authenticated && res.user) {
        setUser(res.user)
        if (res.tenant) setTenant(res.tenant)
        if (res.moduleAccess) setModuleAccess(res.moduleAccess)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHostContext().then(() => checkSession())
  }, [loadHostContext, checkSession])

  useEffect(() => {
    const handler = () => setUser(null)
    window.addEventListener('auth:unauthorized', handler)
    return () => window.removeEventListener('auth:unauthorized', handler)
  }, [])

  useEffect(() => {
    if (!tenant?.branding) return
    const root = document.documentElement
    if (tenant.branding.primary_color) {
      root.style.setProperty('--tenant-primary', tenant.branding.primary_color)
    }
  }, [tenant])

  const login = async (email: string, password: string) => {
    const res = await api<{
      ok: boolean
      user: TenantUser
      tenant: Tenant
      moduleAccess: Record<string, boolean>
    }>('/api/tenant/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    setUser(res.user)
    setTenant(res.tenant)
    setModuleAccess(res.moduleAccess)
  }

  const logout = async () => {
    await api('/api/tenant/auth/logout', { method: 'POST' })
    setUser(null)
  }

  return (
    <TenantAuthContext.Provider
      value={{ tenant, user, moduleAccess, isAuthenticated: !!user, isLoading, login, logout }}
    >
      {children}
    </TenantAuthContext.Provider>
  )
}

export function useTenantAuth() {
  const ctx = useContext(TenantAuthContext)
  if (!ctx) throw new Error('useTenantAuth must be used within TenantAuthProvider')
  return ctx
}
