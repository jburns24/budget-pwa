import type { AuthPort, AuthState, Session, User } from '../ports/auth-port'

const FAKE_USER: User = {
  id: 'fake-user-1',
  email: 'dev@example.com',
  name: 'Dev User',
}

const FAKE_SESSION: Session = {
  user: FAKE_USER,
  accessToken: 'fake-access-token',
}

export class FakeAuthProvider implements AuthPort {
  private _session: Session | null
  private _callbacks = new Set<(state: AuthState) => void>()

  constructor(initialSession: Session | null = FAKE_SESSION) {
    this._session = initialSession
  }

  async signInWithGoogle(): Promise<void> {
    this._session = FAKE_SESSION
    this._notify()
  }

  async signOut(): Promise<void> {
    this._session = null
    this._notify()
  }

  async getSession(): Promise<Session | null> {
    return this._session
  }

  onAuthChange(callback: (state: AuthState) => void): () => void {
    this._callbacks.add(callback)
    // fire async so callers see loading:true on first render
    Promise.resolve().then(() => {
      callback({
        user: this._session?.user ?? null,
        session: this._session,
        loading: false,
      })
    })
    return () => this._callbacks.delete(callback)
  }

  private _notify(): void {
    const state: AuthState = {
      user: this._session?.user ?? null,
      session: this._session,
      loading: false,
    }
    for (const cb of this._callbacks) cb(state)
  }
}
