import type { DateOnly, DateTime, Hour, Weekday } from './api'
import type { OccupantType } from './parking'

// 관리자 화면 타입 (docs/openapi-mock.yaml admin). 필드 이름은 API 그대로

export type ShareRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

// ── 대시보드 GET /admin/buildings/{id}/dashboard ──
export type AdminDashboardQuery = { /** YYYY-MM */ month?: string }
export type AdminPendingRequest = { id: number; requester: { name: string; temperature: number }; slot_label: string; request_date: DateOnly; start_hour: Hour; end_hour: Hour; total_price: number; created_at: DateTime }
export type AdminRealtimeVehicle = { slot_id: number; slot_label: string; plate: string; occupant_type: OccupantType; can_request_move: boolean }
export type CongestionDay = { date: DateOnly; peak_occupied: number }
export type AdminDashboard = {
  building: { id: number; name: string }
  /** 요청자 이름은 마스킹 (박○○) */
  pending_requests: AdminPendingRequest[]
  /** 외부·미확인 차량만 */
  realtime: { available_count: number; vehicles: AdminRealtimeVehicle[] }
  /** 이번 달은 오늘까지. month = 조회한 달 "YYYY-MM" (KST, 쿼리를 생략하면 서버 기준 이번 달, backend #35) */
  congestion: { month: string; total_slots: number; days: CongestionDay[] }
  /** 향후 기능. 지금은 항상 null */
  ai_insight: null
}

// ── 공유 요청 관리 ──
export type AdminShareRequestQuery = { status?: 'all' | ShareRequestStatus; /** 요청자 또는 차량번호 */ q?: string; cursor?: string }
export type AdminShareRequestItem = { id: number; requester: { name: string; unit: string }; plate: string | null; slot_label: string; request_date: DateOnly; start_hour: Hour; end_hour: Hour; total_price: number; status: ShareRequestStatus }
export type AdminShareRequestPage = { counts: Record<ShareRequestStatus, number>; items: AdminShareRequestItem[]; next_cursor: string | null }
export type ShareRequestDecision = { status: 'APPROVED' | 'REJECTED'; reject_reason?: string | null }
export type ShareRequestDecided = { id: number; status: ShareRequestStatus; reject_reason: string | null; responded_at: DateTime }

// ── 주차 구역 설정 ──
export type AdminSlot = { slot_id: number; zone_id: number; number: number; label: string; is_active: boolean; occupied: boolean; /** 공유 조건이 걸린 칸이면 id */ share_offer_id: number | null }
export type AdminSlotUpdate = { is_active: boolean }

// ── 공유 조건(차고지 등록) ──
export type ShareOfferFields = {
  /** 생략하면 매일 */
  weekdays?: Weekday[]
  start_hour: Hour
  end_hour: Hour
  /** 시간당 토큰. 0 = 무료 */
  hourly_price?: number
  /** null = 제한 없음 */
  max_hours?: number | null
  memo?: string | null
  /** false = 공유 중단 */
  is_public?: boolean
}
export type ShareOfferCreate = ShareOfferFields & { slot_ids: number[] }
export type ShareOffer = Required<ShareOfferFields> & { id: number; slot_id: number; slot_label: string; host_id: number }
export type ShareOfferUpdate = Partial<ShareOfferFields>
