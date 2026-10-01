import { useState } from 'react'
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded'
import EventRoundedIcon from '@mui/icons-material/EventRounded'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import { Box, Button, ButtonBase, Chip, Dialog, DialogContent, FormControlLabel, Stack, Switch, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import ParkingMap from '../../components/ParkingMap'
import { NavButton, PageTitle, SectionTitle, StatusChip, Surface } from '../../components/Ui'
import UnavailableNotice from './UnavailableNotice'

function BottomSheet({ children }: { children: React.ReactNode }) {
  return <Box sx={{mx:-2.5,mb:-2.5,mt:0,bgcolor:'#fff',borderTop:'1px solid',borderColor:'divider',borderRadius:'24px 24px 0 0',boxShadow:'0 -12px 32px rgba(23,35,60,.08)',p:2.5,pb:'calc(24px + env(safe-area-inset-bottom))','@media (max-width: 360px)':{mx:-2,px:2}}}>{children}</Box>
}

const CUSTOM_TIME = '직접 입력'

export default function ParkingRegisterPage() {
  const [time, setTime] = useState('07:30')
  const [selected, setSelected] = useState('A2')
  const [unavailableOpen, setUnavailableOpen] = useState(false)
  // TODO(logic): 출차 순서 기반 자리 추천 결과(추천 칸, 추천 사유, 막힘 가능성)를 API에서 받아 표시
  const selectedLabel = selected === 'A1' ? '필로티 1번 (입구 쪽)' : '필로티 2번 (안쪽)'
  const recommended = selected === 'A2'
  return <Stack gap={2.25}>
    <PageTitle title="차 배치 · 출차 등록" description="배치도에서 빈 칸을 탭하면 내 차가 놓여요."/>
    {/* TODO(logic): 탭한 칸의 실제 사용 불가 사유를 모달에 전달 */}
    <ParkingMap selectable selected={selected} onSelect={setSelected} onUnavailable={()=>setUnavailableOpen(true)}/>
    <Stack direction="row" gap={0.75}><StatusChip kind="recommended" label="★ 추천"/><StatusChip kind="available" label="빈 칸"/><ButtonBase onClick={()=>setUnavailableOpen(true)} sx={{borderRadius:4}}><StatusChip kind="disabled" label="사용 불가"/></ButtonBase></Stack>
    <Surface sx={{bgcolor:'#F7F9FC'}}><Stack direction="row" gap={1.5} alignItems="center"><Box sx={{width:40,height:40,flexShrink:0,borderRadius:3,display:'grid',placeItems:'center',bgcolor:'#E8F0FF',color:'primary.main'}}><StarRoundedIcon/></Box><Box><Typography variant="subtitle2">선택한 칸 · {selectedLabel}{recommended && ' ★추천'}</Typography><Typography variant="caption" color="text.secondary">{recommended ? '지금 선 차들보다 늦게 나가서 안쪽이 좋아요 · 다른 칸을 탭하면 바뀝니다' : '입구와 가까워요 · 다른 칸을 탭하면 바뀝니다'}</Typography></Box></Stack></Surface>
    <BottomSheet><Stack gap={2.25}>
      <SectionTitle>내 차량</SectionTitle>
      <Stack direction="row" justifyContent="space-between" alignItems="center"><Stack direction="row" gap={1.25} alignItems="center"><Box sx={{width:46,height:46,borderRadius:3,display:'grid',placeItems:'center',bgcolor:'#E8F0FF',color:'primary.main'}}><DirectionsCarRoundedIcon/></Box><Box><Typography variant="subtitle2">12가 3456</Typography><Typography variant="caption" color="text.secondary">흰색</Typography></Box></Stack><NavButton to="vehicles" variant="outlined">차량 변경</NavButton></Stack>
      {/* TODO(logic): 상시 주차가 켜져 있을 때 출차 시간 입력을 생략할지 결정 후 반영 */}
      <FormControlLabel control={<Switch defaultChecked/>} label="상시 주차 여부" sx={{justifyContent:'space-between',mx:0}} labelPlacement="start"/>
      <Typography variant="caption" color="text.secondary" textAlign="center">↓ 스크롤해서 출차 시간도 함께 등록</Typography>
      <SectionTitle action={<Chip size="small" icon={<EventRoundedIcon/>} label="10/2 (금) · 날짜 변경" clickable/>}>내일 몇 시에 나가요?</SectionTitle>
      {/* TODO(logic): 날짜 변경 칩을 누르면 날짜 선택 열기 */}
      <ToggleButtonGroup exclusive value={time} onChange={(_,value)=>value&&setTime(value)} fullWidth size="small">{['06:00','07:30','09:00',CUSTOM_TIME].map((value)=><ToggleButton key={value} value={value}>{value}</ToggleButton>)}</ToggleButtonGroup>
      {time === CUSTOM_TIME && <TextField label="출차 시간" type="time" defaultValue="08:00" slotProps={{inputLabel:{shrink:true}}}/>}
      <Stack direction="row" justifyContent="space-between" alignItems="center"><Box><Typography variant="subtitle2">평일 같은 시간 반복</Typography><Typography variant="caption" color="text.secondary">월–금 07:30</Typography></Box><Switch defaultChecked/></Stack>
      <NavButton to="repeat" variant="outlined" fullWidth>반복 요일 자세히 설정</NavButton>
      <TextField label="메모 (선택)" multiline rows={2} placeholder="이웃에게 전달할 내용을 적어 주세요"/>
      {/* TODO(logic): 배치 확정 요청(칸 중복 시 사용 불가 모달), 출차 일정·반복 설정 함께 저장 */}
      <NavButton to="home" fullWidth>여기에 배치하기</NavButton>
    </Stack></BottomSheet>
    <Dialog open={unavailableOpen} onClose={()=>setUnavailableOpen(false)} fullWidth maxWidth="xs"><DialogContent><UnavailableNotice reason="예약된 상태" actions={<><Button variant="contained" fullWidth onClick={()=>setUnavailableOpen(false)}>다른 칸 선택</Button><Button variant="outlined" fullWidth onClick={()=>setUnavailableOpen(false)}>취소</Button></>}/></DialogContent></Dialog>
  </Stack>
}
