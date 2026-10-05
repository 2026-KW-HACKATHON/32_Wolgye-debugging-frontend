import type { BuildingRole, DateTime, Page, TimeOfDay, VehicleColor, Weekday } from './api'

// 배치도·홈·차량·주차·이동 요청·알림 타입 (docs/openapi-mock.yaml). 필드 이름은 API 그대로

export type SlotState = 'EMPTY' | 'SOON_EXIT' | 'OCCUPIED' | 'UNAVAILABLE'
export type SlotTag = 'RECOMMENDED' | 'EMPTY' | 'UNAVAILABLE'
export type OccupantType = 'RESIDENT' | 'EXTERNAL' | 'UNKNOWN'
export type ExitSource = 'MANUAL' | 'RECURRING' | 'AI_ESTIMATED' | 'NONE'
export type ParkingState = 'PARKED' | 'EXITED'
export type ZoneType = 'PILOTI_IN' | 'PILOTI_OUT' | 'ROADSIDE'
export type MoveRequestStatus = 'PENDING' | 'MOVED' | 'DECLINED'
export type NotificationType = 'BLOCK_ALERT' | 'MOVE_REQUEST' | 'EXIT_DONE' | 'SHARE_REQUEST' | 'SHARE_RESULT'
export type NotificationScreen = 'MOVE_REQUEST' | 'SHARE_REQUEST' | 'HOME'

export type AlleyRef = { id: number; name: string }

// ── 배치도 GET /buildings/{id}/layout ──
/** 건물 기준 로컬 좌표(미터) */
export type SlotRect = { x0: number; y0: number; x1: number; y1: number }
export type LayoutSlot = { id: number; number: number; label: string; front_slot_id: number | null; is_active: boolean; rect: SlotRect | null }
export type LayoutZone = { id: number; name: string; zone_type: ZoneType; sort_order: number; slots: LayoutSlot[] }
export type BuildingLayout = { building_id: number; name: string; alley: AlleyRef; zones: LayoutZone[] }

// ── 현황 GET /buildings/{id}/status ──
export type SlotParking = { id: number; is_mine: boolean; plate: string; occupant_type: OccupantType; expected_exit_at: DateTime | null; exit_source: ExitSource }
export type SlotStatus = { slot_id: number; state: SlotState; parking: SlotParking | null; blocked_by: number[]; blocking: number[] }
export type BuildingStatus = { updated_at: DateTime; slots: SlotStatus[] }

// ── 배치도 화면용 칸 (layout + status 를 합친 값. src/components/parkingLotGeometry.ts 의 toLotSlots) ──
/** 칸 키. API label(빌라 안 순번 P1, P2 …). 빌라 안에서 겹치지 않는다 */
export type SlotId = string
/** 배치도 평면 좌표(px, Figma site-surface 800×610 기준) = API rect(미터) × 50 */
export type LotRect = { x: number; y: number; w: number; h: number }
/** API SlotState(EMPTY·SOON_EXIT·OCCUPIED·UNAVAILABLE)와 같은 값 */
export type LotSlotState = 'empty' | 'soon_exit' | 'occupied' | 'unavailable'
/** API OccupantType(RESIDENT·EXTERNAL·UNKNOWN)과 같은 값 */
export type Occupant = 'resident' | 'external' | 'unknown'
export type LotSlot = {
  id: SlotId
  /** API slot_id */
  slotId: number
  /** 칸 이름. API label(빌라 안 순번 P1, P2 …)을 그대로 쓴다 */
  label: string
  rect: LotRect
  state: LotSlotState
  /** exitAt 은 "HH:mm" (KST). 출차 시간이 없으면 생략 */
  car?: { parkingId: number; plate: string; mine: boolean; occupant: Occupant; exitAt?: string }
  /** 이 칸의 차를 막고 있는 칸. 막힘 판정은 백엔드가 하고 FE는 표시만 한다 (API blocked_by) */
  blockedBy?: SlotId[]
}

// ── 알림 ──
export type NotificationLink = { screen: NotificationScreen; id: number | null }
export type NotificationItem = { id: number; type: NotificationType; title: string; body: string; link: NotificationLink | null; is_read: boolean; created_at: DateTime }
export type NotificationPage = Page<NotificationItem>

