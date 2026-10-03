import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded'
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded'
import { Alert, Stack, Typography } from '@mui/material'
import { NavButton, PageTitle, SectionTitle, Surface } from '../../components/Ui'

export default function RoleGuidePage() {
  return <Stack gap={2.25}>
    <PageTitle title="역할 및 권한 안내" description="입주민과 관리자가 할 수 있는 일을 확인해요."/>
    <Surface><Stack gap={1.25}><Stack direction="row" alignItems="center" gap={1}><DirectionsCarRoundedIcon color="primary"/><SectionTitle>입주민</SectionTitle></Stack><Typography variant="body2">내 차량 등록·관리, 주차 및 출차 일정 등록</Typography><Typography variant="body2">주차 현황 확인, 차량 이동 요청 및 처리</Typography><Typography variant="body2">공유 주차 탐색 및 이용 요청</Typography></Stack></Surface>
    <Surface><Stack gap={1.25}><Stack direction="row" alignItems="center" gap={1}><SecurityRoundedIcon color="primary"/><SectionTitle>관리자</SectionTitle></Stack><Typography variant="body2">소속 건물의 주차 현황과 공유 요청 확인</Typography><Typography variant="body2">공유 요청 수락·거절, 주차 칸 사용 설정</Typography><Typography variant="body2">공유할 칸의 요일·시간·토큰 요금 등록</Typography></Stack></Surface>
    <Alert severity="info">관리자 권한은 운영자가 부여해요. 이 화면에서 역할을 선택하거나 변경할 수 없어요.</Alert>
    <NavButton to="profile" variant="outlined" fullWidth>설정으로 돌아가기</NavButton>
  </Stack>
}
