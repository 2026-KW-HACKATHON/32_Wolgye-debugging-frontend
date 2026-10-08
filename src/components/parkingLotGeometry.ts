import { siteFor } from '../api/sites'
import type { BuildingLayout, BuildingStatus, Lot, LotRect, LotShape, LotSlot, LotSlotState, Occupant, OccupantType, SlotId, SlotRect, SlotState } from '../types/parking'
import type { GarageDetail } from '../types/sharedParking'

// 빌라 모양(건물·벽·통로·입구)과 칸 좌표는 사이트 파일(src/sites/*.json, src/api/sites.ts)에 있다 (FE #56).
// 칸 상태는 API 에서 받아 칸 이름(P1…)으로 합친다. 칸 좌표는 사이트 파일에 있으면 그 값, 없으면 서버 rect 를 쓴다

/** API rect(건물 기준 미터) → 배치도 px */
export const PX_PER_METER = 50
const px = (meter: number) => Math.round(meter * PX_PER_METER)
export const toLotRect = ({ x0, y0, x1, y1 }: SlotRect): LotRect => ({ x: px(x0), y: px(y0), w: px(x1) - px(x0), h: px(y1) - px(y0) })

const lotState: Record<SlotState, LotSlotState> = { EMPTY: 'empty', SOON_EXIT: 'soon_exit', OCCUPIED: 'occupied', UNAVAILABLE: 'unavailable' }
const occupant: Record<OccupantType, Occupant> = { RESIDENT: 'resident', EXTERNAL: 'external', UNKNOWN: 'unknown' }
// 응답 시각은 KST ISO 8601 ("2026-09-30T18:30:00+09:00") → "18:30"
const hhmm = (dateTime: string) => dateTime.slice(11, 16)

/** 사이트 파일이 없는 빌라: 칸이 모두 들어가는 땅만 그린다 (건물·벽 없음) */
export function plainShape(name: string, slots: LotSlot[]): LotShape {
  const margin = 35
  const w = Math.max(400, ...slots.map(({ rect }) => rect.x + rect.w + margin))
  const h = Math.max(300, ...slots.map(({ rect }) => rect.y + rect.h + margin))
  return { name, site: { w, h }, slots: {} }
}

/** GET /buildings/{id}/layout + GET /buildings/{id}/status → 배치도. 막힘은 판정하지 않고 blocked_by 를 칸 이름으로 바꿔 옮기기만 한다 */
export function toLot(layout: BuildingLayout, status: BuildingStatus): Lot {
  const site = siteFor(layout)
  const slots = layout.zones.flatMap((zone) => zone.slots)
  const labels = new Map(slots.map((slot) => [slot.id, slot.label]))
  const statuses = new Map(status.slots.map((slot) => [slot.slot_id, slot]))
  // TODO(logic): 사이트 파일에도 없고 rect 도 null 인 칸(좌표 미등록)은 배치도에 그릴 수 없어 뺀다. 목록으로 따로 보여줄지 정해지지 않았다
  const lotSlots = slots.flatMap((slot) => {
    const rect = site?.slots[slot.label] ?? (slot.rect ? toLotRect(slot.rect) : null)
    if (!rect) return []
    const current = statuses.get(slot.id)
    const parking = current?.parking
    const blockedBy = (current?.blocked_by ?? []).map((id) => labels.get(id)).filter((label): label is string => Boolean(label))
    const lotSlot: LotSlot = { id: slot.label, slotId: slot.id, label: slot.label, rect, state: current ? lotState[current.state] : 'unavailable' }
    if (parking) lotSlot.car = { parkingId: parking.id, plate: parking.plate, mine: parking.is_mine, occupant: occupant[parking.occupant_type], ...(parking.expected_exit_at ? { exitAt: hhmm(parking.expected_exit_at) } : {}) }
    if (blockedBy.length) lotSlot.blockedBy = blockedBy
    return [lotSlot]
  })
  return { shape: site ?? plainShape(layout.name, lotSlots), slots: lotSlots }
}

const garageState: Record<GarageDetail['slots'][number]['state'], LotSlotState> = { AVAILABLE: 'empty', SOON_EXIT: 'soon_exit', IN_USE: 'occupied' }

/**
 * GET /garages/{id} → 공유 칸만 그린 배치도. 차고지 상세는 칸 좌표가 응답에 없어 사이트 파일이 있어야 그린다 (없으면 null → 목록만).
 * 이용 중인 칸의 차는 누구 차인지 모르므로 이웃 차로 그린다
 */
export function toGarageLot(garage: GarageDetail): Lot | null {
  const site = siteFor(garage)
  if (!site) return null
  const slots = garage.slots.flatMap((slot): LotSlot[] => {
    const rect = site.slots[slot.label]
    if (!rect) return []
    const state = garageState[slot.state]
    const exitAt = slot.estimated_free_at ?? slot.in_use_until
    const car = { parkingId: 0, plate: '', mine: false, occupant: 'resident' as const, ...(exitAt ? { exitAt: hhmm(exitAt) } : {}) }
    return [{ id: slot.label, slotId: slot.slot_id, label: slot.label, rect, state, ...(state === 'empty' ? {} : { car }) }]
  })
  return slots.length ? { shape: site, slots } : null
}

export const slotById = (slots: LotSlot[], id: SlotId) => slots.find((slot) => slot.id === id)
