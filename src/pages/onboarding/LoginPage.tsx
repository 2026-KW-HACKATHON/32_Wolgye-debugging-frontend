import { IS_GUEST } from '../../api/guestMode'
import GuestEntryButton from '../../components/GuestEntryButton'
import { useState } from 'react'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded'
import { Alert, Button, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material'
import { ADMIN_DEMO_EMAIL, DEMO_EMAIL, DEMO_PASSWORD, login } from '../../api/auth'
import { USE_MOCK } from '../../api/client'
import { NavButton, PageTitle, Surface } from '../../components/Ui'
import { onboardingHash, useOnboardingForm } from './useOnboardingForm'

export default function LoginPage() {
  const { pending, error, submit } = useOnboardingForm()
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [showPassword,setShowPassword] = useState(false)
  const fillDemo = (value:string) => { setEmail(value);setPassword(DEMO_PASSWORD) }
  return <Stack component="form" gap={2.25} pt={2} onSubmit={(event)=>{
    event.preventDefault()
    void submit(async()=>{ const result=await login({email,password});window.location.hash=onboardingHash(result.user.onboarding_step) })
  }}>
    <PageTitle title="반가워요" description="로그인하고 우리 빌라 주차를 시작해요."/>
    {error && <Alert severity="error">{error}</Alert>}
    <TextField name="email" label="이메일" type="email" required disabled={pending} autoComplete="email" value={email} onChange={(event)=>setEmail(event.target.value)}/>
    <TextField name="password" label="비밀번호" type={showPassword ? 'text' : 'password'} required disabled={pending} autoComplete="current-password" value={password} onChange={(event)=>setPassword(event.target.value)} slotProps={{input:{endAdornment:<InputAdornment position="end"><IconButton aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'} onClick={()=>setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOffRoundedIcon/> : <VisibilityRoundedIcon/>}</IconButton></InputAdornment>}}}/>
    <Button type="submit" variant="contained" fullWidth disabled={pending}>{pending ? '로그인 중…' : '로그인'}</Button>
    <GuestEntryButton/>
    <NavButton to="signup" variant="text" fullWidth>처음이라면 회원가입</NavButton>
    {USE_MOCK && !IS_GUEST && <Surface sx={{bgcolor:'#F1F6FF',boxShadow:'none'}}><Stack gap={1.25}><Typography variant="subtitle2">회원가입 없이 체험해 보세요</Typography><Typography variant="body2" color="text.secondary">계정을 선택하면 로그인 정보가 채워져요.</Typography><Stack direction="row" gap={1}><Button type="button" variant="outlined" fullWidth disabled={pending} onClick={()=>fillDemo(DEMO_EMAIL)}>입주민 체험</Button><Button type="button" variant="outlined" fullWidth disabled={pending} onClick={()=>fillDemo(ADMIN_DEMO_EMAIL)}>관리자 체험</Button></Stack></Stack></Surface>}
  </Stack>
}
