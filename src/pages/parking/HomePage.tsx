import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded'
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded'
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded'
import { Box, Button, Chip, Divider, Stack, Typography } from '@mui/material'
import { NavButton, PageTitle, SectionTitle, StatusChip, Surface } from '../../components/Ui'
import ParkingLotMap, { LotLegend } from './ParkingLotMap'
import { lotStatus, slotById } from './parkingLot'

// TODO(logic): 로그인한 차곡이의 빌라 기준으로 칸 상태 집계, 내 차량, 막힘 여부, 최근 알림을 API에서 불러와 아래 하드코딩 값을 교체
export default function HomePage() {
  const mine = lotStatus.find((slot) => slot.car?.mine)
  const blocker = mine?.blockedBy?.[0] ? slotById(lotStatus, mine.blockedBy[0]) : undefined
  return <Stack gap={2.25}>
    <PageTitle eyebrow="월계 한빛빌라" title="우리 빌라 주차 현황" action={<Chip component="a" href="#notifications" clickable icon={<NotificationsRoundedIcon/>} label="알림 2"/>}/>
    <Stack direction="row" gap={0.75} flexWrap="wrap"><StatusChip kind="available" label="가능 4"/><StatusChip kind="soon" label="곧 출차 2"/><StatusChip kind="danger" label="막힘 1"/><Chip size="small" variant="outlined" label="빈칸 3"/></Stack>
    <Box sx={{borderRadius:4,bgcolor:'#F8FAFC',border:'1px solid',borderColor:'divider',p:1}}><ParkingLotMap slots={lotStatus}/><LotLegend/></Box>
    <Surface sx={{background:'linear-gradient(135deg,#246BFD 0%,#4988FF 100%)',color:'#fff',border:'none'}}><Box component="a" href="#vehicle-detail" sx={{display:'flex',justifyContent:'space-between',alignItems:'center',color:'inherit'}}><Box><Typography variant="caption" sx={{opacity:.82}}>내 차량 · 12가 3456</Typography><Typography variant="h6" mt={0.4}>{mine?.label}</Typography><Stack direction="row" gap={0.75} mt={1}><Chip size="small" label="주차 중" sx={{bgcolor:'rgba(255,255,255,.18)',color:'#fff'}}/><Chip size="small" label="출차 예정 오후 6:30" sx={{bgcolor:'#fff',color:'primary.main'}}/></Stack></Box><DirectionsCarRoundedIcon sx={{fontSize:58,opacity:.9}}/></Box></Surface>
    <Surface sx={{bgcolor:'#FFF7F2',borderColor:'#FFD9BE'}}><Stack gap={1.25}><Stack direction="row" justifyContent="space-between" alignItems="center"><Stack direction="row" gap={1} alignItems="center"><ErrorRoundedIcon color="error"/><Typography variant="subtitle2">막힘 알림</Typography></Stack><Button component="a" href="#notifications" size="small" endIcon={<ArrowForwardRoundedIcon/>}>알림 센터</Button></Stack><Typography variant="body2" color="text.secondary">내 차량이 {blocker?.label} 차량에 의해 막혀 있습니다.</Typography><Stack direction="row" gap={1}>{/* TODO(logic): 막고 있는 차량 차주에게 이동 요청 전송 */}<NavButton to="notifications" fullWidth>이동 요청 보내기</NavButton><NavButton to="notifications" variant="outlined" fullWidth>상세 보기</NavButton></Stack></Stack></Surface>
    <SectionTitle>빠른 액션</SectionTitle>
    <Stack direction="row" gap={1.25}><NavButton to="parking-register" fullWidth>주차 배치 등록</NavButton><NavButton to="share" variant="outlined" fullWidth>공유 주차 탐색</NavButton></Stack>
    <Box sx={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:1.25}}>{[['내 차량 상세','12가 3456 · 흰색','vehicle-detail'],['관리자 대시보드','대기 요청 2건','admin']].map(([title,desc,to])=><Surface key={title}><Box component="a" href={`#${to}`} sx={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:1,color:'inherit'}}><Box><Typography variant="subtitle2">{title}</Typography><Typography variant="caption" color="text.secondary">{desc}</Typography></Box><ArrowForwardRoundedIcon color="action" fontSize="small"/></Box></Surface>)}</Box>
    <SectionTitle>최근 알림</SectionTitle>
    <Surface><Stack divider={<Divider flexItem/>} gap={1.25}>{[['주차 요청 도착','101동 입주민 · 방금 전'],['출차 완료 안내','건물 앞 2번 비어 있음 · 10분 전']].map(([title,desc])=><Stack key={title} direction="row" justifyContent="space-between" alignItems="center" gap={1}><Box><Typography variant="subtitle2">{title}</Typography><Typography variant="caption" color="text.secondary">{desc}</Typography></Box>{/* TODO(logic): 알림 읽음 처리 */}<Button component="a" href="#notifications" size="small" variant="outlined">확인</Button></Stack>)}</Stack></Surface>
  </Stack>
}
