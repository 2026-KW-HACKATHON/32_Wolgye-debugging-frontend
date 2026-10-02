// 주차 배치도 좌표 — Figma '월계디버깅 / 주차 배치도 SVG'(node 125:2)의 site-surface 기준 평면 좌표(px)

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

// 이 칸에서 나가려면 비어 있어야 하는 칸.
// P1~P6: 같은 줄의 통로 쪽 칸 + 같은 열의 입구 쪽 칸. P7·P8: 서로 막지 않음.
export const BLOCKED_BY: Record<SlotId, SlotId[]> = {
  P1: ['P3', 'P5'],
  P2: ['P1', 'P4', 'P6'],
  P3: ['P5'],
  P4: ['P3', 'P6'],
  P5: [],
  P6: ['P5'],
  P7: [],
  P8: [],
}

export type LotSlot = {
  id: SlotId
  state: 'empty' | 'occupied' | 'disabled'
  car?: { plate: string; mine: boolean; departure?: string; departureType?: 'registered' | 'estimated' }
}
