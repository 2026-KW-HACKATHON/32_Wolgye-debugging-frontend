import { useState } from 'react'
import { Alert, Box, Button, Checkbox, Chip, CircularProgress, Divider, FormControlLabel, InputAdornment, MenuItem, Stack, Switch, TextField, Typography } from '@mui/material'
import { PageTitle, SectionTitle, Surface } from '../../components/Ui'
import { createAdminShareOffer, listAdminShareOffers, listAdminSlots, updateAdminShareOffer } from '../../api/admin'
import { isApiError } from '../../api/client'
import { getHome } from '../../api/parking'
import { useApi } from '../../api/useApi'
import { WEEKDAYS, type Weekday } from '../../types/api'
import type { AdminSlot, ShareOffer, ShareOfferUpdate } from '../../types/admin'
import { toHash } from '../../types/navigation'
import { hourLabel } from '../parking/kstTime'

const HOURS = Array.from({ length: 25 }, (_, hour) => hour)
const dayLabel: Record<Weekday, string> = { MON: '월', TUE: '화', WED: '수', THU: '목', FRI: '금', SAT: '토', SUN: '일' }
// 값 '' = 제한 없음 (max_hours null)
const maxHourOptions = [{ value: '1', label: '1시간' }, { value: '2', label: '2시간' }, { value: '3', label: '3시간' }, { value: '4', label: '4시간' }, { value: '', label: '제한 없음' }]
// 새 등록 기본값 / 기존 공유 조건 → 폼 값
type Form = { startHour: number; endHour: number; days: Weekday[]; price: string; maxHours: string; memo: string; isPublic: boolean }
const DEFAULT_FORM: Form = { startHour: 6, endHour: 18, days: [...WEEKDAYS], price: '2', maxHours: '4', memo: '', isPublic: true }
const formOf = (offer: ShareOffer): Form => ({ startHour: offer.start_hour, endHour: offer.end_hour, days: [...offer.weekdays], price: String(offer.hourly_price), maxHours: offer.max_hours === null ? '' : String(offer.max_hours), memo: offer.memo ?? '', isPublic: offer.is_public })

// building_id 는 홈 응답의 building.id. 공유할 수 있는 칸 = 사용 중(is_active)인 칸
async function loadGarage() {
  const buildingId = (await getHome()).building.id
  const [slots, offers] = await Promise.all([listAdminSlots(buildingId), listAdminShareOffers(buildingId)])
  return { buildingId, slots: slots.items.filter((slot) => slot.is_active), offers: offers.items }
}

export default function GarageRegisterPage() {
  const { data, error, reload } = useApi(loadGarage, 'garage-register')
  if (error) return <Stack gap={2.25}><PageTitle title="차고지 등록"/><Alert severity="error" action={<Button color="inherit" size="small" onClick={reload}>다시 시도</Button>}>{error.message}</Alert></Stack>
  if (!data) return <Box display="grid" py={6} sx={{placeItems:'center'}}><CircularProgress size={30}/></Box>
  return <GarageForm key={data.buildingId} buildingId={data.buildingId} slots={data.slots} offers={data.offers}/>
}

