import { useState } from 'react'
import { getClient, saveClient, getClients } from '../store'
import { QRCodeSVG } from 'qrcode.react'
import { CheckCircle2, Glasses, Printer, ChevronLeft, AlertCircle, Share2, Eye, Star } from 'lucide-react'

const SPH_OPTIONS = ['-4.00','-3.50','-3.00','-2.50','-2.00','-1.75','-1.50','-1.25','-1.00','-0.75','-0.50','-0.25','0.00','+0.25','+0.50','+0.75','+1.00','+1.25','+1.50','+2.00','+2.50','+3.00','+3.50','+4.00']
const CYL_OPTIONS = ['0.00','-0.25','-0.50','-0.75','-1.00','-1.25','-1.50','-2.00','-2.50','-3.00']
const ADD_OPTIONS = ['+0.75','+1.00','+1.25','+1.50','+1.75','+2.00','+2.25','+2.50','+2.75','+3.00','+3.25','+3.50']
const FRAMES = [
  { id: 'F01-BLK', label: 'Classic Black', desc: 'Full rim · Rectangular' },
  { id: 'F02-BRN', label: 'Warm Brown', desc: 'Full rim · Oval' },
  { id: 'F03-SLV', label: 'Silver Metal', desc: 'Semi-rimless · Rectangular' },
  { id: 'F04-TRT', label: 'Tortoiseshell', desc: 'Full rim · Cat-eye' },
  { id: 'F05-CLR', label: 'Clear Frame', desc: 'Full rim · Rectangular' },
]

