import { useState } from 'react'
import { getCamp, getSyncQueue, clearSyncQueue, logout, getClients } from '../store'
import { LogOut, Wifi, WifiOff, Database, Trash2, User, MapPin, Shield, Info, RefreshCw, CheckCircle2 } from 'lucide-react'

export default function SettingsScreen({ tester, onLogout }) {
  const camp = getCamp()
  const queue = getSyncQueue()
  const clients = getClients()
  const [syncing, setSyncing] = useState(false)
  const [synced, setSynced] = useState(false)

  function handleSync() {
    setSyncing(true)
    setTimeout(() => {
      clearSyncQueue()
      setSyncing(false)
      setSynced(true)
    }, 2500)
  }

  function handleLogout() {
    logout()
    onLogout()
  }

  return (
    <div className="px-4 py-5 space-y-5 animate-fade-in">
      <h2 className="text-xl font-bold text-white">Settings</h2>

      {/* Tester profile */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #7C5CDB, #4A90D9)' }}>
            {tester?.name?.charAt(0) || 'T'}
          </div>
          <div>
            <p className="font-semibold text-white">{tester?.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="chip chip-purple">{tester?.role}</span>
              <span className="text-xs text-white/40">{tester?.experience}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/8">
          <Stat label="Camp" value={camp.name} />
          <Stat label="Location" value={camp.location} />
          <Stat label="Clients today" value={clients.length} />
          <Stat label="Unsynced" value={queue.length} highlight={queue.length > 0} />
        </div>
      </div>

      {/* Sync */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Database size={15} className="text-brand-accent-light" />
          <p className="text-sm font-semibold text-white">Data Sync</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff size={14} className="text-brand-amber" />
            <p className="text-sm text-white/70">Connection status</p>
          </div>
          <div className="chip chip-amber">Offline</div>
        </div>

        {queue.length > 0 && (
          <div className="bg-brand-amber/10 border border-brand-amber/25 rounded-xl p-3">
            <p className="text-xs text-brand-amber">{queue.length} record{queue.length !== 1 ? 's' : ''} pending sync</p>
          </div>
        )}

        {synced ? (
          <div className="flex items-center gap-2 bg-brand-teal/10 border border-brand-teal/25 rounded-xl p-3">
            <CheckCircle2 size={14} className="text-brand-teal" />
            <p className="text-xs text-brand-teal">All records synced successfully</p>
          </div>
        ) : (
          <button onClick={handleSync} disabled={syncing || queue.length === 0}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #7C5CDB, #5B3FA8)' }}>
            {syncing ? (
              <><RefreshCw size={15} className="animate-spin" /> Syncing…</>
            ) : (
              <><Wifi size={15} /> Sync when connected</>
            )}
          </button>
        )}
      </div>

      {/* Camp info */}
      <div className="glass-card rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <MapPin size={15} className="text-brand-accent-light" />
          <p className="text-sm font-semibold text-white">Camp</p>
        </div>
        <Stat label="Name" value={camp.name} />
        <Stat label="Location" value={camp.location} />
        <Stat label="Date" value={camp.date} />
        <Stat label="Camp ID" value={camp.campId} mono />
      </div>

      {/* Privacy */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={15} className="text-brand-accent-light" />
          <p className="text-sm font-semibold text-white">Privacy</p>
        </div>
        <div className="space-y-2 text-xs text-white/50 leading-relaxed">
          <p>• Client names and contact details are <strong className="text-white/70">never stored</strong> in this app.</p>
          <p>• Clients are identified by anonymous short IDs only.</p>
          <p>• All data is stored locally and synced only when you choose.</p>
          <p>• Tester accounts remain active for 30 days offline.</p>
        </div>
      </div>

      {/* App info */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Info size={15} className="text-brand-accent-light" />
          <p className="text-sm font-semibold text-white">App</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Version" value="HoneyLens 2.1" />
          <Stat label="Platform" value="OOXii Field" />
        </div>
      </div>

      {/* Logout */}
      <button onClick={handleLogout}
        className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 border border-brand-red/30 text-brand-red bg-brand-red/10 active:bg-brand-red/20 transition-colors">
        <LogOut size={16} />
        Sign out
      </button>

      <p className="text-center text-[10px] text-white/20 pb-2">
        OOXii HoneyLens · Offline-first eye testing platform<br />
        Built for remote communities in the Pacific
      </p>
    </div>
  )
}

function Stat({ label, value, highlight, mono }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
      <p className="text-xs text-white/40">{label}</p>
      <p className={`text-xs font-semibold ${highlight ? 'text-brand-amber' : 'text-white/80'} ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  )
}
