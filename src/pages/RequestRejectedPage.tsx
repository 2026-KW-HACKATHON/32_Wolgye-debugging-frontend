import { Button, Stack, Typography } from '@mui/material'
import { ResultHero, StatusChip, Surface } from '../components/Ui'

export default function RequestRejectedPage() {
  return <Stack gap={2.25}><ResultHero state="error" title="이번 요청은 어려워요" description="선택한 시간에 주차면을 이용하기 어렵습니다."/><Surface><Stack direction="row" justifyContent="space-between" alignItems="center"><div><Typography variant="subtitle2">햇살빌라 101동 B-2</Typography><Typography variant="caption" color="text.secondary">A-1 구역 · 오후 1:00 – 6:00</Typography></div><StatusChip kind="rejected"/></Stack></Surface><Button component="a" href="#share" variant="contained" fullWidth>다른 자리 찾아보기</Button></Stack>
}
