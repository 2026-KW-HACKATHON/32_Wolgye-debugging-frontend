import { useState } from 'react'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded'
import { Alert, Button, Chip, Divider, Drawer, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { GarageVisual } from '../../components/Illustrations'
import { InfoRow, PageTitle, SectionTitle, StatusChip, Surface } from '../../components/Ui'
import { garages } from '../../data/mockData'
import { hashParams, toHash } from '../../types/navigation'
import { hourLabel, isValidRequestDate, todayKst } from './requestPreview'

export default function GarageDetailPage() {
  const garageId = Number(hashParams().get('id') ?? garages[0].garageId)
  const highlightedOfferId = Number(hashParams().get('offer_id'))
  const spots = garages.filter((item) => item.garageId === garageId)
  const garage = spots[0]
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<(typeof garages)[number] | null>(null)
  const [date, setDate] = useState(todayKst)
  const [start, setStart] = useState(9)
  const [end, setEnd] = useState(10)
  const [vehicle, setVehicle] = useState('7')
  const isWeekend = date ? [0, 6].includes(new Date(`${date}T12:00:00+09:00`).getUTCDay()) : false
  const invalid = !isValidRequestDate(date) || !selected || !Number.isInteger(start) || !Number.isInteger(end) || end <= start || start < selected.startHour || end > selected.endHour || end - start > selected.maxHours || (selected.garageId === 5 && isWeekend)
  const visible = spots.filter((spot) => filter === 'all' || spot.status === filter)
  if (!garage) return <Alert severity="info" action={<Button href="#share">다시 탐색</Button>}>차고지를 찾을 수 없어요.</Alert>
  // TODO(logic): #16 GET /garages/{id}의 칸별 offer 및 GET /me/vehicles를 표시한다.
  const openRequest = (spot: (typeof garages)[number]) => {
    setSelected(spot)
    setStart(spot.startHour)
    setEnd(spot.startHour + 1)
  }
  const previewRequest = () => {
    if (invalid || !selected) return
    // TODO(logic): #16 POST /share-requests 후 반환된 id로 이동하고 토큰 부족·시간 충돌을 처리한다.
    window.location.hash = toHash('request-result', {offer_id:selected.offerId, vehicle_id:vehicle, request_date:date, start_hour:start, end_hour:end})
  }
  return <Stack gap={2.25}><PageTitle eyebrow="공유 차고지" title={garage.name} description={garage.address}/><GarageVisual large/><Surface><InfoRow label="운영 시간" value={`${hourLabel(garage.startHour)} – ${hourLabel(garage.endHour)}`} icon={<AccessTimeRoundedIcon color="primary" fontSize="small"/>}/><Divider/><InfoRow label="요금" value={garage.hourlyPrice === 0 ? '무료' : `시간당 ${garage.hourlyPrice}토큰`} icon={<PaymentsRoundedIcon color="primary" fontSize="small"/>}/><Divider/><InfoRow label="최대 이용" value={`${garage.maxHours}시간`}/></Surface><SectionTitle>주차면 현황</SectionTitle><Stack direction="row" gap={0.75} flexWrap="wrap" useFlexGap>{[['all','전체'],['available','이용 가능'],['soon','곧 출차'],['disabled','이용 중']].map(([value,label])=><Chip key={value} label={label} color={filter === value ? 'primary' : 'default'} onClick={()=>setFilter(value)}/>)}</Stack>{visible.length === 0 && <Typography color="text.secondary" variant="body2">해당 상태의 주차면이 없어요.</Typography>}{visible.map((spot)=><Surface key={spot.offerId} sx={spot.offerId === highlightedOfferId ? {borderColor:'primary.main'} : undefined}><Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}><div><Typography variant="subtitle2">{spot.label}{spot.offerId === highlightedOfferId && ' · 선택한 칸'}</Typography><Typography variant="caption" color="text.secondary">{spot.note}</Typography></div><Stack alignItems="flex-end" gap={0.75}><StatusChip kind={spot.status === 'available' ? 'available' : spot.status === 'soon' ? 'soon' : spot.status === 'reserve' ? 'pending' : 'disabled'} label={spot.status === 'reserve' ? '예약 가능' : undefined}/>{spot.status !== 'disabled' && <Button size="small" variant="contained" onClick={()=>openRequest(spot)}>요청하기</Button>}</Stack></Stack></Surface>)}<Alert severity="info" sx={{borderRadius:3}}>지정 주차면만 이용할 수 있으며, 종료 시간을 지켜 주세요.</Alert><Drawer anchor="bottom" open={selected !== null} onClose={()=>setSelected(null)} slotProps={{paper:{sx:{maxWidth:440,mx:'auto',borderTopLeftRadius:20,borderTopRightRadius:20}}}}><Stack gap={2} p={3} component="form" onSubmit={(event)=>{event.preventDefault();previewRequest()}}><Typography variant="h6">공유 요청 · {selected?.label}</Typography><TextField select label="이용 차량" value={vehicle} onChange={(event)=>setVehicle(event.target.value)}><MenuItem value="7">12가 3456 · 흰색</MenuItem></TextField><TextField label="이용 날짜" type="date" value={date} onChange={(event)=>setDate(event.target.value)} slotProps={{inputLabel:{shrink:true},htmlInput:{min:todayKst()}}}/><Stack direction="row" gap={1}><TextField select fullWidth label="시작 시간" value={start} onChange={(event)=>{const next=Number(event.target.value);setStart(next);setEnd(next+1)}}>{Array.from({length:(selected?.endHour ?? 23)-(selected?.startHour ?? 7)},(_,i)=>(selected?.startHour ?? 7)+i).map((hour)=><MenuItem key={hour} value={hour}>{hourLabel(hour)}</MenuItem>)}</TextField><TextField select fullWidth label="종료 시간" value={end} onChange={(event)=>setEnd(Number(event.target.value))}>{Array.from({length:Math.min(selected?.maxHours ?? 4,(selected?.endHour ?? 23)-start)},(_,i)=>start+i+1).map((hour)=><MenuItem key={hour} value={hour}>{hourLabel(hour)}</MenuItem>)}</TextField></Stack>{selected && <Typography variant="body2">예상 요금 {(selected.hourlyPrice * Math.max(0,end-start)).toLocaleString()}토큰 · 최대 {selected.maxHours}시간</Typography>}{invalid && <Alert severity="warning">이용 가능한 날짜와 시간을 선택해 주세요.{selected?.garageId === 5 && ' 평일에만 이용할 수 있어요.'}</Alert>}<Alert severity="info">지금은 요청 화면을 미리 볼 수 있어요. 실제 요청은 전송되지 않습니다.</Alert><Button type="submit" variant="contained" disabled={invalid}>요청 화면 미리보기</Button><Button onClick={()=>setSelected(null)}>닫기</Button></Stack></Drawer></Stack>
}
