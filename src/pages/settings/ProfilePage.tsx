import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded'
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded'
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded'
import { Avatar, Button, Stack, TextField, Typography } from '@mui/material'
import { PageTitle, SectionTitle, Surface } from '../../components/Ui'

export default function ProfilePage() {
  // TODO(logic): #16 GET/PATCH /users/me 연결 후 계정 입력과 저장 활성화. 마스킹된 연락처를 그대로 전송하지 않는다.
  const menuItems = [
    { icon: DirectionsCarRoundedIcon, title: '차량 관리', description: '등록 차량 확인 및 수정', href: '#vehicles' },
    { icon: NotificationsRoundedIcon, title: '알림 설정', description: '막힘·이동 요청 알림 관리', href: '#notifications' },
    { icon: SecurityRoundedIcon, title: '역할 및 권한 안내', description: '입주민·관리자 역할 확인', href: '#role-guide' },
  ]

  return <Stack gap={2.25}><PageTitle title="프로필·설정" description="계정 정보와 알림 설정을 관리해요."/><Surface sx={{background:'linear-gradient(135deg,#F1F6FF,#FFFFFF)'}}><Stack direction="row" gap={1.5} alignItems="center"><Avatar sx={{width:58,height:58,bgcolor:'primary.main',fontWeight:800}}>김</Avatar><div><Typography variant="h6">김지수</Typography><Typography variant="body2" color="text.secondary">101동 202호 · 입주민</Typography></div></Stack></Surface><SectionTitle>계정 정보</SectionTitle><TextField disabled label="이름" defaultValue="김지수"/><TextField disabled label="동·호수" defaultValue="101동 202호"/><TextField disabled label="연락처" defaultValue="010-****-1234"/><SectionTitle>설정</SectionTitle>{menuItems.map(({ icon: Icon, title, description, href })=><Surface key={title}><Stack component="a" href={href} direction="row" alignItems="center" gap={1.25} color="inherit"><Icon/><Stack flex={1}><Typography variant="subtitle2">{title}</Typography><Typography variant="caption" color="text.secondary">{description}</Typography></Stack><ArrowForwardRoundedIcon color="action"/></Stack></Surface>)}<Button variant="contained" fullWidth disabled>변경사항 저장</Button></Stack>
}
