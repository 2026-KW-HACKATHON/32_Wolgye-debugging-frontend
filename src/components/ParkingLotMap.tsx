import type { KeyboardEvent, ReactNode } from 'react'
import { Box } from '@mui/material'
import { tones } from '../theme'
import type { LotBlock, LotRect as Rect, LotShape, LotSlot, Occupant, SlotId } from '../types/parking'

export type LotView = 'top' | 'iso'

type Props = {
  /** 빌라 모양 (사이트 파일 또는 땅만 있는 기본 모양, parkingLotGeometry 의 toLot) */
  shape: LotShape
  slots: LotSlot[]
  view?: LotView
  /** 'admin'이면 차 색을 입주민(파랑)·외부(주황)·미확인(빨강)으로 나눈다. 차량 번호는 칸을 누르면 화면이 보여 준다 (onInspect) */
  variant?: 'resident' | 'admin'
  selected?: SlotId
  recommendedId?: SlotId
  /** 이 칸만 진하게, 나머지는 흐리게 (차량 상세, 선택 칸 미리보기) */
  focusId?: SlotId
  /** 넘기면 칸을 탭할 수 있다. 빈 칸 → onSelect, 그 밖의 칸 → onUnavailable */
  onSelect?: (id: SlotId) => void
  onUnavailable?: (slot: LotSlot) => void
  /** 홈에서 상태에 관계없이 칸 정보를 확인한다 */
  onInspect?: (slot: LotSlot) => void
}

const colors = {
  ground: '#F2F4F7', groundEdge: '#D0D5DD', aisle: '#98A2B3',
  building: '#FFFFFF', buildingSide: '#E4E7EC', buildingRoof: '#F9FAFB', buildingLine: '#101828',
  wall: '#2E90FA',
  emptyFill: tones.mintSoft, emptyLine: '#2CA58D',
  recommendedFill: '#DDF6EE', disabledFill: '#EEF1F5', disabledLine: '#98A2B3',
  occupiedFill: '#FFFFFF', slotLine: '#D0D5DD',
  mineCar: tones.blue, neighborCar: '#B8C0CC', carWindow: '#1D2939',
  soonBg: '#FFF6D8', soonText: '#986D05',
}

const occupantColor: Record<Occupant, { car: string; tagBg: string; tagText: string }> = {
  resident: { car: '#6E9BFF', tagBg: '#E8F0FF', tagText: tones.blueDark },
  external: { car: tones.orange, tagBg: tones.orangeSoft, tagText: '#B95515' },
  unknown: { car: tones.red, tagBg: tones.redSoft, tagText: '#B82D3B' },
}

// ── 2.5D 투영: 평면 (x, y) + 높이 z → 화면 좌표. 아래쪽(입구)이 시점 쪽이다.
const ISO_X = 0.78
const ISO_Y = 0.52
// 높이·글자 크기는 800×610px 사이트(한빛빌라) 기준이다. 그려지는 폭에 맞춰 줄이거나 늘린다 (scale)
// 입체는 화면 폭이 사이트 폭+길이에 비례하고, 평면은 사이트 폭에 비례한다
const BUILDING_HEIGHT = 80
// floors 가 있는 사이트 파일의 한 층 높이 기본값 (floorHeight 가 없을 때)
const FLOOR_HEIGHT = 40
const isoPoint = (x: number, y: number, z = 0): [number, number] => [(x - y) * ISO_X, (x + y) * ISO_Y - z]
/** 땅 네 모서리 + 높이 있는 도형의 가장 먼 윗모서리까지 들어가는 범위 */
const isoBounds = ({ site }: LotShape, tops: [Rect, number][], scale: number) => {
  const corners = [isoPoint(0, 0), isoPoint(site.w, 0), isoPoint(0, site.h), isoPoint(site.w, site.h), ...tops.flatMap(([r, z]) => [isoPoint(r.x, r.y, z), isoPoint(r.x + r.w, r.y, z), isoPoint(r.x, r.y + r.h, z)])]
  const xs = corners.map(([x]) => x)
  const ys = corners.map(([, y]) => y)
  return { minX: Math.min(...xs) - 12 * scale, minY: Math.min(...ys) - 40 * scale, maxX: Math.max(...xs) + 12 * scale, maxY: Math.max(...ys) + 40 * scale }
}

// 화면 폭(약 360px)에서 글자가 읽히도록 정한 SVG 단위 글자 크기 (폭 800px 사이트 기준)
const FONT = { iso: { tag: 34 }, top: { tag: 28 } }

