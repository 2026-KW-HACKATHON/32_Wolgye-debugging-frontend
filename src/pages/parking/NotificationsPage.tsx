import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded'
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded'
import { Box, Button, Divider, Stack, Typography } from '@mui/material'
import { NavButton, PageTitle, SectionTitle, StatusChip, Surface } from '../../components/Ui'

// 알림 센터(n26). 와이어프레임이 없어 유저플로우(막힘 사전 알림 목록 → 이동 요청 전송, 이동 요청 수신)를 기준으로 구성했다.
// TODO(logic): 내 알림 목록(막힘 사전 알림, 받은 이동 요청, 일반 알림)을 API에서 불러오기
export default function NotificationsPage() {
  return <Stack gap={2.25}>
    <PageTitle title="알림" description="막힘 알림과 이동 요청을 한곳에서 확인해요."/>
    <SectionTitle action={<StatusChip kind="danger" label="2건"/>}>막힘 사전 알림</SectionTitle>
    <Surface sx={{bgcolor:'#FFF7F2',borderColor:'#FFD9BE'}}><Stack gap={1.25}>
      <Stack direction="row" gap={1} alignItems="center"><ErrorRoundedIcon color="error"/><Typography variant="subtitle2">내 차량이 막혀 있어요</Typography></Stack>
      <Typography variant="body2" color="text.secondary">P1 차량(123가 4634)이 내 차량(P2) 앞에 있어요. 내 출차 예정은 오늘 18:30이에요.</Typography>
      {/* TODO(logic): 막고 있는 차량 차주에게 이동 요청 전송 (전화번호 노출 없이) */}
      <Button variant="contained" fullWidth>이동 요청 보내기</Button>
    </Stack></Surface>
    <Surface><Stack gap={1.25}>
      <Stack direction="row" gap={1} alignItems="center"><ScheduleRoundedIcon color="warning"/><Typography variant="subtitle2">내 차량이 이웃 차를 막고 있어요</Typography></Stack>
      <Typography variant="body2" color="text.secondary">78나 9012 차량이 내일 06:00에 출차할 예정이에요. 오늘 밤에 미리 옮겨 주세요.</Typography>
      {/* TODO(logic): 미리 옮겼다고 응답 (요청 없이 선제 응답) */}
      <Button variant="outlined" fullWidth>옮겼어요</Button>
    </Stack></Surface>
    <SectionTitle>받은 이동 요청</SectionTitle>
    <Surface><Box component="a" href="#move" sx={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:1,color:'inherit'}}><Box><Typography variant="subtitle2">301동 입주민의 이동 요청</Typography><Typography variant="caption" color="text.secondary">출차 필요 오후 3:00 · 오후 2:34</Typography></Box><Stack direction="row" gap={0.5} alignItems="center"><StatusChip kind="pending" label="응답 대기"/><ArrowForwardRoundedIcon color="action" fontSize="small"/></Stack></Box></Surface>
    <SectionTitle>최근 알림</SectionTitle>
    <Surface><Stack divider={<Divider flexItem/>} gap={1.25}>{[['주차 요청 도착','101동 입주민 · 방금 전'],['출차 완료 안내','P8 비어 있음 · 10분 전']].map(([title,desc])=><Stack key={title} direction="row" justifyContent="space-between" alignItems="center" gap={1}><Box><Typography variant="subtitle2">{title}</Typography><Typography variant="caption" color="text.secondary">{desc}</Typography></Box>{/* TODO(logic): 알림 읽음 처리 */}<Button size="small" variant="outlined">확인</Button></Stack>)}</Stack></Surface>
    <NavButton to="home" variant="text" fullWidth>배치도로 돌아가기</NavButton>
  </Stack>
}
