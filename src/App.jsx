import { useState, useEffect } from 'react'
import { isLoggedIn, getTester } from './store'
import LoginScreen from './screens/LoginScreen'
import MainShell from './screens/MainShell'

export default function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn())

  useEffect(() => {
    // Recheck on storage changes
    const handler = () => setLoggedIn(isLoggedIn())
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  return (
    <div className="mobile-shell">
      {loggedIn
        ? <MainShell onLogout={() => setLoggedIn(false)} />
        : <LoginScreen onLogin={() => setLoggedIn(true)} />
      }
    </div>
  )
}
