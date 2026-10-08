// 백엔드 API 공통 타입 (docs/openapi-mock.yaml components). 필드 이름은 API 그대로 snake_case

/** 400 INVALID_INPUT · 401 UNAUTHORIZED, INVALID_CREDENTIALS · 403 NOT_BUILDING_MEMBER, NOT_BUILDING_ADMIN · 404 NOT_FOUND, INVALID_INVITE_CODE · 나머지 409 */
export type ErrorCode =
  | 'INVALID_INPUT'
  | 'UNAUTHORIZED'
  | 'INVALID_CREDENTIALS'
  | 'NOT_BUILDING_MEMBER'
  | 'NOT_BUILDING_ADMIN'
  | 'NOT_FOUND'
  | 'INVALID_INVITE_CODE'
  | 'CONFLICT'
  | 'EMAIL_EXISTS'
  | 'SLOT_OCCUPIED'
  | 'SLOT_UNAVAILABLE'
  | 'VEHICLE_ALREADY_PARKED'
  | 'GARAGE_TIME_CONFLICT'
  | 'PLATE_EXISTS'
  | 'REPORT_LIMIT_EXCEEDED'
  | 'ALREADY_DECIDED'
  | 'MOVE_REQUEST_ALREADY_PENDING'
  | 'ALREADY_IN_BUILDING'
  | 'INSUFFICIENT_TOKENS'
  // 아래 둘은 FE 전용 (서버 응답이 아님): 서버에 닿지 못함(status 0) / 에러 본문이 { error } 모양이 아님
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR'

export type ErrorDetail = Record<string, unknown> | null

/** 에러 응답 본문 `{ error: { code, message, detail } }` */
export type ErrorBody = { error: { code: ErrorCode; message: string; detail: ErrorDetail } }

/** `?cursor=&limit=` 목록 응답. 더 없으면 next_cursor: null */
export type Page<T> = { items: T[]; next_cursor: string | null }
export type PageQuery = { cursor?: string; limit?: number }

/** KST ISO 8601 (`2026-09-30T14:40:00+09:00`) */
export type DateTime = string
/** 날짜만 (`2026-09-30`) */
export type DateOnly = string
/** 시각만 (`07:30`) */
export type TimeOfDay = string
/** 정시 단위 시각 0~24 (24 = 자정) */
export type Hour = number

export type Weekday = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'
export const WEEKDAYS: Weekday[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export type BuildingRole = 'RESIDENT' | 'ADMIN'
export type VehicleColor = '검정' | '흰색' | '은색' | '회색' | '파랑' | '빨강' | '기타'
