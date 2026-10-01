import { Button, Stack } from '@mui/material'
import { InfoRow, ResultHero, StatusChip, Surface } from '../../components/Ui'

export default function RequestResultPage() {
  return <Stack gap={2.25}><ResultHero state="pending" title="요청을 보냈어요" description="관리자가 확인하면 알림으로 결과를 알려드릴게요."/><Surface><InfoRow label="차고지" value="햇살빌라 101동 B-2"/><InfoRow label="주차면" value="A-1 구역"/><InfoRow label="이용 시간" value="오후 1:00 – 6:00"/><InfoRow label="요청 상태" value={<StatusChip kind="pending"/>}/></Surface><Button component="a" href="#share" variant="contained" fullWidth>공유 주차로 돌아가기</Button></Stack>
}
