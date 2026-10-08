import { useEffect, useRef, useState } from 'react'
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { Alert, Box, Button, CircularProgress, InputAdornment, Stack, TextField, Typography } from '@mui/material'
import { demoVillaPins } from './demoVillaPins'
import { garageCards } from './garageCards'
import { getMe } from '../../api/auth'
import { tones } from '../../theme'
import { StatusChip, Surface } from '../../components/Ui'
import { listGarages, listMyShareRequests } from '../../api/sharedParking'
import { isApiError } from '../../api/client'
import { useApi } from '../../api/useApi'
import type { GarageListItem, ShareRequestDetail } from '../../types/sharedParking'
import { hashParams, toHash } from '../../types/navigation'
import AlleyMap from './AlleyMap'

// 칸 단위 서버 페이지를 모두 모은 뒤 빌라별로 묶는다. 페이지 경계의 같은 빌라도 한 장이다.
async function loadGarageCards(query: string) {
  const items: GarageListItem[] = []
  const seenCursors = new Set<string>()
  let cursor: string | undefined
  do {
    const page = await listGarages({q:query,filter:'all',limit:50,cursor})
    items.push(...page.items)
    cursor = page.next_cursor ?? undefined
    if (cursor) {
      if (seenCursors.has(cursor)) throw new Error('목록 페이지를 불러오지 못했어요.')
      seenCursors.add(cursor)
    }
  } while (cursor)
  return garageCards(items)
}
const normalVillaName = (name:string)=>name.replace(/^월계\s*/, '')
function GarageResults({query}:{query:string}) {
  const {data,error,loading,reload} = useApi(()=>loadGarageCards(query))
  const profile = useApi(()=>getMe(),'garage-card-profile')
  const [visible,setVisible] = useState(3)
  if (loading) return <CircularProgress aria-label="차고지 불러오는 중"/>
  if (error) return <Alert severity="error" action={<Button onClick={reload}>재시도</Button>}>{error.message}{error.status === 401 && <Button href="#login">로그인</Button>}</Alert>
  const items: Array<(ReturnType<typeof garageCards>[number]) & {empty?:boolean}> = [...(data ?? [])]
  const building = profile.data?.building
  const firstPin = demoVillaPins[0]
  if (building && normalVillaName(building.name) === normalVillaName(firstPin.name) && !items.some((garage)=>garage.id === building.building_id) && (!query || building.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()))) {
    items.unshift({id:building.building_id,name:building.name,availability:'UNAVAILABLE',available:0,minPrice:0,maxPrice:0,info:'현재 공유 중인 칸이 없어요.',empty:true})
  }
  items.sort((a,b)=> {
    const order = (name:string)=>demoVillaPins.find((pin)=>normalVillaName(pin.name) === normalVillaName(name))?.number ?? Infinity
    return order(a.name)-order(b.name)
  })
  return <><Typography variant="subtitle1">빌라별 주차 현황</Typography>{items.length === 0 && <Alert severity="info">조건에 맞는 자리가 없어요. 검색어를 바꿔보세요.</Alert>}{items.slice(0,visible).map((garage)=> {
    const normalName = normalVillaName
    const pin = demoVillaPins.find((pin)=>normalName(pin.name) === normalName(garage.name))
    const isMine = profile.data?.building && normalName(profile.data.building.name) === normalName(garage.name)
    const color = profile.loading || profile.error ? '#8494A7' : isMine ? tones.blue : tones.orange
    const price = garage.minPrice === garage.maxPrice ? (garage.minPrice === 0 ? '무료' : `시간당 ${garage.minPrice.toLocaleString()}토큰`) : `시간당 ${garage.minPrice.toLocaleString()}–${garage.maxPrice.toLocaleString()}토큰`
    return <Surface key={garage.id}><Box component="a" href={toHash('garage-detail',{id:garage.id,q:query})} sx={{display:'flex',gap:1.5,alignItems:'center',color:'inherit'}}><Box aria-label={pin ? `지도 ${pin.number}번` : '빌라 위치'} sx={{display:'grid',placeItems:'center',flexShrink:0,width:44,height:44,borderRadius:'50%',bgcolor:color,color:'white',border:'3px solid white',boxShadow:'0 2px 6px #0002',fontSize:20,fontWeight:800}}>{pin ? pin.number : <LocationOnRoundedIcon/>}</Box><Stack minWidth={0} flex={1} alignItems="flex-start" gap={0.5}><Typography variant="subtitle2">{garage.name}</Typography><StatusChip kind={garage.availability === 'AVAILABLE' ? 'available' : garage.availability === 'SOON_EXIT' ? 'soon' : garage.availability === 'UNAVAILABLE' ? 'disabled' : 'pending'} label={garage.empty ? '남은 칸 없음 · 0칸' : garage.availability === 'RESERVABLE' ? '예약 가능' : garage.availability === 'AVAILABLE' ? `이용 가능 · ${garage.available}칸` : undefined}/>{!garage.empty && <Typography variant="body2" fontWeight={800}>{price}</Typography>}{garage.info && <Typography variant="caption" color="text.secondary">{garage.info}</Typography>}</Stack></Box></Surface>
  })}{items.length > visible && <Button onClick={()=>setVisible((count)=>count+3)}>더 보기</Button>}</>
}
function MyRequests({query}:{query:string}) {
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
  return <><Typography variant="subtitle1">내 요청 현황</Typography>{loading ? <CircularProgress size={24} aria-label="요청 불러오는 중"/> : error ? <Alert severity="error" action={<Button onClick={reload}>재시도</Button>}>{error.message}</Alert> : !items.length ? <Typography variant="body2" color="text.secondary">아직 보낸 요청이 없어요.</Typography> : items.map((request)=><Button key={request.id} href={toHash('request-result',{id:request.id,garage_id:request.garage.id,slot_id:request.slot_id,q:query})} variant="outlined" sx={{justifyContent:'space-between',gap:1}}><span>{request.garage.name} · {request.slot_label}<br/>{request.request_date}</span><StatusChip kind={request.status === 'APPROVED' ? 'accepted' : request.status === 'REJECTED' ? 'rejected' : 'pending'}/></Button>)}{moreError && <Alert severity="error">{moreError}</Alert>}{next && !loading && !error && <Button variant="text" disabled={busy} onClick={()=>void more()}>{busy ? '불러오는 중…' : '요청 더 보기'}</Button>}</>
}
export default function SharePage() {
  const [query,setQuery] = useState(hashParams().get('q') ?? '')
  const [search,setSearch] = useState(query)
  useEffect(()=>{const timer=window.setTimeout(()=>setSearch(query.trim()),300);return()=>window.clearTimeout(timer)},[query])
  return <Stack gap={2.25}>
    <Surface sx={{overflow:'hidden','.MuiCardContent-root':{p:0,'&:last-child':{pb:0}}}}>
      <Stack direction="row" gap={1} alignItems="center" px={2} py={1.5}><LocationOnRoundedIcon color="primary" fontSize="small"/><Typography variant="subtitle2">광운로19가길</Typography></Stack>
      <AlleyMap/>
    </Surface>
    <TextField label="주소, 빌라명으로 검색" value={query} onChange={(event)=>setQuery(event.target.value)} slotProps={{input:{startAdornment:<InputAdornment position="start"><SearchRoundedIcon/></InputAdornment>}}}/><GarageResults key={search} query={search}/><MyRequests query={search}/>
  </Stack>
}
