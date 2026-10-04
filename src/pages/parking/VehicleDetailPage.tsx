import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded'
import { Alert, Box, Button, Chip, CircularProgress, Divider, Stack, Typography } from '@mui/material'
import { InfoRow, PageTitle, SectionTitle, StatusChip, Surface } from '../../components/Ui'
import ParkingLotMap from '../../components/ParkingLotMap'
import { toLotSlots } from '../../components/parkingLotGeometry'
import { getBuildingLayout, getBuildingStatus, getHome, getMyVehicle, listMyVehicles } from '../../api/parking'
import { useApi } from '../../api/useApi'
import { hashParams, toHash } from '../../types/navigation'
import type { ExitSource } from '../../types/parking'

const sourceLabel: Record<ExitSource, string> = { MANUAL: '직접 등록', RECURRING: '반복', AI_ESTIMATED: 'AI 추정', NONE: '없음' }

const kstDate = (offsetDays = 0) => new Date(Date.now() + 9 * 3600000 + offsetDays * 86400000).toISOString().slice(0, 10)
// KST ISO 8601 → "오늘 18:30" / "내일 07:30" / "9/30 08:30"
function dayTime(dateTime: string) {
  const date = dateTime.slice(0, 10)
  const day = date === kstDate() ? '오늘' : date === kstDate(1) ? '내일' : date === kstDate(-1) ? '어제' : `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}`
  return `${day} ${dateTime.slice(11, 16)}`
}
const defaultVehicleId = async () => { const { items } = await listMyVehicles(); return (items.find((item) => item.is_default) ?? items[0])?.id }
const elapsed = (minutes: number) => minutes < 60 ? `${minutes}분` : `${Math.floor(minutes / 60)}시간${minutes % 60 ? ` ${minutes % 60}분` : ''}`

// 차량 id 는 #vehicle-detail?id=7. 없으면(화면 목록에서 직접 연 경우) 홈의 내 주차 차량, 주차 중이 아니면 기본 차량(없으면 첫 차)을 쓴다
async function loadDetail(paramId: number) {
  const home = await getHome()
  const vehicleId = paramId || home.my_parking?.vehicle.id || await defaultVehicleId()
  const [vehicle, layout, status] = await Promise.all([vehicleId ? getMyVehicle(vehicleId) : null, getBuildingLayout(home.building.id), getBuildingStatus(home.building.id)])
  return { vehicle, slots: toLotSlots(layout, status) }
}

export default function VehicleDetailPage() {
  const paramId = Number(hashParams().get('id')) || 0
  const { data, error, reload } = useApi(() => loadDetail(paramId), `vehicle-${paramId}`)
  if (error) return <Alert severity="error" action={<Button color="inherit" size="small" onClick={reload}>다시 시도</Button>}>{error.message}</Alert>
  if (!data) return <Box display="grid" py={6} sx={{placeItems:'center'}}><CircularProgress size={30}/></Box>
  const { vehicle, slots } = data
  if (!vehicle) return <Stack gap={2.25}><PageTitle title="차량 상세"/><Typography variant="caption" color="text.secondary">차량 정보를 찾을 수 없어요.</Typography></Stack>
  const { parking, schedule } = vehicle
  return <Stack gap={2.25}>
    <PageTitle title="차량 상세"/>
    <Surface><Stack direction="row" gap={1.5} alignItems="center"><DirectionsCarRoundedIcon color="primary" sx={{fontSize:36}}/><div><Typography variant="h6">{vehicle.plate}</Typography><Typography variant="caption" color="text.secondary">{vehicle.color ?? '색상 미등록'}</Typography></div></Stack><Divider sx={{my:1.25}}/><InfoRow label="차량 소유자" value={vehicle.owner.name}/><InfoRow label="동·호수" value={vehicle.owner.unit}/></Surface>
    <SectionTitle>현재 주차 상태</SectionTitle>
    <Surface>{parking ? <><InfoRow label="주차 구역" value={parking.slot_label}/><InfoRow label="입차 시각" value={dayTime(parking.entered_at)}/><InfoRow label="주차 상태" value={parking.state === 'PARKED' ? <StatusChip kind="accepted" label="주차 중"/> : <StatusChip kind="disabled" label="출차"/>}/></> : <Typography variant="caption" color="text.secondary">지금 주차 중이 아니에요.</Typography>}</Surface>
    <SectionTitle>출차 일정</SectionTitle>
    <Surface>{schedule ? <>
      <InfoRow label="예정 출차 시각" value={schedule.expected_exit_at ? dayTime(schedule.expected_exit_at) : '없음'}/>
      {/* 등록 유형: 직접 등록 / 반복 / AI 추정 / 없음 */}
      <InfoRow label="등록 유형" value={<Chip size="small" variant="outlined" color="secondary" icon={schedule.exit_source === 'AI_ESTIMATED' ? <AutoAwesomeRoundedIcon/> : undefined} label={sourceLabel[schedule.exit_source]}/>}/>
      <InfoRow label="경과 시간" value={elapsed(schedule.elapsed_minutes)}/>
      {schedule.exit_source === 'AI_ESTIMATED' && <Typography variant="caption" color="text.secondary">출차 시간을 등록하지 않아 지난 기록으로 추정한 시각이에요.</Typography>}
    </> : <Typography variant="caption" color="text.secondary">등록된 출차 일정이 없어요.</Typography>}</Surface>
    <SectionTitle>주차 위치</SectionTitle>
    {parking ? <Box sx={{borderRadius:4,bgcolor:'#F8FAFC',border:'1px solid',borderColor:'divider',p:1}}><ParkingLotMap slots={slots} focusId={parking.slot_label}/></Box> : <Typography variant="caption" color="text.secondary">지금 주차 중이 아니에요.</Typography>}
    <Button component="a" href={toHash('departure', { id: vehicle.id })} variant="contained" fullWidth disabled={!parking}>출차 일정 수정</Button>
  </Stack>
}
