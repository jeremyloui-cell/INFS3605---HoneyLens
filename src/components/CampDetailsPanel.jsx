import { useState } from 'react'
import { X, MapPin, Calendar, Hash, Users, Monitor, CheckCircle2, Clock, QrCode } from 'lucide-react'
import { getCamp, getClients, getDevices, getThisDevice } from '../store'
import { QRCodeSVG } from 'qrcode.react'

export default function CampDetailsPanel({ onClose }) {
  const camp    = getCamp()
  const clients = getClients()
  const devices = getDevices()
  const thisDevice = getThisDevice()
  const [showQR, setShowQR] = useState(false)

  const dispensed  = clients.filter(c => c.status === 'dispensed').length
  const inProgress = clients.filter(c => c.status === 'in-progress').length
  const waiting    = clients.filter(c => c.status === 'waiting').length
  const onlineDev  = devices.filter(d => d.status === 'online').length + 1

  const campQR = JSON.stringify({ campId: camp.campId, name: camp.name, location: camp.location, date: camp.date })

  const hoursOpen = Math.floor((Date.now() - (camp.startTime || Date.now() - 4*3600000)) / 3600000)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(10,6,25,0.88)', backdropFilter: 'blur(10px)' }} onClick={onClose}>
      <div className="w-full max-w-[390px] rounded-t-3xl pb-10 animate-slide-up"
        style={{ background: 'linear-gradient(180deg, #2D1B69 0%, #1A0F3C 100%)', border: '1px solid rgba(124,92,219,0.3)' }}
        onClick={e => e.stopPropagation()}>

        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-5" />

        <div className="flex items-center justify-between px-6 mb-5">
          <h3 className="text-lg font-bold text-white">Camp Details</h3>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
            <X size={15} className="text-white/70" />
          </button>
        </div>

        {/* Camp hero */}
        <div className="mx-6 mb-4 rounded-2xl p-4 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(124,92,219,0.3), rgba(74,144,217,0.2))', border: '1px solid rgba(124,92,219,0.3)' }}>
          <div className="absolute top-0 right-0 w-24 h-24 opacity-10"
            style={{ background: 'radial-gradient(circle, #4A90D9, transparent)' }} />
          <h4 className="text-xl font-bold text-white">{camp.name}</h4>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin size={12} className="text-brand-accent-light" />
            <span className="text-sm text-white/60">{camp.location}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <Calendar size={12} className="text-brand-accent-light" />
            <span className="text-sm text-white/60">{camp.date}</span>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="chip chip-teal">Active</span>
            <span className="text-xs text-white/40">{hoursOpen}h running</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="px-6 grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Total',    value: clients.length, color: 'text-brand-accent-light' },
            { label: 'Done',     value: dispensed,       color: 'text-brand-teal'   },
            { label: 'Active',   value: inProgress,      color: 'text-brand-amber'  },
            { label: 'Waiting',  value: waiting,         color: 'text-white/50'     },
          ].map(s => (
            <div key={s.label} className="glass-card rounded-xl p-2.5 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[9px] text-white/40">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Camp ID + device count */}
        <div className="px-6 space-y-2 mb-4">
          {[
            ['Camp ID',  camp.campId,             'font-mono text-brand-accent-light'],
            ['Devices',  `${onlineDev} online / ${devices.length + 1} total`, ''],
            ['This device', thisDevice.id,        'font-mono text-white/70'],
          ].map(([k, v, cls]) => (
            <div key={k} className="glass-card rounded-xl px-3.5 py-2.5 flex items-center justify-between">
              <span className="text-xs text-white/40">{k}</span>
              <span className={`text-xs font-semibold ${cls || 'text-white'}`}>{v}</span>
            </div>
          ))}
        </div>

        {/* Camp QR */}
        <div className="px-6">
          <button onClick={() => setShowQR(s => !s)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl active:scale-98 transition-transform"
            style={{ background: 'rgba(124,92,219,0.15)', border: '1px solid rgba(124,92,219,0.3)' }}>
            <div className="flex items-center gap-2">
              <QrCode size={16} className="text-brand-accent-light" />
              <span className="text-sm font-semibold text-white">Camp join QR code</span>
            </div>
            <span className="text-xs text-brand-accent-light">{showQR ? 'Hide' : 'Show'}</span>
          </button>

          {showQR && (
            <div className="mt-3 flex flex-col items-center gap-2">
              <div className="qr-container">
                <QRCodeSVG value={campQR} size={160} level="M" fgColor="#1A0F3C" bgColor="#ffffff" />
              </div>
              <p className="text-xs text-white/30 text-center">New devices scan this to join {camp.name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
