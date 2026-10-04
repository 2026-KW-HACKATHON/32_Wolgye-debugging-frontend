import { useState } from 'react'
import { Alert, Button, Checkbox, FormControlLabel, Stack, TextField } from '@mui/material'
import { signup } from '../../api/auth'
import { NavButton, PageTitle } from '../../components/Ui'
import { onboardingHash, useOnboardingForm } from './useOnboardingForm'

export default function SignupPage() {
  const [agreed, setAgreed] = useState(false)
  const { pending, error, submit, setError } = useOnboardingForm()
  return <Stack component="form" gap={2.25} onSubmit={(event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const password = String(data.get('password'))
    if (password !== data.get('confirm')) { setError('비밀번호가 일치하지 않습니다.'); return }
    void submit(async () => {
      const result = await signup({ email: String(data.get('email')), password, nickname: String(data.get('nickname')), agree_terms: agreed })
      window.location.hash = onboardingHash(result.user.onboarding_step)
    })
  }}>
    <PageTitle title="계정 만들기" description="이메일과 비밀번호로 가입하세요." />
    {error && <Alert severity="error">{error}</Alert>}
    <TextField name="email" label="이메일" type="email" required disabled={pending} autoComplete="email" placeholder="example@email.com" />
    <TextField name="password" label="비밀번호" type="password" required disabled={pending} autoComplete="new-password" placeholder="8~128자 입력" slotProps={{htmlInput:{minLength:8,maxLength:128}}} />
    <TextField name="confirm" label="비밀번호 확인" type="password" required disabled={pending} autoComplete="new-password" placeholder="비밀번호 다시 입력" />
    <TextField name="nickname" label="닉네임" required disabled={pending} autoComplete="nickname" placeholder="이름 또는 닉네임" slotProps={{htmlInput:{maxLength:50}}} />
    <FormControlLabel control={<Checkbox checked={agreed} disabled={pending} onChange={(event) => setAgreed(event.target.checked)} />} label="이용약관에 동의합니다" />
    <Button type="submit" variant="contained" fullWidth disabled={!agreed || pending}>{pending ? '가입 중…' : '가입 완료'}</Button>
    <NavButton to="login" variant="text" fullWidth>로그인</NavButton>
  </Stack>
}
