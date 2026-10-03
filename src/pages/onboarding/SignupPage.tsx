import { useState } from 'react'
import { Button, Checkbox, FormControlLabel, Stack, TextField } from '@mui/material'
import { NavButton, PageTitle } from '../../components/Ui'

// TODO(logic): POST /auth/signup { email, password, nickname, agree_terms }, 비밀번호 확인·중복 이메일 검증 및 토큰 저장 후 건물 합류로 이동.
export default function SignupPage() {
  const [agreed, setAgreed] = useState(false)
  return <Stack component="form" gap={2.25} onSubmit={(event) => event.preventDefault()}>
    <PageTitle title="계정 만들기" description="이메일과 비밀번호로 가입하세요." />
    <TextField label="이메일" type="email" autoComplete="email" placeholder="example@email.com" />
    <TextField label="비밀번호" type="password" autoComplete="new-password" placeholder="8~128자 입력" slotProps={{htmlInput:{minLength:8,maxLength:128}}} />
    <TextField label="비밀번호 확인" type="password" autoComplete="new-password" placeholder="비밀번호 다시 입력" />
    <TextField label="닉네임" autoComplete="nickname" placeholder="이름 또는 닉네임" slotProps={{htmlInput:{maxLength:50}}} />
    <FormControlLabel control={<Checkbox checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />} label="이용약관에 동의합니다" />
    <Button component="a" href="#join-building" variant="contained" fullWidth disabled={!agreed}>가입 완료</Button>
    <NavButton to="login" variant="text" fullWidth>로그인</NavButton>
  </Stack>
}
