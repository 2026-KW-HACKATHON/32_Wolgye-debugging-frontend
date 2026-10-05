import type { UserMe } from '../types/auth'

export const DEMO_EMAIL = 'kim@kw.ac.kr'
export const DEMO_PASSWORD = 'chagok1234'
export const demoUser: UserMe = {
  id: 1, email: DEMO_EMAIL, nickname: '지수', name: '김지수', phone: '010-****-5678',
  temperature: 36.5, token_balance: 500_000, onboarding_step: 'DONE',
  building: { building_id: 3, name: '월계 한빛빌라', alley: { id: 1, name: '광운로19가길' }, role: 'RESIDENT', unit: '101동 202호' },
}
// 관리자 체험 계정 (2026-10-06 결정). id 2 = mocks/admin.ts 의 ADMIN_USER_ID (공유 조건 host)
export const ADMIN_DEMO_EMAIL = 'admin@kw.ac.kr'
export const adminDemoUser: UserMe = {
  id: 2, email: ADMIN_DEMO_EMAIL, nickname: '관리자', name: '박관리', phone: '010-****-1234',
  temperature: 36.5, token_balance: 500_000, onboarding_step: 'DONE',
  building: { building_id: 3, name: '월계 한빛빌라', alley: { id: 1, name: '광운로19가길' }, role: 'ADMIN', unit: '관리실' },
}
// 목 계정 비밀번호는 메모리에만 둔다. 새로고침 후 신규 계정 재로그인은 지원하지 않는다.
export const accounts = new Map<string, { password: string; user: UserMe }>([
  [DEMO_EMAIL, { password: DEMO_PASSWORD, user: structuredClone(demoUser) }],
  [ADMIN_DEMO_EMAIL, { password: DEMO_PASSWORD, user: structuredClone(adminDemoUser) }],
])