const toPath = (points: [number, number][]) => points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ') + ' Z'
const isoRect = ({ x, y, w, h }: Rect, z = 0) => toPath([isoPoint(x, y, z), isoPoint(x + w, y, z), isoPoint(x + w, y + h, z), isoPoint(x, y + h, z)])

// 직육면체: 시점에서 보이는 윗면, 남쪽 면(+y), 동쪽 면(+x)
function IsoBox({ rect, z0 = 0, z1, top, side, front, stroke }: { rect: Rect; z0?: number; z1: number; top: string; side: string; front: string; stroke?: string }) {
  const { x, y, w, h } = rect
  const south = toPath([isoPoint(x, y + h, z0), isoPoint(x + w, y + h, z0), isoPoint(x + w, y + h, z1), isoPoint(x, y + h, z1)])
  const east = toPath([isoPoint(x + w, y, z0), isoPoint(x + w, y + h, z0), isoPoint(x + w, y + h, z1), isoPoint(x + w, y, z1)])
  return <g stroke={stroke} strokeWidth={stroke ? 1 : 0} strokeLinejoin="round"><path d={south} fill={front}/><path d={east} fill={side}/><path d={isoRect(rect, z1)} fill={top}/></g>
}

// 칸 안에 놓인 차 (차체 + 캐빈). 칸 중앙에 둔다.
function IsoCar({ slot, color, ghost, scale }: { slot: Rect; color: string; ghost?: boolean; scale: number }) {
  const portrait = slot.h >= slot.w
  const body: Rect = portrait ? { x: slot.x + slot.w * 0.24, y: slot.y + slot.h * 0.12, w: slot.w * 0.52, h: slot.h * 0.76 } : { x: slot.x + slot.w * 0.12, y: slot.y + slot.h * 0.2, w: slot.w * 0.76, h: slot.h * 0.6 }
  const cabin: Rect = portrait ? { x: body.x + body.w * 0.08, y: body.y + body.h * 0.3, w: body.w * 0.84, h: body.h * 0.4 } : { x: body.x + body.w * 0.3, y: body.y + body.h * 0.08, w: body.w * 0.4, h: body.h * 0.84 }
  return <g opacity={ghost ? 0.55 : 1}><IsoBox rect={body} z1={20 * scale} top={color} side={shade(color, -18)} front={shade(color, -30)}/><IsoBox rect={cabin} z0={20 * scale} z1={36 * scale} top={shade(color, 10)} side={colors.carWindow} front={colors.carWindow}/></g>
}

function TopCar({ slot, color, ghost, scale }: { slot: Rect; color: string; ghost?: boolean; scale: number }) {
  const portrait = slot.h >= slot.w
  const w = portrait ? slot.w * 0.52 : slot.w * 0.76
  const h = portrait ? slot.h * 0.76 : slot.h * 0.6
  const x = slot.x + (slot.w - w) / 2
  const y = slot.y + (slot.h - h) / 2
  const glass = portrait ? { x: x + w * 0.12, y: y + h * 0.28, w: w * 0.76, h: h * 0.42 } : { x: x + w * 0.28, y: y + h * 0.12, w: w * 0.42, h: h * 0.76 }
  return <g opacity={ghost ? 0.55 : 1}><rect x={x} y={y} width={w} height={h} rx={14 * scale} fill={color}/><rect {...{ x: glass.x, y: glass.y, width: glass.w, height: glass.h }} rx={8 * scale} fill={colors.carWindow} opacity={0.85}/></g>
}

// 밝기 조절 (#RRGGBB)
function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16)
  const clamp = (v: number) => Math.max(0, Math.min(255, v))
  const r = clamp((n >> 16) + amount), g = clamp(((n >> 8) & 255) + amount), b = clamp((n & 255) + amount)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

// 글자 폭 추정: 한글은 글자 크기만큼, 영문·숫자·기호는 0.6배
const textWidth = (label: string, size: number) => [...label].reduce((sum, ch) => sum + (/[가-힣★]/.test(ch) ? size : ch === ' ' ? size * 0.3 : size * 0.6), 0)

// SVG 안의 칩 라벨
function Tag({ x, y, label, color, bg, size, stroke }: { x: number; y: number; label: string; color: string; bg: string; size: number; stroke?: string }) {
  const width = textWidth(label, size) + size * 0.9
  return <g pointerEvents="none"><rect x={x - width / 2} y={y - size} width={width} height={size * 1.6} rx={size * 0.8} fill={bg} stroke={stroke} strokeWidth={stroke ? 3 : 0}/><text x={x} y={y + size * 0.32} textAnchor="middle" fontSize={size} fontWeight={800} fill={color}>{label}</text></g>
}

