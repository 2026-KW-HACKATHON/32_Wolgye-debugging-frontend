import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded'
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded'
import ShareLocationRoundedIcon from '@mui/icons-material/ShareLocationRounded'
import { Box, Stack, Typography } from '@mui/material'
import ParkingMap from '../components/ParkingMap'
import { NavButton, PageTitle, Surface } from '../components/Ui'

const benefits = [
  { icon: <DirectionsCarRoundedIcon />, title: '한눈에 보는 주차 현황', text: '우리 빌라의 빈자리와 출차 시간을 바로 확인해요.' },
  { icon: <NotificationsActiveRoundedIcon />, title: '막힘 알림에 빠른 응답', text: '차량 이동 요청을 받고 한 번의 탭으로 답해요.' },
  { icon: <ShareLocationRoundedIcon />, title: '비어 있는 자리 공유', text: '외출 중인 주차면을 이웃과 간편하게 나눠요.' },
]

export default function WelcomePage() {
  return <Stack gap={2.5}>
    <Box pt={1}><PageTitle eyebrow="월계1동 이웃 주차" title="우리 골목 주차, 이제 쉽게" description="좁은 빌라 골목에서도 서로의 출차 시간을 알고 편하게 주차해요." /></Box>
    <ParkingMap compact />
    <Stack gap={1.25}>{benefits.map((benefit)=><Surface key={benefit.title}><Stack direction="row" gap={1.5} alignItems="center"><Box sx={{width:44,height:44,borderRadius:3,display:'grid',placeItems:'center',bgcolor:'#E8F0FF',color:'primary.main'}}>{benefit.icon}</Box><Box><Typography variant="subtitle2">{benefit.title}</Typography><Typography variant="caption" color="text.secondary">{benefit.text}</Typography></Box></Stack></Surface>)}</Stack>
    <Stack gap={1}><NavButton to="signup" fullWidth>시작하기</NavButton><NavButton to="login" variant="text" fullWidth>이미 계정이 있어요</NavButton></Stack>
  </Stack>
}
