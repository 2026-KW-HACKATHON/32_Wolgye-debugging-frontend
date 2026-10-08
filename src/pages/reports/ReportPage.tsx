import { useRef, useState } from 'react'
import { Alert, Box, Button, Chip, Stack, TextField, Typography } from '@mui/material'
import { getMe } from '../../api/auth'
import { getBuildingLayout, getBuildingStatus } from '../../api/parking'
import { createVehicleReport } from '../../api/vehicleReports'
import { isApiError } from '../../api/client'
import { isValidPlate } from '../../api/vehicles'
import { useApi } from '../../api/useApi'
import { PageTitle, SectionTitle, Surface } from '../../components/Ui'
import ParkingLotMap from '../../components/ParkingLotMap'
import { toLot } from '../../components/parkingLotGeometry'
import { getReportDraft, finishReport } from './reportDraft'
import PhotoCaptureButton from './PhotoCaptureButton'
import { usePhotoUrl } from './usePhotoUrl'
import { toHash } from '../../types/navigation'

export default function ReportPage() {
  const [draft,setDraft] = useState(getReportDraft)
  const [plate,setPlate] = useState('')
  const [picked,setPicked] = useState<string>()
  const [busy,setBusy] = useState(false)
  const [photoBusy,setPhotoBusy] = useState(false)
  const [error,setError] = useState('')
  const [registered,setRegistered] = useState(false)
  const lock = useRef(false)
  const url = usePhotoUrl(draft?.photo)
  const state = useApi(async()=> {
    const me = await getMe()
    if (!me.building) throw new Error('우리 빌라에 먼저 합류해 주세요.')
    const [layout,status] = await Promise.all([getBuildingLayout(me.building.building_id),getBuildingStatus(me.building.building_id)])
    return {me,lot:toLot(layout,status)}
  },'report-lot')
  const slot = state.data?.lot.slots.find((slot)=>slot.id === picked && slot.state === 'empty')
  const hasPhoto = draft && state.data?.me.id === draft.ownerId
  const submit = async()=> {
    if (lock.current || photoBusy || !hasPhoto || !slot || !isValidPlate(plate) || !state.data?.me.building) return
    lock.current=true;setBusy(true);setError('');setRegistered(false)
    try {
      const result = await createVehicleReport(state.data.me.building.building_id,{photo:draft.photo,plate,slot_id:slot.slotId})
      finishReport(result,state.data.me.id)
      window.location.replace(toHash('report-success'))
    } catch(e) {
      const code = isApiError(e) ? e.code : ''
      setRegistered(code === 'PLATE_EXISTS')
      setError(code === 'PLATE_EXISTS' ? '앱에 등록된 차량이에요. 이동 요청을 보내 보세요.' : code === 'SLOT_OCCUPIED' || code === 'SLOT_UNAVAILABLE' ? '이미 차가 있거나 쓸 수 없는 칸이에요. 다른 빈 칸을 골라 주세요.' : code === 'VEHICLE_ALREADY_PARKED' ? '이미 다른 칸에 등록된 차량이에요.' : code === 'REPORT_LIMIT_EXCEEDED' ? '오늘은 더 제보할 수 없어요.' : e instanceof Error ? e.message : '잠시 후 다시 시도해 주세요.')
      if (code === 'SLOT_OCCUPIED' || code === 'SLOT_UNAVAILABLE') {setPicked(undefined);state.reload()}
    } finally {lock.current=false;setBusy(false)}
  }
  return <Stack component="form" gap={2.25} onSubmit={(event)=>{event.preventDefault();void submit()}}>
    <PageTitle eyebrow="우리 빌라 함께 지키기" title="미등록 차량 제보" description="사진과 차량 번호, 주차된 칸을 확인해 주세요."/>
    {state.error && <Alert severity="error" action={<Button onClick={state.reload}>재시도</Button>}>{state.error.message}</Alert>}
    <Surface><Stack gap={1.5}>{hasPhoto && url ? <Box component="img" src={url} alt="제보할 차량 사진" sx={{width:'100%',maxHeight:280,objectFit:'contain',borderRadius:2,bgcolor:'#F1F4F8'}}/> : <Alert severity="info">사진을 다시 찍어 주세요.</Alert>}<PhotoCaptureButton label={hasPhoto ? '다시 찍기' : '차량 사진 찍기'} disabled={busy} onProcessingChange={setPhotoBusy} onPhoto={()=>setDraft(getReportDraft())}/></Stack></Surface>
    <TextField label="차량 번호" placeholder="예: 45다 6789" value={plate} disabled={busy} autoComplete="off" required error={!!plate && !isValidPlate(plate)} helperText={plate && !isValidPlate(plate) ? '숫자 2~3자리 + 한글 + 숫자 4자리로 입력해 주세요.' : '사진에 찍힌 번호판을 입력해 주세요.'} onChange={(event)=>setPlate(event.target.value)}/>
    <SectionTitle action={slot && <Chip label={`${slot.label} 선택`} color="primary" size="small"/>}>주차된 칸</SectionTitle>
    <Surface>{state.data ? <><ParkingLotMap shape={state.data.lot.shape} slots={state.data.lot.slots} selected={picked} onSelect={busy ? undefined : setPicked}/><Typography variant="caption" color="text.secondary">빈 칸만 선택할 수 있어요. 선택한 칸에 제보 차량을 등록해요.</Typography></> : <Typography variant="body2">배치도 불러오는 중…</Typography>}</Surface>
    <Alert severity="info">제보가 완료되면 500토큰을 드려요.</Alert>
    {error && <Alert severity="error">{error}{registered && <Button href="#notifications">이동 요청 확인</Button>}</Alert>}
    <Button type="submit" variant="contained" fullWidth disabled={busy || photoBusy || state.loading || !!state.error || !hasPhoto || !slot || !isValidPlate(plate)}>{busy ? '제보 보내는 중…' : '제보하기'}</Button>
  </Stack>
}
