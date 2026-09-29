import { useState } from 'react'
import BlockRoundedIcon from '@mui/icons-material/BlockRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import { Box, ButtonBase, Stack, Typography } from '@mui/material'
import { tones } from '../theme'

type SlotState = 'available' | 'mine' | 'occupied' | 'external' | 'disabled' | 'recommended'
type Slot = { id: string; label: string; state: SlotState; time?: string }

const baseSlots: Slot[] = [
  { id: 'A1', label: '필로티 1', state: 'available' },
  { id: 'A2', label: '필로티 2', state: 'recommended', time: '추천' },
  { id: 'A3', label: '필로티 3', state: 'mine', time: '18:30' },
  { id: 'B1', label: '필로티 4', state: 'external', time: '미등록' },
  { id: 'B2', label: '필로티 5', state: 'occupied', time: '20:10' },
  { id: 'B3', label: '필로티 6', state: 'disabled' },
]

const visual: Record<SlotState, { bg: string; color: string; border: string; text: string }> = {
  available: { bg: tones.mintSoft, color: '#187E67', border: '#C9EDE3', text: '빈자리' },
  recommended: { bg: '#E8F0FF', color: tones.blueDark, border: '#BBD0FF', text: '추천' },
  mine: { bg: tones.blue, color: '#FFFFFF', border: tones.blue, text: '내 차량' },
  occupied: { bg: '#EEF1F5', color: '#475467', border: '#DCE1E8', text: '주차 중' },
  external: { bg: tones.orangeSoft, color: '#B95515', border: '#FFD8BD', text: '외부 차량' },
  disabled: { bg: '#F2F4F7', color: '#98A2B3', border: '#E4E7EC', text: '사용 불가' },
}

export default function ParkingMap({ selectable = false, compact = false, selected: controlled, onSelect }: { selectable?: boolean; compact?: boolean; selected?: string; onSelect?: (id: string) => void }) {
  const [localSelected, setLocalSelected] = useState(controlled ?? (selectable ? 'A2' : ''))
  const selected = controlled ?? localSelected
  const select = (slot: Slot) => {
    if (!selectable || ['occupied', 'mine', 'external', 'disabled'].includes(slot.state)) return
    setLocalSelected(slot.id)
    onSelect?.(slot.id)
  }
  return (
    <Box sx={{ borderRadius: 4, bgcolor: '#EDF1F5', p: compact ? 1.25 : 1.75, border: '1px solid #E2E7EE' }}>
      <Typography variant="caption" color="text.secondary" textAlign="center" display="block" mb={1.25}>건물 안쪽</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: compact ? 0.75 : 1 }}>
        {baseSlots.map((slot) => {
          const style = visual[slot.state]
          const isSelected = selected === slot.id
          const Icon = slot.state === 'recommended' ? StarRoundedIcon : slot.state === 'available' ? CheckCircleRoundedIcon : slot.state === 'disabled' ? BlockRoundedIcon : DirectionsCarRoundedIcon
          return (
            <ButtonBase key={slot.id} onClick={() => select(slot)} disabled={!selectable || ['occupied', 'mine', 'external', 'disabled'].includes(slot.state)} sx={{ minHeight: compact ? 70 : 92, p: compact ? 1 : 1.25, borderRadius: 2.5, display: 'flex', flexDirection: 'column', gap: 0.4, bgcolor: style.bg, color: style.color, border: `2px solid ${isSelected ? tones.blue : style.border}`, boxShadow: isSelected ? '0 0 0 3px rgba(36,107,253,.12)' : 'none', opacity: 1, '&.Mui-disabled': { opacity: 1 } }}>
              <Icon sx={{ fontSize: compact ? 18 : 22 }} />
              <Typography variant="caption" fontWeight={800}>{slot.label}</Typography>
              <Typography variant="caption" sx={{ fontSize: 10 }}>{slot.time ?? style.text}</Typography>
            </ButtonBase>
          )
        })}
      </Box>
      <Stack direction="row" alignItems="center" justifyContent="center" gap={1} mt={1.4} color="text.secondary"><Box sx={{ width: 28, height: 3, borderRadius: 2, bgcolor: '#C7CED8' }} /><Typography variant="caption">골목 진입로 · 바깥쪽</Typography><Box sx={{ width: 28, height: 3, borderRadius: 2, bgcolor: '#C7CED8' }} /></Stack>
    </Box>
  )
}
