import { describe, it, expect, vi } from 'vitest'
import { FakeAuthProvider } from './auth-fake'

describe('FakeAuthProvider', () => {
  it('starts authenticated with the fake user by default', async () => {
    const auth = new FakeAuthProvider()
    const session = await auth.getSession()
    expect(session).not.toBeNull()
    expect(session?.user.email).toBe('dev@example.com')
    expect(session?.user.id).toBe('fake-user-1')
  })

  it('starts unauthenticated when constructed with null', async () => {
    const auth = new FakeAuthProvider(null)
    const session = await auth.getSession()
    expect(session).toBeNull()
  })

  it('calls onAuthChange with initial state asynchronously', () =>
    new Promise<void>((resolve) => {
      const auth = new FakeAuthProvider()
      auth.onAuthChange((state) => {
        expect(state.loading).toBe(false)
        expect(state.user?.email).toBe('dev@example.com')
        resolve()
      })
    }))

  it('notifies subscribers on sign out', async () => {
    const auth = new FakeAuthProvider()
    const cb = vi.fn()
    auth.onAuthChange(cb)
    await auth.signOut()
    const lastCall = cb.mock.calls[cb.mock.calls.length - 1][0]
    expect(lastCall.user).toBeNull()
    expect(lastCall.session).toBeNull()
  })

  it('notifies subscribers on sign in', async () => {
    const auth = new FakeAuthProvider(null)
    const cb = vi.fn()
    auth.onAuthChange(cb)
    await auth.signInWithGoogle()
    const lastCall = cb.mock.calls[cb.mock.calls.length - 1][0]
    expect(lastCall.user?.email).toBe('dev@example.com')
  })

  it('unsubscribe stops notifications', async () => {
    const auth = new FakeAuthProvider()
    const cb = vi.fn()
    const unsub = auth.onAuthChange(cb)
    unsub()
    await auth.signOut()
    // cb may have been called once (initial async fire) but not on signOut
    const callCount = cb.mock.calls.length
    await auth.signInWithGoogle()
    expect(cb.mock.calls.length).toBe(callCount)
  })
})
