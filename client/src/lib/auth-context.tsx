import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { api } from './api'

interface User {
  id: number
  email: string
  isPlatformAdmin: boolean
  platformRole: string | null
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  bootstrapLogin: (email: string, secret: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function PlatformAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = useCallback(async () => {
    try {
      const res = await api<{ authenticated: boolean; user?: User }>('/api/platform/auth/me')
      if (res.authenticated && res.user) {
        setUser(res.user)
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
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    const handler = () => setUser(null)
    window.addEventListener('auth:unauthorized', handler)
    return () => window.removeEventListener('auth:unauthorized', handler)
  }, [])

  const login = async (email: string, password: string) => {
    const res = await api<{ ok: boolean; user: User }>('/api/platform/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    setUser(res.user)
  }

  const bootstrapLogin = async (email: string, secret: string) => {
    const res = await api<{ ok: boolean; user: User }>('/api/platform/auth/bootstrap-login', {
      method: 'POST',
      body: { email, secret },
    })
    setUser(res.user)
  }

  const logout = async () => {
    await api('/api/platform/auth/logout', { method: 'POST' })
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        bootstrapLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within PlatformAuthProvider')
  return ctx
}
