import { useState } from 'react'
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Stack, Switch, Typography } from '@mui/material'
import { NavButton, PageTitle, Surface } from '../../components/Ui'

type Slot = { name: string; inUse: boolean; shareable: boolean }

// TODO(logic): 운영팀이 등록한 빌라의 주차 칸 목록을 API에서 불러오기
const slots: Slot[] = [
  { name: 'P4', inUse: true, shareable: false },
  { name: 'P2', inUse: true, shareable: false },
  { name: 'P7', inUse: true, shareable: false },
  { name: 'P8', inUse: false, shareable: false },
  { name: 'P3', inUse: true, shareable: true },
]

const describe = (slot: Slot) => slot.inUse ? `사용 중 · ${slot.shareable ? '공유 중' : '공유 안 함'}` : '사용 중지'

export default function SlotsPage() {
  const [editing, setEditing] = useState<Slot | null>(null)
  return <Stack gap={2.25}>
    <PageTitle title="주차 구역 설정" description="운영팀이 등록한 칸이에요. 관리자는 사용·공유 여부만 바꿀 수 있어요."/>
    {slots.map((slot)=><Surface key={slot.name}><Stack direction="row" justifyContent="space-between" alignItems="center"><div><Typography variant="subtitle2">{slot.name}</Typography><Typography variant="caption" color={slot.inUse?'text.secondary':'error.main'}>{describe(slot)}</Typography></div><Chip label="수정" clickable onClick={()=>setEditing(slot)}/></Stack></Surface>)}
    <NavButton to="admin" variant="outlined" fullWidth>대시보드로 돌아가기</NavButton>
    <Dialog open={editing !== null} onClose={()=>setEditing(null)} fullWidth maxWidth="xs">
      <DialogTitle>칸 설정 · {editing?.name}</DialogTitle>
      <DialogContent><Stack gap={1}>
        <FormControlLabel control={<Switch defaultChecked={editing?.inUse}/>} label={<div><Typography variant="subtitle2">사용 가능</Typography><Typography variant="caption" color="text.secondary">끄면 배치도에서 선택할 수 없어요</Typography></div>} labelPlacement="start" sx={{justifyContent:'space-between',mx:0}}/>
        <Typography variant="caption" color="text.secondary">{editing?.shareable ? '공유 중인 칸이에요. 공유 조건은 차고지 등록에서 바꿔요.' : '공유하려면 차고지 등록에서 이 칸을 고르세요.'}</Typography>
      </Stack></DialogContent>
      {/* TODO(logic): 칸 사용 가능 여부 저장 (PATCH /admin/slots/{slot_id} { is_active }). 공유 여부는 share_offer_id 유무로 표시 */}
      <DialogActions sx={{px:3,pb:2.5}}><Button variant="outlined" onClick={()=>setEditing(null)}>취소</Button><Button variant="contained" onClick={()=>setEditing(null)}>저장</Button></DialogActions>
    </Dialog>
  </Stack>
}
