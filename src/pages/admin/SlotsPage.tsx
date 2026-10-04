import { useState } from 'react'
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Stack, Switch, Typography } from '@mui/material'
import { NavButton, PageTitle, Surface } from '../../components/Ui'
import { listAdminSlots, updateAdminSlot } from '../../api/admin'
import { isApiError } from '../../api/client'
import { getHome } from '../../api/parking'
import { useApi } from '../../api/useApi'
import type { AdminSlot } from '../../types/admin'

const describe = (slot: AdminSlot) => slot.is_active ? `사용 중 · ${slot.share_offer_id !== null ? '공유 중' : '공유 안 함'}` : '사용 중지'

// building_id 는 홈 응답의 building.id
async function loadSlots() {
  const buildingId = (await getHome()).building.id
  return (await listAdminSlots(buildingId)).items
}

export default function SlotsPage() {
  const { data: slots, error, reload } = useApi(loadSlots, 'admin-slots')
  const [editing, setEditing] = useState<AdminSlot | null>(null)
  const [active, setActive] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const open = (slot: AdminSlot) => { setEditing(slot); setActive(slot.is_active); setSaveError(null) }
  const close = () => { if (!saving) setEditing(null) }

  // 주차 중인 칸을 끌 때만 한 번 더 확인한다. 꺼도 그 차는 그대로 있다
  function save() {
    if (!editing) return
    if (active === editing.is_active) return setEditing(null)
    if (!active && editing.occupied) return setConfirming(true)
    void apply()
  }

  async function apply() {
    if (!editing) return
    setConfirming(false)
    setSaving(true)
    setSaveError(null)
    try {
      await updateAdminSlot(editing.slot_id, { is_active: active })
      setEditing(null)
      reload()
    } catch (e) {
      setSaveError(isApiError(e) ? e.message : '잠시 후 다시 시도해 주세요.')
    } finally {
      setSaving(false)
    }
  }

  return <Stack gap={2.25}>
    <PageTitle title="주차 구역 설정" description="운영팀이 등록한 칸이에요. 관리자는 사용 여부만 바꾸고, 공유는 차고지 등록에서 해요."/>
    {error ? <Alert severity="error" action={<Button color="inherit" size="small" onClick={reload}>다시 시도</Button>}>{error.message}</Alert>
      : !slots ? <Box display="grid" py={6} sx={{placeItems:'center'}}><CircularProgress size={30}/></Box>
      : slots.length ? slots.map((slot)=><Surface key={slot.slot_id}><Stack direction="row" justifyContent="space-between" alignItems="center"><div><Typography variant="subtitle2">{slot.label}</Typography><Typography variant="caption" color={slot.is_active?'text.secondary':'error.main'}>{describe(slot)}</Typography></div><Chip label="수정" clickable onClick={()=>open(slot)}/></Stack></Surface>)
      : <Typography variant="caption" color="text.secondary">등록된 칸이 없어요.</Typography>}
    <NavButton to="admin" variant="outlined" fullWidth>대시보드로 돌아가기</NavButton>
    <Dialog open={editing !== null} onClose={close} fullWidth maxWidth="xs">
      <DialogTitle>칸 설정 · {editing?.label}</DialogTitle>
      <DialogContent><Stack gap={1}>
        <FormControlLabel control={<Switch checked={active} onChange={(event)=>setActive(event.target.checked)}/>} label={<div><Typography variant="subtitle2">사용 가능</Typography><Typography variant="caption" color="text.secondary">끄면 배치도에서 선택할 수 없어요</Typography></div>} labelPlacement="start" sx={{justifyContent:'space-between',mx:0}}/>
        <Typography variant="caption" color="text.secondary">{editing?.share_offer_id != null ? '공유 중인 칸이에요. 공유 조건은 차고지 등록에서 바꿔요.' : '공유하려면 차고지 등록에서 이 칸을 고르세요.'}</Typography>
        {saveError && <Alert severity="error">{saveError}</Alert>}
      </Stack></DialogContent>
      <DialogActions sx={{px:3,pb:2.5}}><Button variant="outlined" disabled={saving} onClick={close}>취소</Button><Button variant="contained" disabled={saving} onClick={save}>저장</Button></DialogActions>
    </Dialog>
    <Dialog open={confirming} onClose={()=>setConfirming(false)} fullWidth maxWidth="xs">
      <DialogTitle>주차 중인 칸이에요</DialogTitle>
      <DialogContent><Typography variant="body2" color="text.secondary">지금 {editing?.label}에 주차 중인 차가 있어요. 사용 중지해도 그 차는 그대로 있어요. 중지할까요?</Typography></DialogContent>
      <DialogActions sx={{px:3,pb:2.5}}><Button variant="outlined" onClick={()=>setConfirming(false)}>취소</Button><Button variant="contained" color="error" onClick={apply}>중지</Button></DialogActions>
    </Dialog>
  </Stack>
}
