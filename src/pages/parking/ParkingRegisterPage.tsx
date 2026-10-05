import { useState } from 'react'
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded'
import EventRoundedIcon from '@mui/icons-material/EventRounded'
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Stack, Switch, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { NavButton, PageTitle, SectionTitle, StatusChip, Surface } from '../../components/Ui'
import ParkingLotMap, { type LotView } from '../../components/ParkingLotMap'
import { slotById, toLotSlots } from '../../components/parkingLotGeometry'
import { isApiError } from '../../api/client'
import { createParking, getBuildingLayout, getBuildingStatus, getHome, getSlotRecommendations } from '../../api/parking'
import { useApi } from '../../api/useApi'
import { toHash } from '../../types/navigation'
import type { Home, LotSlot, SlotId } from '../../types/parking'
import type { VehicleListItem } from '../../types/vehicles'
import { getDefaultVehicle } from './defaultVehicle'
import UnavailableNotice from './UnavailableNotice'
import { kstClock, kstDate } from './kstTime'

function BottomSheet({ children }: { children: React.ReactNode }) {
  return <Box sx={{mx:-2.5,mb:-2.5,mt:0,bgcolor:'#fff',borderTop:'1px solid',borderColor:'divider',borderRadius:'24px 24px 0 0',boxShadow:'0 -12px 32px rgba(23,35,60,.08)',p:2.5,pb:'calc(24px + env(safe-area-inset-bottom))','@media (max-width: 360px)':{mx:-2,px:2}}}>{children}</Box>
}

const CUSTOM_TIME = '직접 입력'
const OCCUPIED_REASON = '다른 차가 주차 중'
const GENERAL_REASON = '사용할 수 없는 칸이에요'
const WEEKDAY = '일월화수목금토'

const errorMessage = (e: unknown) => isApiError(e) ? e.message : '잠시 후 다시 시도해 주세요'
const monthDay = (date: string) => `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}`
const weekday = (date: string) => WEEKDAY[new Date(`${date}T00:00:00Z`).getUTCDay()]
const dayTitle = (date: string) => date === kstDate() ? '오늘' : date === kstDate(1) ? '내일' : `${monthDay(date)}에`
const isTime = (value: string) => /^\d{2}:\d{2}$/.test(value)
const isDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value)

const loadBase = async () => { const [home, vehicle] = await Promise.all([getHome(), getDefaultVehicle()]); return { home, vehicle } }
const loadLot = async (buildingId: number) => { const [layout, status] = await Promise.all([getBuildingLayout(buildingId), getBuildingStatus(buildingId)]); return toLotSlots(layout, status) }

function Loading() {
  return <Box display="grid" py={6} sx={{placeItems:'center'}}><CircularProgress size={30}/></Box>
}

function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <Alert severity="error" action={<Button color="inherit" size="small" onClick={onRetry}>다시 시도</Button>}>{message}</Alert>
}

export default function ParkingRegisterPage() {
  const { data, error, reload } = useApi(() => loadBase(), 'parking-register')
  // 기본 차량 조회는 로그인 세션이 필요하다 (401)
  if (error?.status === 401) return <Stack gap={2.25}><PageTitle title="차 배치 · 출차 등록"/><Alert severity="info" action={<NavButton to="login" variant="text">로그인</NavButton>}>로그인이 필요해요.</Alert></Stack>
  if (error) return <LoadError message={error.message} onRetry={reload}/>
  if (!data) return <Loading/>
  if (!data.vehicle) return <Stack gap={2.25}><PageTitle title="차 배치 · 출차 등록"/><Surface><Stack gap={1.25}><Typography variant="caption" color="text.secondary">등록된 차량이 없어요. 차량을 먼저 등록해 주세요.</Typography><NavButton to="vehicles" variant="outlined" fullWidth>차량 관리로 가기</NavButton></Stack></Surface></Stack>
  return <RegisterView home={data.home} vehicle={data.vehicle} reloadBase={reload}/>
}

