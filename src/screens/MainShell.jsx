import { useState } from 'react'
import { getTester, getCamp } from '../store'
import CampDevicesScreen from './CampDevicesScreen'
import ClientsScreen from './ClientsScreen'
import DispenserScreen from './DispenserScreen'
import SettingsScreen from './SettingsScreen'
import { Monitor, Users, Glasses, Settings, Wifi, WifiOff } from 'lucide-react'

const TABS = [
  { id: 'camp',      label: 'Devices',   icon: Monitor   },
  { id: 'clients',   label: 'Clients',   icon: Users     },
  { id: 'dispenser', label: 'Dispense',  icon: Glasses   },
  { id: 'settings',  label: 'Settings',  icon: Settings  },
]

export default function MainShell({ onLogout }) {
  const [tab, setTab] = useState('camp')
  const [selectedClientId, setSelectedClientId] = useState(null)
  const tester = getTester()
  const camp = getCamp()

  function goDispense(id) {
    setSelectedClientId(id)
    setTab('dispenser')
  }

  function renderScreen() {
    switch (tab) {
      case 'camp':      return <CampDevicesScreen tester={tester} camp={camp} />
      case 'clients':   return <ClientsScreen tester={tester} camp={camp} onDispense={goDispense} />
      case 'dispenser': return <DispenserScreen clientId={selectedClientId} onBack={() => setTab('clients')} />
      case 'settings':  return <SettingsScreen tester={tester} onLogout={onLogout} />
      default:          return null
    }
  }

  return (
    <div className="flex flex-col min-h-svh" style={{ background: 'linear-gradient(170deg, #1A0F3C 0%, #0D0820 100%)' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7C5CDB, #4A90D9)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <ellipse cx="8" cy="8" rx="7" ry="4.5" stroke="white" strokeWidth="1.5"/>
              <circle cx="8" cy="8" r="2" fill="white"/>
            </svg>
          </div>
          <div>
            <p className="text-[10px] text-white/40 leading-none">HoneyLens · OOXii</p>
            <p className="text-sm font-semibold text-white leading-tight">{camp.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white/5 rounded-full px-2.5 py-1">
            <WifiOff size={11} className="text-brand-amber" />
            <span className="text-[10px] text-brand-amber font-medium">Offline</span>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #7C5CDB, #4A90D9)' }}>
            {tester?.name?.charAt(0) || 'T'}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {renderScreen()}
      </div>

      {/* Bottom nav */}
      <div className="border-t border-white/5 flex safe-bottom"
        style={{ background: 'rgba(26,15,60,0.95)', backdropFilter: 'blur(12px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {TABS.map(t => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`nav-tab ${active ? 'active' : ''}`}>
              <Icon size={20} strokeWidth={active ? 2.2 : 1.7} />
              <span className="text-[10px] font-medium">{t.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
