import type { ErrorCode, ErrorDetail } from '../types/api'

export type { ErrorCode, ErrorDetail, Page, PageQuery } from '../types/api'

// TODO(api): 서버 연결 시 여기에 BASE_URL('http://localhost:8000/api/v1')과 request() 를 둔다.
// Bearer 헤더는 src/api/auth.ts(효재)의 getAccessToken(), 401이면 refreshTokens() 후 한 번 재시도 (docs/decisions.md D6, docs/api-layer.md)

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

const wait = () => new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 200))

/** 목 응답: 200~400ms 뒤 값을 복사해서 돌려준다 (화면이 목데이터를 직접 바꾸지 못하게) */
export async function mockDelay<T>(value: T): Promise<T> {
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
