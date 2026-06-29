import { getTester } from '../store'
import { Screen, Logo } from './LoginScreen'
import { UserPlus, Search, ChevronRight } from 'lucide-react'

export default function WelcomeScreen({ onNewClient, onSearchClient }) {
  const tester = getTester()
  const name = [tester?.firstName, tester?.lastName].filter(Boolean).join(' ') || 'Tester'

  return (
    <Screen>
      <Logo />

      <div className="space-y-1 text-center">
        <h2 className="text-2xl font-bold text-white">Welcome, {name}</h2>
        <p className="text-sm text-white/50">What would you like to do today?</p>
      </div>

      <div className="space-y-3">
        <button onClick={onNewClient}
          className="w-full rounded-2xl p-5 flex items-center gap-4 active:scale-98 transition-transform text-left"
          style={{ background: 'linear-gradient(135deg, rgba(124,92,219,0.25), rgba(74,144,217,0.2))', border: '1px solid rgba(124,92,219,0.4)' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #7C5CDB, #4A90D9)' }}>
            <UserPlus size={22} color="white" />
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-white">New Client</p>
            <p className="text-sm text-white/50 mt-0.5">Start a new eye test</p>
          </div>
          <ChevronRight size={18} className="text-white/30" />
        </button>

        <button onClick={onSearchClient}
          className="w-full rounded-2xl p-5 flex items-center gap-4 active:scale-98 transition-transform text-left"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(0,201,167,0.2)', border: '1px solid rgba(0,201,167,0.3)' }}>
            <Search size={22} className="text-brand-teal" />
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-white">Search Client Info</p>
            <p className="text-sm text-white/50 mt-0.5">Find an existing client</p>
          </div>
          <ChevronRight size={18} className="text-white/30" />
        </button>
      </div>
    </Screen>
  )
}
