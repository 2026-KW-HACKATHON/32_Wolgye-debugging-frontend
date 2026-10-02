import { useState } from 'react'
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded'
import EventRoundedIcon from '@mui/icons-material/EventRounded'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import { Box, Button, Chip, Dialog, DialogContent, FormControlLabel, Stack, Switch, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { NavButton, PageTitle, SectionTitle, StatusChip, Surface } from '../../components/Ui'
import ParkingLotMap, { type LotView } from './ParkingLotMap'
import { BLOCKED_BY, type LotSlot, type SlotId } from './parkingLot'
import UnavailableNotice from './UnavailableNotice'

function BottomSheet({ children }: { children: React.ReactNode }) {
  return <Box sx={{mx:-2.5,mb:-2.5,mt:0,bgcolor:'#fff',borderTop:'1px solid',borderColor:'divider',borderRadius:'24px 24px 0 0',boxShadow:'0 -12px 32px rgba(23,35,60,.08)',p:2.5,pb:'calc(24px + env(safe-area-inset-bottom))','@media (max-width: 360px)':{mx:-2,px:2}}}>{children}</Box>
}

const CUSTOM_TIME = '직접 입력'

// TODO(logic): 빌라의 칸 상태와 차량 출차 일정을 API에서 불러오기
const lotSlots: LotSlot[] = [
  { id: 'P1', state: 'occupied', car: { plate: '34나 5678', mine: false, departure: '06:00', departureType: 'registered' } },
  { id: 'P2', state: 'empty' },
  { id: 'P3', state: 'occupied', car: { plate: '78나 9012', mine: false, departure: '08:00', departureType: 'estimated' } },
  { id: 'P4', state: 'occupied', car: { plate: '56다 1234', mine: false, departure: '19:00', departureType: 'registered' } },
  { id: 'P5', state: 'empty' },
  { id: 'P6', state: 'disabled' },
  { id: 'P7', state: 'occupied', car: { plate: '23바 6789', mine: false } },
  { id: 'P8', state: 'empty' },
]
// TODO(logic): 출차 순서 기반 자리 추천 결과(추천 칸, 추천 사유)를 API에서 받기
const RECOMMENDED: SlotId = 'P2'
const RECOMMEND_REASON = '앞 칸(P1) 차가 06:00에 먼저 나가서, 늦게 나가는 내 차는 안쪽이 좋아요'

const unavailableReason = (slot: LotSlot) => slot.state === 'disabled' ? '관리자가 사용 중지한 칸' : slot.car?.mine ? '내 차가 이미 주차된 칸' : '다른 차가 주차 중'

export default function ParkingRegisterPage() {
  const [time, setTime] = useState('07:30')
  const [selected, setSelected] = useState<SlotId>(RECOMMENDED)
  const [view, setView] = useState<LotView>('iso')
  const [unavailable, setUnavailable] = useState<LotSlot | null>(null)
  const recommended = selected === RECOMMENDED
  // TODO(logic): 막는 차의 출차 시각과 내 출차 시각을 비교해 실제로 막히는지 판단 (지금은 앞 칸에 차가 있는지만 표시)
  const blockers = BLOCKED_BY[selected].filter((id) => lotSlots.find((slot) => slot.id === id)?.state === 'occupied')
  const hint = recommended ? RECOMMEND_REASON : blockers.length ? `${blockers.join('·')} 차가 먼저 나가야 출차할 수 있어요` : '앞을 막는 차가 없어 바로 나갈 수 있어요'
  return <Stack gap={2.25}>
    <PageTitle title="차 배치 · 출차 등록" description="배치도에서 빈 칸을 탭하면 내 차가 놓여요."/>
    <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
      <Stack direction="row" gap={0.75} flexWrap="wrap"><StatusChip kind="recommended" label="★ 추천"/><StatusChip kind="available" label="빈 칸"/><StatusChip kind="disabled" label="사용 불가"/></Stack>
      <ToggleButtonGroup exclusive size="small" value={view} onChange={(_,value)=>value&&setView(value)} aria-label="배치도 시점"><ToggleButton value="iso" sx={{px:1.25,py:0.25}}>입체</ToggleButton><ToggleButton value="top" sx={{px:1.25,py:0.25}}>평면</ToggleButton></ToggleButtonGroup>
    </Stack>
    <Box sx={{borderRadius:4,bgcolor:'#F8FAFC',border:'1px solid',borderColor:'divider',p:1}}><ParkingLotMap slots={lotSlots} view={view} selected={selected} recommendedId={RECOMMENDED} onSelect={setSelected} onUnavailable={setUnavailable}/></Box>
    <Surface sx={{bgcolor:'#F7F9FC'}}><Stack direction="row" gap={1.5} alignItems="center"><Box sx={{width:40,height:40,flexShrink:0,borderRadius:3,display:'grid',placeItems:'center',bgcolor:recommended?'#DDF6EE':'#E8F0FF',color:recommended?'#12B76A':'primary.main'}}><StarRoundedIcon/></Box><Box><Typography variant="subtitle2">{recommended ? '추천 자리' : '선택한 칸'} · {selected}</Typography><Typography variant="caption" color="text.secondary">{hint} · 다른 칸을 탭하면 바뀝니다</Typography></Box></Stack></Surface>
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
    <Dialog open={unavailable !== null} onClose={()=>setUnavailable(null)} fullWidth maxWidth="xs"><DialogContent><UnavailableNotice reason={unavailable ? `${unavailable.id} · ${unavailableReason(unavailable)}` : ''} actions={<><Button variant="contained" fullWidth onClick={()=>setUnavailable(null)}>다른 칸 선택</Button><Button variant="outlined" fullWidth onClick={()=>setUnavailable(null)}>취소</Button></>}/></DialogContent></Dialog>
  </Stack>
}
