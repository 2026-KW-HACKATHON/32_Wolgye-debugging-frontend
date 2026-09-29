import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import { Button, IconButton, Stack, Switch, TextField, Typography } from '@mui/material'
import { PageTitle, SectionTitle, StatusChip, Surface } from '../components/Ui'

export default function VehiclesPage() {
  return <Stack gap={2.25}><PageTitle title="차량 관리" description="우리 집 차량과 대표 차량을 관리해요."/><SectionTitle>등록 차량</SectionTitle>{[['12가 3456','흰색 아반떼','주차 중'],['78나 9012','검정 쏘나타','외부 출차']].map(([plate,model,status],index)=><Surface key={plate}><Stack direction="row" justifyContent="space-between" alignItems="center"><Stack direction="row" gap={1.25} alignItems="center"><DirectionsCarRoundedIcon color={index===0?'primary':'action'}/><div><Stack direction="row" gap={0.75} alignItems="center"><Typography variant="subtitle2">{plate}</Typography>{index===0&&<StatusChip kind="recommended" label="대표"/>}</Stack><Typography variant="caption" color="text.secondary">{model} · {status}</Typography></div></Stack><IconButton aria-label={`${plate} 수정`}><EditRoundedIcon/></IconButton></Stack></Surface>)}<SectionTitle>차량 추가</SectionTitle><TextField label="차량 번호" placeholder="12가 3456"/><TextField label="차종 · 색상" placeholder="예: 흰색 아반떼"/><Surface><Stack direction="row" justifyContent="space-between" alignItems="center"><div><Typography variant="subtitle2">대표 차량으로 설정</Typography><Typography variant="caption" color="text.secondary">홈 화면에 먼저 표시합니다.</Typography></div><Switch/></Stack></Surface><Button variant="contained" startIcon={<AddRoundedIcon/>} fullWidth>차량 추가</Button></Stack>
}
