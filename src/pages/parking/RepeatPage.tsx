import { useState } from 'react'
import { Alert, Box, Button, CircularProgress, Divider, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { NavButton, PageTitle, SectionTitle } from '../../components/Ui'
import { isApiError } from '../../api/client'
import { getHome, getMyVehicle, getRecurringSchedule, putRecurringSchedule } from '../../api/parking'
import { useApi } from '../../api/useApi'
import { hashParams, toHash } from '../../types/navigation'
import { WEEKDAYS, type Weekday } from '../../types/api'
import type { RecurringSchedule } from '../../types/parking'
import { getDefaultVehicle } from './defaultVehicle'
import { halfHourOptions } from './timeOptions'

const TIME_OPTIONS = halfHourOptions('06:00','23:30')
const dayLabel: Record<Weekday, string> = { MON: '월', TUE: '화', WED: '수', THU: '목', FRI: '금', SAT: '토', SUN: '일' }

// 차량 id 는 #repeat?id=7. 없으면(화면 목록에서 직접 연 경우) 홈의 내 주차 차량, 주차 중이 아니면 기본 차량(없으면 첫 차)을 쓴다
async function loadRepeat(paramId: number) {
  const vehicleId = paramId || (await getHome()).my_parking?.vehicle.id || (await getDefaultVehicle())?.id
  if (!vehicleId) return null
  // 반복 일정이 없으면 404 (목 기준, 명세에 없는 경우) → 빈 일정으로 시작
  const schedule = await getRecurringSchedule(vehicleId).catch((e: unknown) => { if (isApiError(e) && e.code === 'NOT_FOUND') return null; throw e })
  return { vehicleId, schedule, vehicle: await getMyVehicle(vehicleId) }
}

export default function RepeatPage() {
  const paramId = Number(hashParams().get('id')) || 0
  const { data, error, reload } = useApi(() => loadRepeat(paramId), `repeat-${paramId}`)
  // 기본 차량 조회는 로그인 세션이 필요하다 (401)
  if (error?.status === 401) return <Stack gap={2.25}><PageTitle title="반복 일정 설정"/><Alert severity="info" action={<NavButton to="login" variant="text">로그인</NavButton>}>로그인이 필요해요.</Alert></Stack>
  if (error) return <Alert severity="error" action={<Button color="inherit" size="small" onClick={reload}>다시 시도</Button>}>{error.message}</Alert>
  if (data === undefined) return <Box display="grid" py={6} sx={{placeItems:'center'}}><CircularProgress size={30}/></Box>
  if (!data) return <Stack gap={2.25}><PageTitle title="반복 일정 설정"/><Typography variant="caption" color="text.secondary">차량 정보를 찾을 수 없어요.</Typography></Stack>
  return <RepeatForm key={data.vehicleId} vehicleId={data.vehicleId} schedule={data.schedule} plate={data.vehicle.plate}/>
}

function RepeatForm({ vehicleId, schedule, plate }: { vehicleId: number; schedule: RecurringSchedule | null; plate: string }) {
  const [days, setDays] = useState<Weekday[]>(schedule?.days ?? ['MON','TUE','WED','THU','FRI'])
  // 저장된 시각이 선택지(06:00~12:00) 밖이면 기본값 07:30
  const [time, setTime] = useState(schedule && TIME_OPTIONS.includes(schedule.time) ? schedule.time : '07:30')
  const [memo, setMemo] = useState(schedule?.memo ?? '')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function save() {
    if (saving) return
    if (!days.length) return setSaveError('요일을 하나 이상 골라 주세요.')
    setSaving(true)
    setSaveError(null)
    try {
      await putRecurringSchedule(vehicleId, { days: WEEKDAYS.filter((day) => days.includes(day)), time, memo: memo.trim() || null })
      const from = hashParams().get('from')
      const target = from === 'parking-register' || from === 'departure' ? from : 'vehicle-detail'
      window.location.hash = toHash(target, { id: vehicleId, saved: 'repeat' })
    } catch (e) {
      setSaveError(isApiError(e) ? e.message : '잠시 후 다시 시도해 주세요')
      setSaving(false)
    }
  }

  return <Stack gap={2.25}>
    <PageTitle title="반복 일정 설정" description={`${plate} · 매주 반복할 출차 일정을 설정해요.`}/>
    <Divider/>
    <SectionTitle>반복 요일</SectionTitle>
    <ToggleButtonGroup color="primary" aria-label="반복 요일" value={days} onChange={(_,value: Weekday[])=>setDays(value)} size="small" sx={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>{WEEKDAYS.map((day)=><ToggleButton key={day} value={day} sx={{minWidth:0,px:0,minHeight:44,'&.Mui-selected':{bgcolor:'primary.main',color:'#fff','&:hover':{bgcolor:'primary.dark'}}}}>{dayLabel[day]}</ToggleButton>)}</ToggleButtonGroup>
    <Divider/>
    <Typography variant="body2" color="text.secondary">{days.length ? `매주 ${WEEKDAYS.filter((day)=>days.includes(day)).map((day)=>dayLabel[day]).join(' · ')}요일 반복` : '반복할 요일을 하나 이상 선택해 주세요.'}</Typography>
    <SectionTitle>출차 예정 시간</SectionTitle>
    <TextField select label="출차 시간" value={time} onChange={(event)=>setTime(event.target.value)}>{TIME_OPTIONS.map((value)=><MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
    <Divider/>
    <TextField label="메모 (선택)" placeholder="예: 출근 일정" multiline rows={2} value={memo} onChange={(event)=>setMemo(event.target.value)}/>
    {saveError && <Alert severity="error">{saveError}</Alert>}
    <Button variant="contained" fullWidth disabled={saving || !days.length} onClick={save}>{saving ? '저장 중…' : '반복 일정 저장'}</Button>
  </Stack>
}
