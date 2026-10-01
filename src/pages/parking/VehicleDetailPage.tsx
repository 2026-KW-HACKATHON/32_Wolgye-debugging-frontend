import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded'
import { Chip, Divider, Stack, Typography } from '@mui/material'
import ParkingMap from '../../components/ParkingMap'
import { InfoRow, NavButton, PageTitle, SectionTitle, StatusChip, Surface } from '../../components/Ui'

// TODO(logic): 차량 ID로 차량 정보, 현재 주차 상태, 출차 일정(직접 등록 / AI 추정 구분)을 불러와 하드코딩 값 교체
// TODO(logic): 경과 시간을 입차 시각 기준으로 계산
export default function VehicleDetailPage() {
  return <Stack gap={2.25}>
    <PageTitle title="차량 상세"/>
    <Surface><Stack direction="row" gap={1.5} alignItems="center"><DirectionsCarRoundedIcon color="primary" sx={{fontSize:36}}/><div><Typography variant="h6">12가 3456</Typography><Typography variant="caption" color="text.secondary">흰색</Typography></div></Stack><Divider sx={{my:1.25}}/><InfoRow label="차량 소유자" value="김지수"/><InfoRow label="동·호수" value="101동 203호"/></Surface>
    <SectionTitle>현재 주차 상태</SectionTitle>
    <Surface><InfoRow label="주차 구역" value="필로티 3번"/><InfoRow label="입차 시각" value="오늘 08:30"/><InfoRow label="주차 상태" value={<StatusChip kind="accepted" label="주차 중"/>}/></Surface>
    <SectionTitle>출차 일정</SectionTitle>
    <Surface>
      <InfoRow label="예정 출차 시각" value="오늘 18:30"/>
      {/* 직접 등록한 일정은 '직접 등록' 칩, 기록 기반 추정값은 'AI 추정' 칩으로 구분 표시 */}
      <InfoRow label="등록 유형" value={<Chip size="small" variant="outlined" color="secondary" icon={<AutoAwesomeRoundedIcon/>} label="AI 추정"/>}/>
      <InfoRow label="경과 시간" value="9시간 30분"/>
      <Typography variant="caption" color="text.secondary">출차 시간을 등록하지 않아 지난 기록으로 추정한 시각이에요.</Typography>
    </Surface>
    <SectionTitle>주차 위치</SectionTitle>
    <ParkingMap compact highlightMine/>
    <NavButton to="departure" fullWidth>출차 일정 수정</NavButton>
  </Stack>
}
