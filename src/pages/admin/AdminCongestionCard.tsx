import { useState } from 'react'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import { Alert, Box, Button, CircularProgress, IconButton, Stack, Typography } from '@mui/material'
import { Surface } from '../../components/Ui'
import { getAdminDashboard } from '../../api/admin'
import { useApi } from '../../api/useApi'
import type { AdminDashboard } from '../../types/admin'
import CongestionChart from './CongestionChart'

const shiftCongestionMonth = (month: string, diff: number) => {
  const index = Number(month.slice(0, 4)) * 12 + Number(month.slice(5, 7)) - 1 + diff
  return `${Math.floor(index / 12)}-${String((index % 12 + 12) % 12 + 1).padStart(2, '0')}`
}

export default function AdminCongestionCard({ buildingId, initial, thisMonth }: { buildingId: number; initial: AdminDashboard['congestion']; thisMonth: string }) {
  const [month, setMonth] = useState<string | null>(null)
  const selectedMonth = month ?? initial.month
  // Only the chart observes month changes. The resident list, map and dialogs stay mounted.
  const chart = useApi(async () => month === null ? initial : (await getAdminDashboard(buildingId, {month})).congestion,
    `congestion-${buildingId}-${month ?? JSON.stringify(initial)}`)
  const shownMonth = chart.data?.month ?? selectedMonth
  const totalSlots = chart.data?.total_slots ?? initial.total_slots
  return <Surface sx={{boxShadow:'none','& .MuiCardContent-root':{p:2,'&:last-child':{pb:2}}}}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1} flexWrap="wrap">
      <Typography variant="subtitle1">주차 혼잡도</Typography>
      <Stack direction="row" alignItems="center" sx={{bgcolor:'#F4F6F9',borderRadius:'10px'}}>
        <IconButton size="small" aria-label="이전 달" disabled={chart.loading} onClick={() => setMonth(shiftCongestionMonth(shownMonth, -1))}><ChevronLeftRoundedIcon/></IconButton>
        <Typography variant="subtitle2">{shownMonth.slice(0, 4) === thisMonth.slice(0, 4) ? '' : `${shownMonth.slice(0, 4)}년 `}{Number(shownMonth.slice(5, 7))}월</Typography>
        <IconButton size="small" aria-label="다음 달" disabled={chart.loading} onClick={() => setMonth(shiftCongestionMonth(shownMonth, 1))}><ChevronRightRoundedIcon/></IconButton>
      </Stack>
    </Stack>
    <Typography variant="caption" color="text.secondary">날짜별 가장 많이 사용된 주차 칸 수예요. (전체 {totalSlots}칸)</Typography>
    <Box aria-busy={chart.loading} sx={{minHeight:300}}>
      {chart.loading ? <Stack role="status" alignItems="center" justifyContent="center" gap={1.5} sx={{minHeight:300}}><CircularProgress size={24}/><Typography variant="caption" color="text.secondary">{Number(selectedMonth.slice(5,7))}월 데이터 불러오는 중…</Typography></Stack>
        : chart.error ? <Alert sx={{mt:2}} severity="error" action={<Button onClick={chart.reload}>재시도</Button>}>{chart.error.message}</Alert>
        : shownMonth > thisMonth ? <Typography variant="body2" color="text.secondary" py={3}>아직 지나지 않은 달이라 데이터가 없어요.</Typography>
        : chart.data?.days.length ? <CongestionChart days={chart.data.days} totalSlots={chart.data.total_slots}/>
        : <Typography variant="body2" color="text.secondary" py={3}>이 달의 주차 데이터가 없어요.</Typography>}
    </Box>
  </Surface>
}
