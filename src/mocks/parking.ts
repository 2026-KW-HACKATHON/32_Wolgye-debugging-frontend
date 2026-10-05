import type { BuildingRole, DateTime, Weekday } from '../types/api'
import { toLotSlots } from '../components/parkingLotGeometry'
import type { BuildingLayout, ExitSource, LayoutSlot, LotSlot, MoveRequestDetail, MoveRequestBox, NotificationItem, OccupantType, ParkingState, RecurringSchedule, SlotStatus } from '../types/parking'

// 목데이터 (docs/decisions.md 확정 값). 배치도 화면용 lotStatus 는 맨 아래에서 layout + slotStatuses() 로 만든다
// api/*.ts 의 쓰기 함수가 이 값을 직접 바꾼다 (새로고침하면 처음 값으로 돌아감)

/** 목 기준 시각 (2026-09-30 수요일 14:40 KST) */
export const MOCK_NOW: DateTime = '2026-09-30T14:40:00+09:00'
export const MY_BUILDING_ID = 3
export const MY_VEHICLE_ID = 7

export const me: { name: string; unit: string; role: BuildingRole; label: string } = { name: '김지수', unit: '101동 202호', role: 'RESIDENT', label: '101동 입주민' }

// rect = 배치도 px / 50 (src/components/parkingLotGeometry.ts PX_PER_METER). front_slot_id = 출구(통로) 쪽 앞 칸
// TODO(logic): 주차 구역(zone) 이름·묶음은 화면에 쓰지 않아 배치도 줄 단위 임시 값이다 (명세 example 의 구역 구성과 다름)
export const layout: BuildingLayout = {
  building_id: MY_BUILDING_ID,
  name: '월계 한빛빌라',
  alley: { id: 1, name: '광운로19가길' },
  zones: [
    { id: 10, name: '필로티 안쪽', zone_type: 'PILOTI_IN', sort_order: 0, slots: [
      { id: 1001, number: 1, label: 'P1', front_slot_id: null, is_active: true, rect: { x0: 9.1, y0: 0.8, x1: 11.6, y1: 3.3 } },
      { id: 1002, number: 2, label: 'P2', front_slot_id: 1001, is_active: true, rect: { x0: 12, y0: 0.8, x1: 14.5, y1: 3.3 } },
    ] },
    { id: 11, name: '필로티 외부', zone_type: 'PILOTI_OUT', sort_order: 1, slots: [
      { id: 1003, number: 1, label: 'P3', front_slot_id: null, is_active: true, rect: { x0: 9.1, y0: 3.7, x1: 11.6, y1: 6.2 } },
      { id: 1004, number: 2, label: 'P4', front_slot_id: 1003, is_active: true, rect: { x0: 12, y0: 3.7, x1: 14.5, y1: 6.2 } },
    ] },
    { id: 12, name: '건물 앞', zone_type: 'PILOTI_OUT', sort_order: 2, slots: [
      { id: 1005, number: 1, label: 'P5', front_slot_id: null, is_active: true, rect: { x0: 9.1, y0: 6.6, x1: 11.6, y1: 9.1 } },
      { id: 1006, number: 2, label: 'P6', front_slot_id: 1005, is_active: true, rect: { x0: 12, y0: 6.6, x1: 14.5, y1: 9.1 } },
    ] },
    { id: 13, name: '골목', zone_type: 'ROADSIDE', sort_order: 3, slots: [
      { id: 1007, number: 1, label: 'P7', front_slot_id: 1008, is_active: true, rect: { x0: 0.7, y0: 9.6, x1: 3.9, y1: 11.4 } },
      { id: 1008, number: 2, label: 'P8', front_slot_id: null, is_active: false, rect: { x0: 4.3, y0: 9.6, x1: 7.5, y1: 11.4 } },
    ] },
  ],
}

/** 서버의 주차 건 (parkings 테이블). 현황 API 는 이 값으로 만든다 */
export type MockParking = { id: number; slot_id: number; vehicle_id: number | null; plate: string; occupant_type: OccupantType; state: ParkingState; entered_at: DateTime; expected_exit_at: DateTime | null; exit_source: ExitSource; memo: string | null }

export const parkings: MockParking[] = [
  { id: 558, slot_id: 1001, vehicle_id: null, plate: '123가 4634', occupant_type: 'EXTERNAL', state: 'PARKED', entered_at: '2026-09-30T13:00:00+09:00', expected_exit_at: '2026-09-30T20:00:00+09:00', exit_source: 'NONE', memo: null },
  // 시연은 내 차가 주차 안 한 상태에서 시작한다 (2026-10-04 결정). 오늘 아침 P2에 있다가 출차한 기록만 남긴다
  { id: 556, slot_id: 1002, vehicle_id: MY_VEHICLE_ID, plate: '12가 3456', occupant_type: 'RESIDENT', state: 'EXITED', entered_at: '2026-09-30T08:30:00+09:00', expected_exit_at: '2026-09-30T18:30:00+09:00', exit_source: 'MANUAL', memo: null },
  { id: 557, slot_id: 1004, vehicle_id: null, plate: '27가 4821', occupant_type: 'RESIDENT', state: 'PARKED', entered_at: '2026-09-30T09:20:00+09:00', expected_exit_at: '2026-09-30T15:10:00+09:00', exit_source: 'RECURRING', memo: null },
  { id: 559, slot_id: 1006, vehicle_id: null, plate: '45다 6789', occupant_type: 'UNKNOWN', state: 'PARKED', entered_at: '2026-09-29T21:00:00+09:00', expected_exit_at: null, exit_source: 'NONE', memo: null },
  { id: 555, slot_id: 1007, vehicle_id: null, plate: '34나 5678', occupant_type: 'RESIDENT', state: 'PARKED', entered_at: '2026-09-30T12:10:00+09:00', expected_exit_at: '2026-09-30T15:30:00+09:00', exit_source: 'MANUAL', memo: null },
]

