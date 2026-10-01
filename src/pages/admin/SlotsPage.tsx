import { useState } from 'react'
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Stack, Switch, Typography } from '@mui/material'
import { NavButton, PageTitle, Surface } from '../../components/Ui'

type Slot = { name: string; inUse: boolean; shareable: boolean }

// TODO(logic): 운영팀이 등록한 빌라의 주차 칸 목록을 API에서 불러오기
const slots: Slot[] = [
  { name: '필로티 1번', inUse: true, shareable: false },
  { name: '필로티 2번', inUse: true, shareable: false },
  { name: '건물 앞 1번', inUse: true, shareable: false },
  { name: '건물 앞 2번', inUse: false, shareable: false },
  { name: '골목 1번', inUse: true, shareable: true },
]

const describe = (slot: Slot) => slot.inUse ? `사용 중 · ${slot.shareable ? '공유 가능' : '공유 안 함'}` : '사용 중지'

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
        <FormControlLabel control={<Switch defaultChecked={editing?.shareable}/>} label={<div><Typography variant="subtitle2">공유 가능</Typography><Typography variant="caption" color="text.secondary">차고지에 묶어 시간제로 열 수 있어요</Typography></div>} labelPlacement="start" sx={{justifyContent:'space-between',mx:0}}/>
      </Stack></DialogContent>
      {/* TODO(logic): 칸의 사용 가능·공유 가능 여부 저장 */}
      <DialogActions sx={{px:3,pb:2.5}}><Button variant="outlined" onClick={()=>setEditing(null)}>취소</Button><Button variant="contained" onClick={()=>setEditing(null)}>저장</Button></DialogActions>
    </Dialog>
  </Stack>
}
