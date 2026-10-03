import { Alert, Button, Stack, Typography } from '@mui/material'
import { ResultHero, StatusChip, Surface } from '../../components/Ui'
import { requestPreview } from './requestPreview'

export default function RequestRejectedPage() {
  const request = requestPreview()
  return <Stack gap={2.25}><Alert severity="info">거절 화면 미리보기입니다. 실제 요청 결과가 아닙니다.</Alert><ResultHero state="error" title="요청이 거절되었습니다" description="관리자가 현재 요청을 수락할 수 없다고 판단했습니다."/><Surface><Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}><div><Typography variant="subtitle2">{request.offer.name} · {request.offer.label}</Typography><Typography variant="caption" color="text.secondary">{request.date} · {request.time}</Typography></div><StatusChip kind="rejected"/></Stack></Surface><Surface><Typography variant="subtitle2">거절 사유</Typography><Typography variant="body2" color="text.secondary" mt={1}>주차 구역 용량 초과</Typography></Surface><Button component="a" href="#share" variant="contained" fullWidth>다시 탐색</Button></Stack>
}
