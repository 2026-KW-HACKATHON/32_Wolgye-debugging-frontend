import type { BuildingRole } from './api'

export type OnboardingStep = 'JOIN_BUILDING' | 'REGISTER_VEHICLE' | 'DONE'
export type SignupRequest = { email: string; password: string; nickname: string; agree_terms: boolean }
export type LoginRequest = { email: string; password: string }
export type AuthTokens = { access_token: string; refresh_token: string; user: { id: number; nickname: string; onboarding_step: OnboardingStep } }
export type UserMe = {
  id: number; email: string; nickname: string; name: string | null; phone: string | null
  temperature: number; token_balance: number; onboarding_step: OnboardingStep
  building: { building_id: number; name: string; alley: { id: number; name: string }; role: BuildingRole; unit: string | null } | null
}
export type UpdateMeRequest = { name?: string; unit?: string; phone?: string }
export type JoinBuildingResponse = { building_id: number; name: string; address: string; alley: { id: number; name: string }; role: BuildingRole; onboarding_step: OnboardingStep }
