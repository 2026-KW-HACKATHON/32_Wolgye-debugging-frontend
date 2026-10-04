import { Alert, Button, MenuItem, Stack, TextField } from '@mui/material'
import { createMyVehicle } from '../../api/vehicles'
import { NavButton, PageTitle } from '../../components/Ui'
import type { VehicleColor } from '../../types/api'
import { useOnboardingForm } from './useOnboardingForm'

const colors: VehicleColor[] = ['검정', '흰색', '은색', '회색', '파랑', '빨강', '기타']

export default function VehicleRegisterPage() {
  const { pending, error, needsLogin, submit } = useOnboardingForm()
  return <Stack component="form" gap={2.25} onSubmit={(event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    void submit(async () => {
      await createMyVehicle({ plate: String(data.get('plate')), color: String(data.get('color')) as VehicleColor, is_default: true })
      window.location.hash = '#home'
    })
  }}>
    <PageTitle eyebrow="2단계 중 2단계" title="차량 정보 등록" description="본인 차량의 번호판과 색상을 입력해 주세요." />
    {error && <Alert severity="error" action={needsLogin ? <NavButton to="login" variant="text">로그인</NavButton> : undefined}>{error}</Alert>}
    <TextField name="plate" label="번호판" required disabled={pending} placeholder="예: 12가 3456" autoComplete="off" />
    <TextField name="color" select label="색상" required disabled={pending} defaultValue="" helperText="차량 색상을 선택해 주세요.">{colors.map((color) => <MenuItem key={color} value={color}>{color}</MenuItem>)}</TextField>
    <Button type="submit" variant="contained" fullWidth disabled={pending}>{pending ? '등록 중…' : '완료'}</Button>
  </Stack>
}
