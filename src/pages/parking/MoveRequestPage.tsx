import { useState } from 'react'
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded'
import { Alert, Box, Button, CircularProgress, Divider, Stack, Typography } from '@mui/material'
import { isApiError } from '../../api/client'
import { doneMoveRequest, getMoveRequest } from '../../api/parking'
import { useApi } from '../../api/useApi'
import { InfoRow, NavButton, PageTitle, SectionTitle, Surface } from '../../components/Ui'
import { hashParams, toHash } from '../../types/navigation'
import { timeOf } from './kstTime'

// 이동 요청 수신(Figma 52:651). 알림의 link(MOVE_REQUEST)로 #move?id= 를 받아 요청 정보를 불러온다.
export default function MoveRequestPage() {
  const id = Number(hashParams().get('id'))
  const { data: request, error, reload } = useApi(() => getMoveRequest(id), `move-${id}`)
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState<{ severity: 'error' | 'info'; message: string } | null>(null)
  const done = async () => {
    setSending(true)
    setNotice(null)
    try {
      await doneMoveRequest(id)
      window.location.hash = toHash('move-done', { id })
    } catch (e) {
      if (isApiError(e) && e.code === 'ALREADY_DECIDED') { setNotice({ severity: 'info', message: e.message }); reload() }
      else setNotice({ severity: 'error', message: isApiError(e) ? e.message : '잠시 후 다시 시도해 주세요.' })
    } finally { setSending(false) }
  }
  if (error && (error.status === 403 || error.status === 404)) return <Stack gap={2.25}><PageTitle title="이동 요청"/><Typography variant="caption" color="text.secondary">요청을 찾을 수 없어요. 알림 센터에서 다시 확인해 주세요.</Typography><NavButton to="notifications" variant="outlined" fullWidth>알림 센터</NavButton></Stack>
  if (error) return <Stack gap={2.25}><PageTitle title="이동 요청"/><Alert severity="error" action={<Button color="inherit" size="small" onClick={reload}>다시 시도</Button>}>{error.message}</Alert></Stack>
  if (!request) return <Box display="grid" minHeight="40vh" sx={{placeItems:'center'}}><CircularProgress size={30}/></Box>
  const handled = request.status !== 'PENDING'
  return <Stack gap={2.25}>
    <PageTitle title="이동 요청"/>
    <Surface sx={{bgcolor:'#FFF7F2',borderColor:'#FFD9BE'}}><Stack direction="row" gap={1.25} alignItems="center"><ErrorRoundedIcon color="warning"/><div><Typography variant="caption" color="warning.main" fontWeight={800}>긴급 이동 요청</Typography><Typography variant="h6">내 차량을 이동해 주세요</Typography></div></Stack><Divider sx={{my:1.25}}/><InfoRow label="요청 시각" value={timeOf(request.requested_at)}/><InfoRow label="요청자" value={request.requester.label}/></Surface>
    <SectionTitle>요청 차량 정보</SectionTitle>
    <Surface><InfoRow label="차량 번호" value={request.my_vehicle.plate}/><InfoRow label="차량 위치" value={request.my_vehicle.slot_label}/><InfoRow label="주차 시각" value={timeOf(request.my_vehicle.parked_at)}/></Surface>
    <SectionTitle>막힌 차량 정보</SectionTitle>
    <Surface><InfoRow label="차량 번호" value={request.blocked_vehicle.plate}/><InfoRow label="차량 위치" value={request.blocked_vehicle.slot_label}/><InfoRow label="출차 필요 시각" value={timeOf(request.blocked_vehicle.needed_at)}/></Surface>
    <SectionTitle>요청 사유</SectionTitle>
    <Surface><Typography variant="body2" color="text.secondary">{request.reason ?? '요청 사유가 없어요.'}</Typography></Surface>
    {notice && <Alert severity={notice.severity}>{notice.message}</Alert>}
    {handled && !notice && <Alert severity="info">{request.status === 'MOVED' ? '이미 이동 완료로 처리한 요청이에요.' : '이미 처리된 요청이에요.'}</Alert>}
    <Button variant="contained" fullWidth disabled={handled || sending} onClick={done}>옮겼어요</Button>
  </Stack>
}
