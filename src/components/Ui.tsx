import { parkingStatusColors } from './parkingStatusColors'
import type { ReactNode } from 'react'
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded'
import LocalParkingRoundedIcon from '@mui/icons-material/LocalParkingRounded'
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded'
import type { PageId } from '../types/navigation'
import { toHash } from '../types/navigation'
import { tones } from '../theme'

export function PageTitle({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
      <Box>
        {eyebrow && <Typography variant="caption" color="primary" fontWeight={800}>{eyebrow}</Typography>}
        <Typography variant="h5" mt={eyebrow ? 0.5 : 0}>{title}</Typography>
        {description && <Typography variant="body2" color="text.secondary" mt={0.75}>{description}</Typography>}
      </Box>
      {action}
    </Stack>
  )
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return <Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="subtitle1">{children}</Typography>{action}</Stack>
}

export function Surface({ children, sx }: { children: ReactNode; sx?: object }) {
  return <Card sx={sx}><CardContent>{children}</CardContent></Card>
}

export function NavButton({ to, children, variant = 'contained', color = 'primary', fullWidth = false, startIcon }: { to: PageId; children: ReactNode; variant?: 'contained' | 'outlined' | 'text'; color?: 'primary' | 'error' | 'inherit'; fullWidth?: boolean; startIcon?: ReactNode }) {
  return <Button component="a" href={toHash(to)} variant={variant} color={color} fullWidth={fullWidth} startIcon={startIcon}>{children}</Button>
}

type StatusKind = 'available' | 'recommended' | 'soon' | 'external' | 'danger' | 'disabled' | 'pending' | 'accepted' | 'rejected'

const statusStyles: Record<StatusKind, { bg: string; color: string; label: string }> = {
  available: { bg: parkingStatusColors.available.bg, color: parkingStatusColors.available.text, label: '빈자리' },
  recommended: { bg: parkingStatusColors.recommended.bg, color: parkingStatusColors.recommended.text, label: '추천' },
  soon: { bg: '#FFF6D8', color: '#986D05', label: '곧 출차' },
  external: { bg: tones.orangeSoft, color: '#B95515', label: '외부 차량' },
  danger: { bg: tones.redSoft, color: '#B82D3B', label: '주의' },
  disabled: { bg: parkingStatusColors.disabled.bg, color: parkingStatusColors.disabled.text, label: '이용 불가' },
  pending: { bg: '#FFF6D8', color: '#986D05', label: '대기 중' },
  accepted: { bg: tones.mintSoft, color: '#187E67', label: '수락됨' },
  rejected: { bg: tones.redSoft, color: '#B82D3B', label: '거절됨' },
}

export function StatusChip({ kind, label }: { kind: StatusKind; label?: string }) {
  const style = statusStyles[kind]
  return <Chip size="small" label={label ?? style.label} sx={{ bgcolor: style.bg, color: style.color, border: 'none' }} />
}

export function InfoRow({ label, value, icon }: { label: string; value: ReactNode; icon?: ReactNode }) {
  return <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2} py={0.75}><Stack direction="row" alignItems="center" gap={1}>{icon}<Typography variant="body2" color="text.secondary">{label}</Typography></Stack><Typography component="div" variant="body2" fontWeight={750} textAlign="right">{value}</Typography></Stack>
}

export function ResultHero({ state, title, description }: { state: 'success' | 'error' | 'pending'; title: string; description: string }) {
  const color = state === 'success' ? tones.mint : state === 'error' ? tones.red : tones.blue
  const Icon = state === 'success' ? CheckCircleRoundedIcon : state === 'error' ? ErrorRoundedIcon : ScheduleRoundedIcon
  return <Stack alignItems="center" textAlign="center" gap={1.25} py={4}><Box sx={{ width: 72, height: 72, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: `${color}18`, color }}><Icon sx={{ fontSize: 42 }} /></Box><Typography variant="h5">{title}</Typography><Typography variant="body2" color="text.secondary" maxWidth={280}>{description}</Typography></Stack>
}

export function ParkingMark() {
  return <Box sx={{ width: 42, height: 42, borderRadius: 3, display: 'grid', placeItems: 'center', bgcolor: '#E8F0FF', color: 'primary.main' }}><LocalParkingRoundedIcon /></Box>
}
