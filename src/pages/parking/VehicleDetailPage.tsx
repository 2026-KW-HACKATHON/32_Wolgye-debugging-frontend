import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded'
import { useState } from 'react'
import { Alert, Box, Button, Chip, CircularProgress, Divider, Stack, Typography } from '@mui/material'
import { InfoRow, NavButton, PageTitle, SectionTitle, StatusChip, Surface } from '../../components/Ui'
import ParkingLotPanel from '../../components/ParkingLotPanel'
import { toLot } from '../../components/parkingLotGeometry'
import { getBuildingLayout, getBuildingStatus, getHome, getMyVehicle, getRecurringSchedule } from '../../api/parking'
import { isApiError } from '../../api/client'
import { useApi } from '../../api/useApi'
import { hashParams, toHash } from '../../types/navigation'
import type { ExitSource } from '../../types/parking'
import { getDefaultVehicle } from './defaultVehicle'
import ExitParkingButton, { type ExitNotice } from './ExitParkingButton'
import { dayTimeOf, kstNow } from './kstTime'

const sourceLabel: Record<ExitSource, string> = { MANUAL: '직접 등록', RECURRING: '반복', AI_ESTIMATED: 'AI 추정', NONE: '없음' }

const elapsed = (minutes: number) => minutes < 60 ? `${minutes}분` : `${Math.floor(minutes / 60)}시간${minutes % 60 ? ` ${minutes % 60}분` : ''}`

// 차량 id 는 #vehicle-detail?id=7. 없으면(화면 목록에서 직접 연 경우) 홈의 내 주차 차량, 주차 중이 아니면 기본 차량(없으면 첫 차)을 쓴다
async function loadDetail(paramId: number) {
  const home = await getHome()
  const vehicleId = paramId || home.my_parking?.vehicle.id || (await getDefaultVehicle())?.id
  const [vehicle, layout, status] = await Promise.all([vehicleId ? getMyVehicle(vehicleId) : null, getBuildingLayout(home.building.id), getBuildingStatus(home.building.id)])
  const recurring = vehicle ? await getRecurringSchedule(vehicle.id).catch((e:unknown)=>{ if (isApiError(e) && e.status === 404) return null; throw e }) : null
  return { vehicle, recurring, lot: toLot(layout, status) }
}

