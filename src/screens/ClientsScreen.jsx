import { useState } from 'react'
import { getClients, createClient, getClient, saveClient } from '../store'
import { Plus, Search, ChevronRight, Clock, CheckCircle2, AlertCircle, Eye, X, ChevronDown, ArrowRight, Circle } from 'lucide-react'

const STATUS_CONFIG = {
  waiting:     { label: 'Waiting',     chip: 'chip-purple', icon: Clock },
  'in-progress': { label: 'In Progress', chip: 'chip-amber',  icon: AlertCircle },
  dispensed:   { label: 'Dispensed',   chip: 'chip-teal',   icon: CheckCircle2 },
}

const STEPS = [
  { id: 'distance', label: 'Distance VA', short: 'DVA' },
  { id: 'wheel',    label: 'Wheel Test',  short: 'WHL' },
  { id: 'near',     label: 'Near VA',     short: 'NVA' },
  { id: 'lens',     label: 'Lenses',      short: 'LNS' },
]

const VA_OPTIONS = ['6/6','6/9','6/12','6/18','6/24','6/36','6/60','CF','HM','PL','NPL']
const NEAR_VA    = ['N5','N6','N8','N10','N12','N14','N18','N24','N36']

export default function ClientsScreen({ tester, camp, onDispense }) {
  const [clients, setClients] = useState(getClients())
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [view, setView] = useState('list') // list | detail | new
  const [selectedId, setSelectedId] = useState(null)
  const [activeStep, setActiveStep] = useState(null)

  function refresh() { setClients(getClients()) }

  const filtered = clients.filter(c => {
    const matchSearch = search === '' || c.id.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || c.status === filter
    return matchSearch && matchFilter
  })

  function openClient(id) { setSelectedId(id); setView('detail') }

  if (view === 'new')   return <NewClientForm camp={camp} onSave={(c) => { refresh(); setSelectedId(c.id); setView('detail') }} onBack={() => setView('list')} />
  if (view === 'detail') {
    const client = getClient(selectedId)
    if (!client) { setView('list'); return null }
    return <ClientDetail client={client} onBack={() => setView('list')} onRefresh={refresh} onDispense={() => onDispense(selectedId)} />
  }

  return (
    <div className="px-4 py-5 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Clients</h2>
          <p className="text-xs text-white/40">{clients.length} registered today</p>
        </div>
        <button onClick={() => setView('new')}
          className="w-10 h-10 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: 'linear-gradient(135deg, #7C5CDB, #5B3FA8)' }}>
          <Plus size={20} color="white" />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input className="field-input pl-9" placeholder="Search by client ID…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {['all','waiting','in-progress','dispensed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === f ? 'bg-brand-accent text-white' : 'bg-white/5 text-white/50'}`}>
            {f === 'all' ? 'All' : STATUS_CONFIG[f]?.label || f}
          </button>
        ))}
      </div>

      {/* Client list */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-white/30">
            <Eye size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No clients found</p>
          </div>
        ) : filtered.map(client => (
          <ClientCard key={client.id} client={client} onOpen={() => openClient(client.id)} />
        ))}
      </div>
    </div>
  )
}

function ClientCard({ client, onOpen }) {
  const cfg = STATUS_CONFIG[client.status] || STATUS_CONFIG.waiting
  const Icon = cfg.icon
  const completedSteps = client.steps.length
  const progress = Math.round((completedSteps / 4) * 100)

  return (
    <button onClick={onOpen}
      className="glass-card rounded-xl p-3.5 w-full text-left active:scale-98 transition-transform flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-mono font-bold text-sm"
        style={{ background: 'linear-gradient(135deg, rgba(124,92,219,0.3), rgba(74,144,217,0.2))', color: '#9B7EF0' }}>
        {client.id}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`chip ${cfg.chip}`}>
            <Icon size={9} />
            {cfg.label}
          </span>
          {!client.synced && <span className="chip chip-amber">Unsynced</span>}
        </div>
        <div className="flex items-center gap-3 text-xs text-white/40">
          <span>{client.ageBand} · {client.gender || '—'}</span>
          <span>{client.location}</span>
          {client.cataractHx && <span className="text-brand-amber">Cataract Hx</span>}
        </div>
        {/* Step progress */}
        <div className="flex items-center gap-1.5 mt-2">
          {STEPS.map(s => (
            <div key={s.id}
              className={`h-1.5 rounded-full flex-1 ${client.steps.includes(s.id) ? 'bg-brand-teal' : 'bg-white/10'}`} />
          ))}
        </div>
      </div>
      <ChevronRight size={16} className="text-white/20 shrink-0" />
    </button>
  )
}

