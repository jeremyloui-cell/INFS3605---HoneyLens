import { useState, useEffect } from 'react'
import { Wifi, WifiOff, X, CheckCircle2, Loader2, RefreshCw, ExternalLink, Signal, Lock, ChevronRight } from 'lucide-react'
import { getSyncQueue, clearSyncQueue } from '../store'

const NETWORKS = [
  { ssid: 'OOXii_Camp_2847',    strength: 95, secured: false, type: 'Camp network' },
  { ssid: 'Vodafone_VU_4G',     strength: 72, secured: true,  type: 'Mobile hotspot' },
  { ssid: 'BTL_Hotspot_03',     strength: 58, secured: true,  type: 'Mobile hotspot' },
  { ssid: 'Luganville_Clinic',  strength: 41, secured: true,  type: 'Local network'  },
  { ssid: 'VANUATU_WIFI_FREE',  strength: 28, secured: false, type: 'Public WiFi'    },
]

export default function ConnectivityPanel({ onClose }) {
  const [phase, setPhase]         = useState('idle')   // idle | scanning | connecting | connected | syncing | done
  const [selected, setSelected]   = useState(null)
  const [isOnline, setIsOnline]   = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [syncedCount, setSyncedCount]   = useState(0)
  const queue = getSyncQueue()

  function handleNetworkSelect(net) {
    setSelected(net)
    setPhase('connecting')
    setTimeout(() => {
      setIsOnline(true)
      setPhase('connected')
      if (queue.length > 0) {
        setTimeout(() => startSync(), 800)
      }
    }, net.secured ? 2200 : 1500)
  }

  function handleScan() {
    setPhase('scanning')
    setTimeout(() => setPhase('idle'), 1800)
  }

  function startSync() {
    setPhase('syncing')
    setSyncProgress(0)
    const total = Math.max(queue.length, 3)
    let count = 0
    const interval = setInterval(() => {
      count++
      setSyncProgress(Math.round((count / total) * 100))
      setSyncedCount(count)
      if (count >= total) {
        clearInterval(interval)
        clearSyncQueue()
        setTimeout(() => setPhase('done'), 400)
      }
    }, 400)
  }

  function disconnect() {
    setIsOnline(false)
    setSelected(null)
    setPhase('idle')
    setSyncProgress(0)
  }

  const signalBars = (strength) => {
    const bars = strength > 75 ? 4 : strength > 50 ? 3 : strength > 25 ? 2 : 1
    return (
      <div className="flex items-end gap-0.5">
        {[1,2,3,4].map(b => (
          <div key={b} className={`w-1 rounded-sm ${b <= bars ? 'bg-brand-teal' : 'bg-white/20'}`}
            style={{ height: `${b * 3 + 3}px` }} />
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(10,6,25,0.88)', backdropFilter: 'blur(10px)' }} onClick={onClose}>
      <div className="w-full max-w-[390px] rounded-t-3xl pb-10 animate-slide-up"
        style={{ background: 'linear-gradient(180deg, #2D1B69 0%, #1A0F3C 100%)', border: '1px solid rgba(124,92,219,0.3)' }}
        onClick={e => e.stopPropagation()}>

        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-5" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: isOnline ? 'rgba(0,201,167,0.2)' : 'rgba(245,166,35,0.2)', border: `1px solid ${isOnline ? 'rgba(0,201,167,0.4)' : 'rgba(245,166,35,0.4)'}` }}>
              {isOnline ? <Wifi size={18} className="text-brand-teal" /> : <WifiOff size={18} className="text-brand-amber" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Connectivity</h3>
              <p className="text-xs" style={{ color: isOnline ? '#00C9A7' : '#F5A623' }}>
                {isOnline ? `Connected to ${selected?.ssid}` : 'Offline mode active'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
            <X size={15} className="text-white/70" />
          </button>
        </div>

        {/* Status toggle */}
        <div className="mx-6 mb-4 glass-card rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">WiFi</p>
            <p className="text-xs text-white/40">{isOnline ? 'Connected' : 'Tap a network below to connect'}</p>
          </div>
          <button onClick={isOnline ? disconnect : handleScan}
            className={`w-12 h-6 rounded-full transition-all duration-300 relative ${isOnline ? 'bg-brand-teal' : 'bg-white/20'}`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${isOnline ? 'left-6' : 'left-0.5'}`} />
          </button>
        </div>

        {/* Phase: connecting */}
        {phase === 'connecting' && (
          <div className="mx-6 mb-4 glass-card rounded-xl p-4 flex items-center gap-3">
            <Loader2 size={18} className="text-brand-accent animate-spin shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white">Connecting to {selected?.ssid}…</p>
              <p className="text-xs text-white/40">Authenticating</p>
            </div>
          </div>
        )}

        {/* Phase: syncing */}
        {phase === 'syncing' && (
          <div className="mx-6 mb-4 glass-card rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <RefreshCw size={18} className="text-brand-accent-light animate-spin shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">Syncing records to OOXii server…</p>
                <p className="text-xs text-white/40">{syncedCount} of {Math.max(queue.length, 3)} records uploaded</p>
              </div>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="h-2 rounded-full transition-all duration-300"
                style={{ width: `${syncProgress}%`, background: 'linear-gradient(90deg, #7C5CDB, #00C9A7)' }} />
            </div>
          </div>
        )}

        {/* Phase: done */}
        {phase === 'done' && (
          <div className="mx-6 mb-4 rounded-xl p-4 flex items-center gap-3"
            style={{ background: 'rgba(0,201,167,0.12)', border: '1px solid rgba(0,201,167,0.3)' }}>
            <CheckCircle2 size={18} className="text-brand-teal shrink-0" />
            <div>
              <p className="text-sm font-semibold text-brand-teal">Sync complete!</p>
              <p className="text-xs text-white/50">All records uploaded to OOXii server</p>
            </div>
          </div>
        )}

        {/* Phase: scanning */}
        {phase === 'scanning' && (
          <div className="mx-6 mb-4 glass-card rounded-xl p-4 flex items-center gap-3">
            <div className="relative w-5 h-5 shrink-0">
              <Signal size={18} className="text-brand-accent animate-pulse" />
            </div>
            <p className="text-sm text-white/70">Scanning for networks…</p>
          </div>
        )}

        {/* Network list */}
        {!isOnline && phase !== 'connecting' && (
          <div className="px-6 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Available Networks</p>
              <button onClick={handleScan} className="text-xs text-brand-accent-light font-semibold flex items-center gap-1">
                <RefreshCw size={10} /> Scan
              </button>
            </div>
            {NETWORKS.map(net => (
              <button key={net.ssid} onClick={() => handleNetworkSelect(net)}
                className="w-full glass-card rounded-xl p-3.5 flex items-center gap-3 active:scale-98 transition-transform text-left">
                <div className="shrink-0">{signalBars(net.strength)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white truncate">{net.ssid}</p>
                    {!net.secured && <span className="chip chip-teal text-[9px]">Open</span>}
                  </div>
                  <p className="text-xs text-white/40">{net.type} · {net.strength}% signal</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {net.secured && <Lock size={12} className="text-white/30" />}
                  <ChevronRight size={14} className="text-white/20" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Connected state */}
        {isOnline && phase === 'connected' && (
          <div className="px-6 space-y-3">
            <div className="glass-card rounded-xl p-3.5 space-y-2">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Connection Details</p>
              {[['Network', selected?.ssid],['Signal', `${selected?.strength}%`],['Type', selected?.type],['Status', 'Connected']].map(([k,v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-xs text-white/40">{k}</span>
                  <span className="text-xs font-semibold text-white">{v}</span>
                </div>
              ))}
            </div>
            <button onClick={startSync} disabled={queue.length === 0}
              className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #7C5CDB, #5B3FA8)' }}>
              <RefreshCw size={16} /> Sync {queue.length} pending record{queue.length !== 1 ? 's' : ''}
            </button>
          </div>
        )}

        {/* Done state */}
        {phase === 'done' && (
          <div className="px-6">
            <button onClick={disconnect}
              className="w-full py-3 rounded-xl font-semibold bg-white/8 text-white/60"
              style={{ background: 'rgba(255,255,255,0.07)' }}>
              Disconnect
            </button>
          </div>
        )}

        {/* System settings link */}
        <div className="px-6 mt-4">
          <button onClick={() => alert('System network settings would open here on a real device.')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-xs text-white/40">System network settings</span>
            <ExternalLink size={13} className="text-white/30" />
          </button>
        </div>
      </div>
    </div>
  )
}
