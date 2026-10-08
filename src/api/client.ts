import { IS_GUEST, persistGuestState } from './guestMode'
import type { ErrorBody, ErrorCode, ErrorDetail } from '../types/api'

export type { ErrorCode, ErrorDetail, Page, PageQuery } from '../types/api'

// ── 목·서버 스위치 (#30) ──
// VITE_USE_MOCK=false 면 각 API 함수가 request() 로 VITE_API_BASE_URL 서버를 부른다. 기본은 목 (.env.example)
export const USE_MOCK = IS_GUEST || import.meta.env.VITE_USE_MOCK !== 'false'
export const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1').replace(/\/$/, '')

/** API 에러. 서버 응답 `{ error: { code, message, detail } }` + HTTP status */
export class ApiError extends Error {
  status: number
  code: ErrorCode
  detail: ErrorDetail
  constructor(status: number, code: ErrorCode, message: string, detail: ErrorDetail = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.detail = detail
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError

type Query = Record<string, string | number | boolean | null | undefined>
type RequestOptions = { query?: Query; body?: unknown; /** false 면 Bearer 를 붙이지 않고 401 재시도도 하지 않는다 (로그인·가입·토큰 갱신) */ auth?: boolean; responseType?: 'blob' }

const statusCode = (status: number): ErrorCode => status === 401 ? 'UNAUTHORIZED' : status === 404 ? 'NOT_FOUND' : status === 400 ? 'INVALID_INPUT' : 'UNKNOWN_ERROR'

function toUrl(path: string, query?: Query) {
  const params = new URLSearchParams()
  // URLSearchParams 가 '+' 를 %2B 로 인코딩한다 (expected_exit_at 의 +09:00)
  for (const [key, value] of Object.entries(query ?? {})) if (value !== undefined && value !== null) params.set(key, String(value))
  const search = params.toString()
  return `${BASE_URL}${path}${search ? `?${search}` : ''}`
}

async function toApiError(response: Response): Promise<ApiError> {
  const body = await response.json().catch(() => null) as Partial<ErrorBody> | null
  const error = body?.error
  if (error?.code) return new ApiError(response.status, error.code, error.message ?? '요청을 처리하지 못했어요.', error.detail ?? null)
  return new ApiError(response.status, statusCode(response.status), response.status >= 500 ? '서버에 문제가 생겼어요. 잠시 후 다시 시도해 주세요.' : '요청을 처리하지 못했어요.')
}

/** 실제 서버 호출. 실패하면 ApiError 를 던진다 (화면의 에러 처리는 목과 같다) */
export async function request<T>(method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', path: string, options: RequestOptions = {}): Promise<T> {
  if (IS_GUEST) throw new ApiError(403, 'UNKNOWN_ERROR', '체험 모드에서는 실제 서버에 요청할 수 없어요.')
  const { query, body, auth = true } = options
  // auth.ts 가 client.ts 를 import 하므로 순환을 피하려고 호출할 때 불러온다 (decisions D6: 토큰은 auth.ts 가 맡는다)
  const tokens = auth ? await import('./auth') : null
  const send = async () => {
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (body !== undefined && !(body instanceof FormData)) headers['Content-Type'] = 'application/json'
    const token = tokens?.getAccessToken()
    if (token) headers.Authorization = `Bearer ${token}`
    try {
      return await fetch(toUrl(path, query), { method, headers, body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body) })
    } catch {
      throw new ApiError(0, 'NETWORK_ERROR', '서버에 연결하지 못했어요. 네트워크를 확인해 주세요.')
    }
  }
  let response = await send()
  // 401 이면 토큰을 한 번만 갱신하고 다시 보낸다. 갱신도 실패하면 처음 401 을 그대로 던진다
  if (response.status === 401 && tokens) {
    const refreshed = await tokens.refreshTokens().then(() => true, () => false)
    if (refreshed) response = await send()
  }
  if (!response.ok) throw await toApiError(response)
  if (options.responseType === 'blob') return await response.blob() as T
  if (response.status === 204) return undefined as T
  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}

const wait = () => new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 200))

/** 목 응답: 200~400ms 뒤 값을 복사해서 돌려준다 (화면이 목데이터를 직접 바꾸지 못하게) */
export async function mockDelay<T>(value: T): Promise<T> {
  persistGuestState()
  await wait()
  return value === undefined ? value : structuredClone(value)
}

/** 목 에러: 200~400ms 뒤 ApiError 로 실패한다 */
export async function mockFail(status: number, code: ErrorCode, message: string, detail: ErrorDetail = null): Promise<never> {
  await wait()
  throw new ApiError(status, code, message, detail)
}

export const notFound = () => mockFail(404, 'NOT_FOUND', '대상을 찾을 수 없습니다.')
export const invalidInput = (message: string, detail: ErrorDetail = null) => mockFail(400, 'INVALID_INPUT', message, detail)
