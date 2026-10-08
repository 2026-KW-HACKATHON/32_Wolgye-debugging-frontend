import { useEffect, useState } from 'react'
import EventRepeatRoundedIcon from '@mui/icons-material/EventRepeatRounded'
import { Alert, Box, Button, CircularProgress, Divider, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { PageTitle, SectionTitle, Surface } from '../../components/Ui'
import { isApiError } from '../../api/client'
import { getHome, getMyVehicle, updateParkingSchedule } from '../../api/parking'
import { useApi } from '../../api/useApi'
import { hashParams, toHash } from '../../types/navigation'
import type { VehicleDetail } from '../../types/parking'
import { halfHourOptions } from './timeOptions'
import { readDraft, writeDraft, removeDraft } from '../../utils/formDrafts'
import { dateTimeOf, kstClock, kstDate, kstPartsOf } from './kstTime'

const TIME_OPTIONS = halfHourOptions('06:00','23:30')

type Choice = { day: string; customDate: string; time: string }
const dateOfChoice = ({ day, customDate }: Choice) => day === 'today' ? kstDate() : day === 'tomorrow' ? kstDate(1) : customDate
const toChoice = (date: string, time: string): Choice => ({ day: date === kstDate() ? 'today' : date === kstDate(1) ? 'tomorrow' : 'custom', customDate: date, time })
// 오늘 이미 지난 시각 (서버도 400 INVALID_INPUT, 2026-10-04 결정)
const isPastAt = (date: string, time: string) => date < kstDate() || (date === kstDate() && time <= kstClock())

/** 처음 보여 줄 날짜·시간 (#50). 지금 일정이 아직 안 지났으면 그대로, 지났거나 없으면 다음 30분 선택지 (오늘 남은 선택지가 없으면 내일 첫 시각) */
function initialChoice(current: { date: string; clock: string } | null): Choice {
  if (current && !isPastAt(current.date, current.clock)) return toChoice(current.date, current.clock)
  const next = TIME_OPTIONS.find((value) => !isPastAt(kstDate(), value))
  return next ? toChoice(kstDate(), next) : toChoice(kstDate(1), TIME_OPTIONS[0])
}

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
  const draftKey = `departure-${vehicle.id}`
  const [draft] = useState(()=>readDraft<Choice & {memo:string}>(draftKey))
  const current = vehicle.schedule?.expected_exit_at ?? null
  const currentAt = current ? kstPartsOf(current) : null
  // 지금 출차 시각(예: 15:57)이 30분 선택지에 없으면 선택지에 넣어 그대로 고를 수 있게 한다
  const timeOptions = currentAt && !TIME_OPTIONS.includes(currentAt.clock) ? [...TIME_OPTIONS, currentAt.clock].sort() : TIME_OPTIONS
  // 저장하지 않고 나간 입력값이 그새 지난 시각이 됐거나 선택지에 없으면 버리고 기본값으로 연다
  const [initial] = useState(()=>draft && timeOptions.includes(draft.time) && !isPastAt(dateOfChoice(draft), draft.time) ? draft : initialChoice(currentAt))
  const [day, setDay] = useState(initial.day)
  const [customDate, setCustomDate] = useState(initial.customDate)
  const [time, setTime] = useState(initial.time)
  // 지금 일정의 메모로 채운다. PUT 이라 저장할 때 메모 칸 값을 늘 같이 보낸다 (안 보내면 기존 메모가 지워짐, backend #34)
  const [memo, setMemo] = useState(draft?.memo ?? vehicle.schedule?.memo ?? '')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  useEffect(()=>{writeDraft(draftKey,{day,customDate,time,memo})},[draftKey,day,customDate,time,memo])
  const date = day === 'today' ? kstDate() : day === 'tomorrow' ? kstDate(1) : customDate
  const isPast = (value: string) => date === kstDate() && value <= kstClock()
  const pastTime = isPast(time)

  async function save() {
    if (saving) return
    if (!date || date < kstDate()) return setSaveError('오늘 이후 날짜를 골라 주세요.')
    if (pastTime) return
    setSaving(true)
    setSaveError(null)
    try {
      await updateParkingSchedule(parking.parking_id, { expected_exit_at: `${date}T${time}:00+09:00`, memo: memo.trim() || null })
      removeDraft(draftKey)
      window.location.hash = toHash('vehicle-detail', { id: vehicle.id, saved: 'departure' })
    } catch (e) {
      setSaveError(isApiError(e) ? e.message : '잠시 후 다시 시도해 주세요')
      setSaving(false)
    }
  }

  return <Stack gap={2.25}>
    <PageTitle title="출차 일정 수정" description={`${vehicle.plate} · ${parking.slot_label}에 주차 중 · 출차 예정 시간을 변경해요`}/>
    <Divider/>
    {hashParams().get('saved') === 'repeat' && <Alert severity="success">반복 일정을 저장했어요. 출차 일정 입력은 그대로 유지했어요.</Alert>}
    <SectionTitle>출차 일시</SectionTitle>
    <Typography variant="body2" color="text.secondary">지금 일정: {current ? `${dateTimeOf(current)} 출차 예정` : '등록된 출차 시간 없음'}{current && currentAt && isPastAt(currentAt.date, currentAt.clock) && ' (지난 시각)'}</Typography>
    <TextField select label="날짜 선택" value={day} onChange={(event)=>setDay(event.target.value)}>{[['today','오늘'],['tomorrow','내일'],['custom','날짜 직접 선택']].map(([value,label])=><MenuItem key={value} value={value}>{label}</MenuItem>)}</TextField>
    {day === 'custom' && <TextField type="date" label="날짜" value={customDate} onChange={(event)=>setCustomDate(event.target.value)} slotProps={{inputLabel:{shrink:true},htmlInput:{min:kstDate()}}}/>}
    <TextField select label="출차 시간" value={time} onChange={(event)=>setTime(event.target.value)}>{timeOptions.map((value)=><MenuItem key={value} value={value} disabled={isPast(value)}>{value}{currentAt && value === currentAt.clock && date === currentAt.date ? ' (지금 일정)' : ''}</MenuItem>)}</TextField>
    {pastTime && <Typography variant="caption" color="error">이미 지난 시각이에요. 이후 시각을 골라 주세요</Typography>}
    <Divider/>
    <SectionTitle>반복 설정</SectionTitle>
    <Surface><Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}><Stack direction="row" gap={1.25} alignItems="center"><EventRepeatRoundedIcon color="primary"/><div><Typography variant="subtitle2">반복 일정 설정</Typography><Typography variant="caption" color="text.secondary">매주·매일 반복 출차 일정을 등록합니다</Typography></div></Stack><Button component="a" href={toHash('repeat', { id: vehicle.id, from: 'departure' })} variant="outlined">설정</Button></Stack></Surface>
    <Divider/>
    <TextField label="메모 (선택)" multiline rows={2} value={memo} onChange={(event)=>setMemo(event.target.value)}/>
    {saveError && <Alert severity="error">{saveError}</Alert>}
    <Button variant="contained" fullWidth disabled={saving || pastTime || !date || date < kstDate()} onClick={save}>{saving ? '저장 중…' : '변경 사항 저장'}</Button>
  </Stack>
}
