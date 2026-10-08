import { useState } from 'react'
import { Button, Stack } from '@mui/material'
import { isApiError } from '../../api/client'
import { exitParking } from '../../api/parking'

export type ExitNotice = { severity: 'success' | 'info' | 'error'; message: string }

type Props = {
  parkingId: number
  slotLabel: string
  /** 결과 안내. reload 가 true 면 화면 데이터를 다시 불러온다 */
  onResult: (notice: ExitNotice, reload: boolean) => void
  /** 홈의 파란 내 차량 카드 위에 놓일 때 */
  onBlue?: boolean
}

/** '지금 출차!' → 한 번 더 눌러 확인 → POST /parkings/{id}/exit (#46). 홈 내 차량 카드와 차량 상세에서 쓴다 */
export default function ExitParkingButton({ parkingId, slotLabel, onResult, onBlue }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [exiting, setExiting] = useState(false)
  async function exit() {
    if (exiting) return
    setExiting(true)
    try {
      await exitParking(parkingId)
      onResult({ severity: 'success', message: `${slotLabel}에서 출차했어요. 다른 칸에 다시 주차할 수 있어요.` }, true)
    } catch (e) {
      // 404 = 이미 출차된 주차. 화면만 최신으로 맞춘다
      if (isApiError(e) && e.status === 404) onResult({ severity: 'info', message: '이미 출차된 차량이에요. 현황을 새로 불러왔어요.' }, true)
      else onResult({ severity: 'error', message: isApiError(e) ? e.message : '잠시 후 다시 시도해 주세요' }, false)
    } finally { setExiting(false); setConfirming(false) }
  }
  const solid = onBlue ? { bgcolor: '#fff', '&:hover': { bgcolor: '#E8F0FF' } } : undefined
  if (!confirming) return <Button fullWidth variant={onBlue ? 'contained' : 'outlined'} color={onBlue ? 'primary' : 'error'} onClick={()=>setConfirming(true)} sx={onBlue ? { ...solid, color: 'primary.main' } : undefined}>지금 출차!</Button>
  return <Stack direction="row" gap={1}>
    <Button fullWidth variant="contained" color="error" disabled={exiting} onClick={()=>void exit()} sx={onBlue ? { ...solid, color: 'error.main' } : undefined}>{exiting ? '출차 중…' : `${slotLabel}에서 출차`}</Button>
    <Button fullWidth variant="outlined" disabled={exiting} onClick={()=>setConfirming(false)} sx={onBlue ? { color: '#fff', borderColor: 'rgba(255,255,255,.6)' } : undefined}>취소</Button>
  </Stack>
}
