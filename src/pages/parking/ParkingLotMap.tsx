import type { KeyboardEvent, ReactNode } from 'react'
import { Box } from '@mui/material'
import { tones } from '../../theme'
import { AISLE, BUILDING, BUILDING_DOOR, ENTRANCE, SITE, SLOT_RECTS, WALLS, type LotSlot, type Rect, type SlotId } from './parkingLot'

export type LotView = 'top' | 'iso'

type Props = {
  slots: LotSlot[]
  view: LotView
  selected?: SlotId
  recommendedId?: SlotId
  onSelect?: (id: SlotId) => void
  onUnavailable?: (slot: LotSlot) => void
}

const colors = {
  ground: '#F2F4F7', groundEdge: '#D0D5DD', aisle: '#98A2B3',
  building: '#FFFFFF', buildingSide: '#E4E7EC', buildingRoof: '#F9FAFB', buildingLine: '#101828',
  wall: '#2E90FA',
  emptyFill: tones.mintSoft, emptyLine: '#2CA58D',
  recommendedFill: '#DDF6EE', disabledFill: '#EEF1F5', disabledLine: '#98A2B3',
  occupiedFill: '#FFFFFF', slotLine: '#D0D5DD',
  mineCar: tones.blue, neighborCar: '#B8C0CC', carWindow: '#1D2939',
}

// ── 2.5D 투영: 평면 (x, y) + 높이 z → 화면 좌표. 아래쪽(입구)이 시점 쪽이다.
const ISO_X = 0.78
const ISO_Y = 0.42
const BUILDING_HEIGHT = 100
const isoPoint = (x: number, y: number, z = 0): [number, number] => [(x - y) * ISO_X, (x + y) * ISO_Y - z]
const isoBounds = (() => {
  const corners = [isoPoint(0, 0), isoPoint(BUILDING.x, BUILDING.y, BUILDING_HEIGHT), isoPoint(SITE.w, 0), isoPoint(0, SITE.h), isoPoint(SITE.w, SITE.h)]
  const xs = corners.map(([x]) => x)
  const ys = corners.map(([, y]) => y)
  return { minX: Math.min(...xs) - 12, minY: Math.min(...ys) - 12, maxX: Math.max(...xs) + 12, maxY: Math.max(...ys) + 24 }
})()

const toPath = (points: [number, number][]) => points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ') + ' Z'
const isoRect = ({ x, y, w, h }: Rect, z = 0) => toPath([isoPoint(x, y, z), isoPoint(x + w, y, z), isoPoint(x + w, y + h, z), isoPoint(x, y + h, z)])

// 직육면체: 시점에서 보이는 윗면, 남쪽 면(+y), 동쪽 면(+x)
function IsoBox({ rect, z0 = 0, z1, top, side, front, stroke }: { rect: Rect; z0?: number; z1: number; top: string; side: string; front: string; stroke?: string }) {
  const { x, y, w, h } = rect
  const south = toPath([isoPoint(x, y + h, z0), isoPoint(x + w, y + h, z0), isoPoint(x + w, y + h, z1), isoPoint(x, y + h, z1)])
  const east = toPath([isoPoint(x + w, y, z0), isoPoint(x + w, y + h, z0), isoPoint(x + w, y + h, z1), isoPoint(x + w, y, z1)])
  return <g stroke={stroke} strokeWidth={stroke ? 1 : 0} strokeLinejoin="round"><path d={south} fill={front}/><path d={east} fill={side}/><path d={isoRect(rect, z1)} fill={top}/></g>
}

// 칸 안에 놓인 차 (차체 + 캐빈). 차 앞쪽은 통로/길 방향이라 신경 쓰지 않고 칸 중앙에 둔다.
function IsoCar({ slot, color, ghost }: { slot: Rect; color: string; ghost?: boolean }) {
  const portrait = slot.h >= slot.w
  const body: Rect = portrait ? { x: slot.x + slot.w * 0.24, y: slot.y + slot.h * 0.12, w: slot.w * 0.52, h: slot.h * 0.76 } : { x: slot.x + slot.w * 0.12, y: slot.y + slot.h * 0.2, w: slot.w * 0.76, h: slot.h * 0.6 }
  const cabin: Rect = portrait ? { x: body.x + body.w * 0.08, y: body.y + body.h * 0.3, w: body.w * 0.84, h: body.h * 0.4 } : { x: body.x + body.w * 0.3, y: body.y + body.h * 0.08, w: body.w * 0.4, h: body.h * 0.84 }
  return <g opacity={ghost ? 0.55 : 1}><IsoBox rect={body} z1={20} top={color} side={shade(color, -18)} front={shade(color, -30)}/><IsoBox rect={cabin} z0={20} z1={36} top={shade(color, 10)} side={colors.carWindow} front={colors.carWindow}/></g>
}

