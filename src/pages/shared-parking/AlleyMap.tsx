import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { loadNaverMaps, type MapInstance } from '../../api/naverMaps'
import { demoVillaPins } from './demoVillaPins'
import { villaPin } from './villaPin'
import { getMe } from '../../api/auth'
import { listGarages } from '../../api/sharedParking'
import { useApi } from '../../api/useApi'
import { hashParams, toHash } from '../../types/navigation'
import { tones } from '../../theme'

// 제공된 사진의 광운로19가길 주변을 탐색 범위로 둔다 (행정 경계가 아님).
const ALLEY_CENTER = { lat:37.62440,lng:127.05964 }
const ALLEY_ZOOM = 18

export default function AlleyMap() {
  const profile = useApi(()=>getMe(),'alley-profile')
  const garages = useApi(()=>listGarages({filter:'all',limit:50}),'alley-availability')
  const pins = useMemo(()=>demoVillaPins.map((pin)=> {
    const isMine = profile.data?.building?.name.replace(/^월계\s*/, '') === pin.name.replace(/^월계\s*/, '')
    const knownRole = !!profile.data && !profile.error && !profile.loading
    const remaining = garages.data && !garages.error && !garages.loading ? new Set(garages.data.items.filter((slot)=>slot.building_name.replace(/^월계\s*/, '') === pin.name.replace(/^월계\s*/, '') && slot.availability === 'AVAILABLE').map((slot)=>slot.slot_id)).size : null
    const garageId = garages.data?.items.find((slot)=>slot.building_name.replace(/^월계\s*/, '') === pin.name.replace(/^월계\s*/, ''))?.garage_id ?? (isMine ? profile.data?.building?.building_id : undefined) ?? pin.garageId
    const remainingLabel = remaining === null ? (garages.error ? '확인 불가' : '확인 중…') : `${remaining}칸${garages.data?.next_cursor ? '+' : ''}`
    return {...pin,garageId,isMine,remainingLabel,color:knownRole ? (isMine ? tones.blue : tones.orange) : '#8494A7',role:knownRole ? (isMine ? '내 빌라' : '공유 빌라') : '빌라',remaining}
  }),[profile.data,profile.error,profile.loading,garages.data,garages.error,garages.loading])
  const container = useRef<HTMLDivElement>(null)
  const resetView = useRef<(() => void) | null>(null)
  const [attempt,setAttempt] = useState(0)
  const [state,setState] = useState<'loading' | 'ready' | 'error'>('loading')
  useEffect(() => {
    let active = true
    let dispose: (() => void) | undefined
    loadNaverMaps().then((maps) => {
      if (!active || !container.current) return
      const element = container.current
      const center = new maps.LatLng(ALLEY_CENTER.lat,ALLEY_CENTER.lng)
      const map: MapInstance = new maps.Map(element, {
        center, zoom:ALLEY_ZOOM,minZoom:ALLEY_ZOOM,maxZoom:21,
        maxBounds:new maps.LatLngBounds(new maps.LatLng(37.62345,127.05880),new maps.LatLng(37.62480,127.06020)),
        mapTypeId:maps.MapTypeId.HYBRID, zoomControl:true,
        zoomControlOptions:{position:maps.Position.RIGHT_CENTER,style:maps.ZoomControlStyle.SMALL},
        scrollWheel:false,
      })
      const listeners: unknown[] = []
      const markers = pins.map((pin) => {
        const href = toHash('garage-detail',{id:pin.garageId,q:hashParams().get('q') ?? ''})
        const marker = new maps.Marker({
        map,position:new maps.LatLng(pin.lat,pin.lng),clickable:true,draggable:false,
        title:`${pin.role} · ${pin.name} · ${pin.remainingLabel}`,zIndex:10,
        icon:{content:villaPin(pin.number,`${pin.role} · ${pin.name}`,pin.color,pin.remainingLabel,href),size:new maps.Size(56,58),anchor:new maps.Point(28,58)},
        })
        listeners.push(maps.Event.addListener(marker,'click',()=>{window.location.hash = href}))
        return marker
      })
      resetView.current = () => { map.setCenter(center);map.setZoom(ALLEY_ZOOM) }
      const observer = new ResizeObserver(() => map.setSize(new maps.Size(element.clientWidth,element.clientHeight)))
      observer.observe(element)
      dispose = () => { resetView.current = null;observer.disconnect();listeners.forEach((listener)=>maps.Event.removeListener(listener));markers.forEach((marker)=>marker.setMap(null));map.destroy() }
      setState('ready')
    }).catch((error: unknown) => {
      if (!active) return
      if (import.meta.env.DEV) console.warn('네이버 지도:',error)
      setState('error')
    })
    return () => { active = false;dispose?.() }
  },[attempt,pins])
  return <>
    <Box sx={{position:'relative',width:'100%',aspectRatio:'4 / 3',bgcolor:'#E9EEF1'}}>
      <Box ref={container} role="region" aria-label="광운로19가길 위성지도" sx={{position:'absolute',inset:0,width:'100%',height:'100%',visibility:state === 'ready' ? 'visible' : 'hidden'}}/>
      {state === 'ready' && <Button size="small" onClick={()=>resetView.current?.()} sx={{position:'absolute',top:10,left:10,minWidth:0,px:1.25,bgcolor:'background.paper',boxShadow:'0 2px 8px #0002','&:hover':{bgcolor:'background.paper'}}}>골목 중심</Button>}
      {(garages.error || profile.error) && <Button size="small" onClick={()=>{profile.reload();garages.reload()}} sx={{position:'absolute',bottom:28,left:10,bgcolor:'background.paper'}}>빌라 정보 재시도</Button>}
      {state === 'error' && <Box component="img" src="/images/wolgye-alley-satellite.png" alt="광운로19가길 주변 빌라와 골목을 보여주는 위성지도" width={636} height={984} sx={{display:'block',width:'100%',height:'100%',objectFit:'contain'}}/>}
      {state === 'loading' && <Stack sx={{position:'absolute',inset:0}} alignItems="center" justifyContent="center" gap={1}><CircularProgress size={24}/><Typography variant="caption" color="text.secondary">지도 불러오는 중…</Typography></Stack>}
    </Box>
    {state === 'error' && <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} px={2} py={1}><Typography variant="caption" color="text.secondary" role="status">지도를 불러오지 못해 사진으로 표시해요.</Typography><Button size="small" onClick={()=>{setState('loading');setAttempt((value)=>value+1)}}>재시도</Button></Stack>}
  </>
}
