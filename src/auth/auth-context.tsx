import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AuthPort, AuthState } from '../lib/ports/auth-port'
import { getAuthPort } from '../lib/registry'

type AuthContextValue = AuthState & {
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({
  children,
  authPort,
}: {
  children: ReactNode
  authPort?: AuthPort
}) {
  const port = authPort ?? getAuthPort()
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  })

  useEffect(() => {
    return port.onAuthChange(setState)
  }, [port])

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signInWithGoogle: () => port.signInWithGoogle(),
        signOut: () => port.signOut(),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
