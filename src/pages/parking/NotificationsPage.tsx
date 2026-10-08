import ReportPhoto from '../reports/ReportPhoto'
import { useState } from 'react'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded'
import { Alert, Box, Button, CircularProgress, Divider, Stack, Typography } from '@mui/material'
import { isApiError } from '../../api/client'
import { createMoveRequest, getHome, listMyMoveRequests, listNotifications, readAllNotifications, readNotification } from '../../api/parking'
import { useApi } from '../../api/useApi'
import { NavButton, SectionTitle, StatusChip, Surface } from '../../components/Ui'
import type { MoveRequestStatus, NotificationItem } from '../../types/parking'
import { notificationHref, notificationTitle } from '../../utils/notificationLinks'
import { toHash } from '../../types/navigation'
import { dateTimeOf, kstNow, timeOf } from './kstTime'

const errorText = (e: unknown) => isApiError(e) ? e.message : '잠시 후 다시 시도해 주세요.'
const moveStatusChip: Record<MoveRequestStatus, { kind: 'pending' | 'accepted' | 'rejected'; label: string }> = { PENDING: { kind: 'pending', label: '응답 대기' }, MOVED: { kind: 'accepted', label: '처리 완료' }, DECLINED: { kind: 'rejected', label: '거절됨' } }

