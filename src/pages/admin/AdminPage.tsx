import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded'
import { Avatar, Box, Button, Divider, IconButton, Stack, Typography } from '@mui/material'
import ParkingMap from '../../components/ParkingMap'
import { NavButton, PageTitle, SectionTitle, StatusChip, Surface } from '../../components/Ui'
import { tones } from '../../theme'

// 2026년 9월 일별 '가장 붐빈 시간의 점유 칸 수' (총 8칸) 임시 값
const dailyPeak = [6,4,7,8,6,5,3,7,4,8,7,6,5,3,7,4,8,6,7,5,3,7,4,8,7,6,5,3,7,4]
// 월요일(7·14·21·28일)과 수요일(2·9·16·23·30일) 강조
const quietDays = [2,7,9,14,16,21,23,28,30]
const TOTAL_SLOTS = 8

// TODO(logic): 관리 중인 빌라의 대기 요청, 실시간 칸 현황, 외부·미확인 차량, 월별 혼잡도, AI 분석 문구를 API에서 불러오기
export default function AdminPage() {
  return <Stack gap={2.25}>
    <PageTitle eyebrow="관리자" title="월계 햇빛빌라" action={<NavButton to="requests" variant="text" startIcon={<NotificationsRoundedIcon/>}>알림</NavButton>}/>
    <Surface sx={{bgcolor:'#F8FAFD'}}><Stack gap={1.25}>
      <Stack direction="row" gap={1.25} alignItems="center"><Avatar sx={{bgcolor:'#E8F0FF',color:'primary.main',fontWeight:800}}>박</Avatar><Box flex={1} minWidth={0}><Typography variant="caption" color="text.secondary">공유 사용 요청 · 방금</Typography><Typography variant="subtitle2">박○○ 님 · 매너 38.5℃</Typography><Typography variant="caption" color="text.secondary">10/5(월) 06~17시 · 골목 1번</Typography></Box><StatusChip kind="pending"/></Stack>
      <Divider/>
      {/* TODO(logic): 공유 요청 수락·거절 처리 (수락 시 해당 시간 칸을 이용 불가로 표시) */}
      <Stack direction="row" gap={1}><Button variant="outlined" color="error" fullWidth>거절</Button><Button variant="contained" fullWidth>수락</Button></Stack>
    </Stack></Surface>
    <SectionTitle action={<StatusChip kind="available" label="주차 가능 5곳"/>}>● 관리 구역 · 실시간</SectionTitle>
    <ParkingMap compact/>
    <Surface><Stack gap={1.25}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}><Box><Typography variant="caption" color="text.secondary">외부 차량 · 공유 이용자 (앱 가입)</Typography><Typography variant="subtitle2">123가 4634 · 골목 1번</Typography></Box>{/* TODO(logic): 외부 차량 이용자에게 이동 요청 전송 */}<Button size="small" variant="contained">이동 요청</Button></Stack>
      <Divider/>
      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}><Box><Typography variant="caption" color="text.secondary">미확인 차량 (관리자 등록)</Typography><Typography variant="subtitle2">45다 6789 · 건물 앞 1번</Typography></Box><Typography variant="caption" color="text.secondary">앱으로 연락 불가</Typography></Stack>
    </Stack></Surface>
    <Stack direction="row" gap={0.75} flexWrap="wrap"><StatusChip kind="recommended" label="입주민 차량"/><StatusChip kind="external" label="외부 차량"/><StatusChip kind="danger" label="미확인 차량"/><StatusChip kind="available" label="빈 칸"/></Stack>
    <Surface>
      <Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="subtitle2">주차 데이터 · 혼잡도</Typography>{/* TODO(logic): 월 이동 시 해당 월 데이터 불러오기 */}<Stack direction="row" alignItems="center"><IconButton size="small" aria-label="이전 달"><ChevronLeftRoundedIcon/></IconButton><Typography variant="subtitle2">9월</Typography><IconButton size="small" aria-label="다음 달"><ChevronRightRoundedIcon/></IconButton></Stack></Stack>
      <Typography variant="caption" color="text.secondary">하루 중 가장 붐빈 시간의 점유 칸 수 (총 {TOTAL_SLOTS}칸)</Typography>
      <Box sx={{overflowX:'auto',mt:1.5,pb:0.5}}><Box sx={{display:'flex',alignItems:'flex-end',gap:0.75,height:120,minWidth:30*18}}>{dailyPeak.map((count,index)=>{const day=index+1;const quiet=quietDays.includes(day);return <Stack key={day} alignItems="center" justifyContent="flex-end" gap={0.5} sx={{flex:'0 0 12px',height:'100%'}}><Box sx={{width:12,height:`${(count/TOTAL_SLOTS)*100}%`,bgcolor:quiet?'primary.main':'#BBD0FF',borderRadius:'4px 4px 2px 2px'}}/><Typography variant="caption" sx={{fontSize:9,color:quiet?'primary.main':'text.secondary'}}>{day}</Typography></Stack>})}</Box></Box>
    </Surface>
    <Surface sx={{bgcolor:'#F1F7FF',borderColor:'#D5E5FF'}}><Stack direction="row" gap={1.25}><AutoAwesomeRoundedIcon sx={{color:tones.blue}}/><div><Typography variant="subtitle2">AI 분석 (향후)</Typography><Typography variant="body2" color="text.secondary" mt={0.5}>공휴일과 월·수요일은 혼잡도가 낮아요. 이 날은 평균 1칸 이상 비어 있어 공유 자리로 열기 좋아요.</Typography></div></Stack></Surface>
    <SectionTitle>관리 메뉴</SectionTitle>
    {[['공유 요청 관리','대기 요청을 검토하고 승인·거절','requests'],['주차 구역 설정','칸별 사용·공유 여부 관리','slots'],['차고지 등록','새 차고지 또는 공간 추가','garage-register']].map(([title,desc,to])=><Surface key={title}><Box component="a" href={`#${to}`} sx={{display:'flex',justifyContent:'space-between',alignItems:'center',color:'inherit'}}><div><Typography variant="subtitle2">{title}</Typography><Typography variant="caption" color="text.secondary">{desc}</Typography></div><ArrowForwardRoundedIcon color="action"/></Box></Surface>)}
  </Stack>
}