function NewClientForm({ camp, onSave, onBack }) {
  const [form, setForm] = useState({ ageBand: '', gender: '', location: camp.location, cataractHx: false })
  const [saved, setSaved] = useState(null)
  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function handleSave() {
    if (!form.ageBand || !form.gender) return
    const client = createClient(form)
    setSaved(client)
    setTimeout(() => onSave(client), 1000)
  }

  if (saved) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-20 gap-6 animate-fade-in">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #7C5CDB, #4A90D9)' }}>
          <CheckCircle2 size={40} className="text-white" />
        </div>
        <div className="text-center">
          <p className="text-white/50 text-sm mb-1">Client registered</p>
          <p className="font-mono text-4xl font-black text-brand-accent-light tracking-widest">{saved.id}</p>
          <p className="text-xs text-white/40 mt-2">Write this ID on the client's paper card</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-5 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
          <X size={16} className="text-white/70" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-white">New Client</h2>
          <p className="text-xs text-white/40">No personal data stored</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5 space-y-4">
        <InfoBox>Client ID will be auto-generated. Names and contact details are kept offline by your partner organisation — not in this app.</InfoBox>

        <div>
          <label className="field-label">Age Band</label>
          <div className="grid grid-cols-3 gap-2 mt-1.5">
            {['Under 18','18-29','30-39','40-49','50-59','60-69','70+'].map(a => (
              <button key={a} onClick={() => set('ageBand', a)}
                className={`py-2 rounded-lg text-xs font-semibold transition-all ${form.ageBand === a ? 'bg-brand-accent text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                {a}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="field-label">Gender</label>
          <div className="grid grid-cols-3 gap-2 mt-1.5">
            {['Male','Female','Non-binary'].map(g => (
              <button key={g} onClick={() => set('gender', g)}
                className={`py-2 rounded-lg text-xs font-semibold transition-all ${form.gender === g ? 'bg-brand-accent text-white' : 'bg-white/5 text-white/50'}`}>
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="field-label">Location</label>
          <input className="field-input mt-1.5" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Village / area" />
        </div>

        <div>
          <label className="field-label">Cataract surgery history?</label>
          <div className="grid grid-cols-2 gap-2 mt-1.5">
            {[['Yes', true], ['No', false]].map(([label, val]) => (
              <button key={label} onClick={() => set('cataractHx', val)}
                className={`py-2 rounded-lg text-xs font-semibold transition-all ${form.cataractHx === val ? 'bg-brand-accent text-white' : 'bg-white/5 text-white/50'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleSave} disabled={!form.ageBand || !form.gender}
          className="w-full py-3.5 rounded-xl font-semibold text-white disabled:opacity-40 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #7C5CDB, #5B3FA8)' }}>
          Register Client
        </button>
      </div>
    </div>
  )
}

function ClientDetail({ client, onBack, onRefresh, onDispense }) {
  const [localClient, setLocalClient] = useState(client)
  const [activeStep, setActiveStep] = useState(null)
  const [stepForm, setStepForm] = useState({})
  const cfg = STATUS_CONFIG[localClient.status] || STATUS_CONFIG.waiting

  const nextStep = STEPS.find(s => !localClient.steps.includes(s.id))
  const isComplete = localClient.steps.length >= 4 || localClient.status === 'dispensed'

  function openStep(stepId) {
    if (localClient.steps.includes(stepId)) return
    if (nextStep?.id !== stepId) return // enforce decision tree
    setActiveStep(stepId)
    setStepForm({})
  }

  function saveStep(stepId, data) {
    const updated = {
      ...localClient,
      steps: [...localClient.steps, stepId],
      status: 'in-progress',
      clinical: { ...localClient.clinical, ...data },
    }
    saveClient(updated)
    setLocalClient(updated)
    onRefresh()
    setActiveStep(null)
  }

  function skipStep(stepId) {
    const updated = {
      ...localClient,
      steps: [...localClient.steps, stepId],
      status: 'in-progress',
      clinical: localClient.clinical,
    }
    saveClient(updated)
    setLocalClient(updated)
    onRefresh()
    setActiveStep(null)
  }

  return (
    <div className="px-4 py-5 animate-fade-in space-y-4">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
          <X size={16} className="text-white/70" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-2xl text-brand-accent-light">{localClient.id}</span>
            {!localClient.synced && <span className="chip chip-amber">Unsynced</span>}
          </div>
          <p className="text-xs text-white/40">{localClient.ageBand} · {localClient.gender} · {localClient.location}</p>
        </div>
        <div className={`chip ${cfg.chip}`}>{cfg.label}</div>
      </div>

      {/* Cataract warning */}
      {localClient.cataractHx && (
        <div className="flex items-center gap-2.5 bg-brand-amber/10 border border-brand-amber/30 rounded-xl px-3.5 py-2.5">
          <AlertCircle size={16} className="text-brand-amber shrink-0" />
          <p className="text-xs text-brand-amber font-medium">Cataract surgery history — note during testing</p>
        </div>
      )}

      {/* Decision tree steps */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Testing Workflow</p>
          <p className="text-xs text-white/30">{localClient.steps.length}/4 steps</p>
        </div>

        {STEPS.map((step, i) => {
          const done = localClient.steps.includes(step.id)
          const isNext = nextStep?.id === step.id
          const locked = !done && !isNext

          return (
            <button key={step.id} onClick={() => openStep(step.id)} disabled={locked || done}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                done    ? 'bg-brand-teal/10 border border-brand-teal/30' :
                isNext  ? 'bg-brand-accent/15 border border-brand-accent/40 active:scale-98' :
                          'bg-white/5 border border-white/5 opacity-40'
              }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                done ? 'step-done' : isNext ? 'step-active' : 'step-todo'
              }`}>
                {done ? '✓' : i + 1}
              </div>
              <div className="flex-1 text-left">
                <p className={`text-sm font-semibold ${done ? 'text-brand-teal' : isNext ? 'text-white' : 'text-white/30'}`}>
                  {step.label}
                </p>
                {done && localClient.clinical[`distanceVA_R`] && step.id === 'distance' && (
                  <p className="text-xs text-white/40 mt-0.5">
                    OD {localClient.clinical.distanceVA_R} · OS {localClient.clinical.distanceVA_L}
                  </p>
                )}
                {done && step.id === 'wheel' && localClient.clinical.wheelResult && (
                  <p className="text-xs text-white/40 mt-0.5">{localClient.clinical.wheelResult}</p>
                )}
              </div>
              {isNext && <ArrowRight size={16} className="text-brand-accent shrink-0" />}
              {locked && <Circle size={14} className="text-white/10 shrink-0" />}
            </button>
          )
        })}
      </div>

      {/* Clinical summary */}
      {Object.keys(localClient.clinical).length > 0 && (
        <ClinicalSummary clinical={localClient.clinical} />
      )}

      {/* Dispense button */}
      {localClient.steps.length >= 3 && (
        <button onClick={onDispense}
          className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #00C9A7, #007B68)' }}>
          Proceed to Dispense
          <ChevronRight size={18} />
        </button>
      )}

      {/* Step modal */}
      {activeStep && (
        <StepModal step={activeStep} client={localClient} onSave={saveStep} onSkip={skipStep} onClose={() => setActiveStep(null)} />
      )}
    </div>
  )
}

function ClinicalSummary({ clinical }) {
  return (
    <div className="glass-card rounded-2xl p-4 space-y-3">
      <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Clinical Data</p>

      {(clinical.distanceVA_R || clinical.distanceVA_L) && (
        <div>
          <p className="text-xs text-white/40 mb-2">Distance Visual Acuity</p>
          <div className="grid grid-cols-2 gap-2">
            <EyeCell side="R" label="Right Eye" value={clinical.distanceVA_R} />
            <EyeCell side="L" label="Left Eye" value={clinical.distanceVA_L} />
          </div>
        </div>
      )}

      {clinical.wheelResult && (
        <div>
          <p className="text-xs text-white/40 mb-1.5">Wheel Test</p>
          <div className="bg-white/5 rounded-xl px-3.5 py-2.5">
            <p className="text-sm text-white">{clinical.wheelResult}</p>
          </div>
        </div>
      )}

      {(clinical.nearVA_R || clinical.nearVA_L) && (
        <div>
          <p className="text-xs text-white/40 mb-2">Near Vision</p>
          <div className="grid grid-cols-2 gap-2">
            <EyeCell side="R" label="Right Eye" value={clinical.nearVA_R} />
            <EyeCell side="L" label="Left Eye" value={clinical.nearVA_L} />
          </div>
        </div>
      )}
    </div>
  )
}

function EyeCell({ side, label, value }) {
  return (
    <div className={`rounded-xl p-2.5 text-center ${side === 'R' ? 'eye-right' : 'eye-left'}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{label}</p>
      <p className="font-mono font-bold text-lg mt-0.5">{value || '—'}</p>
    </div>
  )
}

function StepModal({ step, client, onSave, onSkip, onClose }) {
  const [form, setForm] = useState({})
  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function handleSave() {
    if (step === 'distance') onSave(step, { distanceVA_R: form.va_R || '6/12', distanceVA_L: form.va_L || '6/12' })
    else if (step === 'wheel') onSave(step, { wheelResult: form.wheelResult || 'No significant astigmatism' })
    else if (step === 'near') onSave(step, { nearVA_R: form.near_R || 'N8', nearVA_L: form.near_L || 'N8' })
    else if (step === 'lens') onSave(step, {})
  }

  const stepInfo = STEPS.find(s => s.id === step)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(10,6,25,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-[390px] rounded-t-3xl p-6 pb-10"
        style={{ background: 'linear-gradient(180deg, #2D1B69 0%, #1A0F3C 100%)', border: '1px solid rgba(124,92,219,0.3)' }}>
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />

        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Step</p>
            <h3 className="text-lg font-bold text-white">{stepInfo?.label}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
            <X size={15} className="text-white/70" />
          </button>
        </div>

        <div className="space-y-4">
          {step === 'distance' && (
            <>
              <InfoBox>Ask the client to read the Snellen chart at 6 metres. Record the last line read correctly for each eye.</InfoBox>
              <div>
                <p className="text-xs text-white/50 mb-2">Right Eye (Blue)</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {VA_OPTIONS.map(v => (
                    <button key={v} onClick={() => set('va_R', v)}
                      className={`py-2 rounded-lg text-xs font-mono font-bold transition-all ${form.va_R === v ? 'bg-brand-blue text-white' : 'bg-white/5 text-white/50'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-white/50 mb-2">Left Eye (White)</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {VA_OPTIONS.map(v => (
                    <button key={v} onClick={() => set('va_L', v)}
                      className={`py-2 rounded-lg text-xs font-mono font-bold transition-all ${form.va_L === v ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 'wheel' && (
            <>
              <InfoBox>Rotate the astigmatism wheel. The client indicates when lines appear equal in clarity. Record findings below.</InfoBox>
              <div className="space-y-2">
                {['No significant astigmatism','Mild astigmatism OD','Mild astigmatism OS','Moderate astigmatism OD','Moderate astigmatism OS','Significant astigmatism OU'].map(r => (
                  <button key={r} onClick={() => set('wheelResult', r)}
                    className={`w-full py-2.5 px-3.5 rounded-xl text-sm text-left font-medium transition-all ${form.wheelResult === r ? 'bg-brand-accent text-white' : 'bg-white/5 text-white/50'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 'near' && (
            <>
              <InfoBox>Hold the near vision paddle at 40 cm. Record the smallest line client can read for each eye.</InfoBox>
              <div>
                <p className="text-xs text-white/50 mb-2">Right Eye (Blue)</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {NEAR_VA.map(v => (
                    <button key={v} onClick={() => set('near_R', v)}
                      className={`py-2 rounded-lg text-xs font-mono font-bold transition-all ${form.near_R === v ? 'bg-brand-blue text-white' : 'bg-white/5 text-white/50'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-white/50 mb-2">Left Eye (White)</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {NEAR_VA.map(v => (
                    <button key={v} onClick={() => set('near_L', v)}
                      className={`py-2 rounded-lg text-xs font-mono font-bold transition-all ${form.near_L === v ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 'lens' && (
            <>
              <InfoBox>Fit trial lenses and confirm client satisfaction. Proceed to the Dispense screen to record the final prescription.</InfoBox>
            </>
          )}

          <div className="flex gap-2">
            <button onClick={() => onSkip(step)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold bg-white/10 text-white/60">
              Skip Step
            </button>
            <button onClick={handleSave}
              className="flex-1 px-8 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #7C5CDB, #5B3FA8)' }}>
              Save & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoBox({ children }) {
  return (
    <div className="bg-brand-accent/10 border border-brand-accent/20 rounded-xl px-3.5 py-2.5">
      <p className="text-xs text-brand-accent-light">{children}</p>
    </div>
  )
}

