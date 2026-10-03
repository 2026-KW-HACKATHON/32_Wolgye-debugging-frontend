import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded'
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded'
import ShareLocationRoundedIcon from '@mui/icons-material/ShareLocationRounded'
import { Box, Stack, Typography } from '@mui/material'
import ParkingLotMap from '../../components/ParkingLotMap'
import { lotStatus } from '../../mocks/parking'
import { NavButton, PageTitle, Surface } from '../../components/Ui'

const benefits = [
  { icon: <DirectionsCarRoundedIcon />, title: '한눈에 보이는 주차 현황', text: '우리 빌라의 빈자리와 출차 시간을 바로 확인해요.' },
  { icon: <NotificationsActiveRoundedIcon />, title: '긴급 알림, 원탭 응답', text: '차량 이동 요청을 받고 한 번의 탭으로 답해요.' },
  { icon: <ShareLocationRoundedIcon />, title: '빈 자리 공유도 간편하게', text: '외출 중인 주차면을 이웃과 간편하게 나눠요.' },
]

export default function WelcomePage() {
  return <Stack gap={2.5}>
    <Box pt={1}><PageTitle eyebrow="월계1동 이웃 주차" title="우리 골목 주차, 이제 쉽게" description="빌라 입주민을 위한 스마트 주차 관리 앱" /></Box>
    <ParkingLotMap slots={lotStatus} />
    <Stack gap={1.25}>{benefits.map((benefit)=><Surface key={benefit.title}><Stack direction="row" gap={1.5} alignItems="center"><Box sx={{width:44,height:44,borderRadius:3,display:'grid',placeItems:'center',bgcolor:'#E8F0FF',color:'primary.main'}}>{benefit.icon}</Box><Box><Typography variant="subtitle2">{benefit.title}</Typography><Typography variant="caption" color="text.secondary">{benefit.text}</Typography></Box></Stack></Surface>)}</Stack>
    <Stack gap={1}><NavButton to="signup" fullWidth>서비스 시작하기</NavButton><NavButton to="login" variant="text" fullWidth>이미 계정이 있어요 · 로그인</NavButton></Stack>
  </Stack>
}
