import { describe, it, expect } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { render, screen } from '../test/test-utils'
import { FakeAuthProvider } from '../lib/adapters/auth-fake'
import { ProtectedRoute } from './protected-route'
import type { AuthPort, AuthState } from '../lib/ports/auth-port'

describe('ProtectedRoute', () => {
  it('renders children when authenticated', async () => {
    const auth = new FakeAuthProvider()
    render(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route index element={<div>Protected Content</div>} />
        </Route>
      </Routes>,
      { authProvider: auth },
    )
    expect(await screen.findByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to /login when unauthenticated', async () => {
    const auth = new FakeAuthProvider(null)
    render(
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route index element={<div>Protected Content</div>} />
        </Route>
      </Routes>,
      { authProvider: auth },
    )
    expect(await screen.findByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders nothing (no flash) while loading', () => {
    // A port that never fires its callback keeps loading:true indefinitely
    const neverResolvingAuth: AuthPort = {
      signInWithGoogle: async () => {},
      signOut: async () => {},
      getSession: () => new Promise<null>(() => {}),
      onAuthChange: (_cb: (state: AuthState) => void) => () => {},
    }
    render(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route index element={<div>Protected Content</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>,
      { authProvider: neverResolvingAuth as unknown as FakeAuthProvider },
    )
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
  })
})
