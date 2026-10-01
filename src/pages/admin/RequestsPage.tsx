import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { Box, Button, Chip, Divider, InputAdornment, Stack, TextField, Typography } from '@mui/material'
import { PageTitle, StatusChip, Surface } from '../../components/Ui'

type RequestStatus = '대기 중' | '수락됨' | '거절됨'

// TODO(logic): 공유 요청 목록과 상태별 건수를 API에서 불러오기
const requests: { name: string; plate: string; unit: string; slot: string; time: string; manner: string; status: RequestStatus }[] = [
  { name: '홍길동', plate: '12가 3456', unit: '101동 201호', slot: '골목 1번', time: '2026.10.05 13:00 ~ 18:00', manner: '38.5℃', status: '대기 중' },
  { name: '이수진', plate: '34나 7890', unit: '102동 302호', slot: '골목 1번', time: '2026.10.05 06:00 ~ 12:00', manner: '36.9℃', status: '대기 중' },
  { name: '박민준', plate: '56다 1234', unit: '103동 101호', slot: '건물 앞 1번', time: '2026.10.04 09:00 ~ 12:00', manner: '41.2℃', status: '대기 중' },
  { name: '김지영', plate: '78라 5678', unit: '101동 403호', slot: '골목 1번', time: '2026.10.04 14:00 ~ 17:00', manner: '35.4℃', status: '대기 중' },
  { name: '최성우', plate: '90마 2345', unit: '102동 202호', slot: '골목 1번', time: '2026.10.02 10:00 ~ 13:00', manner: '39.0℃', status: '수락됨' },
  { name: '정다은', plate: '23바 6789', unit: '103동 304호', slot: '건물 앞 1번', time: '2026.10.02 16:00 ~ 20:00', manner: '33.1℃', status: '거절됨' },
]

const statusKind = { '대기 중': 'pending', '수락됨': 'accepted', '거절됨': 'rejected' } as const

export default function RequestsPage() {
  return <Stack gap={2.25}>
    <PageTitle title="공유 요청 관리" description="대기 요청을 확인하고 이용 가능 여부를 결정해요."/>
    <Box sx={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:1}}>{[['대기 중','4건'],['수락됨','7건'],['거절됨','2건']].map(([label,value],index)=><Surface key={label} sx={{boxShadow:'none',bgcolor:index===0?'#FFF9E8':'#fff'}}><Typography variant="caption" color="text.secondary">{label}</Typography><Typography variant="h6" mt={0.25}>{value}</Typography></Surface>)}</Box>
    {/* TODO(logic): 요청자 이름·차량번호 검색, 상태 필터 적용 */}
    <TextField placeholder="요청자 또는 차량번호 검색" slotProps={{input:{startAdornment:<InputAdornment position="start"><SearchRoundedIcon/></InputAdornment>}}}/>
    <Stack direction="row" gap={0.75} flexWrap="wrap">{['전체','대기 중','수락됨','거절됨'].map((label,index)=><Chip key={label} label={label} clickable color={index===0?'primary':'default'} variant={index===0?'filled':'outlined'}/>)}</Stack>
    {requests.map((request)=><Surface key={request.plate}><Stack gap={1.25}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}><Box minWidth={0}><Typography variant="subtitle2">{request.name}{request.status==='대기 중' && <Typography component="span" variant="caption" color="primary" fontWeight={800}> · 매너 {request.manner}</Typography>}</Typography><Typography variant="caption" color="text.secondary" display="block">{request.plate} · {request.unit}</Typography><Typography variant="caption" color="text.secondary" display="block">요청 구역: {request.slot} · {request.time}</Typography></Box><StatusChip kind={statusKind[request.status]}/></Stack>
      {/* TODO(logic): 공유 요청 수락·거절 처리 후 목록·건수 갱신 */}
      {request.status==='대기 중' && <><Divider/><Stack direction="row" gap={1}><Button size="small" variant="outlined" color="error" fullWidth>거절</Button><Button size="small" variant="contained" fullWidth>수락</Button></Stack></>}
    </Stack></Surface>)}
  </Stack>
}
