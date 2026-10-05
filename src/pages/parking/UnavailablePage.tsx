import { Alert, Box, Button } from '@mui/material'
import { NavButton, Surface } from '../../components/Ui'
import { getHome, getSlotRecommendations } from '../../api/parking'
import { useApi } from '../../api/useApi'
import { hashParams } from '../../types/navigation'
import { getDefaultVehicle } from './defaultVehicle'
import UnavailableNotice from './UnavailableNotice'

const GENERAL_REASON = '사용할 수 없는 칸이에요'

// 칸은 #unavailable?slot=1008 (slot_id). 사유는 추천 결과의 unavailable_reason 을 그대로 쓴다
async function loadReason(slotId: number) {
  if (!slotId) return null
  const [home, vehicle] = await Promise.all([getHome(), getDefaultVehicle()])
  if (!vehicle) return null
  // 출차 시간 없이 조회한다 (시간에 따라 달라지는 사유는 배치 등록 화면에서 본다)
  const { slots } = await getSlotRecommendations(home.building.id, { vehicle_id: vehicle.id })
  const slot = slots.find((item) => item.slot_id === slotId)
  return slot?.unavailable_reason ? `${slot.label} · ${slot.unavailable_reason}` : null
}

// 기획상 모달 화면이라 어두운 배경 위에 안내 카드를 띄운 형태로 보여준다.
export default function UnavailablePage() {
  const slotId = Number(hashParams().get('slot')) || 0
  const { data, error, loading, reload } = useApi(() => loadReason(slotId), `unavailable-${slotId}`)
  const reason = loading ? '사유를 불러오는 중이에요' : data ?? GENERAL_REASON
  return <Box sx={{minHeight:'62vh',borderRadius:4,bgcolor:'rgba(23,35,60,.48)',display:'grid',placeItems:'center',px:2,py:4}}>
    <Surface sx={{width:'100%'}}>
      {/* 기본 차량 조회는 로그인 세션이 필요하다 (401) */}
      {error?.status === 401 ? <Alert severity="info" sx={{mb:2}} action={<NavButton to="login" variant="text">로그인</NavButton>}>로그인이 필요해요.</Alert> : error && <Alert severity="error" sx={{mb:2}} action={<Button color="inherit" size="small" onClick={reload}>다시 시도</Button>}>{error.message}</Alert>}
      <UnavailableNotice reason={reason} actions={<><NavButton to="parking-register" fullWidth>다른 칸 선택</NavButton><NavButton to="parking-register" variant="outlined" fullWidth>취소</NavButton></>}/>
    </Surface>
  </Box>
}
