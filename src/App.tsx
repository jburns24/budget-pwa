import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/auth-context'
import { ProtectedRoute } from './auth/protected-route'
import Callback from './routes/callback'
import Home from './routes/home'
import Login from './routes/login'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<Callback />} />
          <Route element={<ProtectedRoute />}>
            <Route index element={<Home />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
