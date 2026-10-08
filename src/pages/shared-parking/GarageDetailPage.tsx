import { useRef, useState } from 'react'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded'
import { Alert, Box, Button, Chip, CircularProgress, Divider, Drawer, MenuItem, Stack, TextField, Typography } from '@mui/material'
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded'
import { kstClock, kstDate, dateTimeOf } from '../parking/kstTime'
import { InfoRow, PageTitle, SectionTitle, StatusChip, Surface } from '../../components/Ui'
import { hashParams, toHash } from '../../types/navigation'
import { createShareRequest, getGarage } from '../../api/sharedParking'
import { getMe } from '../../api/auth'
import { listMyVehicles } from '../../api/vehicles'
import { isApiError } from '../../api/client'
import { useApi } from '../../api/useApi'
import ParkingLotMap from '../../components/ParkingLotMap'
import { toGarageLot } from '../../components/parkingLotGeometry'
import type { LotSlot } from '../../types/parking'
import type { GarageSlot } from '../../types/sharedParking'
import { hourLabel, isValidRequestDate, todayKst } from './requestPreview'

export default function GarageDetailPage() {
  const garageId = Number(hashParams().get('id') ?? 4)
  const highlightedSlotId = Number(hashParams().get('slot_id'))
  const {data,error,loading,reload} = useApi(async()=>{const [garage,vehicles,me] = await Promise.all([getGarage(garageId),listMyVehicles(),getMe()]);return {garage,vehicles:vehicles.items,me}},String(garageId))
  const [filter,setFilter] = useState('all')
  // 배치도와 목록에서 함께 표시하는 칸. 처음에는 탐색에서 고른 칸(slot_id)
  const [picked,setPicked] = useState(highlightedSlotId)
  const [selected,setSelected] = useState<GarageSlot | null>(null)
  const [date,setDate] = useState(todayKst)
  const [start,setStart] = useState(9)
  const [end,setEnd] = useState(10)
  const [vehicle,setVehicle] = useState('')
  const [busy,setBusy] = useState(false)
  const [submitError,setSubmitError] = useState('')
  const [needsLogin,setNeedsLogin] = useState(false)
  const submitting = useRef(false)
  const offer = selected?.offer
  const day = (['SUN','MON','TUE','WED','THU','FRI','SAT'] as const)[new Date(`${date}T12:00:00+09:00`).getUTCDay()]
  const dateError = !isValidRequestDate(date) ? '오늘 이후 날짜를 선택해 주세요.' : offer && !offer.weekdays.includes(day) ? '이 요일에는 공유하지 않아요. 아래 공유 요일을 확인해 주세요.' : ''
  const timeError = offer && (!Number.isInteger(start) || !Number.isInteger(end) || end <= start || start < offer.start_hour || end > offer.end_hour || (offer.max_hours !== null && end-start > offer.max_hours)) ? '운영 시간과 최대 이용 시간에 맞춰 선택해 주세요.' : date === kstDate() && `${String(start).padStart(2,'0')}:00` < kstClock() ? '이미 지난 시작 시간이에요. 이후 시간이나 다른 날짜를 선택해 주세요.' : ''
  const total = (offer?.hourly_price ?? 0) * Math.max(0,end-start)
  const insufficient = !!data && total > data.me.token_balance
  const invalid = !!dateError || !!timeError || !offer || insufficient || !data?.vehicles.some((item)=>item.id === Number(vehicle))
  const openRequest = (spot:GarageSlot) => {
    setSelected(spot);setSubmitError('');setNeedsLogin(false)
    for (let offset=0;offset<8;offset++) {
      const nextDate=kstDate(offset)
      const nextDay=(['SUN','MON','TUE','WED','THU','FRI','SAT'] as const)[new Date(`${nextDate}T12:00:00Z`).getUTCDay()]
      const nextStart=offset === 0 ? Math.max(spot.offer.start_hour,Number(kstClock().slice(0,2))+(kstClock().slice(3) !== '00' ? 1 : 0)) : spot.offer.start_hour
      if (spot.offer.weekdays.includes(nextDay) && nextStart<spot.offer.end_hour) { setDate(nextDate);setStart(nextStart);setEnd(nextStart+1);break }
    }
    setVehicle(String(data?.vehicles.find((item)=>item.is_default)?.id ?? data?.vehicles[0]?.id ?? ''))
  }
  const sendRequest = async () => {
    if (invalid || !offer || submitting.current) return
    submitting.current = true;setBusy(true);setSubmitError('');setNeedsLogin(false)
    try {const result = await createShareRequest({offer_id:offer.id,vehicle_id:Number(vehicle),request_date:date,start_hour:start,end_hour:end});window.location.hash = toHash('request-result',{id:result.id,garage_id:garageId,slot_id:selected!.slot_id,q:hashParams().get('q') ?? ''})}
    catch(e) {setSubmitError(isApiError(e) ? e.message : '잠시 후 다시 시도해 주세요.');setNeedsLogin(isApiError(e) && e.status === 401)}
    finally {submitting.current = false;setBusy(false)}
  }
  if (loading) return <CircularProgress aria-label="차고지 불러오는 중"/>
  if (error) return <Alert severity="error" action={<Button onClick={reload}>재시도</Button>}>{error.message}<Button href={error.status === 401 ? '#login' : '#share'}>{error.status === 401 ? '로그인' : '다시 탐색'}</Button></Alert>
  if (!data) return null
  const {garage,vehicles,me} = data
  const lot = toGarageLot(garage)
  const pickedLabel = garage.slots.find((spot)=>spot.slot_id === picked)?.label
  // 배치도에서 칸을 누르면 목록의 그 칸으로 내려간다 (필터에 걸려 숨어 있으면 전체로 바꾼다)
  const pickFromMap = (slot:LotSlot) => {
    setPicked(slot.slotId)
    if (filter !== 'all' && garage.slots.find((spot)=>spot.slot_id === slot.slotId)?.state !== filter) setFilter('all')
    requestAnimationFrame(()=>document.getElementById(`garage-slot-${slot.slotId}`)?.scrollIntoView({behavior:'smooth',block:'center'}))
  }
  const visible = garage.slots.filter((spot)=>filter === 'all' || spot.state === filter)
  return <Stack gap={2.25}>
    <PageTitle eyebrow="공유 주차장" title={garage.name}/><Surface sx={{bgcolor:'#F1F6FF',boxShadow:'none'}}><Stack gap={1.25}><Typography variant="subtitle2">{garage.alley.name}</Typography><Typography variant="body2">{garage.address}</Typography><Button startIcon={<LocationOnRoundedIcon/>} component="a" target="_blank" rel="noopener noreferrer" href={`https://map.naver.com/p/search/${encodeURIComponent(garage.address)}`} variant="outlined">지도에서 위치 보기</Button></Stack></Surface>
    <Surface><InfoRow label="운영 시간" value={garage.summary.start_hour === null || garage.summary.end_hour === null ? '공유 중인 칸 없음' : `${hourLabel(garage.summary.start_hour)} – ${hourLabel(garage.summary.end_hour)}`} icon={<AccessTimeRoundedIcon color="primary" fontSize="small"/>}/><Divider/><InfoRow label="요금" value={garage.summary.min_hourly_price === null ? '-' : garage.summary.min_hourly_price === 0 ? '무료부터' : `시간당 ${garage.summary.min_hourly_price}토큰부터`} icon={<PaymentsRoundedIcon color="primary" fontSize="small"/>}/><Divider/><InfoRow label="최대 이용" value={garage.summary.max_hours === null ? '제한 없음' : `${garage.summary.max_hours}시간`}/></Surface>
    <SectionTitle>주차면 현황</SectionTitle>{lot && <Surface sx={{bgcolor:'#F8FAFC',boxShadow:'none',p:1}}><ParkingLotMap shape={lot.shape} slots={lot.slots} focusId={pickedLabel} onInspect={pickFromMap}/><Typography variant="caption" display="block" color="text.secondary" textAlign="center">공유 중인 칸만 보여요. 칸을 누르면 아래 목록에서 찾아 줘요.</Typography></Surface>}<Stack direction="row" gap={0.75} flexWrap="wrap" useFlexGap>{[['all','전체'],['AVAILABLE','이용 가능'],['SOON_EXIT','곧 출차'],['IN_USE','이용 중']].map(([value,label])=><Chip key={value} label={label} color={filter === value ? 'primary' : 'default'} onClick={()=>setFilter(value)}/>)}</Stack>
    {visible.length === 0 && <Typography color="text.secondary" variant="body2">해당 상태의 주차면이 없어요.</Typography>}
    {visible.map((spot)=><Box key={spot.slot_id} id={`garage-slot-${spot.slot_id}`} onClick={()=>setPicked(spot.slot_id)}><Surface sx={spot.slot_id === picked ? {borderColor:'primary.main'} : undefined}><Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}><div><Typography variant="subtitle2">{spot.label}{spot.slot_id === picked && ' · 선택한 칸'}</Typography><Typography variant="caption" color="text.secondary">{spot.offer.hourly_price === 0 ? '무료' : `시간당 ${spot.offer.hourly_price}토큰`}{spot.estimated_free_at && ` · ${dateTimeOf(spot.estimated_free_at)} 출차 추정`}{spot.in_use_until && ` · ${dateTimeOf(spot.in_use_until)}까지 이용 중`}</Typography></div><Stack alignItems="flex-end" gap={0.75}><StatusChip kind={spot.state === 'AVAILABLE' ? 'available' : spot.state === 'SOON_EXIT' ? 'soon' : 'disabled'} label={spot.state === 'IN_USE' ? '이용 중' : undefined}/>{spot.state !== 'IN_USE' && <Button size="small" variant="contained" onClick={()=>openRequest(spot)}>요청하기</Button>}</Stack></Stack></Surface></Box>)}
    <Alert severity="info" sx={{borderRadius:3}}>지정 주차면만 이용할 수 있으며, 종료 시간을 지켜 주세요.</Alert>
    <Drawer anchor="bottom" open={selected !== null} onClose={()=>{if (!busy) setSelected(null)}} slotProps={{paper:{sx:{maxWidth:440,mx:'auto',borderTopLeftRadius:20,borderTopRightRadius:20,maxHeight:'90dvh'}}}}><Stack gap={2} p={3} pb="calc(24px + env(safe-area-inset-bottom))" component="form" onSubmit={(event)=>{event.preventDefault();void sendRequest()}}>
      <Typography variant="h6">공유 요청 · {selected?.label}</Typography>
      {vehicles.length === 0 ? <Alert severity="info" action={<Button href="#vehicles">차량 등록</Button>}>이용할 차량을 먼저 등록해 주세요.</Alert> : <TextField select label="이용 차량" value={vehicle} disabled={busy} onChange={(event)=>setVehicle(event.target.value)}>{vehicles.map((item)=><MenuItem key={item.id} value={String(item.id)}>{item.plate}{item.alias ? ` · ${item.alias}` : ''}</MenuItem>)}</TextField>}
      <TextField label="이용 날짜" type="date" error={!!dateError} helperText={dateError} value={date} disabled={busy} onChange={(event)=>setDate(event.target.value)} slotProps={{inputLabel:{shrink:true},htmlInput:{min:todayKst()}}}/>
      <Stack direction="row" gap={1}><TextField select fullWidth error={!!timeError} label="시작 시간" value={start} disabled={busy} onChange={(event)=>{const next=Number(event.target.value);setStart(next);setEnd(next+1)}}>{Array.from({length:(offer?.end_hour ?? 23)-(offer?.start_hour ?? 7)},(_,i)=>(offer?.start_hour ?? 7)+i).map((hour)=><MenuItem key={hour} value={hour}>{hourLabel(hour)}</MenuItem>)}</TextField><TextField select fullWidth label="종료 시간" error={!!timeError} value={end} disabled={busy} onChange={(event)=>setEnd(Number(event.target.value))}>{Array.from({length:Math.min(offer?.max_hours ?? 24,(offer?.end_hour ?? 23)-start)},(_,i)=>start+i+1).map((hour)=><MenuItem key={hour} value={hour}>{hourLabel(hour)}</MenuItem>)}</TextField></Stack>
      {timeError && <Typography variant="caption" color="error">{timeError}</Typography>}{offer && <><Typography variant="body2">공유 요일: {offer.weekdays.map((day)=>({MON:'월',TUE:'화',WED:'수',THU:'목',FRI:'금',SAT:'토',SUN:'일'}[day])).join(' · ')}</Typography><Typography variant="body2">총 이용 요금 {total.toLocaleString()}토큰 · {offer.max_hours === null ? '시간 제한 없음' : `최대 ${offer.max_hours}시간`}</Typography><Typography variant="caption" color="text.secondary">보유 {me.token_balance.toLocaleString()}토큰 · 수락 시 차감됩니다.</Typography></>}
      {insufficient && <Alert severity="warning">보유 토큰이 부족해요. 이용 시간을 줄이거나 무료 주차 칸을 찾아보세요.</Alert>}{submitError && <Alert severity="error" action={needsLogin ? <Button href="#login">로그인</Button> : undefined}>{submitError}</Alert>}
      <Typography variant="caption" color="text.secondary">요청만으로 이용이 확정되지는 않아요. 관리자 수락 후 이용해 주세요.</Typography><Button type="submit" variant="contained" disabled={invalid || busy}>{busy ? '요청 중…' : '요청 보내기'}</Button><Button disabled={busy} onClick={()=>setSelected(null)}>닫기</Button>
    </Stack></Drawer>
  </Stack>
}
