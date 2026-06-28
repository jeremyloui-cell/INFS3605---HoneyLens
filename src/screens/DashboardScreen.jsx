import { useState, useEffect } from 'react'
import { getClients, getDevices, getCamp, getSyncQueue, getTester } from '../store'
import { Users, Glasses, Clock, CheckCircle2, Share2, Plus, ChevronRight, Zap, TrendingUp, AlertCircle, Eye } from 'lucide-react'

export default function DashboardScreen({ onNewClient, onGoClients, onGoDispense, onGoDevices }) {
  const [clients, setClients] = useState(getClients())
  const [time, setTime] = useState(new Date())
  const tester = getTester()
  const camp = getCamp()
  const devices = getDevices()
  const syncQueue = getSyncQueue()

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30000)
    return () => clearInterval(t)
  }, [])

  const dispensed   = clients.filter(c => c.status === 'dispensed').length
  const inProgress  = clients.filter(c => c.status === 'in-progress').length
  const waiting     = clients.filter(c => c.status === 'waiting').length
  const total       = clients.length
  const onlineDevices = devices.filter(d => d.status === 'online').length + 1

  const hour = time.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = tester?.name?.split(' ')[0] || 'Tester'

  const campStart  = new Date(camp.startTime || Date.now() - 4 * 3600000)
  const hoursRunning = Math.floor((Date.now() - campStart) / 3600000)
  const minsRunning  = Math.floor(((Date.now() - campStart) % 3600000) / 60000)

  // Recent 3 clients
  const recentClients = [...clients].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3)

  const progressPct = total > 0 ? Math.round((dispensed / total) * 100) : 0
  const circumference = 2 * Math.PI * 38
  const strokeDash = (progressPct / 100) * circumference

  return (
    <div className="px-4 py-5 space-y-5 animate-fade-in">

      {/* Greeting */}
      <div>
        <p className="text-white/40 text-sm">{time.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <h2 className="text-2xl font-bold text-white mt-0.5">{greeting}, {firstName} 👋</h2>
        <p className="text-xs text-white/40 mt-1">{camp.name} · {camp.location}</p>
      </div>

      {/* Camp ring + key stats */}
      <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
        {/* Progress ring */}
        <div className="relative shrink-0 w-24 h-24">
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="38" fill="none" stroke="rgba(124,92,219,0.15)" strokeWidth="8"/>
            <circle cx="48" cy="48" r="38" fill="none"
              stroke="url(#ringGrad)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${strokeDash} ${circumference}`}
              transform="rotate(-90 48 48)" style={{ transition: 'stroke-dasharray 1s ease' }}/>
            <defs>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00C9A7"/>
                <stop offset="100%" stopColor="#4A90D9"/>
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-2xl font-black text-white leading-none">{progressPct}%</p>
            <p className="text-[9px] text-white/40 font-semibold">done</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 grid grid-cols-2 gap-2">
          <StatPill icon={<Users size={12}/>}  label="Total"       value={total}       color="text-brand-accent-light" />
          <StatPill icon={<CheckCircle2 size={12}/>} label="Dispensed" value={dispensed}  color="text-brand-teal" />
          <StatPill icon={<AlertCircle size={12}/>}  label="In progress" value={inProgress} color="text-brand-amber" />
          <StatPill icon={<Clock size={12}/>}   label="Waiting"    value={waiting}     color="text-white/50" />
        </div>
      </div>

      {/* Camp status strip */}
      <div className="grid grid-cols-3 gap-2">
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-brand-accent-light">{onlineDevices}/{devices.length + 1}</p>
          <p className="text-[10px] text-white/40">Devices online</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-white">{hoursRunning}h {minsRunning}m</p>
          <p className="text-[10px] text-white/40">Camp running</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <p className={`text-lg font-bold ${syncQueue.length > 0 ? 'text-brand-amber' : 'text-brand-teal'}`}>{syncQueue.length}</p>
          <p className="text-[10px] text-white/40">Unsynced</p>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2.5">Quick Actions</p>
        <div className="grid grid-cols-2 gap-3">
          <QuickAction
            icon={<Plus size={20} color="white"/>}
            label="New Client"
            sub="Register & test"
            gradient="linear-gradient(135deg, #7C5CDB, #5B3FA8)"
            onClick={onNewClient}
          />
          <QuickAction
            icon={<Share2 size={20} color="white"/>}
            label="Sync via QR"
            sub={`${syncQueue.length} pending`}
            gradient="linear-gradient(135deg, #4A90D9, #2D5F8A)"
            onClick={onGoDevices}
          />
          <QuickAction
            icon={<Glasses size={20} color="white"/>}
            label="Dispense"
            sub={`${inProgress} ready`}
            gradient="linear-gradient(135deg, #00C9A7, #007B68)"
            onClick={onGoDispense}
          />
          <QuickAction
            icon={<Eye size={20} color="white"/>}
            label="All Clients"
            sub={`${total} today`}
            gradient="linear-gradient(135deg, #9B59B6, #6C3483)"
            onClick={onGoClients}
          />
        </div>
      </div>

      {/* Recent clients */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Recent Clients</p>
          <button onClick={onGoClients} className="text-xs text-brand-accent-light font-semibold flex items-center gap-1">
            View all <ChevronRight size={12}/>
          </button>
        </div>
        <div className="space-y-2">
          {recentClients.map(c => <RecentClientRow key={c.id} client={c} onDispense={() => onGoDispense(c.id)} />)}
        </div>
      </div>

      {/* Devices banner */}
      <button onClick={onGoDevices}
        className="w-full glass-card rounded-xl p-3.5 flex items-center gap-3 active:scale-98 transition-transform border border-brand-accent/15">
        <div className="flex gap-1 items-center">
          {[...Array(Math.min(onlineDevices, 5))].map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-brand-teal" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-white">{onlineDevices} device{onlineDevices !== 1 ? 's' : ''} online at this camp</p>
          <p className="text-xs text-white/40">Tap to manage devices & QR sync</p>
        </div>
        <ChevronRight size={16} className="text-white/20" />
      </button>

      {/* Motivational footer */}
      <div className="text-center pt-2 pb-4">
        <p className="text-xs text-white/20 italic">
          {dispensed === 0
            ? 'Ready to change lives today.'
            : dispensed === 1
            ? '1 person can see clearly because of you today.'
            : `${dispensed} people can see clearly because of you today.`}
        </p>
      </div>
    </div>
  )
}

function StatPill({ icon, label, value, color }) {
  return (
    <div className="bg-white/5 rounded-lg px-2.5 py-2 flex items-center gap-2">
      <span className={color}>{icon}</span>
      <div>
        <p className={`text-base font-bold ${color} leading-none`}>{value}</p>
        <p className="text-[9px] text-white/30 leading-none mt-0.5">{label}</p>
      </div>
    </div>
  )
}

function QuickAction({ icon, label, sub, gradient, onClick }) {
  return (
    <button onClick={onClick}
      className="glass-card rounded-xl p-4 flex flex-col gap-3 active:scale-95 transition-transform text-left">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: gradient }}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-white">{label}</p>
        <p className="text-[10px] text-white/40">{sub}</p>
      </div>
    </button>
  )
}

