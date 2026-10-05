import { useState } from 'react'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded'
import { Alert, Avatar, Box, Button, CircularProgress, Divider, IconButton, Stack, Typography } from '@mui/material'
import { NavButton, PageTitle, SectionTitle, StatusChip, Surface } from '../../components/Ui'
import { tones } from '../../theme'
import ParkingLotMap from '../../components/ParkingLotMap'
import { toLotSlots } from '../../components/parkingLotGeometry'
import { decideShareRequest, getAdminDashboard } from '../../api/admin'
import { isApiError } from '../../api/client'
import { createMoveRequest, getBuildingLayout, getBuildingStatus, getHome } from '../../api/parking'
import { useApi } from '../../api/useApi'
import type { AdminPendingRequest, CongestionDay } from '../../types/admin'
import { kstAfter, pad } from '../parking/kstTime'
import RejectDialog from './RejectDialog'

type Notice = { severity: 'success' | 'info' | 'warning' | 'error'; message: string }

// 처리 중 상태가 바뀐 요청. 안내 후 다시 불러온다
const DECIDE_CONFLICTS = ['INSUFFICIENT_TOKENS', 'GARAGE_TIME_CONFLICT', 'ALREADY_DECIDED']
const WEEKDAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

const errorMessage = (e: unknown) => isApiError(e) ? e.message : '잠시 후 다시 시도해 주세요'
// "2026-10-03" → 요일 번호 (KST 날짜라 UTC 정오로 계산해도 요일이 같다)
const weekdayOf = (date: string) => new Date(`${date}T12:00:00Z`).getUTCDay()
// "2026-10-03", 7, 11 → "10/3(토) 07~11시"
const requestTime = (date: string, start: number, end: number) => `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}(${WEEKDAY_NAMES[weekdayOf(date)]}) ${pad(start)}~${pad(end)}시`
// "2026-09", -1 → "2026-08"
const shiftMonth = (month: string, diff: number) => { const index = Number(month.slice(0, 4)) * 12 + Number(month.slice(5, 7)) - 1 + diff; return `${Math.floor(index / 12)}-${pad(index % 12 + 1)}` }
function timeAgo(dateTime: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - Date.parse(dateTime)) / 60000))
  return minutes < 1 ? '방금' : minutes < 60 ? `${minutes}분 전` : minutes < 1440 ? `${Math.floor(minutes / 60)}시간 전` : `${Math.floor(minutes / 1440)}일 전`
}
const loadLot = async (buildingId: number) => { const [layout, status] = await Promise.all([getBuildingLayout(buildingId), getBuildingStatus(buildingId)]); return { slots: toLotSlots(layout, status), updatedAt: status.updated_at } }

function Loading() {
  return <Box display="grid" py={6} sx={{placeItems:'center'}}><CircularProgress size={30}/></Box>
}

function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <Alert severity="error" action={<Button color="inherit" size="small" onClick={onRetry}>다시 시도</Button>}>{message}</Alert>
}

function CongestionChart({ days, totalSlots }: { days: CongestionDay[]; totalSlots: number }) {
  return <Box sx={{overflowX:'auto',mt:1.5,pb:0.5}}><Box sx={{display:'flex',alignItems:'flex-end',gap:0.75,height:120,minWidth:days.length*18}}>{days.map(({ date, peak_occupied: count })=>{const day=Number(date.slice(8,10));const quiet=[1,3].includes(weekdayOf(date));return <Stack key={date} alignItems="center" justifyContent="flex-end" gap={0.5} sx={{flex:'0 0 12px',height:'100%'}}><Box sx={{width:12,height:`${totalSlots?Math.min(count/totalSlots,1)*100:0}%`,bgcolor:quiet?'primary.main':'#BBD0FF',borderRadius:'4px 4px 2px 2px'}}/><Typography variant="caption" sx={{fontSize:9,color:quiet?'primary.main':'text.secondary'}}>{day}</Typography></Stack>})}</Box></Box>
}

export default function AdminPage() {
  const { data: home, error, reload } = useApi(() => getHome(), 'home')
  if (error) return <LoadError message={error.message} onRetry={reload}/>
  if (!home) return <Loading/>
  return <AdminView buildingId={home.building.id}/>
}

