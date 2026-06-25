import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/auth-context'

export default function Login() {
  const { user, loading, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) {
      void navigate('/', { replace: true })
    }
  }, [user, loading, navigate])

  return (
    <main>
      <h1>Budget</h1>
      <button onClick={() => void signInWithGoogle()}>Sign in with Google</button>
    </main>
  )
}
