import type { AuthPort, AuthState, Session } from '../ports/auth-port'
import { supabase } from '../supabase'

export class SupabaseAuthProvider implements AuthPort {
  async signInWithGoogle(): Promise<void> {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut()
  }

  async getSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession()
    if (!data.session) return null
    return this._mapSession(data.session)
  }

  onAuthChange(callback: (state: AuthState) => void): () => void {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      callback({
        user: session
          ? {
              id: session.user.id,
              email: session.user.email ?? '',
              name: session.user.user_metadata?.full_name as string | undefined,
              avatarUrl: session.user.user_metadata?.avatar_url as string | undefined,
            }
          : null,
        session: session ? this._mapSession(session) : null,
        loading: false,
      })
    })
    return () => subscription.unsubscribe()
  }

  private _mapSession(session: { user: { id: string; email?: string; user_metadata?: Record<string, unknown> }; access_token: string }): Session {
    return {
      user: {
        id: session.user.id,
        email: session.user.email ?? '',
        name: session.user.user_metadata?.full_name as string | undefined,
        avatarUrl: session.user.user_metadata?.avatar_url as string | undefined,
      },
      accessToken: session.access_token,
    }
  }
}
