import { useRef, useState } from 'react'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { Alert, Box, Button, CircularProgress, InputAdornment, Stack, Tab, Tabs, TextField, Typography } from '@mui/material'
import { AreaMap, GarageVisual } from '../../components/Illustrations'
import { PageTitle, StatusChip, Surface } from '../../components/Ui'
import { listGarages, listMyShareRequests } from '../../api/sharedParking'
import { isApiError } from '../../api/client'
import { useApi } from '../../api/useApi'
import type { GarageFilter, GarageListItem } from '../../types/sharedParking'
import { toHash } from '../../types/navigation'

function GarageResults({query,filter}:{query:string;filter:GarageFilter}) {
  const {data,error,loading,reload} = useApi(()=>listGarages({q:query,filter,limit:3}))
  const [extra,setExtra] = useState<GarageListItem[]>([])
  const [cursor,setCursor] = useState<string | null | undefined>(undefined)
  const [busy,setBusy] = useState(false)
  const [moreError,setMoreError] = useState('')
  const fetchingMore = useRef(false)
  const next = cursor === undefined ? data?.next_cursor : cursor
  const more = async () => {
    if (!next || fetchingMore.current) return
    fetchingMore.current = true
    setBusy(true);setMoreError('')
    try { const page = await listGarages({q:query,filter,limit:3,cursor:next});setExtra((items)=>[...items,...page.items]);setCursor(page.next_cursor) }
    catch(e) { setMoreError(isApiError(e) ? e.message : '잠시 후 다시 시도해 주세요.') }
    finally { fetchingMore.current = false;setBusy(false) }
  }
  if (loading) return <CircularProgress aria-label="차고지 불러오는 중"/>
  if (error) return <Alert severity="error" action={<Button onClick={reload}>재시도</Button>}>{error.message}{error.status === 401 && <Button href="#login">로그인</Button>}</Alert>
  const items = [...(data?.items ?? []),...extra]
  return <><Typography variant="subtitle1">내 주변 차고지</Typography>{items.length === 0 && <Alert severity="info">조건에 맞는 자리가 없어요. 검색어나 필터를 바꿔보세요.</Alert>}{items.map((garage)=><Surface key={garage.slot_id}><Box component="a" href={toHash('garage-detail',{id:garage.garage_id,slot_id:garage.slot_id})} sx={{display:'flex',gap:1.5,color:'inherit'}}><GarageVisual/><Stack minWidth={0} flex={1} justifyContent="center" alignItems="flex-start" gap={0.5}><Typography variant="subtitle2">{garage.title}</Typography><StatusChip kind={garage.availability === 'AVAILABLE' ? 'available' : garage.availability === 'SOON_EXIT' ? 'soon' : garage.availability === 'UNAVAILABLE' ? 'disabled' : 'pending'} label={garage.availability === 'RESERVABLE' ? '예약 가능' : garage.availability === 'AVAILABLE' ? '이용 가능' : undefined}/><Typography variant="body2" fontWeight={800}>{garage.hourly_price === 0 ? '무료' : `시간당 ${garage.hourly_price.toLocaleString()}토큰`}</Typography><Typography variant="caption" color="text.secondary">{garage.info}</Typography></Stack></Box></Surface>)}{moreError && <Alert severity="error">{moreError}</Alert>}{next && <Button onClick={more} disabled={busy}>{busy ? '불러오는 중…' : '더 보기'}</Button>}</>
}
export default function SharePage() {
  const [filter,setFilter] = useState<GarageFilter>('all')
  const [query,setQuery] = useState('')
  const requests = useApi(listMyShareRequests)
  return <Stack gap={2.25}><PageTitle title="공유 주차 탐색" description="내 주변에서 이용할 수 있는 자리를 찾아보세요."/><AreaMap/><TextField label="주소, 빌라명으로 검색" value={query} onChange={(event)=>setQuery(event.target.value)} slotProps={{input:{startAdornment:<InputAdornment position="start"><SearchRoundedIcon/></InputAdornment>}}}/><Tabs value={filter} onChange={(_,value:GarageFilter)=>setFilter(value)} variant="scrollable" scrollButtons={false} aria-label="공유 주차 필터" sx={{minHeight:38,'.MuiTab-root':{minHeight:38,minWidth:'auto',px:1.5,borderRadius:3}}}><Tab value="all" label="전체"/><Tab value="now" label="즉시 가능"/><Tab value="reservable" label="예약 가능"/><Tab value="free" label="무료"/></Tabs><GarageResults key={`${filter}:${query.trim()}`} query={query.trim()} filter={filter}/><Typography variant="subtitle1">내 요청 현황</Typography>{requests.loading ? <CircularProgress size={24} aria-label="요청 불러오는 중"/> : requests.error ? <Alert severity="error" action={<Button onClick={requests.reload}>재시도</Button>}>{requests.error.message}</Alert> : !requests.data?.items.length ? <Typography variant="body2" color="text.secondary">아직 보낸 요청이 없어요.</Typography> : requests.data.items.map((request)=><Button key={request.id} href={toHash('request-result',{id:request.id,garage_id:request.garage.id,slot_id:request.slot_id})} variant="outlined" sx={{justifyContent:'space-between',gap:1}}><span>{request.garage.name} · {request.slot_label}<br/>{request.request_date}</span><StatusChip kind={request.status === 'APPROVED' ? 'accepted' : request.status === 'REJECTED' ? 'rejected' : 'pending'}/></Button>)}</Stack>
}
