import { describe, it, expect } from 'vitest'
import { render, screen } from '../test/test-utils'
import { FakeAuthProvider } from '../lib/adapters/auth-fake'
import Home from './home'

describe('Home', () => {
  it('shows the authenticated user name', async () => {
    const auth = new FakeAuthProvider()
    render(<Home />, { authProvider: auth })
    expect(await screen.findByText(/Dev User/)).toBeInTheDocument()
  })

  it('renders the sign out button', async () => {
    const auth = new FakeAuthProvider()
    render(<Home />, { authProvider: auth })
    expect(await screen.findByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })

  it('shows a transaction list (empty for fresh user)', async () => {
    const auth = new FakeAuthProvider()
    render(<Home />, { authProvider: auth })
    // list renders; with no data it is simply empty — no error
    await screen.findByRole('list')
  })
})
