import { useState } from 'react'
import BlockRoundedIcon from '@mui/icons-material/BlockRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded'
import HelpRoundedIcon from '@mui/icons-material/HelpRounded'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import { Box, ButtonBase, Stack, Typography } from '@mui/material'
import { tones } from '../theme'

type SlotState = 'available' | 'mine' | 'occupied' | 'external' | 'unknown' | 'disabled' | 'recommended'
export type Slot = { id: string; label: string; state: SlotState; time?: string; plate?: string }

const baseSlots: Slot[] = [
  { id: 'A1', label: '필로티 1', state: 'available' },
  { id: 'A2', label: '필로티 2', state: 'recommended', time: '추천' },
  { id: 'A3', label: '필로티 3', state: 'mine', time: '18:30', plate: '12가 3456' },
  { id: 'B1', label: '필로티 4', state: 'external', time: '미등록', plate: '123가 4634' },
  { id: 'B2', label: '필로티 5', state: 'occupied', time: '20:10', plate: '34나 5678' },
  { id: 'B3', label: '필로티 6', state: 'disabled' },
]

// 관리자 화면용: 입주민·외부·미확인 차량을 구분하고 번호판을 보여준다
const adminSlots: Slot[] = [
  { id: 'A1', label: '필로티 1', state: 'available' },
  { id: 'A2', label: '필로티 2', state: 'occupied', plate: '78나 9012' },
  { id: 'A3', label: '필로티 3', state: 'occupied', plate: '12가 3456' },
  { id: 'B1', label: '필로티 4', state: 'external', plate: '123가 4634' },
  { id: 'B2', label: '필로티 5', state: 'unknown', plate: '45다 6789' },
  { id: 'B3', label: '필로티 6', state: 'available' },
]

const visual: Record<SlotState, { bg: string; color: string; border: string; text: string }> = {
  available: { bg: tones.mintSoft, color: '#187E67', border: '#C9EDE3', text: '빈자리' },
  recommended: { bg: '#E8F0FF', color: tones.blueDark, border: '#BBD0FF', text: '추천' },
  mine: { bg: tones.blue, color: '#FFFFFF', border: tones.blue, text: '내 차량' },
  occupied: { bg: '#EEF1F5', color: '#475467', border: '#DCE1E8', text: '주차 중' },
  external: { bg: tones.orangeSoft, color: '#B95515', border: '#FFD8BD', text: '외부 차량' },
  unknown: { bg: tones.redSoft, color: '#B82D3B', border: '#F8C9CF', text: '미확인' },
  disabled: { bg: '#F2F4F7', color: '#98A2B3', border: '#E4E7EC', text: '사용 불가' },
}

// 관리자 화면에서는 입주민 차량을 범례(입주민 차량)와 같은 파란 계열로 보여준다
const adminResident = { bg: '#E8F0FF', color: tones.blueDark, border: '#BBD0FF', text: '입주민' }

const blockedStates: SlotState[] = ['occupied', 'mine', 'external', 'unknown', 'disabled']

type ParkingMapProps = {
  selectable?: boolean
  compact?: boolean
  selected?: string
  onSelect?: (id: string) => void
  /** selectable일 때 사용 불가·점유 칸을 탭하면 호출. 없으면 기존처럼 무시한다 */
  onUnavailable?: (slot: Slot) => void
  /** 'admin'이면 번호판 라벨과 입주민/외부/미확인 색 구분으로 표시 */
  variant?: 'resident' | 'admin'
  /** 내 칸만 강조하고 나머지 칸은 흐리게 표시 (차량 상세용) */
  highlightMine?: boolean
}

export default function ParkingMap({ selectable = false, compact = false, selected: controlled, onSelect, onUnavailable, variant = 'resident', highlightMine = false }: ParkingMapProps) {
  const [localSelected, setLocalSelected] = useState(controlled ?? (selectable ? 'A2' : ''))
  const selected = controlled ?? localSelected
  const isAdmin = variant === 'admin'
  const slots = isAdmin ? adminSlots : baseSlots
  const select = (slot: Slot) => {
    if (!selectable) return
    if (blockedStates.includes(slot.state)) { onUnavailable?.(slot); return }
    setLocalSelected(slot.id)
    onSelect?.(slot.id)
  }
  return (
    <Box sx={{ borderRadius: 4, bgcolor: '#EDF1F5', p: compact ? 1.25 : 1.75, border: '1px solid #E2E7EE' }}>
      <Typography variant="caption" color="text.secondary" textAlign="center" display="block" mb={1.25}>건물 안쪽</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: compact ? 0.75 : 1 }}>
        {slots.map((slot) => {
          const style = isAdmin && (slot.state === 'occupied' || slot.state === 'mine') ? adminResident : visual[slot.state]
          const isSelected = selected === slot.id
          const blocked = blockedStates.includes(slot.state)
          const tappable = selectable && (!blocked || Boolean(onUnavailable))
          const dimmed = highlightMine && slot.state !== 'mine'
          const Icon = slot.state === 'recommended' ? StarRoundedIcon : slot.state === 'available' ? CheckCircleRoundedIcon : slot.state === 'disabled' ? BlockRoundedIcon : slot.state === 'unknown' ? HelpRoundedIcon : DirectionsCarRoundedIcon
          const caption = isAdmin ? (slot.plate ?? style.text) : (slot.time ?? style.text)
          return (
            <ButtonBase key={slot.id} onClick={() => select(slot)} disabled={!tappable} sx={{ minHeight: compact ? 70 : 92, p: compact ? 1 : 1.25, borderRadius: 2.5, display: 'flex', flexDirection: 'column', gap: 0.4, bgcolor: style.bg, color: style.color, border: `2px solid ${isSelected ? tones.blue : style.border}`, boxShadow: isSelected ? '0 0 0 3px rgba(36,107,253,.12)' : 'none', opacity: dimmed ? 0.4 : 1, '&.Mui-disabled': { opacity: dimmed ? 0.4 : 1 } }}>
              <Icon sx={{ fontSize: compact ? 18 : 22 }} />
              <Typography variant="caption" fontWeight={800}>{slot.label}</Typography>
              <Typography variant="caption" sx={{ fontSize: 10, fontWeight: isAdmin && slot.plate ? 800 : 400 }}>{caption}</Typography>
            </ButtonBase>
          )
        })}
      </Box>
      <Stack direction="row" alignItems="center" justifyContent="center" gap={1} mt={1.4} color="text.secondary"><Box sx={{ width: 28, height: 3, borderRadius: 2, bgcolor: '#C7CED8' }} /><Typography variant="caption">골목 진입로 · 바깥쪽</Typography><Box sx={{ width: 28, height: 3, borderRadius: 2, bgcolor: '#C7CED8' }} /></Stack>
    </Box>
  )
}
