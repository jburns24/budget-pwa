import { render as rtlRender, type RenderOptions } from '@testing-library/react'
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthProvider } from '../auth/auth-context'
import { FakeAuthProvider } from '../lib/adapters/auth-fake'

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  routerProps?: MemoryRouterProps
  authProvider?: FakeAuthProvider
}

function createWrapper(routerProps: MemoryRouterProps = {}, authProvider?: FakeAuthProvider) {
  const auth = authProvider ?? new FakeAuthProvider()
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={['/']} {...routerProps}>
        <AuthProvider authPort={auth}>{children}</AuthProvider>
      </MemoryRouter>
    )
  }
}

export function render(ui: React.ReactElement, options: CustomRenderOptions = {}) {
  const { routerProps, authProvider, ...renderOptions } = options
  return rtlRender(ui, {
    wrapper: createWrapper(routerProps, authProvider),
    ...renderOptions,
  })
}

export * from '@testing-library/react'
