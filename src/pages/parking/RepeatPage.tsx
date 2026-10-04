import { useState } from 'react'
import { Alert, Box, Button, CircularProgress, Divider, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { PageTitle, SectionTitle } from '../../components/Ui'
import { isApiError } from '../../api/client'
import { getHome, getRecurringSchedule, listMyVehicles, putRecurringSchedule } from '../../api/parking'
import { useApi } from '../../api/useApi'
import { hashParams, toHash } from '../../types/navigation'
import { WEEKDAYS, type Weekday } from '../../types/api'
import type { RecurringSchedule } from '../../types/parking'
import { halfHourOptions } from './timeOptions'

const TIME_OPTIONS = halfHourOptions('06:00','23:30')
const dayLabel: Record<Weekday, string> = { MON: '월', TUE: '화', WED: '수', THU: '목', FRI: '금', SAT: '토', SUN: '일' }

const defaultVehicleId = async () => { const { items } = await listMyVehicles(); return (items.find((item) => item.is_default) ?? items[0])?.id }

// 차량 id 는 #repeat?id=7. 없으면(화면 목록에서 직접 연 경우) 홈의 내 주차 차량, 주차 중이 아니면 기본 차량(없으면 첫 차)을 쓴다
async function loadRepeat(paramId: number) {
  const vehicleId = paramId || (await getHome()).my_parking?.vehicle.id || await defaultVehicleId()
  if (!vehicleId) return null
  // 반복 일정이 없으면 404 (목 기준, 명세에 없는 경우) → 빈 일정으로 시작
  const schedule = await getRecurringSchedule(vehicleId).catch((e: unknown) => { if (isApiError(e) && e.code === 'NOT_FOUND') return null; throw e })
  return { vehicleId, schedule }
}

export default function RepeatPage() {
  const paramId = Number(hashParams().get('id')) || 0
  const { data, error, reload } = useApi(() => loadRepeat(paramId), `repeat-${paramId}`)
  if (error) return <Alert severity="error" action={<Button color="inherit" size="small" onClick={reload}>다시 시도</Button>}>{error.message}</Alert>
  if (data === undefined) return <Box display="grid" py={6} sx={{placeItems:'center'}}><CircularProgress size={30}/></Box>
  if (!data) return <Stack gap={2.25}><PageTitle title="반복 일정 설정"/><Typography variant="caption" color="text.secondary">차량 정보를 찾을 수 없어요.</Typography></Stack>
  return <RepeatForm key={data.vehicleId} vehicleId={data.vehicleId} schedule={data.schedule}/>
}

function RepeatForm({ vehicleId, schedule }: { vehicleId: number; schedule: RecurringSchedule | null }) {
  const [days, setDays] = useState<Weekday[]>(schedule?.days ?? ['MON','TUE','WED','THU','FRI'])
  // 저장된 시각이 선택지(06:00~12:00) 밖이면 기본값 07:30
  const [time, setTime] = useState(schedule && TIME_OPTIONS.includes(schedule.time) ? schedule.time : '07:30')
  const [memo, setMemo] = useState(schedule?.memo ?? '')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function save() {
    if (!days.length) return setSaveError('요일을 하나 이상 골라 주세요.')
    setSaving(true)
    setSaveError(null)
    try {
      await putRecurringSchedule(vehicleId, { days: WEEKDAYS.filter((day) => days.includes(day)), time, memo: memo.trim() || null })
      window.location.hash = toHash('home')
    } catch (e) {
      setSaveError(isApiError(e) ? e.message : '잠시 후 다시 시도해 주세요')
      setSaving(false)
    }
  }

  return <Stack gap={2.25}>
    <PageTitle title="반복 일정 설정" description="매주 반복할 출차 일정을 설정하세요."/>
    <Divider/>
    <SectionTitle>반복 요일</SectionTitle>
    <ToggleButtonGroup value={days} onChange={(_,value: Weekday[])=>setDays(value)} size="small" sx={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>{WEEKDAYS.map((day)=><ToggleButton key={day} value={day} sx={{minWidth:0,px:0}}>{dayLabel[day]}</ToggleButton>)}</ToggleButtonGroup>
    <Divider/>
    <SectionTitle>출차 예정 시간</SectionTitle>
    <TextField select label="출차 시간" value={time} onChange={(event)=>setTime(event.target.value)}>{TIME_OPTIONS.map((value)=><MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
    <Divider/>
    <TextField label="메모 (선택)" placeholder="예: 출근 일정" multiline rows={2} value={memo} onChange={(event)=>setMemo(event.target.value)}/>
    {saveError && <Alert severity="error">{saveError}</Alert>}
    <Button variant="contained" fullWidth disabled={saving} onClick={save}>반복 일정 저장</Button>
  </Stack>
}
