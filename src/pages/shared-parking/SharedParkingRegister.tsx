import { useState } from 'react'
import { Alert, Button, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { Surface } from '../../components/Ui'
import { errorReason, isApiError } from '../../api/client'
import { createParking } from '../../api/parking'
import { listMyVehicles } from '../../api/vehicles'
import { useApi } from '../../api/useApi'
import type { ShareRequestDetail } from '../../types/sharedParking'
import { hourLabel, kstClock, kstDate, pad } from '../parking/kstTime'

type Notice = { severity: 'success' | 'error'; message: string }

// 공유 종료 시각 = 출차 예정. 24시는 다음 날 00:00
function endAt({ request_date: date, end_hour: end }: ShareRequestDetail) {
  if (end < 24) return `${date}T${pad(end)}:00:00+09:00`
  const next = new Date(Date.parse(`${date}T12:00:00Z`) + 86400000).toISOString().slice(0, 10)
  return `${next}T00:00:00+09:00`
}

/** 승인된 공유의 이용 시간 중에 그 칸에 주차를 등록한다 → 홈 '지금 출차!'로 출차할 수 있다 (#61).
 *  서버는 지금 진행 중인 내 수락된 공유 칸이면 다른 빌라 칸도 POST /parkings 를 허용한다 */
export default function SharedParkingRegister({ request }: { request: ShareRequestDetail }) {
  const vehicles = useApi(() => listMyVehicles(), 'shared-parking-vehicles')
  const [vehicleId, setVehicleId] = useState<number | null>(null)
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)
  const today = kstDate()
  const hour = Number(kstClock().slice(0, 2))
  const before = request.request_date > today || (request.request_date === today && hour < request.start_hour)
  const after = request.request_date < today || (request.request_date === today && hour >= request.end_hour)
  const items = vehicles.data?.items ?? []
  // 공유 요청 응답에 차량이 없어 대표 차량을 기본으로 고른다
  const selected = vehicleId ?? items.find((vehicle) => vehicle.is_default)?.id ?? items[0]?.id ?? null
  const place = `${request.garage.name} ${request.slot_label}`

  async function park() {
    if (selected === null || sending || done) return
    setSending(true); setNotice(null)
    try {
      await createParking({ slot_id: request.slot_id, vehicle_id: selected, expected_exit_at: endAt(request) })
      setDone(true); setNotice({ severity: 'success', message: `${place}에 주차를 등록했어요. 다 쓰면 홈에서 '지금 출차!'를 눌러 주세요.` })
    } catch (e) {
      if (isApiError(e) && e.code === 'VEHICLE_ALREADY_PARKED') setNotice({ severity: 'error', message: '이 차는 이미 다른 칸에 주차 중이에요. 홈에서 먼저 출차한 뒤 다시 눌러 주세요.' })
      else setNotice({ severity: 'error', message: isApiError(e) ? errorReason(e) : '잠시 후 다시 시도해 주세요' })
    } finally { setSending(false) }
  }

  return <Surface><Stack gap={1.25}>
    <Typography variant="subtitle2">주차 등록</Typography>
    <Typography variant="body2" color="text.secondary">{before ? `${request.request_date === today ? '오늘' : request.request_date} ${hourLabel(request.start_hour)}부터 주차할 수 있어요.` : after ? '이용 시간이 끝났어요.' : `${place}에 차를 댔다면 눌러 주세요. 출차 예정은 ${hourLabel(request.end_hour)}이에요.`}</Typography>
    {vehicles.error && <Alert severity="error" action={<Button color="inherit" size="small" onClick={vehicles.reload}>다시 시도</Button>}>{vehicles.error.message}</Alert>}
    {vehicles.data && !items.length && <Alert severity="info" action={<Button color="inherit" size="small" href="#vehicles">차량 등록</Button>}>등록된 차량이 없어요.</Alert>}
    {items.length > 1 && !after && <TextField select size="small" label="주차한 차량" value={selected ?? ''} disabled={sending || done} onChange={(event) => setVehicleId(Number(event.target.value))}>{items.map((vehicle) => <MenuItem key={vehicle.id} value={vehicle.id}>{vehicle.plate}{vehicle.alias ? ` · ${vehicle.alias}` : ''}</MenuItem>)}</TextField>}
    {notice && <Alert severity={notice.severity} action={notice.severity === 'success' || /출차/.test(notice.message) ? <Button color="inherit" size="small" href="#home">홈으로</Button> : undefined}>{notice.message}</Alert>}
    {!after && <Button variant="contained" fullWidth disabled={before || selected === null || sending || done} onClick={() => void park()}>{done ? '주차를 등록했어요' : sending ? '등록 중…' : '여기에 주차했어요'}</Button>}
  </Stack></Surface>
}
