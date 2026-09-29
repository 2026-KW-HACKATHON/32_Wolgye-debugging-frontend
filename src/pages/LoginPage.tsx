import { Button, Stack, TextField, Typography } from '@mui/material'
import { NavButton, PageTitle } from '../components/Ui'

export default function LoginPage() {
  return <Stack component="form" gap={2.25} pt={3}><PageTitle title="다시 만나 반가워요" description="월계 디버깅 계정으로 로그인해 주세요."/><TextField label="이메일" placeholder="이메일을 입력하세요"/><TextField label="비밀번호" type="password" placeholder="비밀번호를 입력하세요"/><Typography variant="caption" color="primary" textAlign="right">비밀번호를 잊으셨나요?</Typography><Button component="a" href="#home" variant="contained" fullWidth>로그인</Button><NavButton to="signup" variant="outlined" fullWidth>계정 만들기</NavButton></Stack>
}
