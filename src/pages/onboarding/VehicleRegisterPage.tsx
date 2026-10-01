import { Button, FormControlLabel, MenuItem, Stack, Switch, TextField } from '@mui/material'
import { PageTitle } from '../../components/Ui'

export default function VehicleRegisterPage() {
  return <Stack component="form" gap={2.25}><PageTitle eyebrow="3 / 3" title="차량 등록" description="주차 위치와 이동 요청에 사용할 차량이에요."/><TextField label="차량 번호" defaultValue="12가 3456"/><TextField label="차종" defaultValue="아반떼" helperText="예: 아반떼, 쏘나타"/><TextField select label="차량 색상" defaultValue="white"><MenuItem value="white">흰색</MenuItem><MenuItem value="black">검정색</MenuItem><MenuItem value="silver">은색</MenuItem></TextField><FormControlLabel control={<Switch defaultChecked/>} label="대표 차량으로 설정"/><FormControlLabel control={<Switch defaultChecked/>} label="이동 요청 알림 받기"/><Button component="a" href="#home" variant="contained" fullWidth>차량 등록 완료</Button></Stack>
}
