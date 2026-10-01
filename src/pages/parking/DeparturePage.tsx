import EventRepeatRoundedIcon from '@mui/icons-material/EventRepeatRounded'
import { Divider, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { NavButton, PageTitle, SectionTitle, Surface } from '../../components/Ui'
import { halfHourOptions } from './timeOptions'

// TODO(logic): 현재 차량의 배치 칸과 등록된 출차 일정을 불러와 기본값으로 채우기
export default function DeparturePage() {
  return <Stack gap={2.25}>
    <PageTitle title="출차 일정 수정" description="12가 3456 · 필로티 3번에 주차 중 — 배치는 그대로 두고 출차 시간만 바꿉니다."/>
    <Divider/>
    <SectionTitle>출차 일시</SectionTitle>
    {/* TODO(logic): '날짜 직접 선택'을 고르면 날짜 선택기 열기 */}
    <TextField select label="날짜 선택" defaultValue="tomorrow">{[['today','오늘'],['tomorrow','내일'],['custom','날짜 직접 선택']].map(([value,label])=><MenuItem key={value} value={value}>{label}</MenuItem>)}</TextField>
    <TextField select label="출차 시간" defaultValue="07:30">{halfHourOptions('06:00','14:00').map((value)=><MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
    <Divider/>
    <SectionTitle>반복 설정</SectionTitle>
    <Surface><Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}><Stack direction="row" gap={1.25} alignItems="center"><EventRepeatRoundedIcon color="primary"/><div><Typography variant="subtitle2">반복 일정 설정</Typography><Typography variant="caption" color="text.secondary">매주·매일 반복 출차 일정을 등록합니다</Typography></div></Stack><NavButton to="repeat" variant="outlined">설정</NavButton></Stack></Surface>
    <Divider/>
    <TextField label="메모 (선택)" multiline rows={2}/>
    {/* TODO(logic): 출차 일정 변경 저장 (배치 칸은 유지) */}
    <NavButton to="vehicle-detail" fullWidth>변경 사항 저장</NavButton>
  </Stack>
}
