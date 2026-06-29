import { setRegionConfirmed, getTester } from '../store'
import { Screen, Logo, Btn } from './LoginScreen'
import { MapPin } from 'lucide-react'

export default function RegionConfirmScreen({ onConfirm }) {
  const tester = getTester()
  const region = [tester?.city, tester?.state, tester?.country].filter(Boolean).join(', ') || 'Not specified'

  function confirm() {
    setRegionConfirmed()
    onConfirm()
  }

  return (
    <Screen>
      <Logo />
      <div className="glass-card rounded-2xl p-6 space-y-5">
        <div>
          <h2 className="text-xl font-bold text-white">Confirm your region</h2>
          <p className="text-sm text-white/50 mt-1">Please confirm your current testing region before proceeding.</p>
        </div>

        <div className="rounded-xl p-4 flex items-start gap-3"
          style={{ background: 'rgba(124,92,219,0.12)', border: '1px solid rgba(124,92,219,0.3)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(124,92,219,0.25)' }}>
            <MapPin size={16} className="text-brand-accent-light" />
          </div>
          <div>
            <p className="text-xs text-white/40 mb-0.5">Your registered region</p>
            <p className="text-base font-semibold text-white">{region}</p>
          </div>
        </div>

        <p className="text-xs text-white/40">
          This region will be used for camp and data reporting. You can update it in settings.
        </p>

        <Btn onClick={confirm} type="button">Confirm &amp; continue</Btn>
      </div>
    </Screen>
  )
}
