import { useState } from 'react'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Stack, Switch, TextField, Typography } from '@mui/material'
import { NavButton, PageTitle, SectionTitle, StatusChip, Surface } from '../../components/Ui'

const vehicles = [
  { id: 7, plate: '12가 3456', alias: '내 차량', is_default: true, parked: true },
  { id: 2, plate: '78나 9012', alias: '가족 차량', is_default: false, parked: false },
]

export default function VehiclesPage() {
  const [editing, setEditing] = useState<(typeof vehicles)[number] | null>(null)
  const [deleting, setDeleting] = useState<(typeof vehicles)[number] | null>(null)
  // TODO(logic): #16 GET/POST/PATCH/DELETE 차량 API 연결 후 등록·저장·삭제 활성화.
  // TODO(logic): 번호판 중복 및 주차 중 삭제 409 응답을 화면에 표시한다.
  return <Stack gap={2.25}>
    <PageTitle title="차량 관리" description="등록 차량과 대표 차량을 관리해요."/>
    <SectionTitle>등록 차량</SectionTitle>
    {vehicles.map(vehicle => <Surface key={vehicle.id}><Stack gap={1}>
      <Stack direction="row" gap={1.25} alignItems="center"><DirectionsCarRoundedIcon color={vehicle.parked ? 'primary' : 'action'}/><div><Stack direction="row" gap={0.75} alignItems="center"><Typography variant="subtitle2">{vehicle.plate}</Typography>{vehicle.is_default && <StatusChip kind="recommended" label="대표"/>}</Stack><Typography variant="caption" color="text.secondary">{vehicle.alias} · {vehicle.parked ? '현재 주차 중' : '외부 출차'}</Typography></div></Stack>
      <Stack direction="row" justifyContent="flex-end" gap={1}><Button size="small" aria-label={`${vehicle.plate} 수정`} onClick={() => setEditing(vehicle)}>수정</Button><Button size="small" color="error" variant="outlined" aria-label={`${vehicle.plate} 삭제`} onClick={() => setDeleting(vehicle)}>삭제</Button></Stack>
    </Stack></Surface>)}
    <SectionTitle>차량 추가</SectionTitle>
    <TextField label="차량 번호" placeholder="12가 3456"/>
    <TextField label="차량 별칭" placeholder="예: 내 차, 가족 차"/>
    <FormControlLabel label="대표 차량으로 설정" labelPlacement="start" sx={{ mx: 0, justifyContent: 'space-between' }} control={<Switch defaultChecked/>}/>
    <Button variant="contained" startIcon={<AddRoundedIcon/>} fullWidth disabled>차량 등록</Button>
    <NavButton to="profile" variant="text" fullWidth>설정으로 돌아가기</NavButton>
    <Dialog open={!!editing} onClose={() => setEditing(null)} fullWidth maxWidth="xs" aria-labelledby="vehicle-edit-title">
      <DialogTitle id="vehicle-edit-title">차량 정보 수정</DialogTitle>
      <DialogContent><Stack gap={2} pt={1} key={editing?.id}><TextField label="차량 번호" defaultValue={editing?.plate}/><TextField label="차량 별칭" defaultValue={editing?.alias}/><FormControlLabel label="대표 차량으로 설정" labelPlacement="start" sx={{ mx: 0, justifyContent: 'space-between' }} control={<Switch defaultChecked={editing?.is_default}/>}/></Stack></DialogContent>
      <DialogActions><Button onClick={() => setEditing(null)}>취소</Button><Button variant="contained" disabled>저장</Button></DialogActions>
    </Dialog>
    <Dialog open={!!deleting} onClose={() => setDeleting(null)} fullWidth maxWidth="xs" aria-labelledby="vehicle-delete-title">
      <DialogTitle id="vehicle-delete-title">차량 삭제</DialogTitle>
      <DialogContent>{deleting?.parked ? <Alert severity="warning">주차 중인 차량은 삭제할 수 없어요. 출차 처리 후 다시 시도해 주세요.</Alert> : <Typography variant="body2">{deleting?.plate} 차량을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.</Typography>}</DialogContent>
      <DialogActions><Button onClick={() => setDeleting(null)}>취소</Button><Button color="error" variant="contained" disabled>삭제</Button></DialogActions>
    </Dialog>
  </Stack>
}