/** 막힘 관계 [막는 칸, 막힌 칸]. 판정은 백엔드 몫이라 목에서는 시나리오 값을 그대로 둔다 */
export const blocks: [number, number][] = []

/** 차량별 반복 일정 (차량당 하나) */
export const recurringByVehicle = new Map<number, RecurringSchedule>([[MY_VEHICLE_ID, { days: ['MON', 'TUE', 'WED', 'THU', 'FRI'], time: '07:30', memo: '출근 일정' }]])
export const WEEKDAYS_MON_FRI: Weekday[] = ['MON', 'TUE', 'WED', 'THU', 'FRI']

export type MockMoveRequest = MoveRequestDetail & { box: MoveRequestBox; target_parking_id: number }

// TODO(logic): 받은 이동 요청 44는 화면 시연용 임시 값. 내 차가 P2에 있을 때 받은 요청이고, 막힌 차량(P4)도 P2 뒤가 아니라 실제와 맞지 않는다
export const moveRequests: MockMoveRequest[] = [
  { id: 44, box: 'received', target_parking_id: 556, status: 'PENDING', requested_at: '2026-09-30T14:34:00+09:00', requester: { label: '101동 입주민' }, my_vehicle: { plate: '12가 3456', slot_label: 'P2', parked_at: '2026-09-30T08:30:00+09:00' }, blocked_vehicle: { plate: '27가 4821', slot_label: 'P4', needed_at: '2026-09-30T15:00:00+09:00' }, reason: '외출 예정으로 출차가 필요합니다. 차량 이동을 부탁드립니다.', responded_at: null },
]

export const notifications: NotificationItem[] = [
  { id: 92, type: 'BLOCK_ALERT', title: '막힘 알림', body: '내 차량이 P1 차량에 의해 막혀 있습니다.', link: { screen: 'HOME', id: null }, is_read: true, created_at: '2026-09-30T14:20:00+09:00' },
  { id: 91, type: 'MOVE_REQUEST', title: '주차 요청 도착', body: '101동 입주민', link: { screen: 'MOVE_REQUEST', id: 44 }, is_read: false, created_at: '2026-09-30T14:34:00+09:00' },
  { id: 90, type: 'EXIT_DONE', title: '출차 완료 안내', body: 'P5 비어 있음', link: null, is_read: true, created_at: '2026-09-30T14:30:00+09:00' },
  { id: 85, type: 'BLOCK_ALERT', title: '내일 출차 안내', body: '내 차량이 내일 07:30 출차하는 차량을 막고 있어요', link: { screen: 'HOME', id: null }, is_read: true, created_at: '2026-09-29T22:30:00+09:00' },
  { id: 80, type: 'SHARE_RESULT', title: '공유 요청이 거절되었어요', body: '주차 구역 용량 초과', link: { screen: 'SHARE_REQUEST', id: 301 }, is_read: true, created_at: '2026-09-29T17:00:00+09:00' },
]

// ── 목 상태에서 계산하는 값 (서버가 하는 일을 흉내) ──
export const allSlots = (): LayoutSlot[] => layout.zones.flatMap((zone) => zone.slots)
export const findSlot = (slotId: number) => allSlots().find((slot) => slot.id === slotId)
export const labelOf = (slotId: number) => findSlot(slotId)?.label ?? ''
export const parkedAt = (slotId: number) => parkings.find((parking) => parking.slot_id === slotId && parking.state === 'PARKED')
/** 1시간 이내 출차 */
export const isSoonExit = (exitAt: DateTime | null) => exitAt !== null && Date.parse(exitAt) - Date.parse(MOCK_NOW) <= 60 * 60 * 1000
export const minutesSince = (from: DateTime) => Math.max(0, Math.round((Date.parse(MOCK_NOW) - Date.parse(from)) / 60000))

/** isMine: 내 차량인지 (api/parking.ts 가 로그인한 사용자의 차량으로 넘긴다) */
export function slotStatuses(isMine: (vehicleId: number | null) => boolean = (vehicleId) => vehicleId === MY_VEHICLE_ID): SlotStatus[] {
  return allSlots().map((slot) => {
    const parking = parkedAt(slot.id)
    const state = !slot.is_active ? 'UNAVAILABLE' : !parking ? 'EMPTY' : isSoonExit(parking.expected_exit_at) ? 'SOON_EXIT' : 'OCCUPIED'
    return {
      slot_id: slot.id,
      state,
      parking: parking ? { id: parking.id, is_mine: isMine(parking.vehicle_id), plate: parking.plate, occupant_type: parking.occupant_type, expected_exit_at: parking.expected_exit_at, exit_source: parking.exit_source } : null,
      blocked_by: blocks.filter(([, blocked]) => blocked === slot.id).map(([blocker]) => blocker),
      blocking: blocks.filter(([blocker]) => blocker === slot.id).map(([, blocked]) => blocked),
    }
  })
}

// ── 화면용 파생 목 ──
// TODO(logic): 화면이 GET /buildings/{id}/layout + /status 를 불러 toLotSlots 로 바꾸게 되면 지운다 (#9~#13). 모듈을 처음 읽을 때의 상태라 쓰기 함수 결과는 반영되지 않는다
export const lotStatus: LotSlot[] = toLotSlots(layout, { updated_at: MOCK_NOW, slots: slotStatuses() })
