import { Box } from '@mui/material'
import { NavButton, Surface } from '../../components/Ui'
import UnavailableNotice from './UnavailableNotice'

// 기획상 모달 화면이라 어두운 배경 위에 안내 카드를 띄운 형태로 보여준다.
export default function UnavailablePage() {
  // TODO(logic): 사용자가 선택한 칸의 실제 사용 불가 사유(예약됨, 관리자 사용 중지 등)를 받아 표시
  return <Box sx={{minHeight:'62vh',borderRadius:4,bgcolor:'rgba(23,35,60,.48)',display:'grid',placeItems:'center',px:2,py:4}}>
    <Surface sx={{width:'100%'}}><UnavailableNotice reason="예약된 상태" actions={<><NavButton to="parking-register" fullWidth>다른 칸 선택</NavButton><NavButton to="parking-register" variant="outlined" fullWidth>취소</NavButton></>}/></Surface>
  </Box>
}
