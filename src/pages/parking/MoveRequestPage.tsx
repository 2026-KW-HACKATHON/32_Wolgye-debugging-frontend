import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded'
import { Divider, Stack, Typography } from '@mui/material'
import { InfoRow, NavButton, PageTitle, SectionTitle, Surface } from '../../components/Ui'

// TODO(logic): 알림(푸시)으로 받은 이동 요청 ID로 요청 정보, 요청 차량(내 차), 막힌 차량 정보를 불러오기
export default function MoveRequestPage() {
  return <Stack gap={2.25}>
    <PageTitle title="이동 요청"/>
    <Surface sx={{bgcolor:'#FFF7F2',borderColor:'#FFD9BE'}}><Stack direction="row" gap={1.25} alignItems="center"><ErrorRoundedIcon color="warning"/><div><Typography variant="caption" color="warning.main" fontWeight={800}>긴급 이동 요청</Typography><Typography variant="h6">내 차량을 이동해 주세요</Typography></div></Stack><Divider sx={{my:1.25}}/><InfoRow label="요청 시각" value="오후 2:34"/><InfoRow label="요청자" value="301동 입주민"/></Surface>
    <SectionTitle>요청 차량 정보</SectionTitle>
    <Surface><InfoRow label="차량 번호" value="12가 3456"/><InfoRow label="차량 위치" value="P2"/><InfoRow label="주차 시각" value="오후 12:10"/></Surface>
    <SectionTitle>막힌 차량 정보</SectionTitle>
    <Surface><InfoRow label="차량 번호" value="78나 9012"/><InfoRow label="차량 위치" value="P4"/><InfoRow label="출차 필요 시각" value="오후 3:00"/></Surface>
    <SectionTitle>요청 사유</SectionTitle>
    <Surface><Typography variant="body2" color="text.secondary">외출 예정으로 출차가 필요합니다. 차량 이동을 부탁드립니다.</Typography></Surface>
    {/* TODO(logic): '옮겼어요' 응답 전송 후 요청자에게 알림 */}
    <NavButton to="move-done" fullWidth>옮겼어요</NavButton>
  </Stack>
}
