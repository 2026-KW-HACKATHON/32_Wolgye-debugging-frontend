import type { UserMe } from '../types/auth'

export const DEMO_EMAIL = 'kim@kw.ac.kr'
export const DEMO_PASSWORD = 'chagok1234'
export const demoUser: UserMe = {
  id: 1, email: DEMO_EMAIL, nickname: '지수', name: '김지수', phone: '010-****-5678',
  temperature: 36.5, token_balance: 500_000, onboarding_step: 'DONE',
  building: { building_id: 3, name: '월계 한빛빌라', alley: { id: 1, name: '광운로19가길' }, role: 'RESIDENT', unit: '101동 202호' },
}
// 목 계정 비밀번호는 메모리에만 둔다. 새로고침 후 신규 계정 재로그인은 지원하지 않는다.
export const accounts = new Map<string, { password: string; user: UserMe }>([[DEMO_EMAIL, { password: DEMO_PASSWORD, user: structuredClone(demoUser) }]])