function TopCar({ slot, color, ghost }: { slot: Rect; color: string; ghost?: boolean }) {
  const portrait = slot.h >= slot.w
  const w = portrait ? slot.w * 0.52 : slot.w * 0.76
  const h = portrait ? slot.h * 0.76 : slot.h * 0.6
  const x = slot.x + (slot.w - w) / 2
  const y = slot.y + (slot.h - h) / 2
  const glass = portrait ? { x: x + w * 0.12, y: y + h * 0.28, w: w * 0.76, h: h * 0.42 } : { x: x + w * 0.28, y: y + h * 0.12, w: w * 0.42, h: h * 0.76 }
  return <g opacity={ghost ? 0.55 : 1}><rect x={x} y={y} width={w} height={h} rx={14} fill={color}/><rect {...{ x: glass.x, y: glass.y, width: glass.w, height: glass.h }} rx={8} fill={colors.carWindow} opacity={0.85}/></g>
}

// 밝기 조절 (#RRGGBB)
function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16)
  const clamp = (v: number) => Math.max(0, Math.min(255, v))
  const r = clamp((n >> 16) + amount), g = clamp(((n >> 8) & 255) + amount), b = clamp((n & 255) + amount)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function slotStyle(slot: LotSlot, recommended: boolean, selected: boolean) {
  if (slot.state === 'disabled') return { fill: colors.disabledFill, stroke: colors.disabledLine, dash: '6 6' }
  if (slot.state === 'occupied') return { fill: colors.occupiedFill, stroke: slot.car?.mine ? tones.blue : colors.slotLine, dash: undefined }
  return { fill: recommended ? colors.recommendedFill : colors.emptyFill, stroke: selected ? tones.blue : colors.emptyLine, dash: selected ? undefined : '8 6' }
}

// SVG 안의 작은 칩 라벨
function Tag({ x, y, label, color, bg, size = 13 }: { x: number; y: number; label: string; color: string; bg: string; size?: number }) {
  const width = label.length * size * 0.92 + 14
  return <g pointerEvents="none"><rect x={x - width / 2} y={y - size} width={width} height={size * 1.7} rx={size * 0.85} fill={bg}/><text x={x} y={y + size * 0.32} textAnchor="middle" fontSize={size} fontWeight={800} fill={color}>{label}</text></g>
}