function RegisterView({ home, vehicle, reloadBase }: { home: Home; vehicle: VehicleListItem; reloadBase: () => void }) {
  const buildingId = home.building.id
  const [date, setDate] = useState(kstDate(1))
  const [dateOpen, setDateOpen] = useState(false)
  const [time, setTime] = useState('07:30')
  const [customTime, setCustomTime] = useState('08:00')
  const [longTerm, setLongTerm] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const [memo, setMemo] = useState('')
  const [picked, setPicked] = useState<SlotId | null>(null)
  const [view, setView] = useState<LotView>('iso')
  const [unavailable, setUnavailable] = useState<{ label: string; reason: string } | null>(null)
  const [sending, setSending] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [parkedError, setParkedError] = useState(false)

  const exitTime = time === CUSTOM_TIME ? customTime : time
  // 오늘 이미 지난 시각은 고를 수 없다 (2026-10-04 결정)
  const isPast = (value: string) => date === kstDate() && isTime(value) && value <= kstClock()
  const pastTime = !longTerm && isPast(exitTime)
  const expectedExitAt = longTerm || !isTime(exitTime) || pastTime ? undefined : `${date}T${exitTime}:00+09:00`
  const canQuery = longTerm || expectedExitAt !== undefined
  const lot = useApi(() => loadLot(buildingId), `lot-${buildingId}`)
  const rec = useApi(() => canQuery ? getSlotRecommendations(buildingId, { vehicle_id: vehicle.id, ...(expectedExitAt ? { expected_exit_at: expectedExitAt } : {}) }) : Promise.resolve(null), `rec-${buildingId}-${vehicle.id}-${longTerm ? 'long' : expectedExitAt ?? 'none'}`)

  const recs = rec.data?.slots ?? []
  const recommended = recs.find((item) => item.tag === 'RECOMMENDED')
  // 추천 결과에서 사용 불가인 칸(예약 등)은 현황이 빈 칸이어도 사용 불가로 그린다
  const lotSlots: LotSlot[] = (lot.data ?? []).map((slot) => slot.state === 'empty' && recs.some((item) => item.slot_id === slot.slotId && item.tag === 'UNAVAILABLE') ? { ...slot, state: 'unavailable' } : slot)
  const recommendedId = recommended?.label
  // 고른 칸이 다시 받은 결과에서 빈 칸이 아니면 추천 칸으로 돌아간다
  const selected = picked && slotById(lotSlots, picked)?.state === 'empty' ? picked : recommendedId
  const selectedSlot = selected ? slotById(lotSlots, selected) : undefined
  const selectedRec = selectedSlot && recs.find((item) => item.slot_id === selectedSlot.slotId)
  const isRecommended = !!selected && selected === recommendedId
  const labelOf = (slotId: number) => recs.find((item) => item.slot_id === slotId)?.label ?? lotSlots.find((slot) => slot.slotId === slotId)?.label
  const willBlock = (selectedRec?.will_block ?? []).map(labelOf).filter(Boolean)
  const hint = !canQuery ? '출차 시간을 입력하면 추천 칸을 알려 드려요' : rec.loading && !rec.data ? '추천 칸을 찾는 중이에요' : !selectedSlot ? '빈 칸을 탭해서 골라 주세요' : isRecommended && recommended?.reason ? recommended.reason : willBlock.length ? `여기 두면 ${willBlock.join('·')} 차를 막을 수 있어요` : '여기 두면 막게 되는 이웃 차가 없어요'
  const parkedLabel = home.my_parking?.slot_label
  const alreadyParked = !!home.my_parking || parkedError

  function showUnavailable(slot: LotSlot) {
    const reason = slot.state === 'unavailable' ? recs.find((item) => item.slot_id === slot.slotId)?.unavailable_reason ?? GENERAL_REASON : OCCUPIED_REASON
    setUnavailable({ label: slot.label, reason })
  }

  async function submit() {
    if (!selectedSlot) return
    setSending(true)
    setSubmitError(null)
    try {
      const trimmed = memo.trim()
      await createParking({ slot_id: selectedSlot.slotId, vehicle_id: vehicle.id, ...(longTerm ? { is_long_term: true } : { is_long_term: false, expected_exit_at: expectedExitAt, repeat_weekdays: repeat }), ...(trimmed ? { memo: trimmed } : {}) })
      window.location.hash = toHash('home')
    } catch (e) {
      if (isApiError(e) && e.code === 'SLOT_UNAVAILABLE') {
        const reason = e.detail?.reason
        setUnavailable({ label: selectedSlot.label, reason: typeof reason === 'string' ? reason : GENERAL_REASON })
        setPicked(null)
        lot.reload()
        rec.reload()
      } else if (isApiError(e) && e.code === 'SLOT_OCCUPIED') {
        setUnavailable({ label: selectedSlot.label, reason: OCCUPIED_REASON })
        setPicked(null)
        lot.reload()
        rec.reload()
      } else if (isApiError(e) && e.code === 'VEHICLE_ALREADY_PARKED') {
        setParkedError(true)
        reloadBase()
      } else setSubmitError(errorMessage(e))
      setSending(false)
    }
  }

  return <Stack gap={2.25}>
    <PageTitle title="차 배치 · 출차 등록" description="배치도에서 빈 칸을 탭하면 내 차가 놓여요."/>
    {alreadyParked && <Alert severity="info" action={<NavButton to="home" variant="text" color="inherit">홈으로</NavButton>}>{parkedLabel ? `이미 ${parkedLabel}에 주차 중이에요` : '이미 주차 중이에요'}</Alert>}
    <Box sx={{position:'relative',borderRadius:4,bgcolor:'#F8FAFC',border:'1px solid',borderColor:'divider',p:1}}>
      {lot.error ? <LoadError message={lot.error.message} onRetry={lot.reload}/> : lot.data ? <>
        <ToggleButtonGroup exclusive size="small" value={view} onChange={(_,value)=>value&&setView(value)} aria-label="배치도 시점" sx={{position:'absolute',top:8,right:8,bgcolor:'#fff'}}><ToggleButton value="iso" sx={{px:1.25,py:0.25}}>입체</ToggleButton><ToggleButton value="top" sx={{px:1.25,py:0.25}}>평면</ToggleButton></ToggleButtonGroup>
        <ParkingLotMap slots={lotSlots} view={view} selected={selected} recommendedId={recommendedId} onSelect={setPicked} onUnavailable={showUnavailable}/>
      </> : <Loading/>}
    </Box>
    <Stack direction="row" gap={0.75} flexWrap="wrap"><StatusChip kind="recommended" label="★ 추천"/><StatusChip kind="available" label="빈 칸"/><StatusChip kind="disabled" label="사용 불가"/></Stack>
    {rec.error && <LoadError message={rec.error.message} onRetry={rec.reload}/>}
    <Surface sx={{bgcolor:'#F7F9FC'}}><Stack direction="row" gap={1.5} alignItems="center">{selectedSlot && <Box sx={{width:120,flexShrink:0,borderRadius:3,overflow:'hidden',border:'1px solid',borderColor:'divider',bgcolor:'#fff'}}><ParkingLotMap slots={lotSlots} view="top" selected={selected} recommendedId={recommendedId} focusId={selected}/></Box>}<Box minWidth={0}><Typography variant="subtitle2">선택한 칸 · {selectedSlot?.label ?? '없음'}{isRecommended && <Typography component="span" variant="subtitle2" color="#12B76A"> ★추천</Typography>}</Typography><Typography variant="caption" color="text.secondary">{hint}{selectedSlot ? ' · 다른 칸을 탭하면 바뀝니다' : ''}</Typography></Box></Stack></Surface>
    <BottomSheet><Stack gap={2.25}>
      <SectionTitle>내 차량</SectionTitle>
      <Stack direction="row" justifyContent="space-between" alignItems="center"><Stack direction="row" gap={1.25} alignItems="center"><Box sx={{width:46,height:46,borderRadius:3,display:'grid',placeItems:'center',bgcolor:'#E8F0FF',color:'primary.main'}}><DirectionsCarRoundedIcon/></Box><Box><Typography variant="subtitle2">{vehicle.plate}</Typography><Typography variant="caption" color="text.secondary">{vehicle.color ?? '색상 미등록'}</Typography></Box></Stack><NavButton to="vehicles" variant="outlined">차량 변경</NavButton></Stack>
      <FormControlLabel control={<Switch checked={longTerm} onChange={(_,checked)=>setLongTerm(checked)}/>} label="상시 주차 여부" sx={{justifyContent:'space-between',mx:0}} labelPlacement="start"/>
      {longTerm ? <Typography variant="caption" color="text.secondary">상시 주차는 출차 시간 없이 배치해요.</Typography> : <>
        <Typography variant="caption" color="text.secondary" textAlign="center">↓ 스크롤해서 출차 시간도 함께 등록</Typography>
        <SectionTitle action={<Chip size="small" icon={<EventRoundedIcon/>} label={`${monthDay(date)} (${weekday(date)}) · 날짜 변경`} clickable onClick={()=>setDateOpen(true)}/>}>{dayTitle(date)} 몇 시에 나가요?</SectionTitle>
        <ToggleButtonGroup exclusive value={time} onChange={(_,value)=>value&&setTime(value)} fullWidth size="small">{['06:00','07:30','09:00',CUSTOM_TIME].map((value)=><ToggleButton key={value} value={value} disabled={value !== CUSTOM_TIME && isPast(value)}>{value}</ToggleButton>)}</ToggleButtonGroup>
        {pastTime && time !== CUSTOM_TIME && <Typography variant="caption" color="error">이미 지난 시각이에요. 이후 시각을 골라 주세요</Typography>}
        {time === CUSTOM_TIME && <TextField label="출차 시간" type="time" value={customTime} onChange={(event)=>setCustomTime(event.target.value)} error={!isTime(customTime) || pastTime} helperText={!isTime(customTime) ? '출차 시간을 입력해 주세요' : pastTime ? '이미 지난 시각이에요. 이후 시각을 골라 주세요' : undefined} slotProps={{inputLabel:{shrink:true}}}/>}
        <Stack direction="row" justifyContent="space-between" alignItems="center"><Box><Typography variant="subtitle2">평일 같은 시간 반복</Typography><Typography variant="caption" color="text.secondary">월–금 {isTime(exitTime) ? exitTime : '--:--'}</Typography></Box><Switch checked={repeat} onChange={(_,checked)=>setRepeat(checked)}/></Stack>
        <Button component="a" href={toHash('repeat', { id: vehicle.id })} variant="outlined" fullWidth>반복 요일 자세히 설정</Button>
      </>}
      <TextField label="메모 (선택)" multiline rows={2} placeholder="이웃에게 전달할 내용을 적어 주세요" value={memo} onChange={(event)=>setMemo(event.target.value)}/>
      {submitError && <Alert severity="error">{submitError}</Alert>}
      <Button variant="contained" fullWidth disabled={sending || alreadyParked || !selectedSlot || !canQuery} onClick={submit}>{sending ? '배치하는 중…' : '여기에 배치하기'}</Button>
    </Stack></BottomSheet>
    <Dialog open={dateOpen} onClose={()=>setDateOpen(false)} fullWidth maxWidth="xs"><DialogTitle>출차 날짜</DialogTitle><DialogContent><TextField type="date" fullWidth value={date} onChange={(event)=>{ const value = event.target.value; if (isDate(value) && value >= kstDate()) setDate(value) }} slotProps={{htmlInput:{min:kstDate()}}} sx={{mt:1}}/></DialogContent><DialogActions><Button onClick={()=>setDateOpen(false)}>완료</Button></DialogActions></Dialog>
    <Dialog open={unavailable !== null} onClose={()=>setUnavailable(null)} fullWidth maxWidth="xs"><DialogContent><UnavailableNotice reason={unavailable ? `${unavailable.label} · ${unavailable.reason}` : ''} actions={<><Button variant="contained" fullWidth onClick={()=>setUnavailable(null)}>다른 칸 선택</Button><Button variant="outlined" fullWidth onClick={()=>setUnavailable(null)}>취소</Button></>}/></DialogContent></Dialog>
  </Stack>
}
