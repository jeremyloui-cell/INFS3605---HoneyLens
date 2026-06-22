import { useState, useEffect } from 'react'
import { getDevices, getThisDevice, getCamp, getClients, buildSyncPayload, encodeQRPayload, getSyncQueue } from '../store'
import { QRCodeSVG } from 'qrcode.react'
import { Monitor, RefreshCw, Share2, Scan, Battery, Clock, CheckCircle2, AlertCircle, Loader2, ChevronRight, MapPin, Users, Wifi, WifiOff, X } from 'lucide-react'

const statusConfig = {
  online:  { label: 'Online',   dot: 'status-dot-online',  text: 'text-brand-teal',  chip: 'chip-teal'   },
  syncing: { label: 'Syncing',  dot: 'status-dot-syncing', text: 'text-brand-amber', chip: 'chip-amber'  },
  offline: { label: 'Offline',  dot: 'status-dot-offline', text: 'text-gray-400',    chip: ''            },
}

export default function CampDevicesScreen({ tester, camp }) {
  const [devices, setDevices] = useState(getDevices())
  const [showQR, setShowQR] = useState(false)
  const [qrMode, setQrMode] = useState('share') // share | scan
  const [qrPayload, setQrPayload] = useState('')
  const [syncCount, setSyncCount] = useState(getSyncQueue().length)
  const [lastRefresh, setLastRefresh] = useState(Date.now())
  const thisDevice = getThisDevice()
  const clients = getClients()

  useEffect(() => {
    const interval = setInterval(() => {
      setDevices(d => d.map(dev => ({
        ...dev,
        lastSeen: dev.status === 'online' ? Date.now() - Math.floor(Math.random() * 30000) : dev.lastSeen,
      })))
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  function openShareQR() {
    const payload = buildSyncPayload(clients.filter(c => !c.synced))
    setQrPayload(encodeQRPayload(payload))
    setQrMode('share')
    setShowQR(true)
  }

  function timeSince(ts) {
    const s = Math.floor((Date.now() - ts) / 1000)
    if (s < 60) return `${s}s ago`
    if (s < 3600) return `${Math.floor(s / 60)}m ago`
    return `${Math.floor(s / 3600)}h ago`
  }

  const onlineCount = devices.filter(d => d.status === 'online').length
  const totalClients = devices.reduce((a, d) => a + d.clients, 0) + clients.length

  return (
    <div className="px-4 py-5 space-y-5 animate-fade-in">
      {/* Camp header card */}
      <div className="glass-card rounded-2xl p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #4A90D9, transparent)' }} />
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[10px] font-semibold text-brand-accent-light uppercase tracking-wider">Active Camp</p>
            <h2 className="text-xl font-bold text-white mt-0.5">{camp.name}</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin size={11} className="text-brand-accent-light" />
              <span className="text-xs text-white/60">{camp.location}</span>
              <span className="text-white/20 mx-1">·</span>
              <span className="text-xs text-white/60">{camp.date}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/40">Camp ID</p>
            <p className="font-mono text-sm font-bold text-brand-accent-light">{camp.campId}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          {[
            { label: 'Devices', value: `${onlineCount}/${devices.length + 1}`, sub: 'online', color: 'text-brand-teal' },
            { label: 'Clients', value: totalClients, sub: 'today', color: 'text-brand-accent-light' },
            { label: 'Unsynced', value: syncCount, sub: 'records', color: syncCount > 0 ? 'text-brand-amber' : 'text-brand-teal' },
          ].map(s => (
            <div key={s.label} className="bg-white/5 rounded-xl p-2.5 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-white/40">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* QR Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={openShareQR}
          className="glass-card rounded-xl p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform border border-brand-accent/30">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7C5CDB, #5B3FA8)' }}>
            <Share2 size={18} color="white" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white">Share Data</p>
            <p className="text-[10px] text-white/50 mt-0.5">Generate QR to sync</p>
          </div>
          {syncCount > 0 && (
            <div className="chip chip-amber">{syncCount} pending</div>
          )}
        </button>

        <button onClick={() => { setQrMode('scan'); setShowQR(true) }}
          className="glass-card rounded-xl p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4A90D9, #2D5F8A)' }}>
            <Scan size={18} color="white" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white">Receive Data</p>
            <p className="text-[10px] text-white/50 mt-0.5">Scan another device</p>
          </div>
        </button>
      </div>

      {/* This device */}
      <div>
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">This device</p>
        <div className="glass-card rounded-xl p-3.5 flex items-center gap-3 border border-brand-accent/20">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #7C5CDB, #4A90D9)' }}>
            <Monitor size={16} color="white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-sm font-bold text-white truncate">{thisDevice.id}</p>
            <p className="text-xs text-white/50">{tester?.name} · {tester?.role}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="chip chip-teal">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-teal inline-block" />
              Online
            </div>
            <div className="flex items-center gap-1">
              <BatteryIcon level={thisDevice.battery} />
              <span className="text-[10px] text-white/40">{thisDevice.battery}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Other devices */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Other devices</p>
          <button onClick={() => { setLastRefresh(Date.now()); setDevices(getDevices()) }}
            className="text-[10px] text-brand-accent-light flex items-center gap-1 active:opacity-60">
            <RefreshCw size={10} /> Refresh
          </button>
        </div>
        <div className="space-y-2">
          {devices.map(device => {
            const cfg = statusConfig[device.status] || statusConfig.offline
            return (
              <div key={device.id} className="glass-card rounded-xl p-3.5 flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
                    <Monitor size={16} className="text-white/60" />
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#1A0F3C] ${cfg.dot}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs font-bold text-white/80 truncate">{device.id}</p>
                  <p className="text-xs text-white/40 truncate">{device.tester} · {device.role}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className={`chip ${cfg.chip || 'chip-purple'}`}>{cfg.label}</div>
                  <div className="flex items-center gap-2 text-[10px] text-white/30">
                    <span>{device.clients} clients</span>
                    <span>·</span>
                    <span>{timeSince(device.lastSeen)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <QRModal
          mode={qrMode}
          payload={qrPayload}
          thisDeviceId={thisDevice.id}
          onClose={() => setShowQR(false)}
          onSyncComplete={() => { setSyncCount(0); setShowQR(false) }}
        />
      )}
    </div>
  )

  function timeSince(ts) {
    const s = Math.floor((Date.now() - ts) / 1000)
    if (s < 60) return `${s}s ago`
    if (s < 3600) return `${Math.floor(s / 60)}m ago`
    return `${Math.floor(s / 3600)}h ago`
  }
}

function QRModal({ mode, payload, thisDeviceId, onClose, onSyncComplete }) {
  const [phase, setPhase] = useState('idle') // idle | scanning | done
  const [synced, setSynced] = useState(0)

  function simulateScan() {
    setPhase('scanning')
    setTimeout(() => {
      setSynced(Math.floor(3 + Math.random() * 6))
      setPhase('done')
    }, 2200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(10,6,25,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-[390px] rounded-t-3xl p-6 pb-10 animate-slide-up"
        style={{ background: 'linear-gradient(180deg, #2D1B69 0%, #1A0F3C 100%)', border: '1px solid rgba(124,92,219,0.3)' }}>
        {/* Handle */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />

        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">
            {mode === 'share' ? 'Share Data via QR' : 'Scan to Receive'}
          </h3>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
            <X size={16} className="text-white/70" />
          </button>
        </div>

        {mode === 'share' ? (
          <div className="space-y-4">
            <p className="text-sm text-white/60 text-center">
              Point another device's camera at this QR code to receive your client data.
            </p>
            <div className="flex justify-center">
              <div className="qr-container shadow-2xl">
                <QRCodeSVG
                  value={payload || 'honeylens://empty'}
                  size={220}
                  level="M"
                  fgColor="#1A0F3C"
                  bgColor="#ffffff"
                  imageSettings={{
                    src: '',
                    x: undefined, y: undefined,
                    height: 0, width: 0,
                    excavate: false,
                  }}
                />
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-xs text-white/40">Device ID</p>
              <p className="font-mono text-sm font-bold text-brand-accent-light">{thisDeviceId}</p>
            </div>
            <div className="chip chip-amber mx-auto w-fit">
              Expires in 5 min · Offline transfer
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {phase === 'idle' && (
              <>
                <p className="text-sm text-white/60 text-center">
                  Point this device's camera at another HoneyLens device to pull their client records.
                </p>
                {/* Simulated camera viewfinder */}
                <div className="relative mx-auto w-56 h-56 rounded-2xl overflow-hidden border-2 border-brand-accent/40"
                  style={{ background: '#0D0820' }}>
                  <div className="absolute inset-4 border-2 border-brand-accent rounded-xl opacity-60" />
                  {/* Corners */}
                  {[['top-3 left-3', 'top'], ['top-3 right-3', 'top'], ['bottom-3 left-3', 'bottom'], ['bottom-3 right-3', 'bottom']].map(([pos], i) => (
                    <div key={i} className={`absolute ${pos} w-5 h-5`}
                      style={{ border: '3px solid #7C5CDB', borderRadius: i < 2 ? '6px 0 0 0' : i === 2 ? '0 0 0 6px' : '0 0 6px 0' }} />
                  ))}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Scan size={28} className="text-brand-accent opacity-40" />
                  </div>
                  {/* Scan line animation */}
                  <div className="absolute left-4 right-4 h-0.5 bg-brand-accent/60 rounded"
                    style={{ top: '50%', boxShadow: '0 0 8px #7C5CDB', animation: 'slide-up 2s ease-in-out infinite alternate' }} />
                </div>
                <button onClick={simulateScan}
                  className="w-full py-3 rounded-xl font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #7C5CDB, #5B3FA8)' }}>
                  Simulate Scan
                </button>
              </>
            )}

            {phase === 'scanning' && (
              <div className="text-center py-8 space-y-4">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-brand-accent/20" />
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-accent animate-spin" />
                  <Loader2 size={24} className="absolute inset-0 m-auto text-brand-accent animate-spin" style={{ animationDuration: '1.5s' }} />
                </div>
                <p className="text-white font-semibold">Reading QR data…</p>
                <p className="text-sm text-white/50">Verifying payload integrity</p>
              </div>
            )}

            {phase === 'done' && (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(0,201,167,0.15)', border: '2px solid rgba(0,201,167,0.4)' }}>
                  <CheckCircle2 size={32} className="text-brand-teal" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">Sync complete!</p>
                  <p className="text-sm text-white/60 mt-1">{synced} client records received</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-xl font-bold text-brand-teal">{synced}</p>
                    <p className="text-[10px] text-white/40">Records added</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-xl font-bold text-brand-accent-light">0</p>
                    <p className="text-[10px] text-white/40">Conflicts</p>
                  </div>
                </div>
                <button onClick={onSyncComplete}
                  className="w-full py-3 rounded-xl font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #00C9A7, #007B68)' }}>
                  Done
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function BatteryIcon({ level }) {
  const color = level > 50 ? '#00C9A7' : level > 20 ? '#F5A623' : '#E85454'
  return (
    <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
      <rect x="0.5" y="0.5" width="13" height="9" rx="2" stroke={color} strokeOpacity="0.6"/>
      <rect x="13.5" y="3" width="2" height="4" rx="1" fill={color} fillOpacity="0.6"/>
      <rect x="1.5" y="1.5" width={Math.round((level / 100) * 11)} height="7" rx="1.5" fill={color}/>
    </svg>
  )
}
