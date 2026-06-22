import { useState } from 'react'
import { saveTester } from '../store'
import { Eye, Lock, User, ChevronRight, Wifi, WifiOff } from 'lucide-react'

export default function LoginScreen({ onLogin }) {
  const [step, setStep] = useState('login') // login | register
  const [form, setForm] = useState({ name: '', pin: '', role: 'Tester', experience: 'Trained', ageBand: '25-34', gender: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function handleLogin(e) {
    e.preventDefault()
    if (!form.name || form.pin.length < 4) { setError('Enter your name and 4-digit PIN'); return }
    setLoading(true)
    setTimeout(() => {
      saveTester({ name: form.name, role: form.role, experience: form.experience, ageBand: form.ageBand, gender: form.gender })
      setLoading(false)
      onLogin()
    }, 900)
  }

  return (
    <div className="min-h-svh bg-brand-purple-dark flex flex-col" style={{ background: 'linear-gradient(170deg, #1A0F3C 0%, #0D0820 100%)' }}>
      {/* Top decoration */}
      <div className="absolute top-0 left-0 right-0 h-72 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-20 animate-spin-slow"
          style={{ background: 'radial-gradient(circle, #7C5CDB 0%, transparent 70%)' }} />
        <div className="absolute -top-10 right-0 w-52 h-52 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #4A90D9 0%, transparent 70%)' }} />
      </div>

      <div className="flex-1 flex flex-col justify-between px-6 pt-16 pb-10 relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4 animate-slide-up">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center animate-pulse-glow"
            style={{ background: 'linear-gradient(135deg, #7C5CDB, #4A90D9)' }}>
            <EyeLogoSvg />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white">HoneyLens</h1>
            <p className="text-sm text-brand-accent-light mt-1 font-medium">OOXii Field Testing Platform</p>
          </div>

          {/* Offline badge */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1">
            <WifiOff size={12} className="text-brand-amber" />
            <span className="text-xs text-brand-amber font-medium">Offline-first mode</span>
          </div>
        </div>

        {/* Form */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-5">
              {step === 'login' ? 'Sign in to your account' : 'Register as tester'}
            </h2>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-brand-accent-light uppercase tracking-wider mb-1.5 block">Full name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-accent opacity-60" />
                  <input className="field-input pl-9" placeholder="Your name" value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-accent-light uppercase tracking-wider mb-1.5 block">4-digit PIN</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-accent opacity-60" />
                  <input className="field-input pl-9 font-mono tracking-[0.35em]" type="password" inputMode="numeric" maxLength={4} placeholder="••••" value={form.pin} onChange={e => set('pin', e.target.value.replace(/\D/g, ''))} />
                </div>
              </div>

              {step === 'register' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-brand-accent-light uppercase tracking-wider mb-1.5 block">Role</label>
                      <select className="field-input" value={form.role} onChange={e => set('role', e.target.value)}>
                        <option>Tester</option>
                        <option>Supervisor</option>
                        <option>Dispenser</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-brand-accent-light uppercase tracking-wider mb-1.5 block">Experience</label>
                      <select className="field-input" value={form.experience} onChange={e => set('experience', e.target.value)}>
                        <option>Trained</option>
                        <option>Experienced</option>
                        <option>Expert</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-brand-accent-light uppercase tracking-wider mb-1.5 block">Age band</label>
                      <select className="field-input" value={form.ageBand} onChange={e => set('ageBand', e.target.value)}>
                        {['18-24','25-34','35-44','45-54','55+'].map(a => <option key={a}>{a}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-brand-accent-light uppercase tracking-wider mb-1.5 block">Gender</label>
                      <select className="field-input" value={form.gender} onChange={e => set('gender', e.target.value)}>
                        <option value="">Prefer not</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Non-binary</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {error && <p className="text-brand-red text-sm">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #7C5CDB, #5B3FA8)' }}>
                {loading ? <Spinner /> : <>
                  {step === 'login' ? 'Sign in' : 'Create account'}
                  <ChevronRight size={18} />
                </>}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button className="text-sm text-brand-accent-light hover:text-white transition-colors"
                onClick={() => setStep(s => s === 'login' ? 'register' : 'login')}>
                {step === 'login' ? "New tester? Register here" : "Already registered? Sign in"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-white/30 space-y-1">
          <p>Stays logged in for 30 days · No client data stored locally</p>
          <p>OOXii Field Platform v2.1</p>
        </div>
      </div>
    </div>
  )
}

function EyeLogoSvg() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="20" cy="20" rx="18" ry="11" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="20" cy="20" r="5" fill="white" fillOpacity="0.9"/>
      <circle cx="20" cy="20" r="2.5" fill="#7C5CDB"/>
      <line x1="20" y1="9" x2="20" y2="5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6"/>
      <line x1="29" y1="14" x2="31.5" y2="11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6"/>
      <line x1="11" y1="14" x2="8.5" y2="11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6"/>
    </svg>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin" width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
      <path d="M9 2 A7 7 0 0 1 16 9" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
