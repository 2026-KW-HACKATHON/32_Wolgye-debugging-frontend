import { useState } from 'react'
import { Alert, Box, Button, Checkbox, Chip, CircularProgress, Divider, FormControlLabel, InputAdornment, MenuItem, Stack, Switch, TextField, Typography } from '@mui/material'
import { PageTitle, SectionTitle, Surface } from '../../components/Ui'
import { createAdminShareOffer, listAdminSlots } from '../../api/admin'
import { isApiError } from '../../api/client'
import { getHome } from '../../api/parking'
import { useApi } from '../../api/useApi'
import { WEEKDAYS, type Weekday } from '../../types/api'
import type { AdminSlot } from '../../types/admin'
import { toHash } from '../../types/navigation'

const HOURS = Array.from({ length: 25 }, (_, hour) => hour)
const hourLabel = (hour: number) => `${String(hour).padStart(2, '0')}:00`
const dayLabel: Record<Weekday, string> = { MON: '월', TUE: '화', WED: '수', THU: '목', FRI: '금', SAT: '토', SUN: '일' }
// 값 '' = 제한 없음 (max_hours null)
const maxHourOptions = [{ value: '1', label: '1시간' }, { value: '2', label: '2시간' }, { value: '3', label: '3시간' }, { value: '4', label: '4시간' }, { value: '', label: '제한 없음' }]

// building_id 는 홈 응답의 building.id. 공유할 수 있는 칸 = 사용 중(is_active)인 칸
async function loadGarage() {
  const buildingId = (await getHome()).building.id
  const slots = (await listAdminSlots(buildingId)).items.filter((slot) => slot.is_active)
  return { buildingId, slots }
}

export default function GarageRegisterPage() {
  const { data, error, reload } = useApi(loadGarage, 'garage-register')
  if (error) return <Stack gap={2.25}><PageTitle title="차고지 등록"/><Alert severity="error" action={<Button color="inherit" size="small" onClick={reload}>다시 시도</Button>}>{error.message}</Alert></Stack>
  if (!data) return <Box display="grid" py={6} sx={{placeItems:'center'}}><CircularProgress size={30}/></Box>
  return <GarageForm key={data.buildingId} buildingId={data.buildingId} slots={data.slots}/>
}

