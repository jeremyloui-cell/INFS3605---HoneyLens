import { useState } from 'react'
import { register, validatePassword, COUNTRIES, STATES, CITIES, HEALTH_ROLES, EXPERIENCE_LEVELS } from '../store'
import { Screen, Logo, Field, Btn, LoginLink, Spinner } from './LoginScreen'
import { User, Mail, Lock, EyeOff, Eye, Globe, ChevronDown, CheckCircle2, Building2 } from 'lucide-react'

export default function RegisterScreen({ onBack, onSuccess }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    firstName: '', lastName: '', gender: '',
    country: '', state: '', city: '',
    role: '', experience: '', organisation: '',
  })
  const [showPw, setShowPw]           = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  const pwErrors = form.password ? validatePassword(form.password) : []

  function nextStep1() {
    if (!form.email || !form.password || !form.confirmPassword) { setError('Please fill in all fields'); return }
    if (pwErrors.length) { setError('Password does not meet requirements'); return }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }
    setError(''); setStep(2)
  }

  function nextStep2() {
    if (!form.firstName || !form.lastName || !form.gender || !form.country) { setError('Please fill in all fields'); return }
    setError(''); setStep(3)
  }

  function submit(e) {
    e.preventDefault()
    if (!form.role || !form.experience) { setError('Please fill in all fields'); return }
    setLoading(true)
    setTimeout(() => {
      register({
        email: form.email, firstName: form.firstName, lastName: form.lastName,
        gender: form.gender, country: form.country, state: form.state, city: form.city,
        role: form.role, experience: form.experience, organisation: form.organisation,
        password: form.password,
      })
      setLoading(false)
      setStep(4)
    }, 1000)
  }

  const states = STATES[form.country] || STATES.default || []
  const cities = CITIES[form.state]   || CITIES.default  || []

  if (step === 4) return (
    <Screen>
      <Logo />
      <div className="glass-card rounded-2xl p-6 text-center space-y-5">
        <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(0,201,167,0.15)', border: '1px solid rgba(0,201,167,0.3)' }}>
          <CheckCircle2 size={30} className="text-brand-teal" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Account created!</h2>
          <p className="text-sm text-white/50 mt-1">Your account has been created successfully.</p>
        </div>
        <Btn onClick={onSuccess} type="button">Continue to login</Btn>
      </div>
    </Screen>
  )

  return (
    <Screen>
      <Logo />

      {/* Step indicator */}
      <div className="flex items-center gap-2 justify-center">
        {[1,2,3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              s < step ? 'bg-brand-teal text-white' : s === step ? 'bg-brand-accent text-white' : 'bg-white/10 text-white/30'
            }`}>{s < step ? '✓' : s}</div>
            {s < 3 && <div className={`h-px w-8 ${s < step ? 'bg-brand-teal' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-5 space-y-4">
        {step === 1 && (
          <>
            <div>
              <h2 className="text-lg font-bold text-white">Create account</h2>
              <p className="text-sm text-white/50">Step 1 of 3 — Account details</p>
            </div>
            <div className="space-y-3">
              <Field label="Email" icon={<Mail size={15}/>}>
                <input className="field-input pl-9" type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => set('email', e.target.value)} autoComplete="email" />
              </Field>
              <Field label="Password" icon={<Lock size={15}/>} action={
                <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30">
                  {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              }>
                <input className="field-input pl-9 pr-9" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={e => set('password', e.target.value)} autoComplete="new-password" />
              </Field>
              {form.password && (
                <div className="space-y-1">
                  {['At least 8 characters','At least 1 uppercase letter (A-Z)','At least 1 special character (e.g., !@#$)'].map(rule => {
                    const ok = !pwErrors.includes(rule)
                    return (
                      <div key={rule} className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-brand-teal' : 'bg-white/20'}`} />
                        <span className={`text-xs ${ok ? 'text-brand-teal' : 'text-white/40'}`}>{rule}</span>
                      </div>
                    )
                  })}
                </div>
              )}
              <Field label="Confirm password" icon={<Lock size={15}/>} action={
                <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30">
                  {showConfirm ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              }>
                <input className="field-input pl-9 pr-9" type={showConfirm ? 'text' : 'password'} placeholder="••••••••"
                  value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} autoComplete="new-password" />
              </Field>
            </div>
            {error && <p className="text-brand-red text-sm">{error}</p>}
            <Btn onClick={nextStep1} type="button">Next</Btn>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <h2 className="text-lg font-bold text-white">Tester info</h2>
              <p className="text-sm text-white/50">Step 2 of 3 — Personal details</p>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Field label="First name" icon={<User size={15}/>}>
                  <input className="field-input pl-9" placeholder="First"
                    value={form.firstName} onChange={e => set('firstName', e.target.value)} />
                </Field>
                <Field label="Last name" icon={<User size={15}/>}>
                  <input className="field-input pl-9" placeholder="Last"
                    value={form.lastName} onChange={e => set('lastName', e.target.value)} />
                </Field>
              </div>
              <SelectField label="Gender" value={form.gender} onChange={v => set('gender', v)}
                options={['Male','Female','Non-binary','Prefer not to say']} placeholder="Select gender" />
              <SelectField label="Country" value={form.country} onChange={v => { set('country', v); set('state', ''); set('city', '') }}
                options={COUNTRIES} placeholder="Select country" />
              {form.country && (
                <SelectField label="State / Region" value={form.state} onChange={v => { set('state', v); set('city', '') }}
                  options={states} placeholder="Select state" />
              )}
              {form.state && cities.length > 0 && (
                <SelectField label="City" value={form.city} onChange={v => set('city', v)}
                  options={cities} placeholder="Select city" />
              )}
            </div>
            {error && <p className="text-brand-red text-sm">{error}</p>}
            <div className="flex gap-2">
              <Btn onClick={() => { setError(''); setStep(1) }} type="button" variant="secondary">Back</Btn>
              <Btn onClick={nextStep2} type="button">Next</Btn>
            </div>
          </>
        )}

        {step === 3 && (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white">Additional info</h2>
              <p className="text-sm text-white/50">Step 3 of 3 — Professional details</p>
            </div>
            <div className="space-y-3">
              <SelectField label="Healthcare role" value={form.role} onChange={v => set('role', v)}
                options={HEALTH_ROLES} placeholder="Select your role" />
              <SelectField label="Experience level" value={form.experience} onChange={v => set('experience', v)}
                options={EXPERIENCE_LEVELS} placeholder="Select experience" />
              <Field label="Organisation" icon={<Building2 size={15}/>}>
                <input className="field-input pl-9" placeholder="e.g. OOXii Vanuatu"
                  value={form.organisation} onChange={e => set('organisation', e.target.value)} />
              </Field>
            </div>
            {error && <p className="text-brand-red text-sm">{error}</p>}
            <div className="flex gap-2">
              <Btn onClick={() => { setError(''); setStep(2) }} type="button" variant="secondary">Back</Btn>
              <Btn loading={loading}>{loading ? <Spinner /> : 'Create account'}</Btn>
            </div>
          </form>
        )}

        <LoginLink onClick={onBack} />
      </div>
    </Screen>
  )
}

function SelectField({ label, value, onChange, options, placeholder }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="relative mt-1.5">
        <select
          className="field-input pr-9 appearance-none"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ color: value ? 'white' : 'rgba(255,255,255,0.3)' }}>
          <option value="" disabled>{placeholder}</option>
          {options.map(o => <option key={o} value={o} style={{ color: 'white', background: '#1A0F3C' }}>{o}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
      </div>
    </div>
  )
}
