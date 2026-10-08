import { useEffect, useRef, useState } from 'react'
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { loadNaverMaps, type MapInstance } from '../../api/naverMaps'
import { demoVillaPins } from './demoVillaPins'
import { villaPin } from './villaPin'

// 제공된 사진의 광운로19가길 주변을 탐색 범위로 둔다 (행정 경계가 아님).
const ALLEY_CENTER = { lat:37.62440,lng:127.05964 }
const ALLEY_ZOOM = 18

export default function AlleyMap() {
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
      const markers = demoVillaPins.map((pin) => new maps.Marker({
        map,position:new maps.LatLng(pin.lat,pin.lng),clickable:false,draggable:false,
        title:pin.name,zIndex:10,
        icon:{content:villaPin(pin.number,pin.name,pin.color),size:new maps.Size(36,44),anchor:new maps.Point(18,44)},
      }))
      resetView.current = () => { map.setCenter(center);map.setZoom(ALLEY_ZOOM) }
      const observer = new ResizeObserver(() => map.setSize(new maps.Size(element.clientWidth,element.clientHeight)))
      observer.observe(element)
      dispose = () => { resetView.current = null;observer.disconnect();markers.forEach((marker)=>marker.setMap(null));map.destroy() }
      setState('ready')
    }).catch((error: unknown) => {
      if (!active) return
      if (import.meta.env.DEV) console.warn('네이버 지도:',error)
      setState('error')
    })
    return () => { active = false;dispose?.() }
  },[attempt])
  return <>
    <Box sx={{position:'relative',width:'100%',aspectRatio:'4 / 3',bgcolor:'#E9EEF1'}}>
      <Box ref={container} role="region" aria-label="광운로19가길 위성지도" sx={{position:'absolute',inset:0,width:'100%',height:'100%',visibility:state === 'ready' ? 'visible' : 'hidden'}}/>
      {state === 'ready' && <Button size="small" onClick={()=>resetView.current?.()} sx={{position:'absolute',top:10,left:10,minWidth:0,px:1.25,bgcolor:'background.paper',boxShadow:'0 2px 8px #0002','&:hover':{bgcolor:'background.paper'}}}>골목 중심</Button>}
      {state === 'error' && <Box component="img" src="/images/wolgye-alley-satellite.png" alt="광운로19가길 주변 빌라와 골목을 보여주는 위성지도" width={636} height={984} sx={{display:'block',width:'100%',height:'100%',objectFit:'contain'}}/>}
      {state === 'loading' && <Stack sx={{position:'absolute',inset:0}} alignItems="center" justifyContent="center" gap={1}><CircularProgress size={24}/><Typography variant="caption" color="text.secondary">지도 불러오는 중…</Typography></Stack>}
    </Box>
    <Stack px={2} py={1.25} gap={0.75}>
      <Stack component="ul" aria-label="지도 번호 안내" direction="row" gap={2} useFlexGap flexWrap="wrap" sx={{listStyle:'none',m:0,p:0}}>
        {demoVillaPins.map((pin)=><Stack key={pin.number} component="li" direction="row" alignItems="center" gap={0.75}><Box component="span" sx={{display:'grid',placeItems:'center',width:20,height:20,borderRadius:'50%',bgcolor:pin.color,color:'white',fontSize:12,fontWeight:800}}>{pin.number}</Box><Typography variant="caption" fontWeight={700}>{pin.name}</Typography></Stack>)}
      </Stack>
      <Typography variant="caption" color="text.secondary">시연용 임시 위치</Typography>
    </Stack>
    {state === 'error' && <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} px={2} py={1}><Typography variant="caption" color="text.secondary" role="status">지도를 불러오지 못해 사진으로 표시해요.</Typography><Button size="small" onClick={()=>{setState('loading');setAttempt((value)=>value+1)}}>재시도</Button></Stack>}
  </>
}
