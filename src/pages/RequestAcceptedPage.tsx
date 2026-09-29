import { Button, Stack } from '@mui/material'
import { InfoRow, ResultHero, StatusChip, Surface } from '../components/Ui'

export default function RequestAcceptedPage() {
  return <Stack gap={2.25}><ResultHero state="success" title="요청이 수락됐어요" description="아래 시간 동안 지정된 주차면을 이용할 수 있어요."/><Surface><InfoRow label="차고지" value="햇살빌라 101동 B-2"/><InfoRow label="주차면" value="A-1 구역"/><InfoRow label="이용 시간" value="오후 1:00 – 6:00"/><InfoRow label="상태" value={<StatusChip kind="accepted"/>}/></Surface><Button component="a" href="#garage-detail" variant="contained" fullWidth>차고지 위치 확인</Button></Stack>
}
