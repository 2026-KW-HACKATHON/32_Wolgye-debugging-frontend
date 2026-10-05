import { useState } from 'react'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded'
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded'
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded'
import { Alert, Box, Button, Chip, CircularProgress, Divider, Stack, Typography } from '@mui/material'
import { NavButton, PageTitle, SectionTitle, StatusChip, Surface } from '../../components/Ui'
import ParkingLotMap, { LotLegend } from '../../components/ParkingLotMap'
import { toLotSlots } from '../../components/parkingLotGeometry'
import { isApiError } from '../../api/client'
import { createMoveRequest, getBuildingLayout, getBuildingStatus, getHome, readNotification } from '../../api/parking'
import { useApi } from '../../api/useApi'
import { toHash } from '../../types/navigation'
import type { Home } from '../../types/parking'
import { getDefaultVehicle } from './defaultVehicle'
import { kstNow } from './kstTime'

type Notice = { severity: 'success' | 'info' | 'error'; message: string }

const errorMessage = (e: unknown) => isApiError(e) ? e.message : '잠시 후 다시 시도해 주세요'
// KST ISO 8601 → "오후 6:30"
const ampm = (dateTime: string) => { const hour = Number(dateTime.slice(11, 13)); return `${hour < 12 ? '오전' : '오후'} ${hour % 12 || 12}:${dateTime.slice(14, 16)}` }
function timeAgo(dateTime: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - Date.parse(dateTime)) / 60000))
  return minutes < 1 ? '방금 전' : minutes < 60 ? `${minutes}분 전` : minutes < 1440 ? `${Math.floor(minutes / 60)}시간 전` : `${Math.floor(minutes / 1440)}일 전`
}
const loadLot = async (buildingId: number) => { const [layout, status] = await Promise.all([getBuildingLayout(buildingId), getBuildingStatus(buildingId)]); return toLotSlots(layout, status) }

function Loading() {
  return <Box display="grid" py={6} sx={{placeItems:'center'}}><CircularProgress size={30}/></Box>
}

function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <Alert severity="error" action={<Button color="inherit" size="small" onClick={onRetry}>다시 시도</Button>}>{message}</Alert>
}

export default function HomePage() {
  const { data: home, error, reload } = useApi(() => getHome(), 'home')
  if (error) return <LoadError message={error.message} onRetry={reload}/>
  if (!home) return <Loading/>
  return <HomeView home={home} reload={reload}/>
}

