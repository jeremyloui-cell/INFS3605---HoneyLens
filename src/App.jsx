import { useState, useEffect } from 'react'
import { isLoggedIn, hasSetRegion } from './store'
import LoginScreen from './screens/LoginScreen'
import RegionConfirmScreen from './screens/RegionConfirmScreen'
import MainShell from './screens/MainShell'

function getView() {
  if (!isLoggedIn()) return 'login'
  if (!hasSetRegion()) return 'region'
  return 'main'
}

export default function App() {
  const [view, setView] = useState(getView)

  useEffect(() => {
    const handler = () => setView(getView())
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  return (
    <div className="mobile-shell">
      {view === 'login'  && <LoginScreen onLogin={() => setView(hasSetRegion() ? 'main' : 'region')} />}
      {view === 'region' && <RegionConfirmScreen onConfirm={() => setView('main')} />}
      {view === 'main'   && <MainShell onLogout={() => setView('login')} />}
    </div>
  )
}