// ── 홈 GET /me/home ──
export type HomeSummary = { available: number; soon_exit: number; blocked: number; empty: number }
export type HomeMyParking = { parking_id: number; vehicle: { id: number; plate: string; color: string | null }; slot_label: string; state: ParkingState; expected_exit_at: DateTime | null }
export type BlockAlert = { blocking_parking_id: number; message: string }
export type Home = {
  building: { id: number; name: string; role: BuildingRole }
  unread_notification_count: number
  summary: HomeSummary
  my_parking: HomeMyParking | null
  /** null 이면 막힘 카드를 숨긴다 */
  block_alert: BlockAlert | null
  /** 관리자일 때만 */
  admin: { pending_share_requests: number } | null
  recent_notifications: NotificationItem[]
}

// ── 차량 목록 GET /me/vehicles ──
// TODO(logic): #16(효재)에서 src/types 차량 타입이 생기면 그쪽으로 옮긴다 (주차 안 한 상태에서 내 차량 id를 얻으려고 임시로 둠)
export type VehicleStatus = 'PARKED' | 'OUT'
export type VehicleListItem = { id: number; plate: string; alias: string | null; color: VehicleColor | null; is_default: boolean; status: VehicleStatus; status_text: string }

// ── 차량 상세 GET /me/vehicles/{id} ──
export type VehicleDetail = {
  id: number
  plate: string
  color: VehicleColor | null
  owner: { name: string; unit: string }
  parking: { parking_id: number; slot_id: number; slot_label: string; entered_at: DateTime; state: ParkingState } | null
  /** memo: 출차 예정이 온 일정의 메모 (RECURRING 이면 반복 일정 메모). 메모가 없거나 상시 주차면 null (backend #33·#34) */
  schedule: { expected_exit_at: DateTime | null; exit_source: ExitSource; elapsed_minutes: number; memo: string | null } | null
}

// ── 반복 일정 /me/vehicles/{id}/recurring-schedule ──
export type RecurringSchedule = { days: Weekday[]; time: TimeOfDay; memo?: string | null }

// ── 주차 배치 ──
export type SlotRecommendationQuery = { vehicle_id: number; /** 상시 주차면 생략 */ expected_exit_at?: DateTime }
export type SlotRecommendation = { slot_id: number; tag: SlotTag; label: string; reason?: string; will_block?: number[]; unavailable_reason?: string }
export type SlotRecommendations = { slots: SlotRecommendation[] }
export type ParkingCreate = { slot_id: number; vehicle_id: number; is_long_term?: boolean; expected_exit_at?: DateTime; /** 평일(월~금) 반복. 이름은 복수형이지만 boolean */ repeat_weekdays?: boolean; memo?: string }
export type ParkingCreated = { id: number; slot_id: number; state: ParkingState; expected_exit_at: DateTime | null; exit_source: ExitSource; blocking: number[] }
export type ParkingScheduleUpdate = { expected_exit_at: DateTime; memo?: string | null }
export type ParkingScheduleUpdated = { parking_id: number; expected_exit_at: DateTime; exit_source: ExitSource; memo: string | null }
export type ParkingExited = { id: number; state: ParkingState; actual_exit_at: DateTime; on_time: boolean }

// ── 이동 요청 ──
export type MoveRequestCreate = { target_parking_id: number; needed_at: DateTime; reason?: string | null }
export type MoveRequestCreated = { id: number; status: MoveRequestStatus }
export type MoveRequestDetail = {
  id: number
  status: MoveRequestStatus
  requested_at: DateTime
  /** 동까지만 ("101동 입주민") */
  requester: { label: string }
  /** 이동을 요청받은 차량 */
  my_vehicle: { plate: string; slot_label: string; parked_at: DateTime }
  /** 막힌 차량 */
  blocked_vehicle: { plate: string; slot_label: string; needed_at: DateTime }
  reason: string | null
  /** "옮겼어요"를 누른 시각. PENDING 이면 null (backend #33·#34) */
  responded_at: DateTime | null
}
export type MoveRequestDone = { id: number; status: MoveRequestStatus; responded_at: DateTime }
export type MoveRequestBox = 'received' | 'sent'
export type MoveRequestListItem = { id: number; status: MoveRequestStatus; requested_at: DateTime; counterpart_label: string; needed_at: DateTime }