function HomeView({ home, reload }: { home: Home; reload: () => void }) {
  const buildingId = home.building.id
  const lot = useApi(() => loadLot(buildingId), `lot-${buildingId}`)
  const { summary, my_parking: mine, block_alert: blockAlert } = home
  // 주차 중이 아닐 때 차량 상세로 갈 내 차 (기본 차량)
  const myVehicle = useApi(() => mine ? Promise.resolve(null) : getDefaultVehicle(), `my-vehicle-${mine ? 'parked' : 'out'}`)
  const [moveNotice, setMoveNotice] = useState<Notice | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [readError, setReadError] = useState<string | null>(null)
  const links: [string, string, string][] = []
  if (mine) links.push(['내 차량 상세', [mine.vehicle.plate, mine.vehicle.color].filter(Boolean).join(' · '), toHash('vehicle-detail', { id: mine.vehicle.id })])
  if (home.admin) links.push(['관리자 대시보드', `대기 요청 ${home.admin.pending_share_requests}건`, toHash('admin')])

  async function sendMoveRequest(blockingParkingId: number, neededAt: string) {
    setSending(true)
    setMoveNotice(null)
    try {
      await createMoveRequest({ target_parking_id: blockingParkingId, needed_at: neededAt })
      setSent(true)
      setMoveNotice({ severity: 'success', message: '이동 요청을 보냈어요. 전화번호는 공유되지 않아요.' })
    } catch (e) {
      if (isApiError(e) && e.code === 'MOVE_REQUEST_ALREADY_PENDING') {
        setSent(true)
        setMoveNotice({ severity: 'info', message: e.message })
        reload()
      } else setMoveNotice({ severity: 'error', message: errorMessage(e) })
    } finally {
      setSending(false)
    }
  }

  async function confirmNotification(id: number) {
    setReadError(null)
    try {
      await readNotification(id)
      reload()
    } catch (e) {
      setReadError(errorMessage(e))
    }
  }

  return <Stack gap={2.25}>
    <PageTitle eyebrow={home.building.name} title="우리 빌라 주차 현황" action={<Chip component="a" href="#notifications" clickable icon={<NotificationsRoundedIcon/>} label={`알림 ${home.unread_notification_count}`}/>}/>
    <Stack direction="row" gap={0.75} flexWrap="wrap"><StatusChip kind="available" label={`가능 ${summary.available}`}/><StatusChip kind="soon" label={`곧 출차 ${summary.soon_exit}`}/><StatusChip kind="danger" label={`막힘 ${summary.blocked}`}/><Chip size="small" variant="outlined" label={`빈칸 ${summary.empty}`}/></Stack>
    <Box sx={{borderRadius:4,bgcolor:'#F8FAFC',border:'1px solid',borderColor:'divider',p:1}}>{lot.error ? <LoadError message={lot.error.message} onRetry={lot.reload}/> : lot.data ? <><ParkingLotMap slots={lot.data}/><LotLegend/></> : <Loading/>}</Box>
    {mine ? <Surface sx={{background:'linear-gradient(135deg,#246BFD 0%,#4988FF 100%)',color:'#fff',border:'none'}}><Box component="a" href={toHash('vehicle-detail', { id: mine.vehicle.id })} sx={{display:'flex',justifyContent:'space-between',alignItems:'center',color:'inherit'}}><Box><Typography variant="caption" sx={{opacity:.82}}>내 차량 · {mine.vehicle.plate}</Typography><Typography variant="h6" mt={0.4}>{mine.slot_label}</Typography><Stack direction="row" gap={0.75} mt={1}><Chip size="small" label={mine.state === 'PARKED' ? '주차 중' : '출차'} sx={{bgcolor:'rgba(255,255,255,.18)',color:'#fff'}}/><Chip size="small" label={mine.expected_exit_at ? `출차 예정 ${ampm(mine.expected_exit_at)}` : '상시 주차'} sx={{bgcolor:'#fff',color:'primary.main'}}/></Stack></Box><DirectionsCarRoundedIcon sx={{fontSize:58,opacity:.9}}/></Box></Surface>
      : myVehicle.error?.status === 401 ? <Alert severity="info" action={<NavButton to="login" variant="text">로그인</NavButton>}>로그인이 필요해요.</Alert>
      : <Surface>{myVehicle.data ? <Box component="a" href={toHash('vehicle-detail', { id: myVehicle.data.id })} sx={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:1,color:'inherit'}}><Box><Typography variant="caption" color="text.secondary">주차 중인 내 차량이 없어요.</Typography><Typography variant="subtitle2">내 차량 · {[myVehicle.data.plate, myVehicle.data.color].filter(Boolean).join(' · ')}</Typography></Box><ArrowForwardRoundedIcon color="action" fontSize="small"/></Box> : <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}><Typography variant="caption" color="text.secondary">주차 중인 내 차량이 없어요.</Typography>{myVehicle.error ? <Button size="small" onClick={myVehicle.reload}>다시 시도</Button> : myVehicle.loading && <CircularProgress size={16}/>}</Stack>}</Surface>}
    {blockAlert && <Surface sx={{bgcolor:'#FFF7F2',borderColor:'#FFD9BE'}}><Stack gap={1.25}><Stack direction="row" justifyContent="space-between" alignItems="center"><Stack direction="row" gap={1} alignItems="center"><ErrorRoundedIcon color="error"/><Typography variant="subtitle2">막힘 알림</Typography></Stack><Button component="a" href="#notifications" size="small" endIcon={<ArrowForwardRoundedIcon/>}>알림 센터</Button></Stack><Typography variant="body2" color="text.secondary">{blockAlert.message}</Typography>{moveNotice && <Alert severity={moveNotice.severity}>{moveNotice.message}</Alert>}<Stack direction="row" gap={1}>{/* needed_at = 내 출차 예정, 상시 주차면 지금 */}<Button variant="contained" fullWidth disabled={sending || sent || !mine} onClick={() => mine && sendMoveRequest(blockAlert.blocking_parking_id, mine.expected_exit_at ?? kstNow())}>{sent ? '이동 요청을 보냈어요' : '이동 요청 보내기'}</Button><NavButton to="notifications" variant="outlined" fullWidth>상세 보기</NavButton></Stack></Stack></Surface>}
    <SectionTitle>빠른 액션</SectionTitle>
    <Stack direction="row" gap={1.25}><NavButton to="parking-register" fullWidth>주차 배치 등록</NavButton><NavButton to="share" variant="outlined" fullWidth>공유 주차 탐색</NavButton></Stack>
    {links.length > 0 && <Box sx={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:1.25}}>{links.map(([title,desc,href])=><Surface key={title}><Box component="a" href={href} sx={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:1,color:'inherit'}}><Box><Typography variant="subtitle2">{title}</Typography><Typography variant="caption" color="text.secondary">{desc}</Typography></Box><ArrowForwardRoundedIcon color="action" fontSize="small"/></Box></Surface>)}</Box>}
    <SectionTitle>최근 알림</SectionTitle>
    {readError && <Alert severity="error">{readError}</Alert>}
    <Surface>{home.recent_notifications.length ? <Stack divider={<Divider flexItem/>} gap={1.25}>{home.recent_notifications.map((item)=><Stack key={item.id} direction="row" justifyContent="space-between" alignItems="center" gap={1}><Box><Typography variant="subtitle2">{item.title}</Typography><Typography variant="caption" color="text.secondary">{item.body} · {timeAgo(item.created_at)}</Typography></Box><Button size="small" variant="outlined" disabled={item.is_read} onClick={() => confirmNotification(item.id)}>확인</Button></Stack>)}</Stack> : <Typography variant="caption" color="text.secondary">새 알림이 없어요.</Typography>}</Surface>
  </Stack>
}
