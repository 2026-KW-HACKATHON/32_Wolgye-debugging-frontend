import type { BuildingLayout, BuildingStatus, LotRect, LotSlot, LotSlotState, Occupant, OccupantType, SlotId, SlotRect, SlotState } from '../types/parking'

// 주차 배치도 FE 상수 — Figma '월계디버깅 / 주차베치도 후보 / 주차 배치도 SVG'(node 125:2)의 site-surface 기준 평면 좌표(px)
// 건물·벽·통로·입구는 FE 상수로 둔다 (docs/decisions.md D3). 칸 좌표·상태는 API 에서 받아 toLotSlots 로 바꾼다

export const SITE = { w: 800, h: 610 }
export const BUILDING: LotRect = { x: 35, y: 35, w: 350, h: 405 }
// 건물 입구(P7·P8 사이 위쪽)
export const BUILDING_DOOR: LotRect = { x: 169, y: 434, w: 82, h: 12 }
// 사이트 경계 벽: 위쪽(가로), 오른쪽(세로)
export const WALLS: LotRect[] = [
  { x: 420, y: 6, w: 364, h: 8 },
  { x: 776, y: 6, w: 8, h: 584 },
]
// 통로 중심선과 차량 진입구
export const AISLE = { x: 405, top: 70, bottom: 560 }
export const ENTRANCE: LotRect = { x: 395, y: 581, w: 20, h: 29 }

/** API rect(건물 기준 미터) → 배치도 px */
export const PX_PER_METER = 50
const px = (meter: number) => Math.round(meter * PX_PER_METER)
export const toLotRect = ({ x0, y0, x1, y1 }: SlotRect): LotRect => ({ x: px(x0), y: px(y0), w: px(x1) - px(x0), h: px(y1) - px(y0) })

const lotState: Record<SlotState, LotSlotState> = { EMPTY: 'empty', SOON_EXIT: 'soon_exit', OCCUPIED: 'occupied', UNAVAILABLE: 'unavailable' }
const occupant: Record<OccupantType, Occupant> = { RESIDENT: 'resident', EXTERNAL: 'external', UNKNOWN: 'unknown' }
// 응답 시각은 KST ISO 8601 ("2026-09-30T18:30:00+09:00") → "18:30"
const hhmm = (dateTime: string) => dateTime.slice(11, 16)

/** GET /buildings/{id}/layout + GET /buildings/{id}/status → 배치도 칸. 막힘은 판정하지 않고 blocked_by 를 칸 이름으로 바꿔 옮기기만 한다 */
export function toLotSlots(layout: BuildingLayout, status: BuildingStatus): LotSlot[] {
  const slots = layout.zones.flatMap((zone) => zone.slots)
  const labels = new Map(slots.map((slot) => [slot.id, slot.label]))
  const statuses = new Map(status.slots.map((slot) => [slot.slot_id, slot]))
  // TODO(logic): rect 가 null 인 칸(좌표 미등록)은 배치도에 그릴 수 없어 뺀다. 목록으로 따로 보여줄지 정해지지 않았다
  return slots.flatMap((slot) => {
    if (!slot.rect) return []
    const current = statuses.get(slot.id)
    const parking = current?.parking
    const blockedBy = (current?.blocked_by ?? []).map((id) => labels.get(id)).filter((label): label is string => Boolean(label))
    const lotSlot: LotSlot = { id: slot.label, slotId: slot.id, label: slot.label, rect: toLotRect(slot.rect), state: current ? lotState[current.state] : 'unavailable' }
    if (parking) lotSlot.car = { parkingId: parking.id, plate: parking.plate, mine: parking.is_mine, occupant: occupant[parking.occupant_type], ...(parking.expected_exit_at ? { exitAt: hhmm(parking.expected_exit_at) } : {}) }
    if (blockedBy.length) lotSlot.blockedBy = blockedBy
    return [lotSlot]
  })
}

export const slotById = (slots: LotSlot[], id: SlotId) => slots.find((slot) => slot.id === id)