export default function VehicleDetailPage() {
  const paramId = Number(hashParams().get('id')) || 0
  const { data, error, reload } = useApi(() => loadDetail(paramId), `vehicle-${paramId}`)
  const [exitNotice, setExitNotice] = useState<ExitNotice | null>(null)
  // 기본 차량 조회는 로그인 세션이 필요하다 (401)
  if (error?.status === 401) return <Stack gap={2.25}><PageTitle title="차량 상세"/><Alert severity="info" action={<NavButton to="login" variant="text">로그인</NavButton>}>로그인이 필요해요.</Alert></Stack>
  if (error) return <Alert severity="error" action={<Button color="inherit" size="small" onClick={reload}>다시 시도</Button>}>{error.message}</Alert>
  if (!data) return <Box display="grid" py={6} sx={{placeItems:'center'}}><CircularProgress size={30}/></Box>
  const { vehicle, recurring, lot } = data
  if (!vehicle) return <Stack gap={2.25}><PageTitle title="차량 상세"/><Typography variant="caption" color="text.secondary">차량 정보를 찾을 수 없어요.</Typography></Stack>
  const { parking, schedule } = vehicle
  // 서버는 출차 예정 시각이 지나도 자동 출차하지 않는다 (#46)
  const overdue = parking?.state === 'PARKED' && !!schedule?.expected_exit_at && Date.parse(schedule.expected_exit_at) < Date.parse(kstNow())
  return <Stack gap={2.25}>
    <PageTitle title="내 차량 상세" action={<Button href="#vehicles" size="small">다른 차량</Button>}/>
    {hashParams().get('saved') && <Alert severity="success">{hashParams().get('saved') === 'repeat' ? '반복 일정을 저장했어요.' : '출차 일정을 변경했어요.'}</Alert>}
    <Surface><Stack direction="row" gap={1.5} alignItems="center"><DirectionsCarRoundedIcon color="primary" sx={{fontSize:36}}/><div><Typography variant="h6">{vehicle.plate}</Typography>{vehicle.color && <Typography variant="caption" color="text.secondary">{vehicle.color}</Typography>}</div></Stack><Divider sx={{my:1.25}}/><InfoRow label="차량 소유자" value={vehicle.owner.name}/><InfoRow label="동·호수" value={vehicle.owner.unit ?? '-'}/></Surface>
    <SectionTitle>현재 주차 상태</SectionTitle>
    {exitNotice && <Alert severity={exitNotice.severity} onClose={()=>setExitNotice(null)}>{exitNotice.message}</Alert>}
    <Surface>{parking ? <><InfoRow label="주차 구역" value={parking.slot_label}/><InfoRow label="입차 시각" value={dayTimeOf(parking.entered_at)}/><InfoRow label="주차 상태" value={parking.state === 'PARKED' ? <StatusChip kind="accepted" label="주차 중"/> : <StatusChip kind="disabled" label="출차"/>}/>{overdue && <Alert severity="warning" sx={{mt:1.5}}>출차 예정 시각이 지났어요. 이미 차를 뺐다면 '지금 출차!'를 눌러 주세요. 더 주차한다면 출차 일정을 수정해 주세요.</Alert>}{parking.state === 'PARKED' && <Box mt={1.5}><ExitParkingButton parkingId={parking.parking_id} slotLabel={parking.slot_label} onResult={(notice,changed)=>{setExitNotice(notice);if (changed) reload()}}/></Box>}</> : <Typography variant="caption" color="text.secondary">지금 주차 중이 아니에요.</Typography>}</Surface>
    <SectionTitle>출차 일정</SectionTitle>
    <Surface>{schedule ? <>
      <InfoRow label="예정 출차 시각" value={schedule.expected_exit_at ? dayTimeOf(schedule.expected_exit_at) : '출차 시간 없이 상시 주차 중'}/>
      {/* 등록 유형: 직접 등록 / 반복 / AI 추정 / 없음 */}
      <InfoRow label="등록 유형" value={<Chip size="small" variant="outlined" color="secondary" icon={schedule.exit_source === 'AI_ESTIMATED' ? <AutoAwesomeRoundedIcon/> : undefined} label={sourceLabel[schedule.exit_source]}/>}/>
      <InfoRow label="경과 시간" value={elapsed(schedule.elapsed_minutes)}/>
      {schedule.exit_source === 'AI_ESTIMATED' && <Typography variant="caption" color="text.secondary">출차 시간을 등록하지 않아 지난 기록으로 추정한 시각이에요.</Typography>}
    </> : <Typography variant="caption" color="text.secondary">등록된 출차 일정이 없어요.</Typography>}</Surface>
    <SectionTitle>반복 출차 일정</SectionTitle>
    <Surface>{recurring ? <InfoRow label="매주 반복" value={`${recurring.days.map((day)=>({MON:'월',TUE:'화',WED:'수',THU:'목',FRI:'금',SAT:'토',SUN:'일'}[day])).join(' · ')} ${recurring.time}`}/> : <Typography variant="body2" color="text.secondary">등록된 반복 일정이 없어요.</Typography>}<Button href={toHash('repeat',{id:vehicle.id,from:'vehicle-detail'})} variant="outlined" fullWidth sx={{mt:1.5}}>{recurring ? '반복 일정 변경' : '반복 일정 추가'}</Button></Surface>
    <SectionTitle>주차 위치</SectionTitle>
    {parking ? <ParkingLotPanel shape={lot.shape} slots={lot.slots} focusId={parking.slot_label}/> : <Typography variant="caption" color="text.secondary">지금 주차 중이 아니에요.</Typography>}
    {parking ? <Button href={toHash('departure', { id: vehicle.id })} variant="contained" fullWidth>출차 일정 수정</Button> : <Button href={toHash('parking-register',{id:vehicle.id})} variant="contained" fullWidth>이 차량으로 주차하기</Button>}
  </Stack>
}