// 알림 센터(n26). 와이어프레임이 없어 유저플로우(막힘 사전 알림 목록 → 이동 요청 전송, 이동 요청 수신)를 기준으로 구성했다.
// 막힘 카드는 GET /me/home 의 block_alert, 받은 이동 요청은 GET /me/move-requests?box=received, 최근 알림은 GET /notifications
export default function NotificationsPage() {
  const notices = useApi(() => listNotifications(), 'notifications')
  const home = useApi(() => getHome(), 'home')
  const sentRequests = useApi(() => listMyMoveRequests({ box: 'sent' }), 'move-requests-sent')
  const received = useApi(() => listMyMoveRequests({ box: 'received' }), 'move-requests-received')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [notice, setNotice] = useState<{ severity: 'error' | 'info' | 'success'; message: string } | null>(null)
  const run = async (action: () => Promise<void>) => {
    setBusy(true)
    setNotice(null)
    try { await action() } catch (e) { setNotice({ severity: 'error', message: errorText(e) }) } finally { setBusy(false) }
  }
  const sendMoveRequest = (blockingParkingId: number, neededAt: string) => run(async () => {
    try {
      await createMoveRequest({ target_parking_id: blockingParkingId, needed_at: neededAt })
      setSent(true)
      sentRequests.reload()
      setNotice({ severity: 'success', message: '이동 요청을 보냈어요. 전화번호는 공유되지 않아요.' })
    } catch (e) {
      if (!isApiError(e) || e.code !== 'MOVE_REQUEST_ALREADY_PENDING') throw e
      setSent(true)
      sentRequests.reload()
      setNotice({ severity: 'info', message: e.message })
      home.reload()
    }
  })
  const open = (item: NotificationItem) => run(async () => {
    if (!item.is_read) await readNotification(item.id)
    const to = notificationHref(item)
    if (to) window.location.hash = to
    else notices.reload()
  })
  const readAll = () => run(async () => { await readAllNotifications(); notices.reload() })
  const error = notices.error ?? home.error ?? received.error
  const retry = () => { if (notices.error) notices.reload(); if (home.error) home.reload(); if (received.error) received.reload() }
  if (error) return <Stack gap={2.25}><Alert severity="error" action={<Button color="inherit" size="small" onClick={retry}>다시 시도</Button>}>{error.message}</Alert></Stack>
  if (!notices.data || !home.data || !received.data) return <Box display="grid" minHeight="40vh" sx={{placeItems:'center'}}><CircularProgress size={30}/></Box>
  const { block_alert: blockAlert, my_parking: myParking } = home.data
  const items = notices.data.items
  const hasUnread = items.some((item) => !item.is_read)
  return <Stack gap={2.25}>
    {notice && <Alert severity={notice.severity}>{notice.message}</Alert>}
    <SectionTitle action={blockAlert && <StatusChip kind="danger" label="1건"/>}>막힘 사전 알림</SectionTitle>
    {blockAlert ? <Surface sx={{bgcolor:'#FFF7F2',borderColor:'#FFD9BE'}}><Stack gap={1.25}>
      <Stack direction="row" gap={1} alignItems="center"><ErrorRoundedIcon color="error"/><Typography variant="subtitle2">내 차량이 막혀 있어요</Typography></Stack>
      <Typography variant="body2" color="text.secondary">{blockAlert.message}{myParking?.expected_exit_at && ` 내 출차 예정은 ${timeOf(myParking.expected_exit_at)}이에요.`}</Typography>
      {/* needed_at = 내 출차 예정, 상시 주차면 지금 */}
      <Button variant="contained" fullWidth disabled={busy || sent || !myParking} onClick={() => myParking && sendMoveRequest(blockAlert.blocking_parking_id, myParking.expected_exit_at ?? kstNow())}>{sent ? '이동 요청을 보냈어요' : '이동 요청 보내기'}</Button>
    </Stack></Surface> : <Typography variant="caption" color="text.secondary">지금 내 차를 막고 있는 차량이 없어요.</Typography>}
    <SectionTitle>받은 이동 요청</SectionTitle>
    {received.data.items.length ? <Surface><Stack divider={<Divider flexItem/>} gap={1.25}>{received.data.items.map((request)=><Box key={request.id} component="a" href={toHash('move', { id: request.id })} sx={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:1,color:'inherit'}}><Box><Typography variant="subtitle2">{request.counterpart_label}의 이동 요청</Typography><Typography variant="caption" color="text.secondary">출차 필요 {timeOf(request.needed_at)} · {timeOf(request.requested_at)}</Typography></Box><Stack direction="row" gap={0.5} alignItems="center"><StatusChip kind={moveStatusChip[request.status].kind} label={moveStatusChip[request.status].label}/><ArrowForwardRoundedIcon color="action" fontSize="small"/></Stack></Box>)}</Stack></Surface> : <Typography variant="caption" color="text.secondary">받은 이동 요청이 없어요.</Typography>}
    <SectionTitle>보낸 이동 요청</SectionTitle>
    {sentRequests.error ? <Alert severity="error" action={<Button onClick={sentRequests.reload}>다시 시도</Button>}>{sentRequests.error.message}</Alert> : !sentRequests.data ? <CircularProgress size={24}/> : sentRequests.data.items.length ? <Surface><Stack gap={1.25} divider={<Divider flexItem/>}>{sentRequests.data.items.map((request)=><Stack key={request.id} direction="row" justifyContent="space-between" alignItems="center" gap={1}><Box><Typography variant="subtitle2">{request.counterpart_label}에게 요청</Typography><Typography variant="caption" color="text.secondary">이동 필요 {dateTimeOf(request.needed_at)}</Typography></Box><StatusChip kind={moveStatusChip[request.status].kind} label={moveStatusChip[request.status].label}/></Stack>)}</Stack></Surface> : <Typography variant="body2" color="text.secondary">보낸 이동 요청이 없어요.</Typography>}
    <SectionTitle action={<Button size="small" disabled={busy || !hasUnread} onClick={readAll}>모두 읽음</Button>}>최근 알림</SectionTitle>
    {items.length ? <Surface><Stack divider={<Divider flexItem/>} gap={1.25}>{items.map((item)=><Stack key={item.id} direction="row" justifyContent="space-between" alignItems="center" gap={1}>{item.type === 'VEHICLE_REPORT' && item.link?.id && <ReportPhoto id={item.link.id} thumbnail/>}<Box><Stack direction="row" gap={0.75} alignItems="center">{!item.is_read && <Box sx={{width:7,height:7,borderRadius:'50%',bgcolor:'error.main',flexShrink:0}}/>}<Typography variant="subtitle2">{notificationTitle(item)}</Typography></Stack><Typography variant="caption" color="text.secondary">{item.body} · {dateTimeOf(item.created_at)}</Typography></Box>{(!item.is_read || item.link) && <Button size="small" variant="outlined" disabled={busy} onClick={() => open(item)}>{item.link ? '보기' : '읽음 처리'}</Button>}</Stack>)}</Stack></Surface> : <Typography variant="caption" color="text.secondary">받은 알림이 없어요.</Typography>}
    <NavButton to="home" variant="text" fullWidth>홈으로 돌아가기</NavButton>
  </Stack>
}
