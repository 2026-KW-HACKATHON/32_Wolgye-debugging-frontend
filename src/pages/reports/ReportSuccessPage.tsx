import { useEffect, useState } from 'react'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { getMe } from '../../api/auth'
import { useApi } from '../../api/useApi'
import { Surface } from '../../components/Ui'
import { clearReportResult, getReportResult } from './reportDraft'
import './reportSuccess.css'
export default function ReportSuccessPage() {
  const [result] = useState(getReportResult)
  const profile = useApi(()=>getMe(),'report-success-owner')
  const valid = result && profile.data?.id === result.ownerId
  const goHome = ()=>{clearReportResult();window.location.replace('#home')}
  useEffect(()=> {
    if (!valid) return
    const timer = window.setTimeout(()=>{clearReportResult();window.location.replace('#home')},2800)
    return ()=>window.clearTimeout(timer)
  },[valid])
  if (profile.loading) return <CircularProgress aria-label="제보 결과 확인 중"/>
  if (profile.error) return <Alert severity="error" action={<Button onClick={profile.reload}>재시도</Button>}>제보 결과를 확인하지 못했어요.</Alert>
  if (!valid) return <Alert severity="info">완료된 제보가 없어요.<Button href="#home">홈으로</Button></Alert>
  return <Stack gap={2.25} py={4} textAlign="center">
    <Box className="report-celebrate" sx={{position:'relative',alignSelf:'center'}}><CheckCircleRoundedIcon color="success" sx={{fontSize:92}}/>{Array.from({length:8},(_,i)=><Box key={i} className="report-confetti" sx={{'--angle':`${i*45}deg`,position:'absolute',left:'50%',top:'50%',width:6,height:12,bgcolor:i%2 ? '#246BFD' : '#FFB648',borderRadius:1}}/>)}</Box>
    <Typography variant="h4">미션 성공!</Typography><Typography color="text.secondary">{result.value.slot_label}의 차량을 제보했어요.</Typography>
    <Surface><Typography variant="h4" color="primary" fontWeight={800}>+{result.value.reward_tokens.toLocaleString()} 토큰</Typography><Typography variant="body2" mt={1}>보유 {result.value.token_balance.toLocaleString()} 토큰</Typography></Surface>
    <Typography variant="caption" color="text.secondary">잠시 후 홈으로 돌아가요.</Typography><Button variant="contained" onClick={goHome}>홈으로</Button>
  </Stack>
}
