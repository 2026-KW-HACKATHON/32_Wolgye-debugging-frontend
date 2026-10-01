import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded'
import EventRoundedIcon from '@mui/icons-material/EventRounded'
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded'
import { Button, Stack, Typography } from '@mui/material'
import ParkingMap from '../../components/ParkingMap'
import { InfoRow, NavButton, PageTitle, StatusChip, Surface } from '../../components/Ui'

export default function VehicleDetailPage() {
  return <Stack gap={2.25}><PageTitle title="내 차량" description="현재 위치와 다음 출차 일정을 확인하세요." action={<StatusChip kind="accepted" label="주차 중"/>}/><ParkingMap compact/><Surface><Stack direction="row" gap={1.5} alignItems="center"><DirectionsCarRoundedIcon color="primary" sx={{fontSize:36}}/><div><Typography variant="h6">12가 3456</Typography><Typography variant="caption" color="text.secondary">흰색 아반떼 · 대표 차량</Typography></div></Stack></Surface><Surface><InfoRow label="주차 위치" value="필로티 2번 · 안쪽"/><InfoRow label="출차 예정" value="내일 오전 7:30" icon={<ScheduleRoundedIcon color="primary" fontSize="small"/>}/><InfoRow label="반복 일정" value="월–금" icon={<EventRoundedIcon color="primary" fontSize="small"/>}/></Surface><Stack direction="row" gap={1}><NavButton to="departure" fullWidth>출차 시간 수정</NavButton><NavButton to="parking-register" variant="outlined" fullWidth>위치 변경</NavButton></Stack><Button variant="text" color="error">출차 완료 처리</Button></Stack>
}
