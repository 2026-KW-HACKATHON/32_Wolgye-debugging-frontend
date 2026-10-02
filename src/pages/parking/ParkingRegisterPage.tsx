import { useState } from 'react'
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded'
import EventRoundedIcon from '@mui/icons-material/EventRounded'
import { Box, Button, Chip, Dialog, DialogContent, FormControlLabel, Stack, Switch, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { NavButton, PageTitle, SectionTitle, StatusChip, Surface } from '../../components/Ui'
import ParkingLotMap, { type LotView } from './ParkingLotMap'
import { lotStatus, slotById, type LotSlot, type SlotId } from './parkingLot'
import UnavailableNotice from './UnavailableNotice'

function BottomSheet({ children }: { children: React.ReactNode }) {
  return <Box sx={{mx:-2.5,mb:-2.5,mt:0,bgcolor:'#fff',borderTop:'1px solid',borderColor:'divider',borderRadius:'24px 24px 0 0',boxShadow:'0 -12px 32px rgba(23,35,60,.08)',p:2.5,pb:'calc(24px + env(safe-area-inset-bottom))','@media (max-width: 360px)':{mx:-2,px:2}}}>{children}</Box>
}

const CUSTOM_TIME = '직접 입력'

// 배치 전 화면이라 내 차(P2)는 아직 칸에 없다.
// TODO(logic): 빌라 현황(GET /buildings/{id}/status)과 추천 결과(GET /buildings/{id}/slots/recommendations)를 불러오기. 출차 시간을 바꿀 때마다 추천을 다시 받는다
const lotSlots: LotSlot[] = lotStatus.map((slot) => slot.car?.mine ? { id: slot.id, short: slot.short, label: slot.label, state: 'empty' } : { ...slot, blockedBy: undefined })
const RECOMMENDED: SlotId = 'P2'
const RECOMMEND_REASON = '지금 선 차들보다 늦게 나가서 안쪽이 좋아요'
// 이 칸에 두면 막게 되는 칸 (API will_block)
const WILL_BLOCK: Partial<Record<SlotId, SlotId[]>> = { P3: ['P4'], P5: ['P6'] }

// TODO(logic): 사용 불가 사유는 API unavailable_reason 또는 POST /parkings 409 SLOT_UNAVAILABLE.detail.reason 을 그대로 쓴다
const unavailableReason = (slot: LotSlot) => slot.state === 'unavailable' ? '관리자가 사용 중지한 칸' : '다른 차가 주차 중'

export default function ParkingRegisterPage() {
  const [time, setTime] = useState('07:30')
  const [selected, setSelected] = useState<SlotId>(RECOMMENDED)
  const [view, setView] = useState<LotView>('iso')
  const [unavailable, setUnavailable] = useState<LotSlot | null>(null)
  const recommended = selected === RECOMMENDED
  const selectedSlot = slotById(lotSlots, selected)
  const willBlock = (WILL_BLOCK[selected] ?? []).map((id) => slotById(lotSlots, id)?.label)
  const hint = recommended ? RECOMMEND_REASON : willBlock.length ? `여기 두면 ${willBlock.join('·')} 차를 막을 수 있어요` : '여기 두면 막게 되는 이웃 차가 없어요'
  return <Stack gap={2.25}>
    <PageTitle title="차 배치 · 출차 등록" description="배치도에서 빈 칸을 탭하면 내 차가 놓여요."/>
    <Box sx={{position:'relative',borderRadius:4,bgcolor:'#F8FAFC',border:'1px solid',borderColor:'divider',p:1}}>
      <ToggleButtonGroup exclusive size="small" value={view} onChange={(_,value)=>value&&setView(value)} aria-label="배치도 시점" sx={{position:'absolute',top:8,right:8,bgcolor:'#fff'}}><ToggleButton value="iso" sx={{px:1.25,py:0.25}}>입체</ToggleButton><ToggleButton value="top" sx={{px:1.25,py:0.25}}>평면</ToggleButton></ToggleButtonGroup>
      <ParkingLotMap slots={lotSlots} view={view} selected={selected} recommendedId={RECOMMENDED} onSelect={setSelected} onUnavailable={setUnavailable}/>
    </Box>
    <Stack direction="row" gap={0.75} flexWrap="wrap"><StatusChip kind="recommended" label="★ 추천"/><StatusChip kind="available" label="빈 칸"/><StatusChip kind="disabled" label="사용 불가"/></Stack>
    <Surface sx={{bgcolor:'#F7F9FC'}}><Stack direction="row" gap={1.5} alignItems="center"><Box sx={{width:120,flexShrink:0,borderRadius:3,overflow:'hidden',border:'1px solid',borderColor:'divider',bgcolor:'#fff'}}><ParkingLotMap slots={lotSlots} view="top" selected={selected} recommendedId={RECOMMENDED} focusId={selected}/></Box><Box minWidth={0}><Typography variant="subtitle2">선택한 칸 · {selectedSlot?.label}{recommended && <Typography component="span" variant="subtitle2" color="#12B76A"> ★추천</Typography>}</Typography><Typography variant="caption" color="text.secondary">{hint} · 다른 칸을 탭하면 바뀝니다</Typography></Box></Stack></Surface>
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
    <Dialog open={unavailable !== null} onClose={()=>setUnavailable(null)} fullWidth maxWidth="xs"><DialogContent><UnavailableNotice reason={unavailable ? `${unavailable.label} · ${unavailableReason(unavailable)}` : ''} actions={<><Button variant="contained" fullWidth onClick={()=>setUnavailable(null)}>다른 칸 선택</Button><Button variant="outlined" fullWidth onClick={()=>setUnavailable(null)}>취소</Button></>}/></DialogContent></Dialog>
  </Stack>
}
