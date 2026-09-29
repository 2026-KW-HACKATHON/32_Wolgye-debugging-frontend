import { useState } from 'react'
import { Button, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { PageTitle, SectionTitle } from '../components/Ui'

export default function RepeatPage() {
  const [days, setDays] = useState<string[]>(['월','화','수','목','금'])
  return <Stack spacing={2.25}><PageTitle title="반복 일정 설정" description="매주 반복할 출차·귀차 시간을 정해 주세요."/><SectionTitle>반복 요일</SectionTitle><ToggleButtonGroup value={days} onChange={(_,value)=>setDays(value)} size="small" sx={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>{['월','화','수','목','금','토','일'].map((day)=><ToggleButton key={day} value={day} sx={{minWidth:0,px:0}}>{day}</ToggleButton>)}</ToggleButtonGroup><TextField label="출차 예정 시간" type="time" defaultValue="07:30" slotProps={{inputLabel:{shrink:true}}}/><TextField label="귀차 예정 시간" type="time" defaultValue="19:00" slotProps={{inputLabel:{shrink:true}}}/><TextField select label="반복 종료" defaultValue="continue"><MenuItem value="continue">계속 반복</MenuItem><MenuItem value="date">종료 날짜 지정</MenuItem></TextField><TextField label="메모 (선택)" defaultValue="평일 출근 일정"/><Button component="a" href="#parking-register" variant="contained" fullWidth>반복 일정 저장</Button></Stack>
}
