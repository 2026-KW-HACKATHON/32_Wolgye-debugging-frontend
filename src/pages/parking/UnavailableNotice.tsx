import type { ReactNode } from 'react'
import BlockRoundedIcon from '@mui/icons-material/BlockRounded'
import { Box, Stack, Typography } from '@mui/material'
import { tones } from '../../theme'

// 사용 불가 안내 모달(n25)의 본문. 주차 배치 등록의 Dialog와 사용 불가 안내 페이지에서 함께 쓴다.
export default function UnavailableNotice({ reason, actions }: { reason: string; actions: ReactNode }) {
  return <Stack gap={2}>
    <Stack direction="row" gap={1.25} alignItems="center"><Box sx={{width:40,height:40,flexShrink:0,borderRadius:'50%',display:'grid',placeItems:'center',bgcolor:tones.redSoft,color:'error.main'}}><BlockRoundedIcon/></Box><Box><Typography variant="subtitle1">해당 칸을 사용할 수 없습니다</Typography><Typography variant="body2" color="text.secondary">선택하신 주차 칸이 현재 사용 불가 상태입니다.</Typography></Box></Stack>
    <Box sx={{border:'1px solid',borderColor:'divider',borderRadius:3,p:1.5}}><Typography variant="caption" color="text.secondary">사용 불가 사유</Typography><Typography variant="subtitle2" mt={0.25}>{reason}</Typography></Box>
    <Stack gap={1}>{actions}</Stack>
  </Stack>
}
