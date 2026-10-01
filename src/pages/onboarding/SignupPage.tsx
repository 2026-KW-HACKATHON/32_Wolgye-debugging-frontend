import { Button, Checkbox, FormControlLabel, Stack, TextField } from '@mui/material'
import { NavButton, PageTitle } from '../../components/Ui'

export default function SignupPage() {
  return <Stack component="form" gap={2.25}><PageTitle eyebrow="1 / 3" title="계정 만들기" description="서비스에서 사용할 기본 정보를 입력해 주세요."/><TextField label="이메일" placeholder="example@email.com"/><TextField label="비밀번호" type="password" placeholder="8자 이상 입력" helperText="영문, 숫자를 함께 사용해 주세요."/><TextField label="비밀번호 확인" type="password" placeholder="비밀번호 다시 입력"/><TextField label="닉네임" placeholder="이름 또는 닉네임"/><FormControlLabel control={<Checkbox defaultChecked/>} label="이용약관과 개인정보 처리방침에 동의합니다"/><Button component="a" href="#alley" variant="contained" fullWidth>가입 완료</Button><NavButton to="login" variant="text" fullWidth>로그인으로 이동</NavButton></Stack>
}
