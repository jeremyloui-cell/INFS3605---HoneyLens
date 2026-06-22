import { useState } from 'react'
import { getTester, getCamp, getClients, logout } from '../store'
import CampDevicesScreen from './CampDevicesScreen'
import ClientsScreen from './ClientsScreen'
import DispenserScreen from './DispenserScreen'
import SettingsScreen from './SettingsScreen'
import { Monitor, Users, Glasses, Settings, WifiOff, X, Star, MapPin, Clock, LogOut, ChevronRight, Bell, CheckCircle2, AlertCircle } from 'lucide-react'

const TABS = [
  { id: 'camp',      label: 'Devices',  icon: Monitor  },
  { id: 'clients',   label: 'Clients',  icon: Users    },
  { id: 'dispenser', label: 'Dispense', icon: Glasses  },
  { id: 'settings',  label: 'Settings', icon: Settings },
]

const NOTIFICATIONS = [
  { id: 1, type: 'sync',   text: 'Device BRIGHT-LENS-42 is ready to sync', time: '2m ago',  read: false },
  { id: 2, type: 'client', text: 'Client 3381M has been waiting 18 mins',  time: '18m ago', read: false },
  { id: 3, type: 'done',   text: 'Client 7243K dispensed successfully',     time: '1h ago',  read: true  },
  { id: 4, type: 'done',   text: 'Camp sync completed — 12 records sent',   time: '2h ago',  read: true  },
]

export default function MainShell({ onLogout }) {
  const [tab, setTab] = useState('camp')
  const [selectedClientId, setSelectedClientId] = useState(null)
  const [showProfile, setShowProfile] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)
  const [notifs, setNotifs] = useState(NOTIFICATIONS)
  const tester = getTester()
  const camp = getCamp()

  const unread = notifs.filter(n => !n.read).length

  function goDispense(id) {
    setSelectedClientId(id)
    setTab('dispenser')
  }

  function markAllRead() {
    setNotifs(n => n.map(x => ({ ...x, read: true })))
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
        {/* Logo + camp name */}
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

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Offline badge */}
          <div className="flex items-center gap-1.5 bg-white/5 rounded-full px-2.5 py-1">
            <WifiOff size={11} className="text-brand-amber" />
            <span className="text-[10px] text-brand-amber font-medium">Offline</span>
          </div>

          {/* Notifications bell */}
          <button onClick={() => { setShowNotifs(true); setShowProfile(false) }}
            className="relative w-8 h-8 rounded-full bg-white/8 flex items-center justify-center active:scale-90 transition-transform"
            style={{ background: 'rgba(255,255,255,0.07)' }}>
            <Bell size={15} className="text-white/70" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                style={{ background: '#E85454', color: 'white' }}>
                {unread}
              </span>
            )}
          </button>

          {/* Avatar — opens profile */}
          <button onClick={() => { setShowProfile(true); setShowNotifs(false) }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white active:scale-90 transition-transform animate-pulse-glow"
            style={{ background: 'linear-gradient(135deg, #7C5CDB, #4A90D9)' }}>
            {tester?.name?.charAt(0) || 'T'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {renderScreen()}
      </div>

      {/* Bottom nav */}
      <div className="border-t border-white/5 flex"
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

      {/* Profile modal */}
      {showProfile && (
        <ProfileModal tester={tester} camp={camp} onClose={() => setShowProfile(false)} onLogout={onLogout} onSettings={() => { setShowProfile(false); setTab('settings') }} />
      )}

      {/* Notifications modal */}
      {showNotifs && (
        <NotificationsModal notifs={notifs} onMarkRead={markAllRead} onClose={() => setShowNotifs(false)} />
      )}
    </div>
  )
}

