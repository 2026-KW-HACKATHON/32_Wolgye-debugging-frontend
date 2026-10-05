import { useState } from 'react'
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'

const REJECT_REASONS = ['주차 구역 용량 초과', '시간 불가', '기타']

export default function RejectDialog({ open, busy, onClose, onReject }: { open: boolean; busy: boolean; onClose: () => void; onReject: (reason: string) => void }) {
  const [reason, setReason] = useState(REJECT_REASONS[0])
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
    <DialogTitle>요청을 거절할까요?</DialogTitle>
    <DialogContent><Typography variant="body2" color="text.secondary" mb={1.25}>거절 사유를 골라 주세요. 요청자에게 함께 전달돼요.</Typography><Stack direction="row" gap={0.75} flexWrap="wrap">{REJECT_REASONS.map((label)=><Chip key={label} label={label} clickable color={reason===label?'primary':'default'} variant={reason===label?'filled':'outlined'} onClick={() => setReason(label)}/>)}</Stack></DialogContent>
    <DialogActions><Button onClick={onClose} disabled={busy}>취소</Button><Button variant="contained" color="error" disabled={busy} onClick={() => onReject(reason)}>거절</Button></DialogActions>
  </Dialog>
}
