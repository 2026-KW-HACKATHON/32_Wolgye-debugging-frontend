import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { getMoveRequest } from '../../api/parking'
import { useApi } from '../../api/useApi'
import { InfoRow, NavButton, ResultHero, Surface } from '../../components/Ui'
import { hashParams, toHash } from '../../types/navigation'

const timeOf = (at: string) => new Date(at).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Seoul' })

// 요청 처리 완료(n31). 와이어프레임이 없어 공유 주차 결과 화면과 같은 ResultHero 형식으로 구성했다.
// '옮겼어요'(POST /move-requests/{id}/done) 후 #move-done?id= 로 온다. 요청자에게는 알림이 가지 않는다 (docs/decisions.md)
export default function MoveDonePage() {
  const id = Number(hashParams().get('id'))
  const { data: request, error, reload } = useApi(() => getMoveRequest(id), `move-${id}`)
  const links = <Stack gap={1}><NavButton to="home" fullWidth>배치도로 돌아가기</NavButton><NavButton to="notifications" variant="outlined" fullWidth>알림 센터</NavButton></Stack>
  if (error && (error.status === 403 || error.status === 404)) return <Stack gap={2.25}><Typography variant="caption" color="text.secondary">요청을 찾을 수 없어요. 알림 센터에서 다시 확인해 주세요.</Typography>{links}</Stack>
  if (error) return <Stack gap={2.25}><Alert severity="error" action={<Button color="inherit" size="small" onClick={reload}>다시 시도</Button>}>{error.message}</Alert>{links}</Stack>
  if (!request) return <Box display="grid" minHeight="40vh" sx={{placeItems:'center'}}><CircularProgress size={30}/></Box>
  if (request.status === 'PENDING') return <Stack gap={2.25}><ResultHero state="pending" title="아직 처리하지 않은 요청이에요" description="차를 옮긴 뒤 이동 요청 화면에서 '옮겼어요'를 눌러 주세요."/><Button component="a" href={toHash('move', { id })} variant="contained" fullWidth>이동 요청 보기</Button><NavButton to="notifications" variant="outlined" fullWidth>알림 센터</NavButton></Stack>
  return <Stack gap={2.25}>
    <ResultHero state="success" title="이동 완료로 처리했어요" description="요청한 이웃에게 따로 알림은 가지 않아요. 전화번호는 공유되지 않아요."/>
    {/* TODO(logic): 응답 시각 표시 — GET /move-requests/{id} 응답에 responded_at이 없어 요청 시각으로 대신한다 */}
    <Surface><InfoRow label="내 차량" value={request.my_vehicle.plate}/><InfoRow label="요청자" value={request.requester.label}/><InfoRow label="요청 시각" value={timeOf(request.requested_at)}/></Surface>
    {links}
  </Stack>
}