function AdminView({ buildingId }: { buildingId: number }) {
  // null = 이번 달 (month 생략 → 서버 기준 이번 달)
  const [month, setMonth] = useState<string | null>(null)
  const dashboard = useApi(() => getAdminDashboard(buildingId, month ? { month } : {}), `dashboard-${buildingId}-${month ?? 'now'}`)
  const lot = useApi(() => loadLot(buildingId), `lot-${buildingId}`)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [rejecting, setRejecting] = useState<AdminPendingRequest | null>(null)
  const [sentSlots, setSentSlots] = useState<number[]>([])

  async function decide(id: number, decision: { status: 'APPROVED' } | { status: 'REJECTED'; reject_reason: string }) {
    setBusy(true)
    setNotice(null)
    try {
      await decideShareRequest(id, decision)
      setNotice({ severity: 'success', message: decision.status === 'APPROVED' ? '요청을 수락했어요. 요청자의 토큰이 정산돼요.' : '요청을 거절했어요.' })
      setRejecting(null)
      dashboard.reload()
      lot.reload()
    } catch (e) {
      if (isApiError(e) && DECIDE_CONFLICTS.includes(e.code)) {
        setNotice({ severity: 'warning', message: e.message })
        setRejecting(null)
        dashboard.reload()
      } else setNotice({ severity: 'error', message: errorMessage(e) })
    } finally {
      setBusy(false)
    }
  }

  // D8: 대시보드 응답엔 slot_id 만 있어 배치도(GET /buildings/{id}/status)의 같은 칸 parking.id 로 이동 요청을 보낸다
  async function requestMove(slotId: number) {
    const parkingId = lot.data?.slots.find((slot) => slot.slotId === slotId)?.car?.parkingId
    if (parkingId === undefined) return
    setBusy(true)
    setNotice(null)
    try {
      // 관리자 화면엔 출차 필요 시각 입력이 없어 지금부터 30분 뒤로 보낸다
      await createMoveRequest({ target_parking_id: parkingId, needed_at: kstAfter(30) })
      setSentSlots((slots) => [...slots, slotId])
      setNotice({ severity: 'success', message: '이동 요청을 보냈어요. 전화번호는 공유되지 않아요.' })
    } catch (e) {
      if (isApiError(e) && e.code === 'MOVE_REQUEST_ALREADY_PENDING') {
        setSentSlots((slots) => [...slots, slotId])
        setNotice({ severity: 'info', message: e.message })
      } else setNotice({ severity: 'error', message: errorMessage(e) })
      lot.reload()
    } finally {
      setBusy(false)
    }
  }

  const loadError = dashboard.error ?? lot.error
  const retry = () => { if (dashboard.error) dashboard.reload(); if (lot.error) lot.reload() }
  if (loadError) return <Stack gap={2.25}><PageTitle eyebrow="관리자" title="관리자 대시보드"/><LoadError message={loadError.message} onRetry={retry}/></Stack>
  if (!dashboard.data || !lot.data) return <Loading/>
  const { building, pending_requests: pending, realtime, congestion } = dashboard.data
  // 이번 달(서버 시각)은 '아직 지나지 않은 달' 안내에만 쓰고, 보여 주는 달은 응답의 congestion.month (backend #35)
  const thisMonth = lot.data.updatedAt.slice(0, 7)
  const shownMonth = congestion.month
  return <Stack gap={2.25}>
    <PageTitle eyebrow="관리자" title={building.name} action={<NavButton to="requests" variant="text" startIcon={<NotificationsRoundedIcon/>}>알림</NavButton>}/>
    {notice && <Alert severity={notice.severity} onClose={() => setNotice(null)}>{notice.message}</Alert>}
    {pending.length ? pending.map((request)=><Surface key={request.id} sx={{bgcolor:'#F8FAFD'}}><Stack gap={1.25}>
      <Stack direction="row" gap={1.25} alignItems="center"><Avatar sx={{bgcolor:'#E8F0FF',color:'primary.main',fontWeight:800}}>{request.requester.name.slice(0, 1)}</Avatar><Box flex={1} minWidth={0}><Typography variant="caption" color="text.secondary">공유 사용 요청 · {timeAgo(request.created_at)}</Typography><Typography variant="subtitle2">{request.requester.name} 님 · 매너 {request.requester.temperature.toFixed(1)}℃</Typography><Typography variant="caption" color="text.secondary">{requestTime(request.request_date, request.start_hour, request.end_hour)} · {request.slot_label}</Typography></Box><StatusChip kind="pending"/></Stack>
      <Divider/>
      <Stack direction="row" gap={1}><Button variant="outlined" color="error" fullWidth disabled={busy} onClick={() => setRejecting(request)}>거절</Button><Button variant="contained" fullWidth disabled={busy} onClick={() => decide(request.id, { status: 'APPROVED' })}>수락</Button></Stack>
    </Stack></Surface>) : <Typography variant="caption" color="text.secondary">대기 중인 공유 요청이 없어요.</Typography>}
    <SectionTitle action={<StatusChip kind="available" label={`주차 가능 ${realtime.available_count}곳`}/>}>● 관리 구역 · 실시간</SectionTitle>
    <Box sx={{borderRadius:4,bgcolor:'#F8FAFC',border:'1px solid',borderColor:'divider',p:1}}><ParkingLotMap slots={lot.data.slots} variant="admin"/></Box>
    {realtime.vehicles.length ? <Surface><Stack divider={<Divider flexItem/>} gap={1.25}>{realtime.vehicles.map((vehicle)=>{const sent=sentSlots.includes(vehicle.slot_id);const parked=lot.data?.slots.some((slot) => slot.slotId === vehicle.slot_id && slot.car);return <Stack key={vehicle.slot_id} direction="row" justifyContent="space-between" alignItems="center" gap={1}><Box><Typography variant="caption" color="text.secondary">{vehicle.occupant_type === 'EXTERNAL' ? '외부 차량 · 공유 이용자 (앱 가입)' : '미확인 차량 (관리자 등록)'}</Typography><Typography variant="subtitle2">{vehicle.plate} · {vehicle.slot_label}</Typography></Box>{vehicle.can_request_move ? <Button size="small" variant="contained" disabled={busy || sent || !parked} onClick={() => requestMove(vehicle.slot_id)}>{sent ? '요청 보냄' : '이동 요청'}</Button> : <Typography variant="caption" color="text.secondary">앱으로 연락 불가</Typography>}</Stack>})}</Stack></Surface> : <Typography variant="caption" color="text.secondary">외부·미확인 차량이 없어요.</Typography>}
    <Stack direction="row" gap={0.75} flexWrap="wrap"><StatusChip kind="recommended" label="입주민 차량"/><StatusChip kind="external" label="외부 차량"/><StatusChip kind="danger" label="미확인 차량"/><StatusChip kind="available" label="빈 칸"/></Stack>
    <Surface>
      <Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="subtitle2">주차 데이터 · 혼잡도</Typography><Stack direction="row" alignItems="center"><IconButton size="small" aria-label="이전 달" disabled={dashboard.loading} onClick={() => setMonth(shiftMonth(shownMonth, -1))}><ChevronLeftRoundedIcon/></IconButton><Typography variant="subtitle2">{shownMonth.slice(0, 4) === thisMonth.slice(0, 4) ? '' : `${shownMonth.slice(0, 4)}년 `}{Number(shownMonth.slice(5, 7))}월</Typography><IconButton size="small" aria-label="다음 달" disabled={dashboard.loading} onClick={() => setMonth(shiftMonth(shownMonth, 1))}><ChevronRightRoundedIcon/></IconButton></Stack></Stack>
      <Typography variant="caption" color="text.secondary">하루 중 가장 붐빈 시간의 점유 칸 수 (총 {congestion.total_slots}칸)</Typography>
      {dashboard.loading ? <Loading/> : shownMonth > thisMonth ? <Typography variant="caption" color="text.secondary" display="block" mt={1.5}>아직 지나지 않은 달이라 데이터가 없어요.</Typography> : congestion.days.length ? <CongestionChart days={congestion.days} totalSlots={congestion.total_slots}/> : <Typography variant="caption" color="text.secondary" display="block" mt={1.5}>이 달의 주차 데이터가 없어요.</Typography>}
    </Surface>
    {/* ai_insight 는 향후 기능이라 항상 null. 고정 문구를 둔다 */}
    <Surface sx={{bgcolor:'#F1F7FF',borderColor:'#D5E5FF'}}><Stack direction="row" gap={1.25}><AutoAwesomeRoundedIcon sx={{color:tones.blue}}/><div><Typography variant="subtitle2">AI 분석 (향후)</Typography><Typography variant="body2" color="text.secondary" mt={0.5}>공휴일과 월·수요일은 혼잡도가 낮아요. 이 날은 평균 1칸 이상 비어 있어 공유 자리로 열기 좋아요.</Typography></div></Stack></Surface>
    <SectionTitle>관리 메뉴</SectionTitle>
    {[['공유 요청 관리','대기 요청을 검토하고 승인·거절','requests'],['주차 구역 설정','칸별 사용·공유 여부 관리','slots'],['차고지 등록','새 차고지 또는 공간 추가','garage-register']].map(([title,desc,to])=><Surface key={title}><Box component="a" href={`#${to}`} sx={{display:'flex',justifyContent:'space-between',alignItems:'center',color:'inherit'}}><div><Typography variant="subtitle2">{title}</Typography><Typography variant="caption" color="text.secondary">{desc}</Typography></div><ArrowForwardRoundedIcon color="action"/></Box></Surface>)}
    <RejectDialog key={rejecting?.id ?? 'none'} open={!!rejecting} busy={busy} onClose={() => setRejecting(null)} onReject={(reason) => rejecting && decide(rejecting.id, { status: 'REJECTED', reject_reason: reason })}/>
  </Stack>
}
