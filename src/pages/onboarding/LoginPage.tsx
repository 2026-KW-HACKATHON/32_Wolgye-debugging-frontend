import { Button, Stack, TextField } from '@mui/material'
import { NavButton, PageTitle } from '../../components/Ui'

// TODO(logic): POST /auth/login → 토큰 저장 후 onboarding_step에 맞춰 이동. 로그인 실패 안내.
export default function LoginPage() {
  return <Stack component="form" gap={2.25} pt={3} onSubmit={(event) => event.preventDefault()}>
    <PageTitle title="로그인" description="입주민을 위한 주차 관리" />
    <TextField label="이메일" type="email" autoComplete="email" placeholder="이메일을 입력하세요" />
    <TextField label="비밀번호" type="password" autoComplete="current-password" placeholder="비밀번호를 입력하세요" />
    <Button component="a" href="#home" variant="contained" fullWidth>로그인</Button>
    <Stack direction="row" justifyContent="center" gap={1}>
      <Button disabled>계정 찾기 · 준비 중</Button>
      <NavButton to="signup" variant="text">회원가입</NavButton>
    </Stack>
  </Stack>
}
