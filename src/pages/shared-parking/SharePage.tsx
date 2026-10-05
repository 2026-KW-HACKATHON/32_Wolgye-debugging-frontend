import { useEffect, useRef, useState } from 'react'
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded'
import { getMe } from '../../api/auth'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { Alert, Box, Button, CircularProgress, InputAdornment, Stack, Tab, Tabs, TextField, Typography } from '@mui/material'
import { GarageVisual } from '../../components/Illustrations'
import { StatusChip, Surface } from '../../components/Ui'
import { listGarages, listMyShareRequests } from '../../api/sharedParking'
import { isApiError } from '../../api/client'
import { useApi } from '../../api/useApi'
import type { GarageFilter, GarageListItem, ShareRequestDetail } from '../../types/sharedParking'
import { hashParams, toHash } from '../../types/navigation'

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
  return <><Typography variant="subtitle1">공유 중인 주차 칸</Typography>{items.length === 0 && <Alert severity="info">조건에 맞는 자리가 없어요. 검색어나 필터를 바꿔보세요.</Alert>}{items.map((garage)=><Surface key={garage.slot_id}><Box component="a" href={toHash('garage-detail',{id:garage.garage_id,slot_id:garage.slot_id,q:query,filter})} sx={{display:'flex',gap:1.5,alignItems:'center',color:'inherit'}}><GarageVisual/><Stack minWidth={0} flex={1} justifyContent="center" alignItems="flex-start" gap={0.5}><Typography variant="subtitle2">{garage.title}</Typography><StatusChip kind={garage.availability === 'AVAILABLE' ? 'available' : garage.availability === 'SOON_EXIT' ? 'soon' : garage.availability === 'UNAVAILABLE' ? 'disabled' : 'pending'} label={garage.availability === 'RESERVABLE' ? '예약 가능' : garage.availability === 'AVAILABLE' ? '이용 가능' : undefined}/><Typography variant="body2" fontWeight={800}>{garage.hourly_price === 0 ? '무료' : `시간당 ${garage.hourly_price.toLocaleString()}토큰`}</Typography><Typography variant="caption" color="text.secondary">{garage.info}</Typography></Stack></Box></Surface>)}{moreError && <Alert severity="error">{moreError}</Alert>}{next && <Button onClick={more} disabled={busy}>{busy ? '불러오는 중…' : '더 보기'}</Button>}</>
}
function MyRequests({query,filter}:{query:string;filter:GarageFilter}) {
  const {data,error,loading,reload} = useApi(()=>listMyShareRequests())
  const [extra,setExtra] = useState<ShareRequestDetail[]>([])
  const [cursor,setCursor] = useState<string | null | undefined>(undefined)
  const [busy,setBusy] = useState(false)
  const [moreError,setMoreError] = useState('')
  const fetchingMore = useRef(false)
  const next = cursor === undefined ? data?.next_cursor : cursor
  // 서버는 20개씩 준다. 그 뒤는 더 보기로 이어 받는다 (GarageResults 와 같은 방식)
  const more = async () => {
    if (!next || fetchingMore.current) return
    fetchingMore.current = true
    setBusy(true);setMoreError('')
    try { const page = await listMyShareRequests({cursor:next});setExtra((items)=>[...items,...page.items]);setCursor(page.next_cursor) }
    catch(e) { setMoreError(isApiError(e) ? e.message : '잠시 후 다시 시도해 주세요.') }
    finally { fetchingMore.current = false;setBusy(false) }
  }
  const items = [...(data?.items ?? []),...extra]
  return <><Typography variant="subtitle1">내 요청 현황</Typography>{loading ? <CircularProgress size={24} aria-label="요청 불러오는 중"/> : error ? <Alert severity="error" action={<Button onClick={reload}>재시도</Button>}>{error.message}</Alert> : !items.length ? <Typography variant="body2" color="text.secondary">아직 보낸 요청이 없어요.</Typography> : items.map((request)=><Button key={request.id} href={toHash('request-result',{id:request.id,garage_id:request.garage.id,slot_id:request.slot_id,q:query,filter})} variant="outlined" sx={{justifyContent:'space-between',gap:1}}><span>{request.garage.name} · {request.slot_label}<br/>{request.request_date}</span><StatusChip kind={request.status === 'APPROVED' ? 'accepted' : request.status === 'REJECTED' ? 'rejected' : 'pending'}/></Button>)}{moreError && <Alert severity="error">{moreError}</Alert>}{next && !loading && !error && <Button variant="text" disabled={busy} onClick={()=>void more()}>{busy ? '불러오는 중…' : '요청 더 보기'}</Button>}</>
}
export default function SharePage() {
  const initialFilter = hashParams().get('filter')
  const [filter,setFilter] = useState<GarageFilter>(initialFilter === 'now' || initialFilter === 'reservable' || initialFilter === 'free' ? initialFilter : 'all')
  const [query,setQuery] = useState(hashParams().get('q') ?? '')
  const [search,setSearch] = useState(query)
  const profile = useApi(()=>getMe(),'share-profile')
  useEffect(()=>{const timer=window.setTimeout(()=>setSearch(query.trim()),300);return()=>window.clearTimeout(timer)},[query])
  return <Stack gap={2.25}>{profile.data?.building && <Surface sx={{bgcolor:'#F1F6FF',boxShadow:'none'}}><Stack direction="row" gap={1} alignItems="center"><LocationOnRoundedIcon color="primary"/><Box><Typography variant="caption" color="text.secondary">소속 골목</Typography><Typography variant="subtitle2">{profile.data.building.alley.name}</Typography></Box></Stack></Surface>}<TextField label="주소, 빌라명으로 검색" value={query} onChange={(event)=>setQuery(event.target.value)} slotProps={{input:{startAdornment:<InputAdornment position="start"><SearchRoundedIcon/></InputAdornment>}}}/><Tabs value={filter} onChange={(_,value:GarageFilter)=>setFilter(value)} variant="scrollable" scrollButtons={false} aria-label="공유 주차 필터" sx={{minHeight:38,'.MuiTab-root':{minHeight:38,minWidth:'auto',px:1.5,borderRadius:3}}}><Tab value="all" label="전체"/><Tab value="now" label="즉시 가능"/><Tab value="reservable" label="예약 가능"/><Tab value="free" label="무료"/></Tabs><GarageResults key={`${filter}:${search}`} query={search} filter={filter}/><MyRequests query={search} filter={filter}/></Stack>
}
