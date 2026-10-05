import { Suspense, useEffect, useState } from 'react'
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import AppShell from './components/AppShell'
import { NavButton } from './components/Ui'
import { getMe } from './api/auth'
import { useApi } from './api/useApi'
import { pageComponents } from './pages'
import { pageFromHash, pages, type PageMeta } from './types/navigation'
import './App.css'

export default function App() {
  const [hash, setHash] = useState(() => window.location.hash)
  const pageId = pageFromHash(hash)

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const current = pages.find((page) => page.id === pageId) ?? pages[0]

  return <PageAccess key={hash} current={current}/>
}

function PageAccess({ current }: { current: PageMeta }) {
  const publicPage = ['welcome', 'signup', 'login', 'role-guide'].includes(current.id)
  const profile = useApi(() => publicPage ? Promise.resolve(null) : getMe(), current.id)
  const Page = pageComponents[current.id]
  const loading = <Box minHeight="40vh" display="grid" sx={{placeItems:'center'}}><CircularProgress size={30} aria-label="화면 불러오는 중"/></Box>
  let content
  if (profile.loading) content = loading
  else if (profile.error?.status === 401) content = <Stack gap={2} py={4}><Typography variant="h5">로그인하고 시작해요</Typography><Typography color="text.secondary">내 차량과 우리 빌라의 주차 현황을 확인할 수 있어요.</Typography><NavButton to="login" fullWidth>로그인</NavButton><NavButton to="signup" variant="outlined" fullWidth>회원가입</NavButton></Stack>
  else if (profile.error) content = <Alert severity="error" action={<Button onClick={profile.reload}>다시 시도</Button>}>{profile.error.message}</Alert>
  else if (profile.data?.onboarding_step === 'JOIN_BUILDING' && current.id !== 'join-building') content = <Stack gap={2}><Typography variant="h5">우리 빌라에 합류해요</Typography><Typography color="text.secondary">관리자에게 받은 초대코드로 소속 빌라를 등록해 주세요.</Typography><NavButton to="join-building" fullWidth>초대코드 입력</NavButton></Stack>
  else if (profile.data?.onboarding_step === 'REGISTER_VEHICLE' && !['vehicle-register', 'vehicles', 'profile', 'join-building'].includes(current.id)) content = <Stack gap={2}><Typography variant="h5">내 차량을 등록해요</Typography><Typography color="text.secondary">차량을 등록하면 주차와 공유 주차를 이용할 수 있어요.</Typography><NavButton to="vehicle-register" fullWidth>차량 등록</NavButton></Stack>
  else content = <Suspense fallback={loading}><Page/></Suspense>
  return <AppShell current={current}>{content}</AppShell>
}
