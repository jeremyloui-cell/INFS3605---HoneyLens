import { useState } from 'react'
import { login, demoLogin, sendPasswordReset } from '../store'
import { Eye, EyeOff, Mail, Lock, ChevronRight, Zap, CheckCircle2 } from 'lucide-react'
import RegisterScreen from './RegisterScreen'

export default function LoginScreen({ onLogin }) {
  const [view, setView] = useState('login') // login | register | forgot | resetSent
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  if (view === 'register') return <RegisterScreen onBack={() => setView('login')} onSuccess={() => setView('login')} />

  function handleLogin(e) {
    e.preventDefault()
    if (!email || !password) { setError('Please enter your email and password'); return }
    setLoading(true); setError('')
    setTimeout(() => {
      login(email, password, remember)
      setLoading(false)
      onLogin()
    }, 1000)
  }

  function handleDemo() {
    setDemoLoading(true)
    setTimeout(() => { demoLogin(); setDemoLoading(false); onLogin() }, 1200)
  }

  function handleReset(e) {
    e.preventDefault()
    if (!resetEmail) return
    setResetLoading(true)
    sendPasswordReset(resetEmail).then(() => { setResetLoading(false); setView('resetSent') })
  }

  if (view === 'forgot') return (
    <Screen>
      <Logo />
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white">Forgot your password?</h2>
          <p className="text-sm text-white/50 mt-1">Enter your email and we'll send a reset link.</p>
        </div>
        <form onSubmit={handleReset} className="space-y-3">
          <Field label="Your email" icon={<Mail size={15}/>}>
            <input className="field-input pl-9" type="email" placeholder="you@example.com" value={resetEmail} onChange={e => setResetEmail(e.target.value)} />
          </Field>
          <Btn loading={resetLoading}>{resetLoading ? 'Sending…' : 'Send reset link'}</Btn>
        </form>
        <LoginLink onClick={() => setView('login')} />
      </div>
    </Screen>
  )

  if (view === 'resetSent') return (
    <Screen>
      <Logo />
      <div className="glass-card rounded-2xl p-6 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,201,167,0.15)', border: '1px solid rgba(0,201,167,0.3)' }}>
          <CheckCircle2 size={28} className="text-brand-teal" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Check your email</h2>
          <p className="text-sm text-white/50 mt-1">A reset link has been sent to <strong className="text-white">{resetEmail}</strong></p>
        </div>
        <Btn onClick={() => setView('login')}>Back to login</Btn>
      </div>
    </Screen>
  )

  return (
    <Screen>
      <Logo />

      {/* Demo login */}
      <button onClick={handleDemo} disabled={demoLoading}
        className="w-full rounded-2xl p-4 flex items-center gap-3 active:scale-98 transition-transform disabled:opacity-60 mb-4"
        style={{ background: 'linear-gradient(135deg, rgba(0,201,167,0.15), rgba(74,144,217,0.15))', border: '1px solid rgba(0,201,167,0.35)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #00C9A7, #4A90D9)' }}>
          {demoLoading ? <Spinner /> : <Zap size={18} color="white" />}
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-white">Quick Demo Login</p>
          <p className="text-xs text-white/50">Sign in as Sophia · pre-loaded with demo data</p>
        </div>
        {!demoLoading && <ChevronRight size={16} className="text-white/30 ml-auto" />}
      </button>

      <Divider />

      {/* Login form */}
      <div className="glass-card rounded-2xl p-5">
        <form onSubmit={handleLogin} className="space-y-4">
          <Field label="Your email" icon={<Mail size={15}/>}>
            <input className="field-input pl-9" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
          </Field>

          <Field label="Password" icon={<Lock size={15}/>} action={
            <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30">
              {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
            </button>
          }>
            <input className="field-input pl-9 pr-9" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
          </Field>

          {/* Remember device */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <div onClick={() => setRemember(r => !r)}
              className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all ${remember ? 'bg-brand-accent' : 'bg-white/10 border border-white/20'}`}>
              {remember && <svg width="11" height="8" viewBox="0 0 11 8" fill="none"><path d="M1 3.5L4 6.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">Remember this device</span>
          </label>

          {error && <p className="text-brand-red text-sm">{error}</p>}

          <Btn loading={loading}>Log in</Btn>
        </form>

        <button onClick={() => setView('forgot')} className="mt-3 w-full text-center text-sm text-brand-accent-light hover:text-white transition-colors">
          Forgot your password?
        </button>
      </div>

      <div className="text-center mt-4">
        <button onClick={() => setView('register')} className="text-sm text-white/50 hover:text-white transition-colors">
          Not registered yet? <span className="text-brand-accent-light font-semibold">Create an account</span>
        </button>
      </div>
    </Screen>
  )
}

// ── Shared sub-components ────────────────────────────────────────────────────
export function Screen({ children }) {
  return (
    <div className="min-h-svh flex flex-col px-6 pt-14 pb-10 gap-5" style={{ background: 'linear-gradient(170deg, #1A0F3C 0%, #0D0820 100%)' }}>
      <div className="absolute top-0 left-0 right-0 h-80 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-20 animate-spin-slow" style={{ background: 'radial-gradient(circle, #7C5CDB 0%, transparent 70%)' }} />
        <div className="absolute -top-10 right-0 w-52 h-52 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #4A90D9 0%, transparent 70%)' }} />
      </div>
      <div className="relative z-10 flex flex-col gap-5 flex-1">{children}</div>
    </div>
  )
}

export function Logo() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse-glow" style={{ background: 'linear-gradient(135deg, #7C5CDB, #4A90D9)' }}>
        <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
          <ellipse cx="20" cy="20" rx="18" ry="11" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="20" cy="20" r="5" fill="white" fillOpacity="0.9"/>
          <circle cx="20" cy="20" r="2.5" fill="#7C5CDB"/>
        </svg>
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white tracking-tight">HoneyLens</h1>
        <p className="text-xs text-brand-accent-light mt-0.5">OOXii Field Testing Platform</p>
      </div>
    </div>
  )
}

export function Field({ label, icon, action, children }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="relative mt-1.5">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-accent opacity-60">{icon}</span>
        {children}
        {action}
      </div>
    </div>
  )
}

export function Btn({ children, loading, onClick, disabled, variant = 'primary', type = 'submit' }) {
  const base = 'w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-50'
  const styles = variant === 'primary'
    ? { background: 'linear-gradient(135deg, #7C5CDB, #5B3FA8)', color: 'white' }
    : { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)' }
  return (
    <button type={type} className={base} style={styles} disabled={loading || disabled} onClick={onClick}>
      {loading ? <Spinner /> : children}
    </button>
  )
}

export function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-xs text-white/30">or sign in with your account</span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  )
}

export function LoginLink({ onClick }) {
  return (
    <div className="text-center pt-1">
      <button type="button" onClick={onClick} className="text-sm text-white/50 hover:text-white transition-colors">
        Already registered? <span className="text-brand-accent-light font-semibold">Login to your account</span>
      </button>
    </div>
  )
}

export function Spinner() {
  return (
    <svg className="animate-spin" width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
      <path d="M9 2 A7 7 0 0 1 16 9" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
