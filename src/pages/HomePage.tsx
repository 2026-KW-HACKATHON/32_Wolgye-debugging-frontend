import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded'
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded'
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded'
import { Box, Button, Chip, Divider, Stack, Typography } from '@mui/material'
import ParkingMap from '../components/ParkingMap'
import { NavButton, PageTitle, SectionTitle, StatusChip, Surface } from '../components/Ui'

export default function HomePage() {
  return <Stack gap={2.25}>
    <PageTitle eyebrow="월계 햇빛빌라" title="안녕하세요, 김지수님" description="오늘 우리 골목의 주차 현황이에요." action={<Chip icon={<NotificationsRoundedIcon/>} label="2"/>}/>
    <Stack direction="row" gap={0.75} flexWrap="wrap"><StatusChip kind="available" label="빈자리 3"/><StatusChip kind="soon" label="곧 출차 2"/><StatusChip kind="danger" label="막힘 1"/><StatusChip kind="external" label="외부 1"/></Stack>
    <ParkingMap/>
    <Surface sx={{background:'linear-gradient(135deg,#246BFD 0%,#4988FF 100%)',color:'#fff',border:'none'}}><Stack direction="row" justifyContent="space-between" alignItems="center"><Box><Typography variant="caption" sx={{opacity:.82}}>내 차량 · 12가 3456</Typography><Typography variant="h6" mt={0.4}>필로티 3번</Typography><Stack direction="row" gap={0.75} mt={1}><Chip size="small" label="주차 중" sx={{bgcolor:'rgba(255,255,255,.18)',color:'#fff'}}/><Chip size="small" label="오후 6:30 출차" sx={{bgcolor:'#fff',color:'primary.main'}}/></Stack></Box><DirectionsCarRoundedIcon sx={{fontSize:58,opacity:.9}}/></Stack></Surface>
    <Surface sx={{bgcolor:'#FFF7F2',borderColor:'#FFD9BE'}}><Stack gap={1.25}><Stack direction="row" justifyContent="space-between" alignItems="center"><Stack direction="row" gap={1} alignItems="center"><ErrorRoundedIcon color="warning"/><Typography variant="subtitle2">차량이 막혀 있어요</Typography></Stack><StatusChip kind="external" label="302호 차량"/></Stack><Typography variant="body2" color="text.secondary">출차가 필요하면 이웃에게 이동을 요청할 수 있어요.</Typography><Stack direction="row" gap={1}><NavButton to="move">이동 요청</NavButton><NavButton to="vehicle-detail" variant="outlined">차량 상세</NavButton></Stack></Stack></Surface>
    <SectionTitle>빠른 메뉴</SectionTitle>
    <Box sx={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:1.25}}>{[['주차 위치 등록','빈 칸과 시간을 선택해요','parking-register'],['공유 주차 찾기','내 주변 공유 공간','share'],['내 차량','위치·출차 일정 확인','vehicle-detail'],['관리자 메뉴','대기 요청 2건','admin']].map(([title,desc,to])=><Surface key={title}><Stack gap={1}><Typography variant="subtitle2">{title}</Typography><Typography variant="caption" color="text.secondary">{desc}</Typography><Button component="a" href={`#${to}`} size="small" endIcon={<ArrowForwardRoundedIcon/>} sx={{alignSelf:'flex-start',px:0}}>열기</Button></Stack></Surface>)}</Box>
    <SectionTitle>최근 알림</SectionTitle>
    <Surface><Stack divider={<Divider flexItem/>} gap={1.25}>{[['주차 요청 도착','201호 김민준 · 방금 전'],['출차 완료 안내','필로티 3번 · 10분 전']].map(([title,desc])=><Stack key={title} direction="row" justifyContent="space-between" alignItems="center"><Box><Typography variant="subtitle2">{title}</Typography><Typography variant="caption" color="text.secondary">{desc}</Typography></Box><ArrowForwardRoundedIcon color="action"/></Stack>)}</Stack></Surface>
  </Stack>
}
