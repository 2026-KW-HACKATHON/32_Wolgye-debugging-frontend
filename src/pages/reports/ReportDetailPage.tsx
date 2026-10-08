import { Alert, Button, Stack, Typography } from '@mui/material'
import { getVehicleReport } from '../../api/vehicleReports'
import { useApi } from '../../api/useApi'
import { InfoRow, PageTitle, Surface } from '../../components/Ui'
import { hashParams } from '../../types/navigation'
import { dateTimeOf } from '../parking/kstTime'
import ReportPhoto from './ReportPhoto'
export default function ReportDetailPage() {
  const id = Number(hashParams().get('id'))
  const state = useApi(()=>getVehicleReport(id),String(id))
  if (state.error) return <Alert severity="error" action={<Button onClick={state.reload}>재시도</Button>}>{state.error.message}</Alert>
  if (!state.data) return <Typography>제보 불러오는 중…</Typography>
  const report = state.data
  return <Stack gap={2.25}><PageTitle eyebrow="미등록 차량" title={`${report.slot_label} 차량 제보`}/><ReportPhoto id={id}/><Surface><InfoRow label="차량 번호" value={report.plate}/><InfoRow label="주차 칸" value={report.slot_label}/><InfoRow label="제보자" value={report.reporter.name}/><InfoRow label="제보 시각" value={dateTimeOf(report.created_at)}/><InfoRow label="상태" value={report.status === 'DISMISSED' ? '기각됨' : '접수됨'}/></Surface><Button href="#notifications" variant="outlined">알림으로</Button></Stack>
}
