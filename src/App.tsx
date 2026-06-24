import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <main>
      <h1>Hello, World!</h1>
      <p className="status">
        <span className={`dot ${online ? 'online' : 'offline'}`} />
        {online ? 'Online' : 'Offline'}
      </p>
      <p className="hint">Install this app from the browser address bar.</p>
    </main>
  )
}

export default App
