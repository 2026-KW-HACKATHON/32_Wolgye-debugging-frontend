import { isApiError } from '../../api/client'
import { useEffect, useState } from 'react'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Stack, Switch, TextField, Typography } from '@mui/material'
import { NavButton, PageTitle, SectionTitle, StatusChip, Surface } from '../../components/Ui'

import { createMyVehicle, deleteMyVehicle, isValidPlate, listMyVehicles, updateMyVehicle } from '../../api/vehicles'
import type { VehicleListItem } from '../../types/vehicles'

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleListItem[]>([])
  const [editing, setEditing] = useState<VehicleListItem | null>(null)
  const [deleting, setDeleting] = useState<VehicleListItem | null>(null)
  const [plate, setPlate] = useState('')
  const [alias, setAlias] = useState('')
  const [isDefault, setIsDefault] = useState(true)
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [needsLogin, setNeedsLogin] = useState(false)
  async function reload() {
    setLoading(true)
    setError('')
    setNeedsLogin(false)
    try { setVehicles((await listMyVehicles()).items) }
    catch (e) { setNeedsLogin(isApiError(e) && e.status === 401); setError(e instanceof Error ? e.message : '차량을 불러오지 못했어요.') }
    finally { setLoading(false) }
  }
  useEffect(() => {
    let active = true
    listMyVehicles().then(result => { if (active) setVehicles(result.items) }).catch(e => { if (active) { setNeedsLogin(isApiError(e) && e.status === 401); setError(e instanceof Error ? e.message : '차량을 불러오지 못했어요.') } }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  async function mutate(action: () => Promise<unknown>) {
    if (pending) return
    setPending(true)
    setError('')
    setNeedsLogin(false)
    try {
      await action()
      setEditing(null)
      setDeleting(null)
      setVehicles((await listMyVehicles()).items)
    } catch (e) { setNeedsLogin(isApiError(e) && e.status === 401); setError(e instanceof Error ? e.message : '요청을 처리하지 못했어요.') }
    finally { setPending(false) }
  }
  return <Stack gap={2.25}>
    <PageTitle title="차량 관리" description="등록 차량과 대표 차량을 관리해요."/>
    <SectionTitle>등록 차량</SectionTitle>
    {loading && <Typography role="status">차량을 불러오는 중이에요.</Typography>}
    {error && !editing && !deleting && <Alert severity="error" action={needsLogin ? <Button component="a" href="#login">로그인</Button> : <Button onClick={() => void reload()}>다시 불러오기</Button>}>{error}</Alert>}
    {!loading && !error && vehicles.length === 0 && <Alert severity="info">등록된 차량이 없어요. 아래에서 첫 차량을 등록해 주세요.</Alert>}
    {vehicles.map(vehicle => <Surface key={vehicle.id}><Stack gap={1}>
      <Stack direction="row" gap={1.25} alignItems="center"><DirectionsCarRoundedIcon color={vehicle.status === 'PARKED' ? 'primary' : 'action'}/><div><Stack direction="row" gap={0.75} alignItems="center"><Typography variant="subtitle2">{vehicle.plate}</Typography>{vehicle.is_default && <StatusChip kind="recommended" label="대표"/>}</Stack><Typography variant="caption" color="text.secondary">{vehicle.alias || vehicle.color || '등록 차량'} · {vehicle.status_text}</Typography></div></Stack>
      <Stack direction="row" justifyContent="flex-end" gap={1}><Button size="small" aria-label={`${vehicle.plate} 수정`} disabled={pending} onClick={() => { setError(''); setEditing(vehicle) }}>수정</Button><Button size="small" color="error" variant="outlined" aria-label={`${vehicle.plate} 삭제`} disabled={pending} onClick={() => { setError(''); setDeleting(vehicle) }}>삭제</Button></Stack>
    </Stack></Surface>)}
    <SectionTitle>차량 추가</SectionTitle>
    <TextField label="차량 번호" placeholder="12가 3456" value={plate} onChange={e => setPlate(e.target.value)} disabled={pending} error={!!plate && !isValidPlate(plate)} helperText={plate && !isValidPlate(plate) ? '차량 번호를 확인해 주세요.' : ' '}/>
    <TextField label="차량 별칭" placeholder="예: 내 차, 가족 차" value={alias} onChange={e => setAlias(e.target.value)} disabled={pending}/>
    <FormControlLabel label="대표 차량으로 설정" labelPlacement="start" sx={{ mx: 0, justifyContent: 'space-between' }} control={<Switch checked={isDefault} onChange={e => setIsDefault(e.target.checked)} disabled={pending}/>}/>
    <Button variant="contained" startIcon={<AddRoundedIcon/>} fullWidth disabled={pending || loading || !isValidPlate(plate)} onClick={() => void mutate(async () => { await createMyVehicle({ plate, alias, is_default: isDefault }); setPlate(''); setAlias('') })}>{pending ? '처리 중…' : '차량 등록'}</Button>
    <NavButton to="profile" variant="text" fullWidth>설정으로 돌아가기</NavButton>
    <Dialog open={!!editing} onClose={() => { if (!pending) setEditing(null) }} fullWidth maxWidth="xs" aria-labelledby="vehicle-edit-title">
      <DialogTitle id="vehicle-edit-title">차량 정보 수정</DialogTitle>
      <DialogContent>{error && <Alert severity="error" action={needsLogin && <Button component="a" href="#login">로그인</Button>}>{error}</Alert>}<Stack gap={2} pt={1} key={editing?.id}><TextField label="차량 번호" value={editing?.plate ?? ''} onChange={e => setEditing(item => item && { ...item, plate: e.target.value })} disabled={pending} error={!!editing && !isValidPlate(editing.plate)}/><TextField label="차량 별칭" value={editing?.alias ?? ''} onChange={e => setEditing(item => item && { ...item, alias: e.target.value })} disabled={pending}/><FormControlLabel label="대표 차량으로 설정" labelPlacement="start" sx={{ mx: 0, justifyContent: 'space-between' }} control={<Switch checked={editing?.is_default ?? false} onChange={e => setEditing(item => item && { ...item, is_default: e.target.checked })} disabled={pending}/>}/></Stack></DialogContent>
      <DialogActions><Button disabled={pending} onClick={() => setEditing(null)}>취소</Button><Button variant="contained" disabled={pending || !editing || !isValidPlate(editing.plate)} onClick={() => editing && void mutate(() => updateMyVehicle(editing.id, { plate: editing.plate, alias: editing.alias ?? '', is_default: editing.is_default }))}>저장</Button></DialogActions>
    </Dialog>
    <Dialog open={!!deleting} onClose={() => { if (!pending) setDeleting(null) }} fullWidth maxWidth="xs" aria-labelledby="vehicle-delete-title">
      <DialogTitle id="vehicle-delete-title">차량 삭제</DialogTitle>
      <DialogContent>{error && <Alert severity="error" action={needsLogin && <Button component="a" href="#login">로그인</Button>}>{error}</Alert>}{deleting?.status === 'PARKED' ? <Alert severity="warning">주차 중인 차량은 삭제할 수 없어요. 출차 처리 후 다시 시도해 주세요.</Alert> : <Typography variant="body2">{deleting?.plate} 차량을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.</Typography>}</DialogContent>
      <DialogActions><Button disabled={pending} onClick={() => setDeleting(null)}>취소</Button><Button color="error" variant="contained" disabled={pending || deleting?.status === 'PARKED'} onClick={() => deleting && void mutate(() => deleteMyVehicle(deleting.id))}>삭제</Button></DialogActions>
    </Dialog>
  </Stack>
}
