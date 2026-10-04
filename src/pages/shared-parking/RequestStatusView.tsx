import { Alert, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { InfoRow, ResultHero, StatusChip, Surface } from '../../components/Ui'
import { getShareRequest } from '../../api/sharedParking'
import { useApi } from '../../api/useApi'
import { hashParams, toHash } from '../../types/navigation'
import { hourLabel } from './requestPreview'

export default function RequestStatusView() {
  const id = Number(hashParams().get('id'))
  const {data:request,error,loading,reload} = useApi(()=>getShareRequest(id),String(id))
  if (loading) return <CircularProgress aria-label="요청 결과 불러오는 중"/>
  if (error) return <Alert severity="error" action={<Button onClick={reload}>재시도</Button>}>{error.message}<Button href={error.status === 401 ? '#login' : '#share'}>{error.status === 401 ? '로그인' : '공유 주차로'}</Button></Alert>
  if (!request) return null
  const approved = request.status === 'APPROVED'
  const rejected = request.status === 'REJECTED'
  return <Stack gap={2.25}>
    <ResultHero state={approved ? 'success' : rejected ? 'error' : 'pending'} title={approved ? '요청 수락됨' : rejected ? '요청이 거절되었습니다' : '요청 확인 중'} description={approved ? '공유 주차 이용 요청이 수락되었습니다.' : rejected ? '관리자가 현재 요청을 수락할 수 없다고 판단했습니다.' : '차고지 관리자가 요청을 검토하고 있습니다. 잠시만 기다려주세요.'}/>
    <Surface><InfoRow label="차고지" value={request.garage.name}/><InfoRow label="주차면" value={request.slot_label}/><InfoRow label="날짜" value={request.request_date}/><InfoRow label="이용 시간" value={`${hourLabel(request.start_hour)} – ${hourLabel(request.end_hour)}`}/><InfoRow label="이용 요금" value={`${request.total_price.toLocaleString()}토큰`}/><InfoRow label="요청 상태" value={<StatusChip kind={approved ? 'accepted' : rejected ? 'rejected' : 'pending'}/>}/></Surface>
    {rejected && <Surface><Typography variant="subtitle2">거절 사유</Typography><Typography variant="body2" color="text.secondary" mt={1}>{request.reject_reason ?? '등록된 거절 사유가 없습니다.'}</Typography></Surface>}
    {!approved && !rejected && <Button onClick={reload} variant="outlined" fullWidth>요청 상태 새로고침</Button>}
    {approved && <><Button href={toHash('garage-detail',{id:request.garage.id,slot_id:request.slot_id})} variant="outlined" fullWidth>차고지 위치 확인</Button><Button href="#home" variant="contained" fullWidth>홈으로</Button></>}
    <Button href="#share" variant={approved ? 'text' : 'contained'} fullWidth>{rejected ? '다시 탐색' : '공유 주차로 돌아가기'}</Button>
  </Stack>
}