function GarageForm({ buildingId, slots, offers }: { buildingId: number; slots: AdminSlot[]; offers: ShareOffer[] }) {
  // 처음엔 아직 공유하지 않는 첫 칸을 골라 둔다
  const [slotIds, setSlotIds] = useState<number[]>(() => { const first = slots.find((slot) => slot.share_offer_id === null); return first ? [first.slot_id] : [] })
  const [form, setForm] = useState<Form>(DEFAULT_FORM)
  const { startHour, endHour, days, price, maxHours, memo, isPublic } = form
  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((prev) => ({ ...prev, [key]: value }))
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const offerOf = (slot: AdminSlot) => offers.find((offer) => offer.id === slot.share_offer_id) ?? offers.find((offer) => offer.slot_id === slot.slot_id) ?? null
  const isShared = (slot: AdminSlot) => slot.share_offer_id !== null || offers.some((offer) => offer.slot_id === slot.slot_id)
  // 여러 칸을 한 번에 고른다. 공유 중인 칸은 같은 조건으로 함께 수정하고, 새 칸은 같은 조건으로 함께 등록한다
  const selected = slots.filter((slot) => slotIds.includes(slot.slot_id))
  const editing = selected.filter(isShared).map(offerOf).filter((offer): offer is ShareOffer => offer !== null)
  const newSlotIds = selected.filter((slot) => !isShared(slot)).map((slot) => slot.slot_id)
  const labels = (items: { slot_label?: string; label?: string }[]) => items.map((item) => item.slot_label ?? item.label).join('·')
  // 저장된 최대 시간이 선택지 밖이면 선택지에 더한다
  const maxOptions = maxHourOptions.some((option) => option.value === maxHours) ? maxHourOptions : [...maxHourOptions.slice(0, -1), { value: maxHours, label: `${maxHours}시간` }, maxHourOptions[maxHourOptions.length - 1]]
  function toggleSlot(slot: AdminSlot) {
    setSaveError(null)
    if (slotIds.includes(slot.slot_id)) {
      const next = slotIds.filter((id) => id !== slot.slot_id)
      setSlotIds(next)
      if (!next.length) setForm(DEFAULT_FORM)
      return
    }
    if (isShared(slot) && !offerOf(slot)) return setSaveError('이 칸의 공유 조건을 찾을 수 없어요. 잠시 후 다시 시도해 주세요.')
    // 처음 고르는 공유 중인 칸이고 폼을 아직 바꾸지 않았으면 그 칸의 조건을 불러와 시작점으로 쓴다. 그 밖에는 지금 폼을 그대로 둔다
    const offer = isShared(slot) ? offerOf(slot) : null
    if (offer && !editing.length && JSON.stringify(form) === JSON.stringify(DEFAULT_FORM)) setForm(formOf(offer))
    setSlotIds([...slotIds, slot.slot_id])
  }
  const toggleDay = (day: Weekday) => set('days', days.includes(day) ? days.filter((item) => item !== day) : [...days, day])

  async function submit() {
    if (!slotIds.length) return setSaveError('공유할 칸을 하나 이상 골라 주세요.')
    if (!days.length) return setSaveError('요일을 하나 이상 골라 주세요.')
    if (startHour >= endHour) return setSaveError('시작 시간은 종료 시간보다 빨라야 합니다.')
    if (!/^\d+$/.test(price.trim())) return setSaveError('요금은 0 이상의 정수로 입력해 주세요.')
    const fields = { weekdays: WEEKDAYS.filter((day) => days.includes(day)), start_hour: startHour, end_hour: endHour, hourly_price: Number(price.trim()), max_hours: maxHours ? Number(maxHours) : null, memo: memo.trim() || null, is_public: isPublic }
    // 수정은 칸마다 바뀐 필드만 보낸다
    const updates = editing.map((offer) => {
      const changes: ShareOfferUpdate = {}
      if (fields.weekdays.join() !== WEEKDAYS.filter((day) => offer.weekdays.includes(day)).join()) changes.weekdays = fields.weekdays
      if (fields.start_hour !== offer.start_hour) changes.start_hour = fields.start_hour
      if (fields.end_hour !== offer.end_hour) changes.end_hour = fields.end_hour
      if (fields.hourly_price !== offer.hourly_price) changes.hourly_price = fields.hourly_price
      if (fields.max_hours !== offer.max_hours) changes.max_hours = fields.max_hours
      if (fields.memo !== offer.memo) changes.memo = fields.memo
      if (fields.is_public !== offer.is_public) changes.is_public = fields.is_public
      return { offer, changes }
    }).filter(({ changes }) => Object.keys(changes).length)
    if (!newSlotIds.length && !updates.length) return setSaveError('바뀐 조건이 없어요.')
    setSaving(true)
    setSaveError(null)
    // 새 칸 등록은 서버가 한 번에 처리한다(하나라도 실패하면 전부 취소). 수정은 칸마다 보내서, 중간에 실패하면 저장된 칸을 알려 준다
    const done: string[] = []
    try {
      if (newSlotIds.length) { await createAdminShareOffer(buildingId, { slot_ids: newSlotIds, ...fields }); done.push(labels(selected.filter((slot) => newSlotIds.includes(slot.slot_id)))) }
      for (const { offer, changes } of updates) { await updateAdminShareOffer(offer.id, changes); done.push(offer.slot_label) }
      window.location.assign(toHash('admin'))
    } catch (e) {
      const message = isApiError(e) ? e.message : '잠시 후 다시 시도해 주세요.'
      setSaveError(done.length ? `${done.join('·')}는 저장했어요. 나머지 칸은 저장하지 못했어요: ${message}` : message)
      setSaving(false)
    }
  }

  return <Stack gap={2.25}>
    <PageTitle title="차고지 등록" description="공유할 칸을 고르고 이용 조건을 정해 주세요. 여러 칸을 고르면 같은 조건이 칸마다 하나씩 등록돼요. 공유 중인 칸을 고르면 그 칸의 조건을 함께 수정해요."/>
    <SectionTitle>공유할 칸 선택</SectionTitle>
    <Surface>{slots.length ? <Stack>{slots.map((slot)=><FormControlLabel key={slot.slot_id} control={<Checkbox checked={slotIds.includes(slot.slot_id)} onChange={()=>toggleSlot(slot)}/>} label={<Stack direction="row" gap={0.75} alignItems="center"><Typography variant="body2">{slot.label}</Typography>{isShared(slot) && <Chip size="small" color="secondary" variant="outlined" label="공유 중"/>}</Stack>}/>)}</Stack> : <Typography variant="caption" color="text.secondary">공유할 수 있는 칸이 없어요. 주차 구역 설정에서 칸을 사용 가능으로 바꿔 주세요.</Typography>}</Surface>
    {!!slotIds.length && <Alert severity="info">{[editing.length ? `${labels(editing)} 공유 중 · 조건 수정` : '', newSlotIds.length ? `${labels(selected.filter((slot) => newSlotIds.includes(slot.slot_id)))} 새로 공유` : ''].filter(Boolean).join(' / ')}{slotIds.length > 1 ? ' · 같은 조건으로 저장해요' : ''}</Alert>}
    <Divider/>
    <SectionTitle>가용 시간</SectionTitle>
    <Stack direction="row" gap={1}><TextField select fullWidth label="시작 시간" value={startHour} onChange={(event)=>set('startHour', Number(event.target.value))}>{HOURS.map((hour)=><MenuItem key={hour} value={hour}>{hourLabel(hour)}</MenuItem>)}</TextField><TextField select fullWidth label="종료 시간" value={endHour} onChange={(event)=>set('endHour', Number(event.target.value))}>{HOURS.map((hour)=><MenuItem key={hour} value={hour}>{hourLabel(hour)}</MenuItem>)}</TextField></Stack>
    <Stack gap={0.75}><Typography variant="caption" color="text.secondary">이용 가능 요일</Typography><Stack direction="row" gap={0.75} flexWrap="wrap">{WEEKDAYS.map((day)=>{const on=days.includes(day);return <Chip key={day} label={dayLabel[day]} clickable aria-pressed={on} variant={on?'filled':'outlined'} onClick={()=>toggleDay(day)} sx={on?{bgcolor:'primary.main',color:'#fff','&:hover':{bgcolor:'primary.dark'}}:{color:'text.secondary'}}/>})}</Stack></Stack>
    <Divider/>
    <SectionTitle>이용 조건</SectionTitle>
    <TextField label="시간당 요금 (토큰)" value={price} onChange={(event)=>set('price', event.target.value)} helperText="0이면 무료로 공개돼요" slotProps={{htmlInput:{inputMode:'numeric'},input:{endAdornment:<InputAdornment position="end">토큰</InputAdornment>}}}/>
    <TextField select label="최대 이용 시간" value={maxHours} onChange={(event)=>set('maxHours', event.target.value)} slotProps={{select:{displayEmpty:true},inputLabel:{shrink:true}}}>{maxOptions.map((option)=><MenuItem key={option.label} value={option.value}>{option.label}</MenuItem>)}</TextField>
    <TextField label="메모 (이용자에게 전달할 사항)" multiline rows={3} value={memo} onChange={(event)=>set('memo', event.target.value)}/>
    <Divider/>
    <SectionTitle>공개 설정</SectionTitle>
    <Surface><Stack direction="row" justifyContent="space-between" alignItems="center"><div><Typography variant="subtitle2">차고지 공개</Typography><Typography variant="caption" color="text.secondary">공유 주차 목록에 표시합니다.</Typography></div><Switch checked={isPublic} onChange={(event)=>set('isPublic', event.target.checked)}/></Stack></Surface>
    {editing.some((offer) => offer.is_public) && !isPublic && <Alert severity="warning">공개를 끄고 저장하면 {labels(editing.filter((offer) => offer.is_public))} 공유가 중단돼요. 공유 주차 목록에서 사라지고 이웃이 새로 요청할 수 없어요.</Alert>}
    {saveError && <Alert severity="error">{saveError}</Alert>}
    <Button variant="contained" fullWidth disabled={saving} onClick={submit}>{editing.length && newSlotIds.length ? '등록·수정 저장하기' : editing.length ? '조건 수정하기' : '차고지 등록 완료'}</Button>
  </Stack>
}
