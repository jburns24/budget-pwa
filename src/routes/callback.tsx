import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/auth-context'

export default function Callback() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      void navigate(user ? '/' : '/login', { replace: true })
    }
  }, [user, loading, navigate])

  return <p>Completing sign in…</p>
}
