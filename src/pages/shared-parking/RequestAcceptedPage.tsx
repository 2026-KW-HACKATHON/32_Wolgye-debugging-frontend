import { Alert, Button, Stack } from '@mui/material'
import { InfoRow, ResultHero, StatusChip, Surface } from '../../components/Ui'
import { toHash } from '../../types/navigation'
import { requestPreview } from './requestPreview'

export default function RequestAcceptedPage() {
  const request = requestPreview()
  return <Stack gap={2.25}><Alert severity="info">수락 화면 미리보기입니다. 실제 예약 내역이 아닙니다.</Alert><ResultHero state="success" title="요청 수락됨" description="공유 주차 이용 요청이 수락되었습니다."/><Surface><InfoRow label="차고지" value={request.offer.name}/><InfoRow label="주차면" value={request.offer.label}/><InfoRow label="날짜" value={request.date}/><InfoRow label="이용 시간" value={request.time}/><InfoRow label="상태" value={<StatusChip kind="accepted"/>}/></Surface><Button component="a" href={toHash('garage-detail',{id:request.offer.garageId,offer_id:request.offer.offerId})} variant="outlined" fullWidth>차고지 위치 확인</Button><Button component="a" href="#home" variant="contained" fullWidth>홈으로</Button></Stack>
}