export default function ParkingLotMap({ slots, view, selected, recommendedId, onSelect, onUnavailable }: Props) {
  const iso = view === 'iso'
  const tap = (slot: LotSlot) => slot.state === 'empty' ? onSelect?.(slot.id) : onUnavailable?.(slot)
  const onKey = (event: KeyboardEvent, slot: LotSlot) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); tap(slot) } }
  const center = (r: Rect) => iso ? isoPoint(r.x + r.w / 2, r.y + r.h / 2) : [r.x + r.w / 2, r.y + r.h / 2] as [number, number]
  const describe = (slot: LotSlot) => slot.state === 'disabled' ? '사용 불가' : slot.state === 'occupied' ? (slot.car?.mine ? '내 차 주차 중' : '이웃 차 주차 중') : slot.id === recommendedId ? '빈 칸, 추천' : '빈 칸'

  const slotLayer = slots.map((slot) => {
    const rect = SLOT_RECTS[slot.id]
    const isSelected = slot.id === selected
    const recommended = slot.id === recommendedId
    const style = slotStyle(slot, recommended, isSelected)
    const shape = iso ? <path className="slot-outline" d={isoRect(rect)} fill={style.fill} stroke={style.stroke} strokeWidth={isSelected ? 4 : 2.5} strokeDasharray={style.dash}/> : <rect className="slot-outline" x={rect.x} y={rect.y} width={rect.w} height={rect.h} rx={6} fill={style.fill} stroke={style.stroke} strokeWidth={isSelected ? 5 : 3} strokeDasharray={style.dash}/>
    return <g key={slot.id} role="button" tabIndex={0} aria-label={`${slot.id} · ${describe(slot)}`} aria-pressed={isSelected} onClick={() => tap(slot)} onKeyDown={(event) => onKey(event, slot)} style={{ cursor: 'pointer', outline: 'none' }}>{shape}</g>
  })

  // 차량과 라벨은 탭 대상(칸) 위에 그리되 포인터 이벤트를 막아 칸 탭을 방해하지 않게 한다.
  // 입체 시점에서는 먼 칸(x+y가 작은 칸)부터 그려 겹침 순서를 맞춘다.
  const ordered = [...slots].sort((a, b) => (SLOT_RECTS[a.id].x + SLOT_RECTS[a.id].y) - (SLOT_RECTS[b.id].x + SLOT_RECTS[b.id].y))
  const carLayer = ordered.map((slot) => {
    const rect = SLOT_RECTS[slot.id]
    const ghost = slot.state === 'empty' && slot.id === selected
    if (slot.state !== 'occupied' && !ghost) return null
    const color = slot.car?.mine || ghost ? colors.mineCar : colors.neighborCar
    return <g key={slot.id} pointerEvents="none">{iso ? <IsoCar slot={rect} color={color} ghost={ghost}/> : <TopCar slot={rect} color={color} ghost={ghost}/>}</g>
  })
  const labelLayer = ordered.map((slot) => {
    const rect = SLOT_RECTS[slot.id]
    const [cx, cy] = center(rect)
    const nameY = iso ? cy - (slot.state === 'occupied' || slot.id === selected ? 46 : 0) : rect.y + 26
    const labels: ReactNode[] = [<text key="name" x={iso ? cx : rect.x + 14} y={nameY} textAnchor={iso ? 'middle' : 'start'} fontSize={iso ? 15 : 22} fontWeight={800} fill={slot.state === 'disabled' ? colors.disabledLine : '#344054'} pointerEvents="none">{slot.id}</text>]
    if (slot.id === recommendedId && slot.state === 'empty') labels.push(<Tag key="rec" x={cx} y={iso ? nameY - 26 : cy + 4} label="★ 추천" color="#FFFFFF" bg="#12B76A" size={iso ? 13 : 18}/>)
    else if (slot.state === 'empty' && slot.id !== selected) labels.push(<Tag key="ok" x={cx} y={iso ? cy + 22 : cy + 4} label="가능" color="#087443" bg="#FFFFFF" size={iso ? 12 : 17}/>)
    if (slot.state === 'disabled') labels.push(<Tag key="no" x={cx} y={iso ? cy + 22 : cy + 4} label="사용 불가" color="#667085" bg="#FFFFFF" size={iso ? 12 : 17}/>)
    if (slot.car?.mine) labels.push(<Tag key="mine" x={cx} y={iso ? nameY - 26 : rect.y + rect.h - 14} label="내 차" color="#FFFFFF" bg={tones.blue} size={iso ? 13 : 16}/>)
    return <g key={slot.id}>{labels}</g>
  })

  if (iso) {
    const { minX, minY, maxX, maxY } = isoBounds
    const [entranceX, entranceY] = isoPoint(ENTRANCE.x + ENTRANCE.w / 2, ENTRANCE.y + ENTRANCE.h)
    const [doorX, doorY] = isoPoint(BUILDING_DOOR.x + BUILDING_DOOR.w / 2, BUILDING_DOOR.y + 20)
    return <MapFrame viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`} label="주차 배치도 (입체)">
      <path d={isoRect({ x: 0, y: 0, w: SITE.w, h: SITE.h })} fill={colors.ground} stroke={colors.groundEdge} strokeWidth={2}/>
      <path d={toPath([isoPoint(AISLE.x, AISLE.bottom), isoPoint(AISLE.x, AISLE.top)])} stroke={colors.aisle} strokeWidth={3} strokeDasharray="12 10" fill="none"/>
      {slotLayer}
      <IsoBox rect={BUILDING} z1={BUILDING_HEIGHT} top={colors.buildingRoof} side={colors.buildingSide} front="#D0D5DD" stroke={colors.buildingLine}/>
      <path d={toPath([isoPoint(BUILDING_DOOR.x, BUILDING.y + BUILDING.h, 0), isoPoint(BUILDING_DOOR.x + BUILDING_DOOR.w, BUILDING.y + BUILDING.h, 0), isoPoint(BUILDING_DOOR.x + BUILDING_DOOR.w, BUILDING.y + BUILDING.h, 46), isoPoint(BUILDING_DOOR.x, BUILDING.y + BUILDING.h, 46)])} fill="#475467"/>
      {WALLS.map((wall, index) => <IsoBox key={index} rect={wall} z1={28} top={colors.wall} side={shade(colors.wall, -30)} front={shade(colors.wall, -45)}/>)}
      {carLayer}
      {labelLayer}
      <Tag x={doorX} y={doorY + 16} label="건물 입구" color="#475467" bg="#FFFFFF" size={12}/>
      <Tag x={entranceX} y={entranceY + 6} label="골목 입구" color="#475467" bg="#FFFFFF" size={12}/>
    </MapFrame>
  }

  return <MapFrame viewBox={`-10 -10 ${SITE.w + 20} ${SITE.h + 56}`} label="주차 배치도 (평면)">
    <rect x={0} y={0} width={SITE.w} height={SITE.h} rx={8} fill={colors.ground} stroke={colors.groundEdge} strokeWidth={2}/>
    <rect x={BUILDING.x} y={BUILDING.y} width={BUILDING.w} height={BUILDING.h} fill={colors.building} stroke={colors.buildingLine} strokeWidth={6}/>
    <text x={BUILDING.x + BUILDING.w / 2} y={BUILDING.y + BUILDING.h / 2} textAnchor="middle" fontSize={34} fontWeight={800} fill={colors.buildingLine}>건물</text>
    <rect x={BUILDING_DOOR.x} y={BUILDING_DOOR.y - 4} width={BUILDING_DOOR.w} height={BUILDING_DOOR.h + 8} fill={colors.building}/>
    <path d={`M${BUILDING_DOOR.x + 6} ${BUILDING_DOOR.y + 4} v18 h70 v-18 M${BUILDING_DOOR.x + 41} ${BUILDING_DOOR.y + 4} v18`} stroke={colors.buildingLine} strokeWidth={3} fill="none"/>
    <text x={BUILDING_DOOR.x + BUILDING_DOOR.w / 2} y={BUILDING_DOOR.y - 14} textAnchor="middle" fontSize={16} fill="#475467">건물 입구</text>
    {WALLS.map((wall, index) => <rect key={index} x={wall.x} y={wall.y} width={wall.w} height={wall.h} rx={4} fill={colors.wall}/>)}
    <path d={`M${AISLE.x} ${AISLE.bottom} V${AISLE.top}`} stroke={colors.aisle} strokeWidth={4} strokeDasharray="14 12"/>
    <path d={`M${AISLE.x - 12} ${AISLE.top + 14} L${AISLE.x} ${AISLE.top} L${AISLE.x + 12} ${AISLE.top + 14}`} stroke={colors.aisle} strokeWidth={4} fill="none" strokeLinecap="round"/>
    <rect x={ENTRANCE.x} y={ENTRANCE.y} width={ENTRANCE.w} height={ENTRANCE.h} fill="#FFFFFF"/>
    <text x={AISLE.x} y={SITE.h + 34} textAnchor="middle" fontSize={18} fontWeight={800} fill="#475467">골목 입구</text>
    {slotLayer}
    {carLayer}
    {labelLayer}
  </MapFrame>
}

function MapFrame({ viewBox, label, children }: { viewBox: string; label: string; children: ReactNode }) {
  return <Box component="svg" viewBox={viewBox} role="group" aria-label={label} sx={{ display: 'block', width: '100%', height: 'auto', fontFamily: 'inherit', '& [role=button]:focus-visible .slot-outline': { stroke: tones.blueDark, strokeWidth: 6 } }}>{children}</Box>
}
