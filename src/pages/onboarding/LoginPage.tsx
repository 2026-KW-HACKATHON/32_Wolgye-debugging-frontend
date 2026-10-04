import { Alert, Button, Stack, TextField } from '@mui/material'
import { DEMO_EMAIL, DEMO_PASSWORD, login } from '../../api/auth'
import { NavButton, PageTitle } from '../../components/Ui'
import { onboardingHash, useOnboardingForm } from './useOnboardingForm'

export default function LoginPage() {
  const { pending, error, submit } = useOnboardingForm()
  return <Stack component="form" gap={2.25} pt={3} onSubmit={(event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    void submit(async () => {
      const result = await login({ email: String(data.get('email')), password: String(data.get('password')) })
      window.location.hash = onboardingHash(result.user.onboarding_step)
    })
  }}>
    <PageTitle title="로그인" description="입주민을 위한 주차 관리" />
    <Alert severity="info">시연 계정: {DEMO_EMAIL}<br />비밀번호: {DEMO_PASSWORD}</Alert>
    {error && <Alert severity="error">{error}</Alert>}
    <TextField name="email" label="이메일" type="email" required disabled={pending} autoComplete="email" placeholder="이메일을 입력하세요" />
    <TextField name="password" label="비밀번호" type="password" required disabled={pending} autoComplete="current-password" placeholder="비밀번호를 입력하세요" />
    <Button type="submit" variant="contained" fullWidth disabled={pending}>{pending ? '로그인 중…' : '로그인'}</Button>
    <Stack direction="row" justifyContent="center" gap={1}>
      <Button disabled>계정 찾기 · 준비 중</Button>
      <NavButton to="signup" variant="text">회원가입</NavButton>
    </Stack>
  </Stack>
}
