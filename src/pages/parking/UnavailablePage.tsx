import BlockRoundedIcon from '@mui/icons-material/BlockRounded'
import { Box, Stack, Typography } from '@mui/material'
import { NavButton } from '../../components/Ui'
import { tones } from '../../theme'

export default function UnavailablePage() {
  return <Stack alignItems="center" textAlign="center" justifyContent="center" gap={2} minHeight="62vh"><Box sx={{width:80,height:80,borderRadius:'50%',display:'grid',placeItems:'center',bgcolor:tones.redSoft,color:'error.main'}}><BlockRoundedIcon sx={{fontSize:44}}/></Box><div><Typography variant="h5">사용할 수 없는 자리예요</Typography><Typography variant="body2" color="text.secondary" mt={1}>현재 주차 중이거나 관리자에게 제한된 칸입니다.<br/>다른 빈자리를 선택해 주세요.</Typography></div><NavButton to="parking-register">다른 자리 선택하기</NavButton></Stack>
}
