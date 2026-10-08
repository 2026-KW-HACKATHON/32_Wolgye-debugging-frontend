import { ApiError, mockDelay, request, USE_MOCK } from './client'
import { IS_GUEST, GUEST_ROLE, GUEST_SESSION_KEY } from './guestMode'
import { accounts, demoUser, adminDemoUser } from '../mocks/auth'
import type { BuildingRole } from '../types/api'
import type { AuthTokens, JoinBuildingResponse, LoginRequest, SignupRequest, UpdateMeRequest, UserMe } from '../types/auth'

export { ADMIN_DEMO_EMAIL, DEMO_EMAIL, DEMO_PASSWORD } from '../mocks/auth'
const KEY = IS_GUEST ? GUEST_SESSION_KEY : 'chagok.auth'
type Session = { tokens: AuthTokens; profile: UserMe; accessExpiresAt: number; refreshExpiresAt: number }
type ServerSession = { mode: 'server'; tokens: AuthTokens; profile: UserMe | null }
const guestUser = GUEST_ROLE === 'ADMIN' ? adminDemoUser : demoUser
let session: Session | null = readSession()
if (IS_GUEST && (!session || session.profile.id !== guestUser.id || session.profile.building?.role !== GUEST_ROLE)) {
  session = { profile: structuredClone(guestUser), tokens: {access_token:'guest.access',refresh_token:'guest.refresh',user:{id:guestUser.id,nickname:guestUser.nickname,onboarding_step:'DONE'}}, accessExpiresAt:Date.now()+30*60_000, refreshExpiresAt:Date.now()+14*86400_000 }
  persist()
}
let serverSession: ServerSession | null = readServerSession()
let pendingRefresh: Promise<AuthTokens> | null = null
if (session) {
  const restoredAccount = accounts.get(session.profile.email)
  if (restoredAccount) restoredAccount.user = structuredClone(session.profile)
}
function readSession(): Session | null {
  if (!USE_MOCK) return null
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Session | null
    if (!value || (value as Session & { mode?: string }).mode === 'server' || !value.tokens?.access_token || !value.tokens?.refresh_token || !value.profile?.id || !Number.isFinite(value.accessExpiresAt) || !Number.isFinite(value.refreshExpiresAt) || !['JOIN_BUILDING', 'REGISTER_VEHICLE', 'DONE'].includes(value.profile.onboarding_step) || (!IS_GUEST && value.refreshExpiresAt <= Date.now())) return null
    return value
  } catch { return null }
}
function readServerSession(): ServerSession | null {
  if (USE_MOCK) return null
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? 'null') as ServerSession | null
    if (value?.mode !== 'server' || !validTokens(value.tokens) || !value.tokens.user?.id) return null
    if (value.profile && value.profile.id !== value.tokens.user.id) return null
    return value
  } catch { return null }
}
function validTokens(value: Pick<AuthTokens, 'access_token' | 'refresh_token'>): boolean {
  return typeof value?.access_token === 'string' && !!value.access_token && typeof value?.refresh_token === 'string' && !!value.refresh_token
}
function persistServer() {
  try { if (serverSession) localStorage.setItem(KEY, JSON.stringify(serverSession)); else localStorage.removeItem(KEY) } catch { /* 저장소 제한 시 현재 탭 세션 유지 */ }
}
function cacheProfile(profile: UserMe, current: ServerSession | null) {
  // 로그아웃·계정 전환 후 도착한 이전 응답은 현재 세션을 덮지 않는다.
  if (!current || serverSession !== current || profile.id !== current.tokens.user.id) return
  current.profile = structuredClone(profile)
  current.tokens.user = { id: profile.id, nickname: profile.nickname, onboarding_step: profile.onboarding_step }
  persistServer()
}
async function startServerSession(path: '/auth/login' | '/auth/signup', body: LoginRequest | SignupRequest): Promise<AuthTokens> {
  const tokens = await request<AuthTokens>('POST', path, { body, auth: false })
  if (!validTokens(tokens) || !tokens.user?.id) throw new ApiError(502, 'UNKNOWN_ERROR', '인증 응답이 올바르지 않습니다.')
  const current: ServerSession = { mode: 'server', tokens: structuredClone(tokens), profile: null }
  serverSession = current
  pendingRefresh = null
  persistServer()
  try {
    const profile = await getMe()
    if (profile.id !== current.tokens.user.id) throw new ApiError(502, 'UNKNOWN_ERROR', '사용자 응답이 올바르지 않습니다.')
    if (serverSession !== current) throw new ApiError(401, 'UNAUTHORIZED', '로그인이 변경되었습니다. 다시 시도해 주세요.')
    return structuredClone(current.tokens)
  } catch (error) {
    if (serverSession === current) clearSession()
    throw error
  }
}
function persist() {
  if (session) {
    session.tokens.user = { id: session.profile.id, nickname: session.profile.nickname, onboarding_step: session.profile.onboarding_step }
    const account = accounts.get(session.profile.email)
    if (account) account.user = structuredClone(session.profile)
  }
  try { if (session) localStorage.setItem(KEY, JSON.stringify(session)); else localStorage.removeItem(KEY) } catch { /* 저장소 제한 시 현재 탭 세션 유지 */ }
}
export function clearSession() { session = null; serverSession = null; pendingRefresh = null; if (USE_MOCK) persist(); else persistServer() }
function unauthorized(): never { clearSession(); throw new ApiError(401, 'UNAUTHORIZED', '로그인이 필요합니다. 다시 로그인해 주세요.') }
export function requireMockSession(): void {
  if (!USE_MOCK) throw new ApiError(401, 'UNAUTHORIZED', '이 기능은 아직 서버에 연결되지 않았습니다.')
  if (!session || (!IS_GUEST && session.refreshExpiresAt <= Date.now())) unauthorized()
  if (session.accessExpiresAt <= Date.now()) {
    session.tokens.access_token = `mock.access.${crypto.randomUUID()}`
    session.accessExpiresAt = Date.now() + 30 * 60_000
    persist()
  }
}
export function getAccessToken(): string | null { return USE_MOCK ? session && session.accessExpiresAt > Date.now() ? session.tokens.access_token : null : serverSession?.tokens.access_token ?? null }
/** 로그인한 사용자의 빌라 역할. 로그인 전·빌라 미합류면 null (화면의 관리 메뉴 표시에 쓴다) */
export function getMyRole(): BuildingRole | null { return (USE_MOCK ? session?.profile : serverSession?.profile)?.building?.role ?? null }
export function getMyBuildingId(): number | null { return (USE_MOCK ? session?.profile : serverSession?.profile)?.building?.building_id ?? null }
export function getMockUserId(): number { requireMockSession(); return session!.profile.id }
function startSession(profile: UserMe): AuthTokens {
  session = { profile: structuredClone(profile), tokens: { access_token: `mock.access.${crypto.randomUUID()}`, refresh_token: `mock.refresh.${crypto.randomUUID()}`, user: { id: profile.id, nickname: profile.nickname, onboarding_step: profile.onboarding_step } }, accessExpiresAt: Date.now() + 30 * 60_000, refreshExpiresAt: Date.now() + 14 * 86400_000 }
  persist()
  return structuredClone(session.tokens)
}
const emailKey = (email: string) => email.trim().toLowerCase()
function invalid(message: string, field: string): never { throw new ApiError(400, 'INVALID_INPUT', message, { field }) }
// TODO(api): POST /auth/signup
export async function signup(body: SignupRequest): Promise<AuthTokens> {
  if (IS_GUEST) throw new ApiError(403, 'UNKNOWN_ERROR', '체험을 종료한 뒤 회원가입해 주세요.')
  if (!USE_MOCK) return startServerSession('/auth/signup', body)
  await mockDelay(undefined)
  const email = emailKey(body.email)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) invalid('이메일 형식을 확인해 주세요.', 'email')
  if (body.password.length < 8 || body.password.length > 128) invalid('비밀번호는 8~128자로 입력해 주세요.', 'password')
  if (!body.nickname.trim() || body.nickname.trim().length > 50) invalid('닉네임은 1~50자로 입력해 주세요.', 'nickname')
  if (!body.agree_terms) invalid('이용약관에 동의해 주세요.', 'agree_terms')
  if (accounts.has(email) || session?.profile.email === email) throw new ApiError(409, 'EMAIL_EXISTS', '이미 가입된 이메일입니다.')
  const user: UserMe = { id: Math.max(1, ...Array.from(accounts.values(), a => a.user.id), session?.profile.id ?? 1) + 1, email, nickname: body.nickname.trim(), name: null, phone: null, temperature: 36.5, token_balance: 500_000, onboarding_step: 'JOIN_BUILDING', building: null }
  accounts.set(email, { password: body.password, user })
  return startSession(user)
}
// TODO(api): POST /auth/login
export async function login(body: LoginRequest): Promise<AuthTokens> {
  if (IS_GUEST) throw new ApiError(403, 'UNKNOWN_ERROR', '체험을 종료한 뒤 로그인해 주세요.')
  if (!USE_MOCK) return startServerSession('/auth/login', body)
  await mockDelay(undefined)
  const account = accounts.get(emailKey(body.email))
  if (!account || account.password !== body.password) throw new ApiError(401, 'INVALID_CREDENTIALS', '이메일 또는 비밀번호가 올바르지 않습니다.')
  return startSession(account.user)
}
// TODO(api): POST /auth/refresh (서버 응답은 두 토큰만 반환)
export async function refreshToken(body: { refresh_token: string }): Promise<Pick<AuthTokens, 'access_token' | 'refresh_token'>> {
  if (!USE_MOCK) {
    if (!serverSession || body.refresh_token !== serverSession.tokens.refresh_token) throw new ApiError(401, 'UNAUTHORIZED', '로그인이 필요합니다. 다시 로그인해 주세요.')
    const tokens = await refreshTokens()
    return { access_token: tokens.access_token, refresh_token: tokens.refresh_token }
  }
  await mockDelay(undefined)
  if (!session || body.refresh_token !== session.tokens.refresh_token || session.refreshExpiresAt <= Date.now()) unauthorized()
  const tokens = startSession(session.profile)
  return { access_token: tokens.access_token, refresh_token: tokens.refresh_token }
}
export async function refreshTokens(): Promise<AuthTokens> {
  if (!USE_MOCK) {
    if (!serverSession) throw new ApiError(401, 'UNAUTHORIZED', '로그인이 필요합니다. 다시 로그인해 주세요.')
    if (pendingRefresh) return pendingRefresh
    const current = serverSession
    const operation = (async () => {
      try {
        const tokens = await request<Pick<AuthTokens, 'access_token' | 'refresh_token'>>('POST', '/auth/refresh', { body: { refresh_token: current.tokens.refresh_token }, auth: false })
        if (!validTokens(tokens)) throw new ApiError(502, 'UNKNOWN_ERROR', '인증 응답이 올바르지 않습니다.')
        if (serverSession !== current) throw new ApiError(401, 'UNAUTHORIZED', '로그인이 변경되었습니다. 다시 시도해 주세요.')
        current.tokens.access_token = tokens.access_token
        current.tokens.refresh_token = tokens.refresh_token
        persistServer()
        return structuredClone(current.tokens)
      } catch (error) {
        if (serverSession === current) clearSession()
        throw error
      }
    })()
    pendingRefresh = operation
    try { return await operation } finally { if (pendingRefresh === operation) pendingRefresh = null }
  }
  if (!session) unauthorized()
  await refreshToken({ refresh_token: session.tokens.refresh_token })
  return structuredClone(session!.tokens)
}
// TODO(api): GET /users/me
export async function getMe(): Promise<UserMe> {
  if (!USE_MOCK) {
    const current = serverSession
    const profile = await request<UserMe>('GET', '/users/me')
    cacheProfile(profile, current)
    return profile
  }
  await mockDelay(undefined); requireMockSession(); return structuredClone(session!.profile)
}
// TODO(api): PATCH /users/me
export async function updateMe(body: UpdateMeRequest): Promise<UserMe> {
  if (!USE_MOCK) {
    const current = serverSession
    const profile = await request<UserMe>('PATCH', '/users/me', { body })
    cacheProfile(profile, current)
    return profile
  }
  await mockDelay(undefined); requireMockSession()
  const profile = session!.profile
  if (body.name !== undefined && (!body.name.trim() || body.name.trim().length > 50)) invalid('이름은 1~50자로 입력해 주세요.', 'name')
  if (body.unit !== undefined && !profile.building) invalid('건물에 먼저 합류해 주세요.', 'unit')
  if (body.unit !== undefined && body.unit.trim().length > 50) invalid('동·호수는 50자 이하로 입력해 주세요.', 'unit')
  const digits = body.phone?.replace(/[-\s]/g, '')
  if (digits !== undefined && !/^01\d\d{7,8}$/.test(digits)) invalid('연락처 형식을 확인해 주세요.', 'phone')
  if (body.name !== undefined) profile.name = body.name.trim()
  if (body.unit !== undefined && profile.building) profile.building.unit = body.unit.trim() || null
  if (digits !== undefined) profile.phone = `${digits.slice(0, 3)}-****-${digits.slice(-4)}`
  persist(); return structuredClone(profile)
}
// TODO(api): POST /buildings/join
export async function joinBuilding(body: { invite_code: string }): Promise<JoinBuildingResponse> {
  if (!USE_MOCK) {
    const current = serverSession
    const result = await request<JoinBuildingResponse>('POST', '/buildings/join', { body })
    if (current?.profile && serverSession === current) {
      current.profile.building = { building_id: result.building_id, name: result.name, alley: result.alley, role: result.role, unit: null }
      current.profile.onboarding_step = result.onboarding_step
      cacheProfile(current.profile, current)
    }
    return result
  }
  await mockDelay(undefined); requireMockSession()
  if (session!.profile.building) throw new ApiError(409, 'ALREADY_IN_BUILDING', '이미 건물에 합류했어요.')
  const code = body.invite_code.replace(/\s/g, '').toUpperCase()
  if (!code || code.length > 12) invalid('초대코드는 1~12자로 입력해 주세요.', 'invite_code')
  if (code !== 'HANBIT01') throw new ApiError(404, 'INVALID_INVITE_CODE', '초대코드를 다시 확인해 주세요.')
  const result: JoinBuildingResponse = { building_id: 3, name: '월계 한빛빌라', address: '서울특별시 노원구 광운로19가길 12', alley: { id: 1, name: '광운로19가길' }, role: 'RESIDENT', onboarding_step: 'REGISTER_VEHICLE' }
  session!.profile.building = { building_id: result.building_id, name: result.name, alley: result.alley, role: result.role, unit: null }
  session!.profile.onboarding_step = result.onboarding_step
  persist(); return structuredClone(result)
}
// 목에서 차량 API가 첫 차량 등록 성공 후 호출. 실제 서버는 onboarding_step을 갱신한다.
export function completeVehicleOnboarding(): void { requireMockSession(); if (session!.profile.building) { session!.profile.onboarding_step = 'DONE'; persist() } }

/** 목 제보 성공 시 현재 계정의 보상을 세션/계정에 함께 반영한다. */
export function creditMockReportReward(amount: number): number {
  requireMockSession()
  session!.profile.token_balance += amount
  persist()
  return session!.profile.token_balance
}

export function debitGuestTokens(amount: number) {
  if (!IS_GUEST || !session || !Number.isFinite(amount) || amount < 0) throw new ApiError(403,'UNKNOWN_ERROR','체험 모드에서만 사용할 수 있어요.')
  requireMockSession()
  if (session.profile.token_balance < amount) throw new ApiError(409,'INSUFFICIENT_TOKENS','토큰이 부족해요.')
  session.profile.token_balance -= amount
  persist()
}
