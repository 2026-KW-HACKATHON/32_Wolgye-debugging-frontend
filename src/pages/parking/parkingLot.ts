// 주차 배치도 좌표 — Figma '월계디버깅 / 주차베치도 후보 / 주차 배치도 SVG'(node 125:2)의 site-surface 기준 평면 좌표(px)

export type Rect = { x: number; y: number; w: number; h: number }

export const SITE = { w: 800, h: 610 }
export const BUILDING: Rect = { x: 35, y: 35, w: 350, h: 405 }
// 건물 입구(P7·P8 사이 위쪽)
export const BUILDING_DOOR: Rect = { x: 169, y: 434, w: 82, h: 12 }
// 사이트 경계 벽: 위쪽(가로), 오른쪽(세로)
export const WALLS: Rect[] = [
  { x: 420, y: 6, w: 364, h: 8 },
  { x: 776, y: 6, w: 8, h: 584 },
]
// 통로 중심선과 차량 진입구
export const AISLE = { x: 405, top: 70, bottom: 560 }
export const ENTRANCE: Rect = { x: 395, y: 581, w: 20, h: 29 }

export type SlotId = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7' | 'P8'

// TODO(logic): 칸 좌표는 API GET /buildings/{id}/layout 의 rect(건물 기준 미터)로 바꾼다 (docs/spec-gap.md 2-3)
export const SLOT_RECTS: Record<SlotId, Rect> = {
  P1: { x: 455, y: 40, w: 125, h: 125 },
  P2: { x: 600, y: 40, w: 125, h: 125 },
  P3: { x: 455, y: 185, w: 125, h: 125 },
  P4: { x: 600, y: 185, w: 125, h: 125 },
  P5: { x: 455, y: 330, w: 125, h: 125 },
  P6: { x: 600, y: 330, w: 125, h: 125 },
  P7: { x: 35, y: 480, w: 160, h: 90 },
  P8: { x: 215, y: 480, w: 160, h: 90 },
}

/** API SlotState(EMPTY·SOON_EXIT·OCCUPIED·UNAVAILABLE)와 같은 값 */
export type LotSlotState = 'empty' | 'soon_exit' | 'occupied' | 'unavailable'
/** API OccupantType(RESIDENT·EXTERNAL·UNKNOWN)과 같은 값 */
export type Occupant = 'resident' | 'external' | 'unknown'

export type LotSlot = {
  id: SlotId
  /** 칸 이름. API label("필로티 안쪽 1번")을 그대로 쓴다. 카드·안내 문구에 쓴다 */
  label: string
  /** 배치도 칩에 쓰는 짧은 이름 (Figma 배치도의 P1~P8) */
  short: string
  state: LotSlotState
  car?: { plate: string; mine: boolean; occupant: Occupant; exitAt?: string }
  /** 이 칸의 차를 막고 있는 칸. 막힘 판정은 백엔드가 하고 FE는 표시만 한다 (API blocked_by) */
  blockedBy?: SlotId[]
}

// TODO(logic): P1~P8 ↔ 주차 구역·번호 매핑이 정해지지 않아 label은 Figma 와이어프레임 문구에 맞춘 임시 값이다 (docs/spec-gap.md D1)
// TODO(logic): 빌라 현황을 API GET /buildings/{id}/status 로 불러오기
export const lotStatus: LotSlot[] = [
  { id: 'P1', short: 'P1', label: '필로티 외부 1번', state: 'occupied', car: { plate: '123가 4634', mine: false, occupant: 'external', exitAt: '17:00' } },
  { id: 'P2', short: 'P2', label: '필로티 안쪽 2번', state: 'occupied', car: { plate: '12가 3456', mine: true, occupant: 'resident', exitAt: '18:30' }, blockedBy: ['P1'] },
  { id: 'P3', short: 'P3', label: '골목 1번', state: 'empty' },
  { id: 'P4', short: 'P4', label: '필로티 안쪽 1번', state: 'soon_exit', car: { plate: '27가 4821', mine: false, occupant: 'resident', exitAt: '15:10' } },
  { id: 'P5', short: 'P5', label: '골목 2번', state: 'empty' },
  { id: 'P6', short: 'P6', label: '건물 앞 3번', state: 'occupied', car: { plate: '45다 6789', mine: false, occupant: 'unknown' } },
  { id: 'P7', short: 'P7', label: '건물 앞 1번', state: 'soon_exit', car: { plate: '34나 5678', mine: false, occupant: 'resident', exitAt: '15:30' } },
  { id: 'P8', short: 'P8', label: '건물 앞 2번', state: 'unavailable' },
]

export const slotById = (slots: LotSlot[], id: SlotId) => slots.find((slot) => slot.id === id)
