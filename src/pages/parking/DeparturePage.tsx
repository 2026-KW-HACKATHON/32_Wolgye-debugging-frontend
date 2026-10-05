import { useState } from 'react'
import EventRepeatRoundedIcon from '@mui/icons-material/EventRepeatRounded'
import { Alert, Box, Button, CircularProgress, Divider, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { PageTitle, SectionTitle, Surface } from '../../components/Ui'
import { isApiError } from '../../api/client'
import { getHome, getMyVehicle, updateParkingSchedule } from '../../api/parking'
import { useApi } from '../../api/useApi'
import { hashParams, toHash } from '../../types/navigation'
import type { VehicleDetail } from '../../types/parking'
import { halfHourOptions } from './timeOptions'

const TIME_OPTIONS = halfHourOptions('06:00','23:30')
const kstDate = (offsetDays = 0) => new Date(Date.now() + 9 * 3600000 + offsetDays * 86400000).toISOString().slice(0, 10)

// 차량 id 는 #departure?id=7. 없으면(화면 목록에서 직접 연 경우) 홈의 내 주차 차량을 쓴다
async function loadVehicle(paramId: number) {
  const vehicleId = paramId || (await getHome()).my_parking?.vehicle.id
  return vehicleId ? getMyVehicle(vehicleId) : null
}

export default function DeparturePage() {
  const paramId = Number(hashParams().get('id')) || 0
  const { data, error, reload } = useApi(() => loadVehicle(paramId), `departure-${paramId}`)
  if (error) return <Alert severity="error" action={<Button color="inherit" size="small" onClick={reload}>다시 시도</Button>}>{error.message}</Alert>
  if (data === undefined) return <Box display="grid" py={6} sx={{placeItems:'center'}}><CircularProgress size={30}/></Box>
  if (!data?.parking) return <Stack gap={2.25}><PageTitle title="출차 일정 수정"/><Typography variant="caption" color="text.secondary">주차 중인 차량이 없어 출차 일정을 바꿀 수 없어요.</Typography></Stack>
  return <DepartureForm key={data.id} vehicle={data} parking={data.parking}/>
}

function DepartureForm({ vehicle, parking }: { vehicle: VehicleDetail; parking: NonNullable<VehicleDetail['parking']> }) {
  const current = vehicle.schedule?.expected_exit_at ?? null
  const currentDate = current?.slice(0, 10)
  const [day, setDay] = useState(!currentDate ? 'tomorrow' : currentDate === kstDate() ? 'today' : currentDate === kstDate(1) ? 'tomorrow' : 'custom')
  const [customDate, setCustomDate] = useState(currentDate ?? '')
  // 지금 출차 시각이 선택지(06:00~14:00) 밖이면 기본값 07:30
  const [time, setTime] = useState(current && TIME_OPTIONS.includes(current.slice(11, 16)) ? current.slice(11, 16) : '07:30')
  // 지금 일정의 메모로 채운다. PUT 이라 저장할 때 메모 칸 값을 늘 같이 보낸다 (안 보내면 기존 메모가 지워짐, backend #34)
  const [memo, setMemo] = useState(vehicle.schedule?.memo ?? '')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function save() {
    const date = day === 'today' ? kstDate() : day === 'tomorrow' ? kstDate(1) : customDate
    if (!date) return setSaveError('날짜를 골라 주세요.')
    setSaving(true)
    setSaveError(null)
    try {
      await updateParkingSchedule(parking.parking_id, { expected_exit_at: `${date}T${time}:00+09:00`, memo: memo.trim() || null })
      window.location.hash = toHash('vehicle-detail', { id: vehicle.id })
    } catch (e) {
      setSaveError(isApiError(e) ? e.message : '잠시 후 다시 시도해 주세요')
      setSaving(false)
    }
  }

  return <Stack gap={2.25}>
    <PageTitle title="출차 일정 수정" description={`${vehicle.plate} · ${parking.slot_label}에 주차 중 — 배치는 그대로 두고 출차 일정만 바꿉니다`}/>
    <Divider/>
    <SectionTitle>출차 일시</SectionTitle>
    <TextField select label="날짜 선택" value={day} onChange={(event)=>setDay(event.target.value)}>{[['today','오늘'],['tomorrow','내일'],['custom','날짜 직접 선택']].map(([value,label])=><MenuItem key={value} value={value}>{label}</MenuItem>)}</TextField>
    {day === 'custom' && <TextField type="date" label="날짜" value={customDate} onChange={(event)=>setCustomDate(event.target.value)} slotProps={{inputLabel:{shrink:true},htmlInput:{min:kstDate()}}}/>}
    <TextField select label="출차 시간" value={time} onChange={(event)=>setTime(event.target.value)}>{TIME_OPTIONS.map((value)=><MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
    <Divider/>
    <SectionTitle>반복 설정</SectionTitle>
    <Surface><Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}><Stack direction="row" gap={1.25} alignItems="center"><EventRepeatRoundedIcon color="primary"/><div><Typography variant="subtitle2">반복 일정 설정</Typography><Typography variant="caption" color="text.secondary">매주·매일 반복 출차 일정을 등록합니다</Typography></div></Stack><Button component="a" href={toHash('repeat', { id: vehicle.id })} variant="outlined">설정</Button></Stack></Surface>
    <Divider/>
    <TextField label="메모 (선택)" multiline rows={2} value={memo} onChange={(event)=>setMemo(event.target.value)}/>
    {saveError && <Alert severity="error">{saveError}</Alert>}
    <Button variant="contained" fullWidth disabled={saving} onClick={save}>변경 사항 저장</Button>
  </Stack>
}
