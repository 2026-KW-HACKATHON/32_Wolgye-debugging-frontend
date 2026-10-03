import { Button, MenuItem, Stack, TextField } from '@mui/material'
import { PageTitle } from '../../components/Ui'

const colors = ['검정', '흰색', '은색', '회색', '파랑', '빨강', '기타'] as const

// TODO(logic): POST /me/vehicles { plate, color } 성공 후 홈으로 이동. 번호판 검증·중복 차량 오류 처리.
export default function VehicleRegisterPage() {
  return <Stack component="form" gap={2.25} onSubmit={(event) => event.preventDefault()}>
    <PageTitle eyebrow="2단계 중 2단계" title="차량 정보 등록" description="본인 차량의 번호판과 색상을 입력해 주세요." />
    <TextField label="번호판" placeholder="예: 12가 3456" autoComplete="off" />
    <TextField select label="색상" defaultValue="" helperText="차량 색상을 선택해 주세요.">{colors.map((color) => <MenuItem key={color} value={color}>{color}</MenuItem>)}</TextField>
    <Button component="a" href="#home" variant="contained" fullWidth>완료</Button>
  </Stack>
}
