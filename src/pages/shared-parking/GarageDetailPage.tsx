import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded'
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded'
import { Alert, Button, Divider, Stack, Typography } from '@mui/material'
import { GarageVisual } from '../../components/Illustrations'
import { InfoRow, PageTitle, SectionTitle, StatusChip, Surface } from '../../components/Ui'

const spots = [
  ['A-1 구역','available','입구 쪽'],['A-2 구역','soon','오후 2:30 출차'],['B-1 구역','disabled','오후 9:00까지'],['B-2 구역','disabled','오후 6:30까지'],['C-1 구역','available','건물 후면'],
] as const

export default function GarageDetailPage() {
  return <Stack gap={2.25}><PageTitle eyebrow="공유 차고지" title="햇살빌라 101동 B-2" description="서울 노원구 월계로 40 · 도보 3분"/><GarageVisual large/><Surface><InfoRow label="운영 시간" value="07:00 – 23:00" icon={<AccessTimeRoundedIcon color="primary" fontSize="small"/>}/><Divider/><InfoRow label="요금" value="월 55,000원" icon={<PaymentsRoundedIcon color="primary" fontSize="small"/>}/><Divider/><InfoRow label="상세 위치" value="건물 뒤편 좌측" icon={<PlaceRoundedIcon color="primary" fontSize="small"/>}/></Surface><SectionTitle>주차면 현황</SectionTitle>{spots.map(([name,status,note])=><Surface key={name}><Stack direction="row" justifyContent="space-between" alignItems="center"><div><Typography variant="subtitle2">{name}</Typography><Typography variant="caption" color="text.secondary">{note}</Typography></div><Stack alignItems="flex-end" gap={0.75}><StatusChip kind={status==='available'?'available':status==='soon'?'soon':'disabled'}/>{status!=='disabled'&&<Button component="a" href="#request-result" size="small" variant="contained">요청하기</Button>}</Stack></Stack></Surface>)}<Alert severity="info" sx={{borderRadius:3}}>지정 주차면만 이용할 수 있으며, 종료 시간을 지켜 주세요.</Alert></Stack>
}