export default function DispenserScreen({ clientId, onBack }) {
  const [client, setClient] = useState(clientId ? getClient(clientId) : null)
  const [tab, setTab] = useState('rx') // rx | frame | confirm
  const [rx, setRx] = useState(
    client?.clinical?.dispensed || { sph_R: '0.00', cyl_R: '0.00', axis_R: '0', sph_L: '0.00', cyl_L: '0.00', axis_L: '0', add: '+1.00', frame: '' }
  )
  const [note, setNote] = useState('')
  const [dispensed, setDispensed] = useState(client?.status === 'dispensed')
  const [showCard, setShowCard] = useState(false)

  function setRxVal(k, v) { setRx(r => ({ ...r, [k]: v })) }

  function handleDispense() {
    if (!client) return
    const updated = {
      ...client,
      status: 'dispensed',
      clinical: { ...client.clinical, dispensed: rx, note },
    }
    saveClient(updated)
    setClient(updated)
    setDispensed(true)
    setTab('confirm')
  }

  if (!client && !clientId) {
    return (
      <div className="px-4 py-10 flex flex-col items-center gap-6 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
          <Glasses size={28} className="text-white/30" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Dispenser</h3>
          <p className="text-sm text-white/40 mt-1">
            Select a client from the <strong className="text-white/60">Clients</strong> tab and tap "Proceed to Dispense"
          </p>
        </div>
        <div className="w-full space-y-2">
          <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">Recent dispensing sessions</p>
          <RecentDispensed />
        </div>
      </div>
    )
  }

  if (!client) {
    return <div className="px-4 py-10 text-center text-white/40 text-sm">Client not found.</div>
  }

  return (
    <div className="px-4 py-5 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
            <ChevronLeft size={16} className="text-white/70" />
          </button>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Dispensing</p>
            <span className="font-mono font-black text-brand-accent-light text-lg">{client.id}</span>
          </div>
          <p className="text-xs text-white/40">{client.ageBand} · {client.gender} · {client.location}</p>
        </div>
        {dispensed && <div className="chip chip-teal"><CheckCircle2 size={10} /> Dispensed</div>}
      </div>

      {/* Clinical summary banner */}
      <div className="glass-card rounded-xl p-3.5 flex gap-4">
        <div className="flex-1 text-center">
          <p className="text-[10px] text-brand-blue font-semibold uppercase">Right Eye</p>
          <p className="font-mono text-base font-bold text-white mt-0.5">{client.clinical?.distanceVA_R || '—'}</p>
          <p className="text-[10px] text-white/30">DVA</p>
        </div>
        <div className="w-px bg-white/10" />
        <div className="flex-1 text-center">
          <p className="text-[10px] text-white/60 font-semibold uppercase">Left Eye</p>
          <p className="font-mono text-base font-bold text-white mt-0.5">{client.clinical?.distanceVA_L || '—'}</p>
          <p className="text-[10px] text-white/30">DVA</p>
        </div>
        <div className="w-px bg-white/10" />
        <div className="flex-1 text-center">
          <p className="text-[10px] text-white/40 font-semibold uppercase">Near</p>
          <p className="font-mono text-base font-bold text-white mt-0.5">{client.clinical?.nearVA_R || '—'}</p>
          <p className="text-[10px] text-white/30">VA</p>
        </div>
      </div>

      {/* Tabs */}
      {!dispensed && (
        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
          {[['rx','Prescription'],['frame','Frame']].map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${tab === id ? 'bg-brand-accent text-white' : 'text-white/40'}`}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Prescription tab */}
      {tab === 'rx' && (
        <div className="space-y-4 glass-card rounded-2xl p-4">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Prescription (Rx)</p>

          {/* Right eye */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full bg-brand-blue/30 border border-brand-blue/60" />
              <p className="text-xs font-semibold text-brand-blue-light">Right Eye (OD)</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <RxPicker label="Sph" value={rx.sph_R} options={SPH_OPTIONS} onChange={v => setRxVal('sph_R', v)} />
              <RxPicker label="Cyl" value={rx.cyl_R} options={CYL_OPTIONS} onChange={v => setRxVal('cyl_R', v)} />
              <AxisPicker value={rx.axis_R} onChange={v => setRxVal('axis_R', v)} />
            </div>
          </div>

          <div className="border-t border-white/8" />

          {/* Left eye */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full bg-white/20 border border-white/40" />
              <p className="text-xs font-semibold text-white/70">Left Eye (OS)</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <RxPicker label="Sph" value={rx.sph_L} options={SPH_OPTIONS} onChange={v => setRxVal('sph_L', v)} />
              <RxPicker label="Cyl" value={rx.cyl_L} options={CYL_OPTIONS} onChange={v => setRxVal('cyl_L', v)} />
              <AxisPicker value={rx.axis_L} onChange={v => setRxVal('axis_L', v)} />
            </div>
          </div>

          <div className="border-t border-white/8" />

          {/* Add power */}
          <div>
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Near Addition</p>
            <div className="grid grid-cols-4 gap-1.5">
              {ADD_OPTIONS.map(v => (
                <button key={v} onClick={() => setRxVal('add', v)}
                  className={`py-2 rounded-lg text-xs font-mono font-bold transition-all ${rx.add === v ? 'bg-brand-teal/80 text-white' : 'bg-white/5 text-white/50'}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Frame tab */}
      {tab === 'frame' && (
        <div className="space-y-2 glass-card rounded-2xl p-4">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Select Frame</p>
          {FRAMES.map(f => (
            <button key={f.id} onClick={() => setRxVal('frame', f.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${rx.frame === f.id ? 'bg-brand-accent/20 border border-brand-accent/50' : 'bg-white/5 border border-white/5'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${rx.frame === f.id ? 'bg-brand-accent/30' : 'bg-white/10'}`}>
                <Glasses size={16} className={rx.frame === f.id ? 'text-brand-accent-light' : 'text-white/40'} />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${rx.frame === f.id ? 'text-white' : 'text-white/60'}`}>{f.label}</p>
                <p className="text-[10px] text-white/30">{f.id} · {f.desc}</p>
              </div>
              {rx.frame === f.id && <CheckCircle2 size={16} className="text-brand-accent shrink-0" />}
            </button>
          ))}

          <div className="mt-3">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Notes</p>
            <textarea
              className="field-input resize-none text-sm"
              rows={2}
              placeholder="Optional tester notes…"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Confirm / done */}
      {tab === 'confirm' && dispensed && (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5 text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00C9A7, #007B68)' }}>
              <CheckCircle2 size={32} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg">Glasses dispensed!</p>
              <p className="text-sm text-white/50 mt-1">Record saved offline · will sync when connected</p>
            </div>

            {/* Rx summary */}
            <div className="text-left bg-white/5 rounded-xl p-3.5 space-y-2">
              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Final Prescription</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-brand-blue font-semibold mb-1">Right Eye (OD)</p>
                  <p className="font-mono text-sm text-white">Sph {rx.sph_R} / Cyl {rx.cyl_R} × {rx.axis_R}°</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/60 font-semibold mb-1">Left Eye (OS)</p>
                  <p className="font-mono text-sm text-white">Sph {rx.sph_L} / Cyl {rx.cyl_L} × {rx.axis_L}°</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-white/8">
                <p className="text-xs text-white/50">Add: <span className="text-white font-semibold">{rx.add}</span></p>
                <p className="text-xs text-white/50">Frame: <span className="text-white font-semibold">{rx.frame || '—'}</span></p>
              </div>
            </div>
          </div>

          {/* Client card QR */}
          <button onClick={() => setShowCard(true)}
            className="w-full glass-card rounded-xl p-4 flex items-center gap-3 active:scale-98 transition-transform border border-brand-accent/20">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7C5CDB, #4A90D9)' }}>
              <Share2 size={18} color="white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white">Generate Client Card</p>
              <p className="text-xs text-white/40">QR code for follow-up use</p>
            </div>
          </button>

          {onBack && (
            <button onClick={onBack}
              className="w-full py-3 rounded-xl text-sm font-semibold bg-white/8 text-white/60">
              Back to Clients
            </button>
          )}
        </div>
      )}

      {/* Dispense button */}
      {!dispensed && (
        <button onClick={handleDispense} disabled={!rx.frame}
          className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-40 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #00C9A7, #007B68)' }}>
          <Glasses size={18} />
          Dispense Glasses
        </button>
      )}

      {!rx.frame && !dispensed && (
        <p className="text-xs text-center text-white/30">Select a frame to complete dispensing</p>
      )}

      {/* Client card modal */}
      {showCard && <ClientCardModal client={client} rx={rx} onClose={() => setShowCard(false)} />}
    </div>
  )
}

function RxPicker({ label, value, options, onChange }) {
  return (
    <div>
      <p className="text-[10px] text-white/40 uppercase font-semibold mb-1.5 text-center">{label}</p>
      <select className="field-input text-center font-mono text-sm px-2" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  )
}

function AxisPicker({ value, onChange }) {
  return (
    <div>
      <p className="text-[10px] text-white/40 uppercase font-semibold mb-1.5 text-center">Axis °</p>
      <input
        type="number"
        min="0" max="180"
        className="field-input text-center font-mono text-sm px-2"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

function ClientCardModal({ client, rx, onClose }) {
  const cardData = JSON.stringify({ id: client.id, rx: { OD: `${rx.sph_R}/${rx.cyl_R}x${rx.axis_R}`, OS: `${rx.sph_L}/${rx.cyl_L}x${rx.axis_L}`, add: rx.add }, f: rx.frame })

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(10,6,25,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-[390px] rounded-t-3xl p-6 pb-10"
        style={{ background: 'linear-gradient(180deg, #2D1B69 0%, #1A0F3C 100%)', border: '1px solid rgba(124,92,219,0.3)' }}>
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />

        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Client Card</h3>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
            <span className="text-white/70 text-lg leading-none">×</span>
          </button>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-5 space-y-4" style={{ background: 'linear-gradient(135deg, #2D1B69, #1A0F3C)', border: '1px solid rgba(124,92,219,0.4)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-white/40 uppercase">Client ID</p>
              <p className="font-mono font-black text-3xl text-brand-accent-light tracking-widest">{client.id}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/40">OOXii HoneyLens</p>
              <p className="text-xs text-white/60">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="eye-right rounded-xl p-2.5">
              <p className="text-[9px] font-semibold text-brand-blue-light uppercase mb-1">Right (OD)</p>
              <p className="font-mono text-xs text-white">Sph {rx.sph_R}</p>
              <p className="font-mono text-xs text-white">Cyl {rx.cyl_R} × {rx.axis_R}°</p>
            </div>
            <div className="eye-left rounded-xl p-2.5">
              <p className="text-[9px] font-semibold text-white/60 uppercase mb-1">Left (OS)</p>
              <p className="font-mono text-xs text-white">Sph {rx.sph_L}</p>
              <p className="font-mono text-xs text-white">Cyl {rx.cyl_L} × {rx.axis_L}°</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-white/50">Add: <span className="text-white font-mono font-semibold">{rx.add}</span></span>
            <span className="text-white/50">Frame: <span className="text-white font-semibold">{rx.frame || '—'}</span></span>
          </div>

          {/* QR */}
          <div className="flex justify-center">
            <div className="qr-container">
              <QRCodeSVG value={cardData} size={140} level="M" fgColor="#1A0F3C" bgColor="#ffffff" />
            </div>
          </div>

          <p className="text-center text-[10px] text-white/30">Scan for digital prescription record</p>
        </div>
      </div>
    </div>
  )
}

function RecentDispensed() {
  const dispensed = getClients().filter(c => c.status === 'dispensed').slice(0, 3)

  if (dispensed.length === 0) {
    return <p className="text-xs text-white/20 text-center py-4">No dispensed clients yet</p>
  }

  return (
    <div className="space-y-2">
      {dispensed.map(c => (
        <div key={c.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
          <span className="font-mono font-bold text-brand-accent-light">{c.id}</span>
          <span className="text-xs text-white/40 flex-1">{c.ageBand} · {c.gender}</span>
          <div className="chip chip-teal"><CheckCircle2 size={9} /> Done</div>
        </div>
      ))}
    </div>
  )
}
