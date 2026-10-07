import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded'
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded'
import ShareLocationRoundedIcon from '@mui/icons-material/ShareLocationRounded'
import { Box, Stack, Typography } from '@mui/material'
import ParkingLotMap from '../../components/ParkingLotMap'
import { NavButton, PageTitle, Surface } from '../../components/Ui'
import type { LotSlot } from '../../types/parking'

const benefits = [
  { icon: <DirectionsCarRoundedIcon />, title: '한눈에 보이는 주차 현황', text: '우리 빌라의 빈자리와 출차 시간을 바로 확인해요.' },
  { icon: <NotificationsActiveRoundedIcon />, title: '긴급 알림, 원탭 응답', text: '차량 이동 요청을 받고 한 번의 탭으로 답해요.' },
  { icon: <ShareLocationRoundedIcon />, title: '빈 자리 공유도 간편하게', text: '외출 중인 주차면을 이웃과 간편하게 나눠요.' },
]

// 로그인 전이라 실제 현황 API 를 부를 수 없어 소개용 예시 칸을 고정해 둔다. 칸 좌표는 시드 빌라(월계 한빛빌라) 배치와 같다
const sampleSlots: LotSlot[] = [
  { id: 'P1', slotId: 1, label: 'P1', rect: { x: 455, y: 40, w: 125, h: 125 }, state: 'occupied', car: { parkingId: 1, plate: '123가 4634', mine: false, occupant: 'external', exitAt: '20:00' } },
  { id: 'P2', slotId: 2, label: 'P2', rect: { x: 600, y: 40, w: 125, h: 125 }, state: 'empty' },
  { id: 'P3', slotId: 3, label: 'P3', rect: { x: 455, y: 185, w: 125, h: 125 }, state: 'empty' },
  { id: 'P4', slotId: 4, label: 'P4', rect: { x: 600, y: 185, w: 125, h: 125 }, state: 'soon_exit', car: { parkingId: 4, plate: '27가 4821', mine: false, occupant: 'resident', exitAt: '15:10' } },
  { id: 'P5', slotId: 5, label: 'P5', rect: { x: 455, y: 330, w: 125, h: 125 }, state: 'empty' },
  { id: 'P6', slotId: 6, label: 'P6', rect: { x: 600, y: 330, w: 125, h: 125 }, state: 'occupied', car: { parkingId: 6, plate: '45다 6789', mine: false, occupant: 'unknown' } },
  { id: 'P7', slotId: 7, label: 'P7', rect: { x: 35, y: 480, w: 160, h: 90 }, state: 'occupied', car: { parkingId: 7, plate: '34나 5678', mine: false, occupant: 'resident', exitAt: '18:30' } },
  { id: 'P8', slotId: 8, label: 'P8', rect: { x: 215, y: 480, w: 160, h: 90 }, state: 'unavailable' },
]

export default function WelcomePage() {
  return <Stack gap={2.5}>
    <Box pt={1}><PageTitle eyebrow="월계1동 이웃 주차" title="우리 골목 주차, 이제 쉽게" description="빌라 입주민을 위한 스마트 주차 관리 앱" /></Box>
    <ParkingLotMap slots={sampleSlots} />
    <Stack gap={1.25}>{benefits.map((benefit)=><Surface key={benefit.title}><Stack direction="row" gap={1.5} alignItems="center"><Box sx={{width:44,height:44,borderRadius:3,display:'grid',placeItems:'center',bgcolor:'#E8F0FF',color:'primary.main'}}>{benefit.icon}</Box><Box><Typography variant="subtitle2">{benefit.title}</Typography><Typography variant="caption" color="text.secondary">{benefit.text}</Typography></Box></Stack></Surface>)}</Stack>
    <Stack gap={1}><NavButton to="signup" fullWidth>서비스 시작하기</NavButton><NavButton to="login" variant="text" fullWidth>이미 계정이 있어요 · 로그인</NavButton></Stack>
  </Stack>
}