function RecentClientRow({ client, onDispense }) {
  const STATUS = {
    dispensed:    { chip: 'chip-teal',   label: 'Dispensed',    icon: CheckCircle2 },
    'in-progress':{ chip: 'chip-amber',  label: 'In Progress',  icon: AlertCircle  },
    waiting:      { chip: 'chip-purple', label: 'Waiting',      icon: Clock        },
  }
  const cfg = STATUS[client.status] || STATUS.waiting
  const Icon = cfg.icon
  const elapsed = Math.floor((Date.now() - client.createdAt) / 60000)
  const timeLabel = elapsed < 60 ? `${elapsed}m ago` : `${Math.floor(elapsed / 60)}h ago`

  return (
    <div className="glass-card rounded-xl p-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0"
        style={{ background: 'linear-gradient(135deg, rgba(124,92,219,0.3), rgba(74,144,217,0.2))', color: '#9B7EF0' }}>
        {client.id}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`chip ${cfg.chip}`}><Icon size={9}/>{cfg.label}</span>
          <span className="text-[10px] text-white/30">{timeLabel}</span>
        </div>
        <p className="text-xs text-white/40 mt-0.5">{client.ageBand} · {client.gender} · {client.location}</p>
      </div>
      {client.status === 'in-progress' && (
        <button onClick={() => onDispense(client.id)}
          className="shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #00C9A7, #007B68)' }}>
          Dispense
        </button>
      )}
    </div>
  )
}
