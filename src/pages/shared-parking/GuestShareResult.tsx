import { useRef, useState } from 'react'
import { Alert, Button, Stack, Typography } from '@mui/material'
import { previewGuestShareResult } from '../../api/sharedParking'
export default function GuestShareResult({ id, reload }: { id: number; reload: () => void }) {
  const busyRef = useRef(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function show(status: 'APPROVED' | 'REJECTED') {
    if (busyRef.current) return
    busyRef.current = true; setBusy(true); setError('')
    try { await previewGuestShareResult(id, status); reload() }
    catch (error) { setError(error instanceof Error ? error.message : '결과를 불러오지 못했어요.'); reload() }
    finally { busyRef.current = false; setBusy(false) }
  }
  return <Stack gap={1} sx={{p:1.5,bgcolor:'#F1F6FF',borderRadius:2}}><Typography variant="caption" color="text.secondary">체험용 결과예요. 수락하면 예시 토큰이 차감돼요.</Typography><Stack direction="row" gap={1}><Button variant="outlined" fullWidth disabled={busy} onClick={() => void show('APPROVED')}>예시 수락 결과 보기</Button><Button variant="text" fullWidth disabled={busy} onClick={() => void show('REJECTED')}>예시 거절 결과 보기</Button></Stack>{error && <Alert severity="error">{error}</Alert>}</Stack>
}
