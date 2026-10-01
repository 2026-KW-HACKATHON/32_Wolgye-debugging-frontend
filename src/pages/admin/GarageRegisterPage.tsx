import { Checkbox, Divider, FormControlLabel, InputAdornment, MenuItem, Stack, Switch, TextField, Typography } from '@mui/material'
import { NavButton, PageTitle, SectionTitle, Surface } from '../../components/Ui'

const startTimes = ['00:00','00:30','01:00','01:30','06:00','06:30','07:00','07:30','08:00','08:30','09:00']
const endTimes = ['18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00','22:30','23:00','23:30']
const dayOptions = ['매일','평일','주말','월~금','토~일']
const maxHourOptions = ['1시간','2시간','3시간','4시간','제한 없음']

// TODO(logic): 공유 가능으로 설정된 칸 목록을 API에서 불러오기
const shareableSlots = ['골목 1번 · 골목 후면','건물 앞 1번 · 건물 정면','필로티 1번 · 입구 쪽']

export default function GarageRegisterPage() {
  return <Stack gap={2.25}>
    <PageTitle title="차고지 등록" description="이웃과 공유할 주차 공간의 정보를 입력해 주세요."/>
    <SectionTitle>기본 정보</SectionTitle>
    <TextField label="차고지 이름" placeholder="예: 햇빛빌라 골목 1번"/>
    <TextField label="상세 위치 안내" multiline rows={3} placeholder="예: 건물 뒤편 좌측"/>
    <SectionTitle>공유할 칸 선택</SectionTitle>
    <Surface><Stack>{shareableSlots.map((label,index)=><FormControlLabel key={label} control={<Checkbox defaultChecked={index===0}/>} label={<Typography variant="body2">{label}</Typography>}/>)}</Stack></Surface>
    <Divider/>
    <SectionTitle>가용 시간</SectionTitle>
    <Stack direction="row" gap={1}><TextField select fullWidth label="시작 시간" defaultValue="06:00">{startTimes.map((value)=><MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField><TextField select fullWidth label="종료 시간" defaultValue="18:00">{endTimes.map((value)=><MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField></Stack>
    <TextField select label="이용 가능 요일" defaultValue="매일">{dayOptions.map((value)=><MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
    <Divider/>
    <SectionTitle>이용 조건</SectionTitle>
    <TextField label="시간당 요금" defaultValue="1,000" helperText="0이면 무료로 공개돼요" slotProps={{input:{endAdornment:<InputAdornment position="end">원</InputAdornment>}}}/>
    <TextField select label="최대 이용 시간" defaultValue="4시간">{maxHourOptions.map((value)=><MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
    <TextField label="메모 (이용자에게 전달할 사항)" multiline rows={3}/>
    <Divider/>
    <SectionTitle>공개 설정</SectionTitle>
    <Surface><Stack direction="row" justifyContent="space-between" alignItems="center"><div><Typography variant="subtitle2">차고지 공개</Typography><Typography variant="caption" color="text.secondary">공유 주차 목록에 표시합니다.</Typography></div><Switch defaultChecked/></Stack></Surface>
    {/* TODO(logic): 차고지 등록 요청 (필수값: 이름, 공유할 칸 1개 이상, 시작 < 종료, 요금 0 이상) */}
    <NavButton to="admin" fullWidth>차고지 등록 완료</NavButton>
  </Stack>
}