function GarageForm({ buildingId, slots }: { buildingId: number; slots: AdminSlot[] }) {
  // 처음엔 아직 공유하지 않는 첫 칸을 골라 둔다
  const [slotIds, setSlotIds] = useState<number[]>(() => { const first = slots.find((slot) => slot.share_offer_id === null); return first ? [first.slot_id] : [] })
  const [startHour, setStartHour] = useState(6)
  const [endHour, setEndHour] = useState(18)
  const [days, setDays] = useState<Weekday[]>([...WEEKDAYS])
  const [price, setPrice] = useState('2')
  const [maxHours, setMaxHours] = useState('4')
  const [memo, setMemo] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const toggleSlot = (slotId: number) => setSlotIds((ids) => ids.includes(slotId) ? ids.filter((id) => id !== slotId) : [...ids, slotId])
  const toggleDay = (day: Weekday) => setDays((list) => list.includes(day) ? list.filter((item) => item !== day) : [...list, day])

  async function submit() {
    if (!slotIds.length) return setSaveError('공유할 칸을 하나 이상 골라 주세요.')
    if (!days.length) return setSaveError('요일을 하나 이상 골라 주세요.')
    if (startHour >= endHour) return setSaveError('시작 시간은 종료 시간보다 빨라야 합니다.')
    if (!/^\d+$/.test(price.trim())) return setSaveError('요금은 0 이상의 정수로 입력해 주세요.')
    setSaving(true)
    setSaveError(null)
    try {
      await createAdminShareOffer(buildingId, { slot_ids: slotIds, weekdays: WEEKDAYS.filter((day) => days.includes(day)), start_hour: startHour, end_hour: endHour, hourly_price: Number(price.trim()), max_hours: maxHours ? Number(maxHours) : null, memo: memo.trim() || null, is_public: isPublic })
      window.location.hash = toHash('admin')
    } catch (e) {
      setSaveError(isApiError(e) ? e.message : '잠시 후 다시 시도해 주세요.')
      setSaving(false)
    }
  }

  return <Stack gap={2.25}>
    <PageTitle title="차고지 등록" description="공유할 칸을 고르고 이용 조건을 정해 주세요. 칸마다 공유 조건이 하나씩 등록돼요."/>
    <SectionTitle>공유할 칸 선택</SectionTitle>
    <Surface>{slots.length ? <Stack>{slots.map((slot)=><FormControlLabel key={slot.slot_id} control={<Checkbox checked={slotIds.includes(slot.slot_id)} onChange={()=>toggleSlot(slot.slot_id)}/>} label={<Typography variant="body2">{slot.label}{slot.share_offer_id !== null && <Typography component="span" variant="caption" color="text.secondary"> · 공유 중</Typography>}</Typography>}/>)}</Stack> : <Typography variant="caption" color="text.secondary">공유할 수 있는 칸이 없어요. 주차 구역 설정에서 칸을 사용 가능으로 바꿔 주세요.</Typography>}</Surface>
    <Divider/>
    <SectionTitle>가용 시간</SectionTitle>
    <Stack direction="row" gap={1}><TextField select fullWidth label="시작 시간" value={startHour} onChange={(event)=>setStartHour(Number(event.target.value))}>{HOURS.map((hour)=><MenuItem key={hour} value={hour}>{hourLabel(hour)}</MenuItem>)}</TextField><TextField select fullWidth label="종료 시간" value={endHour} onChange={(event)=>setEndHour(Number(event.target.value))}>{HOURS.map((hour)=><MenuItem key={hour} value={hour}>{hourLabel(hour)}</MenuItem>)}</TextField></Stack>
    <Stack gap={0.75}><Typography variant="caption" color="text.secondary">이용 가능 요일</Typography><Stack direction="row" gap={0.75} flexWrap="wrap">{WEEKDAYS.map((day)=><Chip key={day} label={dayLabel[day]} clickable color={days.includes(day)?'primary':'default'} variant={days.includes(day)?'filled':'outlined'} onClick={()=>toggleDay(day)}/>)}</Stack></Stack>
    <Divider/>
    <SectionTitle>이용 조건</SectionTitle>
    <TextField label="시간당 요금 (토큰)" value={price} onChange={(event)=>setPrice(event.target.value)} helperText="0이면 무료로 공개돼요" slotProps={{htmlInput:{inputMode:'numeric'},input:{endAdornment:<InputAdornment position="end">토큰</InputAdornment>}}}/>
    <TextField select label="최대 이용 시간" value={maxHours} onChange={(event)=>setMaxHours(event.target.value)} slotProps={{select:{displayEmpty:true},inputLabel:{shrink:true}}}>{maxHourOptions.map((option)=><MenuItem key={option.label} value={option.value}>{option.label}</MenuItem>)}</TextField>
    <TextField label="메모 (이용자에게 전달할 사항)" multiline rows={3} value={memo} onChange={(event)=>setMemo(event.target.value)}/>
    <Divider/>
    <SectionTitle>공개 설정</SectionTitle>
    <Surface><Stack direction="row" justifyContent="space-between" alignItems="center"><div><Typography variant="subtitle2">차고지 공개</Typography><Typography variant="caption" color="text.secondary">공유 주차 목록에 표시합니다.</Typography></div><Switch checked={isPublic} onChange={(event)=>setIsPublic(event.target.checked)}/></Stack></Surface>
    {saveError && <Alert severity="error">{saveError}</Alert>}
    <Button variant="contained" fullWidth disabled={saving} onClick={submit}>차고지 등록 완료</Button>
  </Stack>
}
