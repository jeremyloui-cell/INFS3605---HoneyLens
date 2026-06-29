import { useState } from 'react'
import { createClient, saveClient, OOXII_LINES, calcSnellen, getClient } from '../store'
import { ChevronLeft, ChevronDown, CheckCircle2, Eye } from 'lucide-react'
import { Btn, Spinner } from './LoginScreen'

// ── Shared UI helpers ─────────────────────────────────────────────────────────

function Header({ title, subtitle, onBack }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      {onBack && (
        <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/8 active:bg-white/15 shrink-0">
          <ChevronLeft size={20} className="text-white/70" />
        </button>
      )}
      <div>
        <h2 className="text-lg font-bold text-white leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

function SectionCard({ children, className = '' }) {
  return (
    <div className={`glass-card rounded-2xl p-4 space-y-3 ${className}`}>
      {children}
    </div>
  )
}

function Label({ children }) {
  return <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">{children}</p>
}

function SelectRow({ label, value, onChange, options, placeholder }) {
  return (
    <div>
      <p className="field-label mb-1">{label}</p>
      <div className="relative">
        <select
          className="field-input pr-9 appearance-none"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ color: value ? 'white' : 'rgba(255,255,255,0.3)' }}>
          <option value="" disabled>{placeholder || 'Select…'}</option>
          {options.map(o => (
            <option key={typeof o === 'object' ? o.value : o}
              value={typeof o === 'object' ? o.value : o}
              style={{ color: 'white', background: '#1A0F3C' }}>
              {typeof o === 'object' ? o.label : o}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
      </div>
    </div>
  )
}

function VAInput({ label, line, onLine, partial, onPartial, result }) {
  const lineOptions = OOXII_LINES.map(l => ({ value: String(l.line), label: `Line ${l.line} (${l.snellen})` }))
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        <SelectRow label="OOXii line" value={line} onChange={onLine} options={lineOptions} placeholder="Select line" />
        <SelectRow label="Partial letters" value={partial} onChange={onPartial}
          options={['0','1','2','3','4'].map(n => ({ value: n, label: n === '0' ? 'None' : `+${n}` }))} placeholder="0" />
      </div>
      {line && (
        <div className="rounded-xl px-3 py-2 flex items-center justify-between"
          style={{ background: 'rgba(0,201,167,0.1)', border: '1px solid rgba(0,201,167,0.25)' }}>
          <span className="text-xs text-white/50">Snellen result</span>
          <span className="text-sm font-bold text-brand-teal">{result}</span>
        </div>
      )}
    </div>
  )
}

function YesNo({ label, value, onChange }) {
  return (
    <div>
      <p className="field-label mb-1.5">{label}</p>
      <div className="flex gap-2">
        {['Yes','No'].map(opt => (
          <button key={opt} type="button"
            onClick={() => onChange(opt.toLowerCase())}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${value === opt.toLowerCase()
              ? 'text-white' : 'text-white/40 bg-white/5'}`}
            style={value === opt.toLowerCase() ? { background: 'linear-gradient(135deg,#7C5CDB,#4A90D9)' } : {}}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── STEP 1: Client info ───────────────────────────────────────────────────────

function StepClientInfo({ data, onChange, onNext, onBack }) {
  const [error, setError] = useState('')

  function next() {
    if (!data.yearOfBirth || !data.gender) { setError('Year of birth and gender are required'); return }
    const yr = parseInt(data.yearOfBirth)
    if (isNaN(yr) || yr < 1900 || yr > new Date().getFullYear()) { setError('Enter a valid year of birth'); return }
    setError(''); onNext()
  }

  return (
    <div className="px-5 py-5 space-y-4">
      <Header title="Client Information" subtitle="Step 1 — Basic details" onBack={onBack} />
      <SectionCard>
        <div>
          <p className="field-label mb-1">Year of birth</p>
          <input className="field-input" type="number" placeholder="e.g. 1975" min="1900" max={new Date().getFullYear()}
            value={data.yearOfBirth} onChange={e => onChange('yearOfBirth', e.target.value)} />
        </div>
        <SelectRow label="Gender" value={data.gender} onChange={v => onChange('gender', v)}
          options={['Male','Female','Non-binary','Prefer not to say']} placeholder="Select gender" />
        <SelectRow label="Cataract surgery" value={data.cataract} onChange={v => onChange('cataract', v)}
          options={[{value:'none',label:'No'},{value:'right',label:'Yes – right eye'},{value:'left',label:'Yes – left eye'},{value:'both',label:'Yes – both eyes'}]}
          placeholder="Select…" />
        <div>
          <p className="field-label mb-1">Location</p>
          <input className="field-input" placeholder="e.g. Luganville"
            value={data.location} onChange={e => onChange('location', e.target.value)} />
        </div>
      </SectionCard>
      {error && <p className="text-brand-red text-sm px-1">{error}</p>}
      <Btn onClick={next} type="button">Next</Btn>
    </div>
  )
}

// ── STEP 2: Session type ──────────────────────────────────────────────────────

function StepSessionType({ data, onChange, onNext, onBack }) {
  return (
    <div className="px-5 py-5 space-y-4">
      <Header title="Session Type" subtitle="Step 2" onBack={onBack} />
      <SectionCard>
        <Label>Select session type</Label>
        <div className="grid grid-cols-2 gap-2">
          {['Individual','Group'].map(opt => (
            <button key={opt} type="button"
              onClick={() => onChange('sessionType', opt.toLowerCase())}
              className={`py-4 rounded-xl text-sm font-semibold transition-all flex flex-col items-center gap-1.5 ${data.sessionType === opt.toLowerCase()
                ? 'text-white' : 'text-white/40 bg-white/5'}`}
              style={data.sessionType === opt.toLowerCase() ? { background: 'linear-gradient(135deg,#7C5CDB,#4A90D9)' } : {}}>
              <Eye size={20} />
              {opt}
            </button>
          ))}
        </div>
      </SectionCard>
      <Btn onClick={onNext} type="button" disabled={!data.sessionType}>Next</Btn>
    </div>
  )
}

// ── STEP 3: Distance VA right eye ─────────────────────────────────────────────

function StepDistVARight({ data, onChange, onNext, onBack }) {
  const result = calcSnellen(data.distVA_R_line, data.distVA_R_partial)
  return (
    <div className="px-5 py-5 space-y-4">
      <Header title="Distance VA — Right Eye" subtitle="Step 3 · No glasses" onBack={onBack} />
      <SectionCard>
        <VAInput label="Right eye (unaided)"
          line={data.distVA_R_line} onLine={v => { onChange('distVA_R_line', v); onChange('distVA_R', calcSnellen(v, data.distVA_R_partial || '0')) }}
          partial={data.distVA_R_partial || '0'} onPartial={v => { onChange('distVA_R_partial', v); onChange('distVA_R', calcSnellen(data.distVA_R_line, v)) }}
          result={result} />
      </SectionCard>
      <Btn onClick={onNext} type="button" disabled={!data.distVA_R_line}>Next</Btn>
    </div>
  )
}

// ── STEP 4: Distance VA left eye ──────────────────────────────────────────────

function StepDistVALeft({ data, onChange, onNext, onBack }) {
  const result = calcSnellen(data.distVA_L_line, data.distVA_L_partial)
  return (
    <div className="px-5 py-5 space-y-4">
      <Header title="Distance VA — Left Eye" subtitle="Step 4 · No glasses" onBack={onBack} />
      <SectionCard>
        <VAInput label="Left eye (unaided)"
          line={data.distVA_L_line} onLine={v => { onChange('distVA_L_line', v); onChange('distVA_L', calcSnellen(v, data.distVA_L_partial || '0')) }}
          partial={data.distVA_L_partial || '0'} onPartial={v => { onChange('distVA_L_partial', v); onChange('distVA_L', calcSnellen(data.distVA_L_line, v)) }}
          result={result} />
      </SectionCard>
      <Btn onClick={onNext} type="button" disabled={!data.distVA_L_line}>Next</Btn>
    </div>
  )
}

// ── STEP 5: Own glasses? ──────────────────────────────────────────────────────

function StepOwnGlasses({ data, onChange, onNext, onBack }) {
  return (
    <div className="px-5 py-5 space-y-4">
      <Header title="Own Glasses?" subtitle="Step 5" onBack={onBack} />
      <SectionCard>
        <YesNo label="Does the client have their own glasses?" value={data.ownGlasses} onChange={v => onChange('ownGlasses', v)} />
      </SectionCard>
      <Btn onClick={onNext} type="button" disabled={!data.ownGlasses}>Next</Btn>
    </div>
  )
}

// ── STEP 6: Distance VA with own glasses (both eyes) ─────────────────────────

function StepDistVABoth({ data, onChange, onNext, onBack }) {
  const result = calcSnellen(data.distVA_both_line, data.distVA_both_partial)
  return (
    <div className="px-5 py-5 space-y-4">
      <Header title="Distance VA — Own Glasses" subtitle="Step 6 · Both eyes with glasses" onBack={onBack} />
      <SectionCard>
        <VAInput label="Both eyes with own glasses"
          line={data.distVA_both_line} onLine={v => { onChange('distVA_both_line', v); onChange('distVA_both', calcSnellen(v, data.distVA_both_partial || '0')) }}
          partial={data.distVA_both_partial || '0'} onPartial={v => { onChange('distVA_both_partial', v); onChange('distVA_both', calcSnellen(data.distVA_both_line, v)) }}
          result={result} />
      </SectionCard>
      <Btn onClick={onNext} type="button" disabled={!data.distVA_both_line}>Next</Btn>
    </div>
  )
}

// ── STEP 7: Near VA (no glasses) ─────────────────────────────────────────────

function StepNearVANoGlasses({ data, onChange, onNext, onBack }) {
  const result = calcSnellen(data.nearVA_line, data.nearVA_partial)
  return (
    <div className="px-5 py-5 space-y-4">
      <Header title="Near VA — No Glasses" subtitle="Step 7" onBack={onBack} />
      <SectionCard>
        <VAInput label="Near vision (unaided)"
          line={data.nearVA_line} onLine={v => { onChange('nearVA_line', v); onChange('nearVA', calcSnellen(v, data.nearVA_partial || '0')) }}
          partial={data.nearVA_partial || '0'} onPartial={v => { onChange('nearVA_partial', v); onChange('nearVA', calcSnellen(data.nearVA_line, v)) }}
          result={result} />
      </SectionCard>
      <Btn onClick={onNext} type="button" disabled={!data.nearVA_line}>Next</Btn>
    </div>
  )
}

// ── STEP 8: Reading glasses? ──────────────────────────────────────────────────

function StepReadingGlasses({ data, onChange, onNext, onBack }) {
  return (
    <div className="px-5 py-5 space-y-4">
      <Header title="Reading Glasses?" subtitle="Step 8" onBack={onBack} />
      <SectionCard>
        <YesNo label="Does the client have reading glasses?" value={data.readingGlasses} onChange={v => onChange('readingGlasses', v)} />
      </SectionCard>
      <Btn onClick={onNext} type="button" disabled={!data.readingGlasses}>Next</Btn>
    </div>
  )
}

// ── STEP 9: Near VA with reading glasses ─────────────────────────────────────

function StepNearVAWithGlasses({ data, onChange, onNext, onBack }) {
  const result = calcSnellen(data.nearVA_glasses_line, data.nearVA_glasses_partial)
  return (
    <div className="px-5 py-5 space-y-4">
      <Header title="Near VA — Reading Glasses" subtitle="Step 9" onBack={onBack} />
      <SectionCard>
        <VAInput label="Near vision with reading glasses"
          line={data.nearVA_glasses_line} onLine={v => { onChange('nearVA_glasses_line', v); onChange('nearVA_glasses', calcSnellen(v, data.nearVA_glasses_partial || '0')) }}
          partial={data.nearVA_glasses_partial || '0'} onPartial={v => { onChange('nearVA_glasses_partial', v); onChange('nearVA_glasses', calcSnellen(data.nearVA_glasses_line, v)) }}
          result={result} />
      </SectionCard>
      <Btn onClick={onNext} type="button" disabled={!data.nearVA_glasses_line}>Next</Btn>
    </div>
  )
}

// ── STEP 10: PD measurement ───────────────────────────────────────────────────

function StepPD({ data, onChange, onNext, onBack }) {
  const [error, setError] = useState('')
  const pd = parseInt(data.pd)

  function next() {
    if (!data.pd || isNaN(pd) || pd < 52 || pd > 78) { setError('PD must be between 52 and 78 mm'); return }
    setError(''); onNext()
  }

  return (
    <div className="px-5 py-5 space-y-4">
      <Header title="Pupillary Distance" subtitle="Step 10 · Wheel test preparation" onBack={onBack} />
      <SectionCard>
        <div>
          <p className="field-label mb-1">PD (mm)</p>
          <input className="field-input" type="number" placeholder="52–78" min="52" max="78"
            value={data.pd} onChange={e => onChange('pd', e.target.value)} />
          <p className="text-xs text-white/30 mt-1">Valid range: 52–78 mm</p>
        </div>
      </SectionCard>
      {error && <p className="text-brand-red text-sm px-1">{error}</p>}
      <Btn onClick={next} type="button">Next</Btn>
    </div>
  )
}

// ── STEP 11: Wheel test right eye ─────────────────────────────────────────────

const MINUS_LENSES = ['-0.50','-0.75','-1.00','-1.25','-1.50','-1.75','-2.00','-2.25','-2.50','-2.75','-3.00','-3.25','-3.50','-3.75','-4.00']
const PLUS_LENSES  = ['+0.50','+0.75','+1.00','+1.25','+1.50','+1.75','+2.00','+2.25','+2.50','+2.75','+3.00','+3.25','+3.50','+3.75','+4.00']

function StepWheelRight({ data, onChange, onNext, onBack }) {
  const lenses = data.wheelR_best === 'minus' ? MINUS_LENSES : PLUS_LENSES

  return (
    <div className="px-5 py-5 space-y-4">
      <Header title="Wheel Test — Right Eye" subtitle="Step 11" onBack={onBack} />
      <SectionCard>
        <div>
          <Label>Which is better — plus or minus?</Label>
          <div className="flex gap-2 mt-2">
            {['plus','minus'].map(opt => (
              <button key={opt} type="button"
                onClick={() => { onChange('wheelR_best', opt); onChange('wheelR_lens', '') }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${data.wheelR_best === opt ? 'text-white' : 'text-white/40 bg-white/5'}`}
                style={data.wheelR_best === opt ? { background: 'linear-gradient(135deg,#7C5CDB,#4A90D9)' } : {}}>
                {opt === 'minus' ? 'Minus (–)' : 'Plus (+)'}
              </button>
            ))}
          </div>
        </div>

        {data.wheelR_best && (
          <SelectRow label="Best lens" value={data.wheelR_lens} onChange={v => onChange('wheelR_lens', v)}
            options={lenses.map(l => ({ value: l, label: l }))} placeholder="Select lens" />
        )}

        {data.wheelR_lens && (
          <>
            <div>
              <Label>2-colour test result</Label>
              <div className="flex gap-2 mt-2">
                {['Red','Green','Same'].map(opt => (
                  <button key={opt} type="button"
                    onClick={() => onChange('wheelR_colour', opt.toLowerCase())}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${data.wheelR_colour === opt.toLowerCase() ? 'text-white' : 'text-white/40 bg-white/5'}`}
                    style={data.wheelR_colour === opt.toLowerCase() ? {
                      background: opt === 'Red' ? 'rgba(232,84,84,0.6)' : opt === 'Green' ? 'rgba(0,201,167,0.4)' : 'linear-gradient(135deg,#7C5CDB,#4A90D9)'
                    } : {}}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <YesNo label="Can client read line 9?" value={data.wheelR_readLine9} onChange={v => onChange('wheelR_readLine9', v)} />
          </>
        )}
      </SectionCard>
      <Btn onClick={onNext} type="button"
        disabled={!data.wheelR_best || !data.wheelR_lens || !data.wheelR_colour || !data.wheelR_readLine9}>
        Next
      </Btn>
    </div>
  )
}

// ── STEP 12: Summary & save ───────────────────────────────────────────────────

function StepSummary({ data, clientInfo, onSave, onBack, saving }) {
  const rows = [
    ['Client ID', clientInfo?.id || '—'],
    ['Year of birth', data.yearOfBirth],
    ['Gender', data.gender],
    ['Cataract', data.cataract || 'none'],
    ['Dist VA Right (unaided)', data.distVA_R || '—'],
    ['Dist VA Left (unaided)', data.distVA_L || '—'],
    data.ownGlasses === 'yes' ? ['Dist VA Both (glasses)', data.distVA_both || '—'] : null,
    ['Near VA (unaided)', data.nearVA || '—'],
    data.readingGlasses === 'yes' ? ['Near VA (glasses)', data.nearVA_glasses || '—'] : null,
    ['PD', data.pd ? `${data.pd} mm` : '—'],
    ['Best lens (R)', `${data.wheelR_best || ''} ${data.wheelR_lens || ''}`],
    ['2-colour result (R)', data.wheelR_colour || '—'],
    ['Can read line 9? (R)', data.wheelR_readLine9 || '—'],
  ].filter(Boolean)

  return (
    <div className="px-5 py-5 space-y-4">
      <Header title="Test Summary" subtitle="Step 12 · Review & save" onBack={onBack} />
      <SectionCard>
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
            <span className="text-xs text-white/40">{k}</span>
            <span className="text-xs font-semibold text-white/90 text-right max-w-[55%]">{v}</span>
          </div>
        ))}
      </SectionCard>
      <Btn onClick={onSave} type="button" loading={saving}>{saving ? <Spinner /> : 'Save & complete'}</Btn>
    </div>
  )
}

// ── STEP 13: Complete ─────────────────────────────────────────────────────────

function StepComplete({ clientId, onDone }) {
  return (
    <div className="px-5 py-5 flex flex-col items-center justify-center min-h-[60vh] space-y-5">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(0,201,167,0.15)', border: '1px solid rgba(0,201,167,0.3)' }}>
        <CheckCircle2 size={40} className="text-brand-teal" />
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Test complete!</h2>
        <p className="text-sm text-white/50 mt-1">Client <span className="text-white font-semibold">{clientId}</span> has been saved.</p>
      </div>
      <Btn onClick={onDone} type="button">Done</Btn>
    </div>
  )
}

// ── Main TestFlowScreen ───────────────────────────────────────────────────────

const INITIAL = {
  yearOfBirth: '', gender: '', cataract: 'none', location: '',
  sessionType: '',
  distVA_R_line: '', distVA_R_partial: '0', distVA_R: '',
  distVA_L_line: '', distVA_L_partial: '0', distVA_L: '',
  ownGlasses: '',
  distVA_both_line: '', distVA_both_partial: '0', distVA_both: '',
  nearVA_line: '', nearVA_partial: '0', nearVA: '',
  readingGlasses: '',
  nearVA_glasses_line: '', nearVA_glasses_partial: '0', nearVA_glasses: '',
  pd: '',
  wheelR_best: '', wheelR_lens: '', wheelR_colour: '', wheelR_readLine9: '',
}

export default function TestFlowScreen({ onDone, onBack }) {
  const [step, setStep]     = useState(1)
  const [data, setData]     = useState(INITIAL)
  const [client, setClient] = useState(null)
  const [saving, setSaving] = useState(false)

  function set(k, v) { setData(d => ({ ...d, [k]: v })) }
  const next = () => setStep(s => s + 1)
  const back = () => { if (step === 1) { onBack?.(); return } setStep(s => s - 1) }

  function computeSteps() {
    // Build the step sequence based on branching
    const steps = [1, 2, 3, 4, 5]
    if (data.ownGlasses === 'yes') steps.push(6)
    steps.push(7, 8)
    if (data.readingGlasses === 'yes') steps.push(9)
    steps.push(10, 11, 12)
    return steps
  }

  const stepSeq  = computeSteps()
  const stepIdx  = stepSeq.indexOf(step)
  const nextStep = () => {
    const ni = stepSeq[stepIdx + 1]
    if (ni !== undefined) setStep(ni); else setStep(12)
  }
  const prevStep = () => {
    if (stepIdx <= 0) { onBack?.(); return }
    setStep(stepSeq[stepIdx - 1])
  }

  function handleSave() {
    setSaving(true)
    setTimeout(() => {
      const clinical = { ...data }
      delete clinical.yearOfBirth
      delete clinical.gender
      delete clinical.cataract
      delete clinical.location
      delete clinical.sessionType

      const c = createClient({
        yearOfBirth: parseInt(data.yearOfBirth),
        gender: data.gender === 'Male' ? 'M' : data.gender === 'Female' ? 'F' : data.gender.charAt(0),
        cataract: data.cataract || 'none',
        location: data.location,
        clinical,
      })
      setClient(c)
      setSaving(false)
      setStep(13)
    }, 1000)
  }

  if (step === 13) return <StepComplete clientId={client?.id} onDone={onDone} />

  const sharedProps = { data, onChange: set, onNext: nextStep, onBack: prevStep }

  return (
    <div className="min-h-svh" style={{ background: 'linear-gradient(170deg, #1A0F3C 0%, #0D0820 100%)' }}>
      {/* Progress bar */}
      <div className="h-1 bg-white/10 sticky top-0 z-10">
        <div className="h-full bg-brand-accent transition-all duration-300"
          style={{ width: `${(stepIdx / (stepSeq.length - 1)) * 100}%` }} />
      </div>

      {step === 1  && <StepClientInfo      {...sharedProps} />}
      {step === 2  && <StepSessionType     {...sharedProps} />}
      {step === 3  && <StepDistVARight     {...sharedProps} />}
      {step === 4  && <StepDistVALeft      {...sharedProps} />}
      {step === 5  && <StepOwnGlasses      {...sharedProps} />}
      {step === 6  && <StepDistVABoth      {...sharedProps} />}
      {step === 7  && <StepNearVANoGlasses {...sharedProps} />}
      {step === 8  && <StepReadingGlasses  {...sharedProps} />}
      {step === 9  && <StepNearVAWithGlasses {...sharedProps} />}
      {step === 10 && <StepPD              {...sharedProps} />}
      {step === 11 && <StepWheelRight      {...sharedProps} />}
      {step === 12 && <StepSummary data={data} clientInfo={client} onSave={handleSave} onBack={prevStep} saving={saving} />}
    </div>
  )
}