function ProfileModal({ tester, camp, onClose, onLogout, onSettings }) {
  const clients = getClients()
  const dispensed = clients.filter(c => c.status === 'dispensed').length
  const inProgress = clients.filter(c => c.status === 'in-progress').length

  const ROLE_COLORS = {
    Tester: 'chip-purple',
    Supervisor: 'chip-teal',
    Dispenser: 'chip-blue',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(10,6,25,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div className="w-full max-w-[390px] rounded-t-3xl pb-10 animate-slide-up"
        style={{ background: 'linear-gradient(180deg, #2D1B69 0%, #1A0F3C 100%)', border: '1px solid rgba(124,92,219,0.3)' }}
        onClick={e => e.stopPropagation()}>

        {/* Handle */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-5" />

        {/* Profile hero */}
        <div className="px-6 pb-5 border-b border-white/8">
          <div className="flex items-center gap-4">
            {/* Big avatar */}
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #7C5CDB, #4A90D9)', boxShadow: '0 0 0 3px rgba(124,92,219,0.3)' }}>
              {tester?.name?.charAt(0) || 'T'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{tester?.name || 'Tester'}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`chip ${ROLE_COLORS[tester?.role] || 'chip-purple'}`}>{tester?.role}</span>
                <span className="chip chip-amber">{tester?.experience}</span>
              </div>
            </div>
          </div>

          {/* Camp info */}
          <div className="flex items-center gap-1.5 mt-3">
            <MapPin size={12} className="text-brand-accent-light" />
            <span className="text-xs text-white/50">{camp.name} · {camp.location}</span>
          </div>
        </div>

        {/* Today's stats */}
        <div className="px-6 py-4 border-b border-white/8">
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-3">Today's Activity</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/5 rounded-xl p-2.5">
              <p className="text-xl font-bold text-brand-accent-light">{clients.length}</p>
              <p className="text-[10px] text-white/40">Clients</p>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5">
              <p className="text-xl font-bold text-brand-teal">{dispensed}</p>
              <p className="text-[10px] text-white/40">Dispensed</p>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5">
              <p className="text-xl font-bold text-brand-amber">{inProgress}</p>
              <p className="text-[10px] text-white/40">In progress</p>
            </div>
          </div>
        </div>

        {/* Tester details */}
        <div className="px-6 py-4 border-b border-white/8 space-y-2.5">
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-3">Profile</p>
          {[
            ['Age band', tester?.ageBand || '—'],
            ['Gender', tester?.gender || 'Not specified'],
            ['Experience', tester?.experience || '—'],
            ['Home base', tester?.homeBase || camp.location],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-xs text-white/40">{label}</span>
              <span className="text-xs font-semibold text-white/80">{value}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="px-6 pt-4 space-y-2">
          <button onClick={onSettings}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 active:bg-white/10 transition-colors">
            <span className="text-sm font-semibold text-white">Settings</span>
            <ChevronRight size={16} className="text-white/30" />
          </button>
          <button onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-brand-red/30 bg-brand-red/10 active:bg-brand-red/20 transition-colors">
            <LogOut size={15} className="text-brand-red" />
            <span className="text-sm font-semibold text-brand-red">Sign out</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function NotificationsModal({ notifs, onMarkRead, onClose }) {
  const unread = notifs.filter(n => !n.read).length

  const iconFor = (type) => {
    if (type === 'sync')   return <Monitor size={14} className="text-brand-accent-light" />
    if (type === 'client') return <AlertCircle size={14} className="text-brand-amber" />
    return <CheckCircle2 size={14} className="text-brand-teal" />
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(10,6,25,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div className="w-full max-w-[390px] rounded-t-3xl pb-10 animate-slide-up"
        style={{ background: 'linear-gradient(180deg, #2D1B69 0%, #1A0F3C 100%)', border: '1px solid rgba(124,92,219,0.3)' }}
        onClick={e => e.stopPropagation()}>

        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-5" />

        <div className="flex items-center justify-between px-6 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Notifications</h3>
            {unread > 0 && <p className="text-xs text-white/40">{unread} unread</p>}
          </div>
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <button onClick={onMarkRead} className="text-xs text-brand-accent-light font-semibold">
                Mark all read
              </button>
            )}
            <button onClick={onClose} className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center">
              <X size={14} className="text-white/60" />
            </button>
          </div>
        </div>

        <div className="px-6 space-y-2">
          {notifs.map(n => (
            <div key={n.id}
              className={`flex items-start gap-3 p-3.5 rounded-xl transition-colors ${n.read ? 'bg-white/3 opacity-60' : 'bg-white/8 border border-white/10'}`}
              style={{ background: n.read ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.07)' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(124,92,219,0.2)' }}>
                {iconFor(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.read ? 'text-white/50' : 'text-white'}`}>{n.text}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock size={10} className="text-white/30" />
                  <span className="text-[10px] text-white/30">{n.time}</span>
                  {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-brand-accent inline-block" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
