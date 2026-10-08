import { useState } from 'react'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack, Typography } from '@mui/material'
import { IS_GUEST, startGuestDemo } from '../api/guestMode'
import type { BuildingRole } from '../types/api'

export default function GuestEntryButton() {
  const [open, setOpen] = useState(false)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')
  function start(role: BuildingRole) {
    setStarting(true); setError('')
    try { startGuestDemo(role) }
    catch { setError('체험을 시작하려면 브라우저 저장소를 허용해 주세요.'); setStarting(false) }
  }
  if (IS_GUEST) return null
  return <Stack gap={1}>
    <Button type="button" variant="contained" fullWidth onClick={() => {setError('');setOpen(true)}}>게스트로 체험하기</Button>
    <Dialog open={open} onClose={() => {if (!starting) setOpen(false)}} maxWidth="xs" fullWidth aria-labelledby="guest-role-title">
      <DialogTitle id="guest-role-title">어떤 역할로 체험할까요?</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{mb:2,fontSize:14}}>예시 데이터로 둘러보세요. 역할별 체험 내용은 따로 저장돼요.</DialogContentText>
        <Stack gap={1.5}>
          <Button type="button" variant="outlined" disabled={starting} fullWidth startIcon={<HomeRoundedIcon/>} onClick={() => start('RESIDENT')} sx={{justifyContent:'flex-start',p:2}}>
            <Stack alignItems="flex-start" textAlign="left"><Typography variant="subtitle2">입주민 체험</Typography><Typography variant="caption" color="text.secondary">주차·출차와 공유주차 이용 요청</Typography></Stack>
          </Button>
          <Button type="button" variant="outlined" disabled={starting} fullWidth startIcon={<AdminPanelSettingsRoundedIcon/>} onClick={() => start('ADMIN')} sx={{justifyContent:'flex-start',p:2}}>
            <Stack alignItems="flex-start" textAlign="left"><Typography variant="subtitle2">관리자 체험</Typography><Typography variant="caption" color="text.secondary">요청 처리·주차 칸·공유 조건 관리</Typography></Stack>
          </Button>
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions><Button type="button" disabled={starting} onClick={() => setOpen(false)}>닫기</Button></DialogActions>
    </Dialog>
  </Stack>
}
