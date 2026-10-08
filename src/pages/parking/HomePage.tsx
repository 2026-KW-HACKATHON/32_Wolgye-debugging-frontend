import { useState } from 'react'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded'
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded'
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import { Alert, Box, Button, Chip, CircularProgress, Divider, Drawer, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { InfoRow, NavButton, PageTitle, SectionTitle, Surface } from '../../components/Ui'
import ParkingLotMap, { LotLegend, type LotView } from '../../components/ParkingLotMap'
import { toLot } from '../../components/parkingLotGeometry'
import { isApiError } from '../../api/client'
import { createMoveRequest, getBuildingLayout, getBuildingStatus, getHome, readNotification } from '../../api/parking'
import { listMyVehicles } from '../../api/vehicles'
import { useApi } from '../../api/useApi'
import { toHash } from '../../types/navigation'
import type { Home, LotSlot, NotificationItem } from '../../types/parking'
import { dateTimeOf, kstNow } from './kstTime'
import ExitParkingButton from './ExitParkingButton'
import { notificationHref, notificationTitle } from '../../utils/notificationLinks'

type Notice = { severity: 'success' | 'info' | 'error'; message: string }
const errorMessage = (e: unknown) => isApiError(e) ? e.message : '잠시 후 다시 시도해 주세요'
const loadLot = async (buildingId: number) => {
  const [layout, status] = await Promise.all([getBuildingLayout(buildingId), getBuildingStatus(buildingId)])
  return { ...toLot(layout, status), status }
}
function Loading() { return <Box display="grid" py={6} sx={{placeItems:'center'}}><CircularProgress size={30}/></Box> }
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
  const lot = useApi(() => loadLot(home.building.id), `lot-${home.building.id}`)
  const vehicles = useApi(() => listMyVehicles(), 'home-vehicles')
  const [view, setView] = useState<LotView>('iso')
  const [inspectedId, setInspectedId] = useState<number | null>(null)
  const [moveNotice, setMoveNotice] = useState<Notice | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [readError, setReadError] = useState<string | null>(null)
  const [openingId, setOpeningId] = useState<number | null>(null)
  const [openedNotice, setOpenedNotice] = useState<NotificationItem | null>(null)
  const [exitNotice, setExitNotice] = useState<Notice | null>(null)
  const { summary, my_parking: mine, block_alert: blockAlert } = home
  const inspected = lot.data?.slots.find((slot) => slot.slotId === inspectedId)
  const inspectedParking = lot.data?.status.slots.find((slot) => slot.slot_id === inspectedId)?.parking
  const refresh = () => { reload(); lot.reload(); vehicles.reload() }
  // 서버는 출차 예정 시각이 지나도 자동 출차하지 않는다 (#46)
  const overdue = !!mine?.expected_exit_at && Date.parse(mine.expected_exit_at) < Date.parse(kstNow())
  async function sendMoveRequest() {
    if (!blockAlert || !mine || sending || sent) return
    setSending(true); setMoveNotice(null)
    try {
      await createMoveRequest({ target_parking_id: blockAlert.blocking_parking_id, needed_at: mine.expected_exit_at ?? kstNow() })
      setSent(true); setMoveNotice({ severity: 'success', message: '이동 요청을 보냈어요. 알림에서 요청을 확인할 수 있어요.' })
    } catch (e) {
      if (isApiError(e) && e.code === 'MOVE_REQUEST_ALREADY_PENDING') { setSent(true); setMoveNotice({ severity: 'info', message: e.message }) }
      else setMoveNotice({ severity: 'error', message: errorMessage(e) })
    } finally { setSending(false) }
  }
  async function openNotification(item: NotificationItem) {
    if (openingId !== null) return
    setOpeningId(item.id); setReadError(null)
    try {
      if (!item.is_read) await readNotification(item.id)
      const href = notificationHref(item)
      if (href) window.location.assign(href)
      else { setOpenedNotice(item); reload() }
    } catch (e) { setReadError(errorMessage(e)) }
    finally { setOpeningId(null) }
  }
  function inspect(slot: LotSlot) { setInspectedId(slot.slotId) }
  return <Stack gap={2.25}>
    <PageTitle eyebrow={home.building.name} title={home.building.role === 'ADMIN' ? '우리 빌라 관리' : '우리 빌라 주차'} action={<Chip label={home.building.role === 'ADMIN' ? '관리자' : '입주민'} size="small" variant="outlined" color="primary"/>}/>
    {home.admin && <Surface sx={{bgcolor:'#E8F0FF',borderColor:'#C6D9FF'}}><Stack gap={1.25}><Typography variant="subtitle2">확인할 공유 요청 {home.admin.pending_share_requests}건</Typography><NavButton to="admin" fullWidth>관리자 대시보드 열기</NavButton></Stack></Surface>}
    {blockAlert && <Surface sx={{bgcolor:'#FFF7F2',borderColor:'#FFD9BE'}}><Stack gap={1.25}><Stack direction="row" gap={1} alignItems="center"><ErrorRoundedIcon color="error"/><Typography variant="subtitle2">내 차가 막혀 있어요</Typography></Stack><Typography variant="body2">{blockAlert.message}</Typography>{moveNotice && <Alert severity={moveNotice.severity}>{moveNotice.message}</Alert>}<Button variant="contained" disabled={sending || sent || !mine} onClick={sendMoveRequest}>{sending ? '보내는 중…' : sent ? '이동 요청을 보냈어요' : '이동 요청 보내기'}</Button><Typography variant="caption" color="text.secondary">{mine?.expected_exit_at ? `${dateTimeOf(mine.expected_exit_at)}까지 이동을 요청해요.` : '지금 출차가 필요하다고 요청해요.'} 전화번호는 공유되지 않아요.</Typography></Stack></Surface>}
    <Box sx={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:1}}>{[
      ['지금 빈자리', summary.empty, '#187E67'], ['1시간 내 출차', summary.soon_exit, '#986D05'], ['막힌 차량', summary.blocked, '#B82D3B'],
    ].map(([label,count,color])=><Box key={label} sx={{p:1.25,bgcolor:'#fff',border:'1px solid',borderColor:'divider',borderRadius:3,textAlign:'center'}}><Typography variant="h5" color={String(color)}>{count}</Typography><Typography variant="caption">{label}</Typography></Box>)}</Box>
    <Surface sx={{boxShadow:'none'}}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}><Typography variant="subtitle2">주차 현황</Typography><ToggleButtonGroup color="primary" exclusive size="small" value={view} onChange={(_,value)=>value&&setView(value)} aria-label="배치도 시점"><ToggleButton value="iso">입체</ToggleButton><ToggleButton value="top">평면</ToggleButton></ToggleButtonGroup></Stack>
      {lot.error ? <LoadError message={lot.error.message} onRetry={lot.reload}/> : lot.data ? <><ParkingLotMap shape={lot.data.shape} slots={lot.data.slots} view={view} onInspect={inspect}/><LotLegend/><Typography variant="caption" display="block" color="text.secondary" mt={1.5}>칸을 누르면 차량과 출차 예정 시간을 볼 수 있어요.</Typography></> : <Loading/>}
      <Button size="small" startIcon={<RefreshRoundedIcon/>} onClick={refresh} sx={{mt:1}}>현황 새로고침</Button>
    </Surface>
    {exitNotice && <Alert severity={exitNotice.severity} onClose={()=>setExitNotice(null)}>{exitNotice.message}</Alert>}
    {mine ? <Surface sx={{background:'linear-gradient(135deg,#246BFD,#4988FF)',color:'#fff',border:'none'}}><Stack gap={1.5}><Stack direction="row" justifyContent="space-between" alignItems="center"><Box><Typography variant="caption">내 차량 · {mine.vehicle.plate}</Typography><Typography variant="h5" mt={.5}>{mine.slot_label}에 주차 중</Typography><Typography variant="body2" mt={.5}>{mine.expected_exit_at ? `${dateTimeOf(mine.expected_exit_at)} 출차 예정` : '출차 시간 없이 상시 주차 중'}</Typography></Box><DirectionsCarRoundedIcon sx={{fontSize:44}}/></Stack>{overdue && <Alert severity="warning" sx={{py:0}}>출차 예정 시각이 지났어요. 이미 차를 뺐다면 '지금 출차!'를 눌러 주세요. 더 주차한다면 출차 시간을 변경해 주세요.</Alert>}<ExitParkingButton onBlue parkingId={mine.parking_id} slotLabel={mine.slot_label} onResult={(notice,changed)=>{setExitNotice(notice);if (changed) refresh()}}/><Button href={toHash('departure',{id:mine.vehicle.id})} variant="outlined" sx={{color:'#fff',borderColor:'rgba(255,255,255,.6)','&:hover':{borderColor:'#fff'}}}>출차 시간 변경</Button><Button href={toHash('vehicle-detail',{id:mine.vehicle.id})} sx={{color:'#fff'}}>내 차량 상세 보기</Button></Stack></Surface> : <Surface><Stack gap={1.25}><Typography variant="subtitle2">지금 주차 중인 내 차가 없어요</Typography><Typography variant="body2" color="text.secondary">빈 칸을 선택하고 출차 시간을 알려 주세요.</Typography><NavButton to={vehicles.data?.items.length === 0 ? 'vehicles' : 'parking-register'} fullWidth>{vehicles.data?.items.length === 0 ? '내 차량 등록' : '주차하기'}</NavButton></Stack></Surface>}
    <SectionTitle action={<Button href="#vehicles" size="small">관리</Button>}>내 차량</SectionTitle>
    {vehicles.error ? <LoadError message={vehicles.error.message} onRetry={vehicles.reload}/> : !vehicles.data ? <Loading/> : vehicles.data.items.length ? <Surface><Stack divider={<Divider flexItem/>} gap={1.25}>{vehicles.data.items.map((vehicle)=><Box component="a" key={vehicle.id} href={toHash('vehicle-detail',{id:vehicle.id})} sx={{display:'flex',alignItems:'center',gap:1.25,minHeight:48}}><DirectionsCarRoundedIcon color="primary"/><Box flex={1}><Typography variant="subtitle2">{vehicle.plate}</Typography><Typography variant="caption" color="text.secondary">{vehicle.alias || '내 차량'}{vehicle.is_default && ' · 대표 차량'} · {vehicle.status === 'PARKED' ? '주차 중' : '주차 안 함'}</Typography></Box><ArrowForwardRoundedIcon color="action"/></Box>)}</Stack></Surface> : <Typography variant="body2" color="text.secondary">등록된 차량이 없어요.</Typography>}
    <SectionTitle action={<Button href="#notifications" size="small" startIcon={<NotificationsRoundedIcon/>}>전체 {home.unread_notification_count > 0 && `· ${home.unread_notification_count}`}</Button>}>최근 알림</SectionTitle>
    {readError && <Alert severity="error">{readError}</Alert>}
    <Surface>{home.recent_notifications.length ? <Stack divider={<Divider flexItem/>} gap={1.25}>{home.recent_notifications.map((item)=><Stack key={item.id} direction="row" alignItems="center" gap={1}><Box flex={1}><Typography variant="subtitle2">{notificationTitle(item)}</Typography><Typography variant="caption" color="text.secondary">{item.body} · {dateTimeOf(item.created_at)}</Typography></Box><Button size="small" variant="outlined" disabled={openingId !== null} onClick={()=>void openNotification(item)} aria-label={`${notificationTitle(item)} 보기`}>보기</Button></Stack>)}</Stack> : <Typography variant="body2" color="text.secondary">새 알림이 없어요.</Typography>}</Surface>
    <Drawer anchor="bottom" open={!!inspected} onClose={()=>setInspectedId(null)} slotProps={{paper:{sx:{maxWidth:440,mx:'auto',borderRadius:'20px 20px 0 0'}}}}><Stack gap={1.5} p={3} pb="calc(24px + env(safe-area-inset-bottom))"><Typography variant="h6">{inspected?.label} 주차 정보</Typography>{inspectedParking ? <><InfoRow label="차량" value={inspectedParking.is_mine ? `내 차 · ${inspectedParking.plate}` : `${inspected?.label} 차량`}/><InfoRow label="출차 예정" value={inspectedParking.expected_exit_at ? dateTimeOf(inspectedParking.expected_exit_at) : '등록된 출차 시간 없음'}/>{inspectedParking.exit_source === 'AI_ESTIMATED' && <Alert severity="info">예상 시각이에요. 실제 출차 시간은 달라질 수 있어요.</Alert>}{!!inspected?.blockedBy?.length && <Alert severity="warning">{inspected.blockedBy.join(' · ')} 차량에 막혀 있어요.</Alert>}</> : <Typography color="text.secondary">{inspected?.state === 'empty' ? '현재 빈자리예요. 출차 시간을 입력하고 이 칸에 주차해 주세요.' : '현재 사용할 수 없는 칸이에요.'}</Typography>}{inspected?.state === 'empty' && !inspectedParking && <Button href={toHash('parking-register',{slot_id:inspected.slotId})} variant="contained" fullWidth>{inspected.label}에 주차하기</Button>}<Button variant="outlined" onClick={()=>setInspectedId(null)}>닫기</Button></Stack></Drawer>
    <Drawer anchor="bottom" open={!!openedNotice} onClose={()=>setOpenedNotice(null)} slotProps={{paper:{sx:{maxWidth:440,mx:'auto',borderRadius:'20px 20px 0 0'}}}}><Stack gap={2} p={3}><Typography variant="h6">{openedNotice?.title}</Typography><Typography>{openedNotice?.body}</Typography><Button onClick={()=>setOpenedNotice(null)}>닫기</Button></Stack></Drawer>
  </Stack>
}
