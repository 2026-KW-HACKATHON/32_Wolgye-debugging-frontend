import EditRoundedIcon from '@mui/icons-material/EditRounded'
import { Button, IconButton, MenuItem, Stack, Switch, TextField, Typography } from '@mui/material'
import { PageTitle, SectionTitle, StatusChip, Surface } from '../../components/Ui'

const slots = [
  ['A-1','일반 주차 · 입구 쪽','available'],['A-2','일반 주차 · 입구 쪽','available'],['B-1','지정 주차 · 중앙','disabled'],['B-2','지정 주차 · 중앙','external'],['C-1','공유 주차 · 후면','available'],
] as const

export default function SlotsPage() {
  return <Stack gap={2.25}><PageTitle title="주차 구역 설정" description="칸 이름과 현재 사용 가능 여부를 관리해요."/><SectionTitle>등록된 주차 칸</SectionTitle>{slots.map(([name,desc,status])=><Surface key={name}><Stack direction="row" justifyContent="space-between" alignItems="center"><div><Stack direction="row" gap={0.75} alignItems="center"><Typography variant="subtitle2">{name}</Typography><StatusChip kind={status==='available'?'available':status==='external'?'external':'disabled'}/></Stack><Typography variant="caption" color="text.secondary">{desc}</Typography></div><IconButton aria-label={`${name} 수정`}><EditRoundedIcon/></IconButton></Stack></Surface>)}<SectionTitle>새 주차 칸 추가</SectionTitle><TextField label="칸 번호" placeholder="예: A-3"/><TextField label="위치 설명" placeholder="예: 입구 쪽 두 번째 칸"/><TextField select label="칸 유형" defaultValue="normal"><MenuItem value="normal">일반 주차</MenuItem><MenuItem value="assigned">지정 주차</MenuItem><MenuItem value="shared">공유 주차</MenuItem></TextField><Surface><Stack direction="row" justifyContent="space-between" alignItems="center"><div><Typography variant="subtitle2">사용 가능한 칸</Typography><Typography variant="caption" color="text.secondary">배치도에서 빈자리로 표시합니다.</Typography></div><Switch defaultChecked/></Stack></Surface><Button variant="contained" fullWidth>주차 칸 저장</Button></Stack>
}
