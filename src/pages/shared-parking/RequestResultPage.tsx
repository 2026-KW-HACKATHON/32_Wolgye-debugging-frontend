import { Alert, Button, Stack } from '@mui/material'
import { InfoRow, ResultHero, StatusChip, Surface } from '../../components/Ui'
import { toHash } from '../../types/navigation'
import { requestPreview } from './requestPreview'

export default function RequestResultPage() {
  const request = requestPreview()
  return <Stack gap={2.25}><Alert severity="info">화면 미리보기입니다. 실제 요청은 전송되지 않았어요.</Alert><ResultHero state="pending" title="요청 확인 중" description="차고지 관리자가 요청을 검토하고 있습니다. 잠시만 기다려주세요."/><Surface><InfoRow label="차고지" value={request.offer.name}/><InfoRow label="주차면" value={request.offer.label}/><InfoRow label="날짜" value={request.date}/><InfoRow label="이용 시간" value={request.time}/><InfoRow label="요청 상태" value={<StatusChip kind="pending"/>}/></Surface><Button component="a" href="#share" variant="outlined" fullWidth>공유 주차로 돌아가기</Button><Button component="a" href={toHash('request-accepted',request.params)} variant="contained" fullWidth>수락 화면 미리보기</Button><Button component="a" href={toHash('request-rejected',request.params)} variant="outlined" fullWidth>거절 화면 미리보기</Button></Stack>
}
