export type User = {
  id: string
  email: string
  name?: string
  avatarUrl?: string
}

export type Session = {
  user: User
  accessToken: string
}

export type AuthState = {
  user: User | null
  session: Session | null
  loading: boolean
}

export interface AuthPort {
  signInWithGoogle(): Promise<void>
  signOut(): Promise<void>
  getSession(): Promise<Session | null>
  onAuthChange(callback: (state: AuthState) => void): () => void
}
