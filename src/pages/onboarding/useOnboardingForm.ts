import { useRef, useState } from 'react'
import { isApiError } from '../../api/client'
import type { OnboardingStep } from '../../types/auth'

export const onboardingHash = (step: OnboardingStep) => step === 'JOIN_BUILDING' ? '#join-building' : step === 'REGISTER_VEHICLE' ? '#vehicle-register' : '#home'

export function useOnboardingForm() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [needsLogin, setNeedsLogin] = useState(false)
  const busy = useRef(false)
  async function submit(action: () => Promise<void>) {
    if (busy.current) return
    busy.current = true; setPending(true); setError(''); setNeedsLogin(false)
    try { await action() }
    catch (cause) {
      setError(isApiError(cause) ? cause.message : '잠시 후 다시 시도해 주세요.')
      setNeedsLogin(isApiError(cause) && cause.code === 'UNAUTHORIZED')
    } finally { busy.current = false; setPending(false) }
  }
  return { pending, error, needsLogin, submit, setError }
}
