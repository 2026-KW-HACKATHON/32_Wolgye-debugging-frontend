import { useState } from 'react'
import { Divider, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { NavButton, PageTitle, SectionTitle } from '../../components/Ui'
import { halfHourOptions } from './timeOptions'

// TODO(logic): 기존 반복 일정이 있으면 불러와 요일·시간·메모 기본값으로 채우기
export default function RepeatPage() {
  const [days, setDays] = useState<string[]>(['월','화','수','목','금'])
  return <Stack gap={2.25}>
    <PageTitle title="반복 일정 설정" description="매주 반복할 출차 일정을 설정하세요."/>
    <Divider/>
    <SectionTitle>반복 요일</SectionTitle>
    <ToggleButtonGroup value={days} onChange={(_,value)=>setDays(value)} size="small" sx={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>{['월','화','수','목','금','토','일'].map((day)=><ToggleButton key={day} value={day} sx={{minWidth:0,px:0}}>{day}</ToggleButton>)}</ToggleButtonGroup>
    <Divider/>
    <SectionTitle>출차 예정 시간</SectionTitle>
    <TextField select label="출차 시간" defaultValue="07:30">{halfHourOptions('06:00','12:00').map((value)=><MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
    <Divider/>
    <TextField label="메모 (선택)" placeholder="예: 출근 일정" multiline rows={2}/>
    {/* TODO(logic): 반복 일정 저장 (요일 1개 이상 선택 확인) */}
    <NavButton to="home" fullWidth>반복 일정 저장</NavButton>
  </Stack>
}
