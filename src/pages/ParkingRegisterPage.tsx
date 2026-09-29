import { useState } from 'react'
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded'
import { Box, Button, Chip, FormControlLabel, Stack, Switch, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import ParkingMap from '../components/ParkingMap'
import { NavButton, PageTitle, SectionTitle, StatusChip, Surface } from '../components/Ui'

function BottomSheet({ children }: { children: React.ReactNode }) {
  return <Box sx={{mx:-2.5,mb:-2.5,mt:0,bgcolor:'#fff',borderTop:'1px solid',borderColor:'divider',borderRadius:'24px 24px 0 0',boxShadow:'0 -12px 32px rgba(23,35,60,.08)',p:2.5,pb:'calc(24px + env(safe-area-inset-bottom))'}}>{children}</Box>
}

export default function ParkingRegisterPage() {
  const [time, setTime] = useState('07:30')
  const [selected, setSelected] = useState('A2')
  const selectedLabel = selected === 'A1' ? '필로티 1번 · 입구 쪽' : '필로티 2번 · 안쪽'
  return <Stack gap={2.25}>
    <PageTitle title="차 배치 · 출차 등록" description="빈 칸을 누르면 내 차량의 위치로 선택돼요."/>
    <ParkingMap selectable selected={selected} onSelect={setSelected}/>
    <Stack direction="row" gap={0.75}><StatusChip kind="recommended"/><StatusChip kind="available"/><StatusChip kind="disabled"/></Stack>
    <Surface sx={{bgcolor:'#F7F9FC'}}><Stack direction="row" justifyContent="space-between" alignItems="center"><Box><Typography variant="caption" color="text.secondary">선택한 자리</Typography><Typography variant="subtitle1">{selectedLabel}</Typography></Box>{selected === 'A2' ? <StatusChip kind="recommended" label="늦은 출차 추천"/> : <StatusChip kind="available" label="입구와 가까워요"/>}</Stack></Surface>
    <BottomSheet><Stack gap={2.25}><SectionTitle>내 차량</SectionTitle><Stack direction="row" justifyContent="space-between" alignItems="center"><Stack direction="row" gap={1.25} alignItems="center"><Box sx={{width:46,height:46,borderRadius:3,display:'grid',placeItems:'center',bgcolor:'#E8F0FF',color:'primary.main'}}><DirectionsCarRoundedIcon/></Box><Box><Typography variant="subtitle2">12가 3456</Typography><Typography variant="caption" color="text.secondary">흰색 아반떼</Typography></Box></Stack><NavButton to="vehicles" variant="outlined">차량 변경</NavButton></Stack><SectionTitle>언제 출차하나요?</SectionTitle><ToggleButtonGroup exclusive value={time} onChange={(_,value)=>value&&setTime(value)} fullWidth size="small">{['06:00','07:30','09:00'].map((value)=><ToggleButton key={value} value={value}>{value}</ToggleButton>)}</ToggleButtonGroup><TextField label="직접 입력" type="time" defaultValue="07:30" slotProps={{inputLabel:{shrink:true}}}/><FormControlLabel control={<Switch defaultChecked/>} label="평일 같은 시간으로 반복"/><Chip label="월 · 화 · 수 · 목 · 금" sx={{alignSelf:'flex-start'}}/><TextField label="메모 (선택)" multiline rows={2} placeholder="관리자에게 전달할 내용을 적어 주세요"/><Button component="a" href="#vehicle-detail" variant="contained" fullWidth>{selectedLabel.split(' · ')[0]}에 배치하기</Button></Stack></BottomSheet>
  </Stack>
}