const occupied = (slot: LotSlot) => slot.state === 'occupied' || slot.state === 'soon_exit'

export default function ParkingLotMap({ shape, slots, view = 'iso', variant = 'resident', selected, recommendedId, focusId, onSelect, onUnavailable, onInspect }: Props) {
  const iso = view === 'iso'
  const admin = variant === 'admin'
  const { site, building, buildingExtra = [], roof, pillars = [], buildingDoor, walls = [], boundary, aisle, entrance } = shape
  const scale = iso ? (site.w + site.h) / 1410 : site.w / 800
  const floorHeight = shape.floorHeight ?? FLOOR_HEIGHT
  // 층수가 있으면 층수 × 층 높이, 없으면 기본 건물 높이 (한빛빌라처럼 층수 없는 사이트 파일)
  const heightOf = (block: LotBlock) => block.floors === undefined ? BUILDING_HEIGHT * scale : block.floors * floorHeight
  // 입체에서 먼 덩어리(x+y가 작은 것)부터 그린다
  const blocks = [...(building ? [building] : []), ...buildingExtra].sort((a, b) => (a.x + a.y) - (b.x + b.y))
  const roofZ0 = roof ? (roof.elevation ?? 1) * floorHeight : 0
  const roofZ1 = roof ? roofZ0 + (roof.floors ? roof.floors * floorHeight : 8 * scale) : 0
  const pillarHeight = roof ? roofZ0 : floorHeight
  const font = { tag: FONT[view].tag * scale }
  const interactive = Boolean(onSelect || onInspect)
  // 골목 입구가 땅 아래 가장자리에 있으면(한빛빌라) 입구 아래에, 옆 가장자리에 있으면(햇살빌라) 땅 안쪽 입구 옆에 글자를 둔다
  // 화살표는 차가 입구로 들어오는 방향 (홈의 '골목 입구 ↑'와 같음). 입체에서 왼쪽 가장자리로 들어오면 화면 오른쪽 아래
  const entranceAtBottom = !!entrance && entrance.y + entrance.h >= site.h - 1
  // 내 차를 막고 있는 칸 (빨간 테두리로 표시)
  const blockers = new Set(admin ? [] : slots.filter((slot) => slot.car?.mine).flatMap((slot) => slot.blockedBy ?? []))
  const tap = (slot: LotSlot) => onInspect ? onInspect(slot) : slot.state === 'empty' ? onSelect?.(slot.id) : onUnavailable?.(slot)
  const onKey = (event: KeyboardEvent, slot: LotSlot) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); tap(slot) } }
  const center = (r: Rect) => iso ? isoPoint(r.x + r.w / 2, r.y + r.h / 2) : [r.x + r.w / 2, r.y + r.h / 2] as [number, number]
  const dim = (slot: LotSlot) => focusId !== undefined && slot.id !== focusId ? 0.35 : 1
  const carColor = (slot: LotSlot) => admin && slot.car ? occupantColor[slot.car.occupant].car : slot.car?.mine ? colors.mineCar : colors.neighborCar
  const describe = (slot: LotSlot) => {
    if (slot.state === 'unavailable') return '사용 불가'
    if (slot.state === 'empty') return slot.id === recommendedId ? '빈 칸, 추천' : '빈 칸'
    const who = slot.car?.mine ? '내 차' : slot.car?.occupant === 'external' ? '외부 차량' : slot.car?.occupant === 'unknown' ? '미확인 차량' : '이웃 차'
    return `${who} 주차 중${slot.state === 'soon_exit' ? `, 곧 출차 ${slot.car?.exitAt ?? ''}` : ''}${slot.car?.mine && slot.blockedBy?.length ? ', 막힘' : ''}`
  }

  const slotStyle = (slot: LotSlot) => {
    const isSelected = slot.id === selected
    if (blockers.has(slot.id)) return { fill: colors.occupiedFill, stroke: tones.red, dash: undefined, width: 4 }
    if (slot.state === 'unavailable') return { fill: colors.disabledFill, stroke: colors.disabledLine, dash: '6 6', width: 2.5 }
    if (occupied(slot)) return { fill: colors.occupiedFill, stroke: slot.car?.mine && !admin ? tones.blue : colors.slotLine, dash: undefined, width: 2.5 }
    return { fill: slot.id === recommendedId ? colors.recommendedFill : colors.emptyFill, stroke: isSelected ? tones.blue : colors.emptyLine, dash: isSelected ? undefined : '8 6', width: isSelected ? 4 : 2.5 }
  }

  const outline = (rect: Rect) => iso ? { d: isoRect(rect) } : { d: `M${rect.x} ${rect.y} h${rect.w} v${rect.h} h${-rect.w} Z` }
  const slotLayer = slots.map((slot) => {
    const style = slotStyle(slot)
    const strokeWidth = (iso ? style.width : style.width + 1) * scale
    const dash = style.dash?.split(' ').map((n) => Number(n) * scale).join(' ')
    return <g key={slot.id} opacity={dim(slot)} pointerEvents="none">{iso ? <path {...outline(slot.rect)} fill={style.fill} stroke={style.stroke} strokeWidth={strokeWidth} strokeDasharray={dash}/> : <rect x={slot.rect.x} y={slot.rect.y} width={slot.rect.w} height={slot.rect.h} rx={6 * scale} fill={style.fill} stroke={style.stroke} strokeWidth={strokeWidth} strokeDasharray={dash}/>}</g>
  })

  // 입체 시점에서는 먼 칸(x+y가 작은 칸)부터 그려 겹침 순서를 맞춘다.
  const ordered = [...slots].sort((a, b) => (a.rect.x + a.rect.y) - (b.rect.x + b.rect.y))

  // 탭 영역은 건물·벽·차·칩보다 위, 맨 마지막에 투명하게 깐다 (입체에서 다른 도형에 가려도 눌린다, FE #47).
  // 칸 바닥 모양 그대로라 평면·입체 모두 같은 칸이 같은 자리에서 눌린다
  const hitLayer = interactive ? ordered.map((slot) => <path key={slot.id} className="slot-hit" {...outline(slot.rect)} fill="transparent" role="button" tabIndex={onSelect && !onInspect && slot.state !== 'empty' ? -1 : 0} aria-disabled={Boolean(onSelect && !onInspect && slot.state !== 'empty')} aria-label={`${slot.label} · ${describe(slot)}`} aria-pressed={onInspect ? undefined : slot.id === selected} onClick={() => tap(slot)} onKeyDown={(event) => onKey(event, slot)} style={{ cursor: 'pointer' }}/>) : null
  const carLayer = ordered.map((slot) => {
    const rect = slot.rect
    const ghost = slot.state === 'empty' && slot.id === selected
    if (!occupied(slot) && !ghost) return null
    const color = ghost ? colors.mineCar : carColor(slot)
    return <g key={slot.id} pointerEvents="none" opacity={dim(slot)}>{iso ? <IsoCar slot={rect} color={color} ghost={ghost} scale={scale}/> : <TopCar slot={rect} color={color} ghost={ghost} scale={scale}/>}</g>
  })

  // 칸마다 칸 이름 칩 하나. 상태는 칩 색으로 나누고, 뜻은 화면의 범례와 아래 카드가 설명한다 (글자를 넣으면 이웃 칸 칩과 겹친다)
  const chip = (slot: LotSlot): { text: string; color: string; bg: string; stroke?: string } => {
    const { label } = slot
    if (admin && slot.car) return { text: label, color: occupantColor[slot.car.occupant].tagText, bg: occupantColor[slot.car.occupant].tagBg, stroke: occupantColor[slot.car.occupant].car }
    if (slot.car?.mine) return { text: label, color: '#FFFFFF', bg: slot.blockedBy?.length ? tones.red : tones.blue }
    if (blockers.has(slot.id)) return { text: label, color: '#B82D3B', bg: '#FFFFFF', stroke: tones.red }
    if (slot.state === 'soon_exit') return { text: label, color: colors.soonText, bg: colors.soonBg, stroke: '#F5C451' }
    if (slot.state === 'empty' && slot.id === selected) return { text: label, color: '#FFFFFF', bg: tones.blue }
    if (slot.state === 'empty' && slot.id === recommendedId) return { text: `★${label}`, color: '#FFFFFF', bg: '#12B76A' }
    if (slot.state === 'empty') return { text: label, color: '#087443', bg: '#FFFFFF', stroke: colors.emptyLine }
    if (slot.state === 'unavailable') return { text: label, color: '#98A2B3', bg: '#F2F4F7', stroke: colors.disabledLine }
    return { text: label, color: '#475467', bg: '#FFFFFF', stroke: colors.slotLine }
  }
  const labelLayer = ordered.map((slot) => {
    const [cx, cy] = center(slot.rect)
    const hasCar = occupied(slot) || slot.id === selected
    // 입체: 차가 있으면 차 지붕 위, 없으면 칸 가운데
    const y = iso ? cy - (hasCar ? 58 * scale : 0) : cy + font.tag * 0.3
    const { text, color, bg, stroke } = chip(slot)
    return <g key={slot.id} opacity={dim(slot)}><Tag x={cx} y={y} label={text} color={color} bg={bg} size={font.tag} stroke={stroke}/></g>
  })

  if (iso) {
    const { minX, minY, maxX, maxY } = isoBounds(shape, [...blocks.map((block): [Rect, number] => [block, heightOf(block)]), ...(roof ? [[roof, roofZ1] as [Rect, number]] : [])], scale)
    return <MapFrame viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`} label="주차 배치도 (입체)">
      <path d={isoRect({ x: 0, y: 0, w: site.w, h: site.h })} fill={colors.ground} stroke={colors.groundEdge} strokeWidth={2 * scale}/>
      {boundary && <path d={isoRect(boundary)} fill="none" stroke={colors.wall} strokeWidth={4 * scale}/>}
      {aisle && <path d={toPath([isoPoint(aisle.x, aisle.bottom), isoPoint(aisle.x, aisle.top)])} stroke={colors.aisle} strokeWidth={3 * scale} strokeDasharray={`${12 * scale} ${10 * scale}`} fill="none"/>}
      {slotLayer}
      {blocks.map((block, index) => <IsoBox key={index} rect={block} z1={heightOf(block)} top={colors.buildingRoof} side={colors.buildingSide} front="#D0D5DD" stroke={colors.buildingLine}/>)}
      {building && buildingDoor && <path d={toPath([isoPoint(buildingDoor.x, building.y + building.h, 0), isoPoint(buildingDoor.x + buildingDoor.w, building.y + building.h, 0), isoPoint(buildingDoor.x + buildingDoor.w, building.y + building.h, 46 * scale), isoPoint(buildingDoor.x, building.y + building.h, 46 * scale)])} fill="#475467"/>}
      {walls.map((wall, index) => <IsoBox key={index} rect={wall} z1={28 * scale} top={colors.wall} side={shade(colors.wall, -30)} front={shade(colors.wall, -45)}/>)}
      {pillars.map((pillar, index) => <IsoBox key={index} rect={pillar} z1={pillarHeight} top="#98A2B3" side="#667085" front="#475467"/>)}
      {carLayer}
      {/* 필로티 지붕은 차 위에 반투명으로 덮어 아래 칸·차가 보이게 한다. 칩과 탭 영역은 그 위 */}
      {roof && <g opacity={0.35} pointerEvents="none"><IsoBox rect={roof} z0={roofZ0} z1={roofZ1} top={colors.buildingRoof} side={colors.buildingSide} front="#D0D5DD" stroke={colors.buildingLine}/></g>}
      {labelLayer}
      {entrance && (() => { const [x, y] = entranceAtBottom ? isoPoint(entrance.x + entrance.w / 2, entrance.y + entrance.h, -30 * scale) : isoPoint(entrance.x + entrance.w + 90 * scale, entrance.y + entrance.h / 2); return <Tag x={x} y={y} label={entranceAtBottom ? '골목 입구 ↑' : '골목 입구 ↘'} color="#475467" bg="#FFFFFF" size={font.tag}/> })()}
      {hitLayer}
    </MapFrame>
  }

  // 골목 입구 글자 자리 (입구가 있을 때만)
  const bottom = entranceAtBottom ? 56 * scale : 10 * scale
  return <MapFrame viewBox={`${-10 * scale} ${-10 * scale} ${site.w + 20 * scale} ${site.h + 10 * scale + bottom}`} label="주차 배치도 (평면)">
    <rect x={0} y={0} width={site.w} height={site.h} rx={8 * scale} fill={colors.ground} stroke={colors.groundEdge} strokeWidth={2 * scale}/>
    {boundary && <rect x={boundary.x} y={boundary.y} width={boundary.w} height={boundary.h} rx={6 * scale} fill="none" stroke={colors.wall} strokeWidth={4 * scale}/>}
    {buildingExtra.map((block, index) => <rect key={index} x={block.x} y={block.y} width={block.w} height={block.h} fill={colors.building} stroke={colors.buildingLine} strokeWidth={6 * scale}/>)}
    {building && <>
      <rect x={building.x} y={building.y} width={building.w} height={building.h} fill={colors.building} stroke={colors.buildingLine} strokeWidth={6 * scale}/>
      <text x={building.x + building.w / 2} y={building.y + building.h / 2} textAnchor="middle" fontSize={34 * scale} fontWeight={800} fill={colors.buildingLine}>건물</text>
    </>}
    {buildingDoor && <>
      <rect x={buildingDoor.x} y={buildingDoor.y - 4 * scale} width={buildingDoor.w} height={buildingDoor.h + 8 * scale} fill={colors.building}/>
      <path d={`M${buildingDoor.x + 6} ${buildingDoor.y + 4} v18 h70 v-18 M${buildingDoor.x + 41} ${buildingDoor.y + 4} v18`} stroke={colors.buildingLine} strokeWidth={3} fill="none"/>
      <text x={buildingDoor.x + buildingDoor.w / 2} y={buildingDoor.y - 14 * scale} textAnchor="middle" fontSize={font.tag} fill="#475467">건물 입구</text>
    </>}
    {walls.map((wall, index) => <rect key={index} x={wall.x} y={wall.y} width={wall.w} height={wall.h} rx={4 * scale} fill={colors.wall}/>)}
    {aisle && <>
      <path d={`M${aisle.x} ${aisle.bottom} V${aisle.top}`} stroke={colors.aisle} strokeWidth={4 * scale} strokeDasharray={`${14 * scale} ${12 * scale}`}/>
      <path d={`M${aisle.x - 12 * scale} ${aisle.top + 14 * scale} L${aisle.x} ${aisle.top} L${aisle.x + 12 * scale} ${aisle.top + 14 * scale}`} stroke={colors.aisle} strokeWidth={4 * scale} fill="none" strokeLinecap="round"/>
    </>}
    {entrance && <>
      <rect x={entrance.x} y={entrance.y} width={entrance.w} height={entrance.h} fill="#FFFFFF"/>
      {entranceAtBottom ? <text x={entrance.x + entrance.w / 2} y={site.h + 34 * scale} textAnchor="middle" fontSize={font.tag} fontWeight={800} fill="#475467">골목 입구</text> : <text x={entrance.x + entrance.w + 12 * scale} y={entrance.y + entrance.h / 2 + font.tag * 0.35} fontSize={font.tag} fontWeight={800} fill="#475467">골목 입구 →</text>}
    </>}
    {slotLayer}
    {carLayer}
    {/* 필로티 지붕: 아래 칸이 보이도록 옅은 면 + 점선 테두리 */}
    {roof && <rect x={roof.x} y={roof.y} width={roof.w} height={roof.h} fill={colors.buildingLine} fillOpacity={0.06} stroke={colors.buildingLine} strokeWidth={3 * scale} strokeDasharray={`${12 * scale} ${8 * scale}`} pointerEvents="none"/>}
    {pillars.map((pillar, index) => <rect key={index} x={pillar.x} y={pillar.y} width={pillar.w} height={pillar.h} fill="#475467" pointerEvents="none"/>)}
    {labelLayer}
    {hitLayer}
  </MapFrame>
}

const legend = [['내 차', tones.blue, tones.blue], ['막힘', tones.red, tones.red], ['곧 출차', colors.soonBg, '#F5C451'], ['빈 칸', '#FFFFFF', colors.emptyLine], ['사용 불가', '#F2F4F7', colors.disabledLine]] as const

/** 입주민 배치도 칩 색의 뜻 (관리자 화면은 Figma의 범례 칩을 쓴다) */
export function LotLegend() {
  return <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 1.5, rowGap: 0.5 }}>{legend.map(([label, bg, line]) => <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 11, fontWeight: 700, color: 'text.secondary' }}><Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: bg, border: `2px solid ${line}` }}/>{label}</Box>)}</Box>
}

function MapFrame({ viewBox, label, children }: { viewBox: string; label: string; children: ReactNode }) {
  return <Box component="svg" viewBox={viewBox} role="group" aria-label={label} sx={{ display: 'block', width: '100%', height: 'auto', fontFamily: 'inherit', '& .slot-hit:focus-visible': { outline: 'none', stroke: tones.blueDark, strokeWidth: 6 } }}>{children}</Box>
}
