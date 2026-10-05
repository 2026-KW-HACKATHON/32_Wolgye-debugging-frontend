import { useEffect, useState } from 'react'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { Alert, Box, Button, Chip, CircularProgress, Divider, InputAdornment, Stack, TextField, Typography } from '@mui/material'
import { PageTitle, StatusChip, Surface } from '../../components/Ui'
import { decideShareRequest, listAdminShareRequests } from '../../api/admin'
import { isApiError } from '../../api/client'
import { getHome } from '../../api/parking'
import { useApi } from '../../api/useApi'
import type { ShareRequestStatus } from '../../types/admin'
import { pad } from '../parking/kstTime'
import RejectDialog from './RejectDialog'

type Filter = 'all' | ShareRequestStatus
type Notice = { severity: 'success' | 'warning' | 'error'; message: string }

const filters: [Filter, string][] = [['all', '전체'], ['PENDING', '대기 중'], ['APPROVED', '수락됨'], ['REJECTED', '거절됨']]
const statusKind = { PENDING: 'pending', APPROVED: 'accepted', REJECTED: 'rejected' } as const
// 처리 중 상태가 바뀐 요청. 안내 후 다시 불러온다
const DECIDE_CONFLICTS = ['INSUFFICIENT_TOKENS', 'GARAGE_TIME_CONFLICT', 'ALREADY_DECIDED']

const errorMessage = (e: unknown) => isApiError(e) ? e.message : '잠시 후 다시 시도해 주세요'
// "2026-10-05", 13, 18 → "2026.10.05 13:00 ~ 18:00"
const requestTime = (date: string, start: number, end: number) => `${date.replaceAll('-', '.')} ${pad(start)}:00 ~ ${pad(end)}:00`

function Loading() {
  return <Box display="grid" py={6} sx={{placeItems:'center'}}><CircularProgress size={30}/></Box>
}

function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <Alert severity="error" action={<Button color="inherit" size="small" onClick={onRetry}>다시 시도</Button>}>{message}</Alert>
}

export default function RequestsPage() {
  const { data: home, error, reload } = useApi(() => getHome(), 'home')
  if (error) return <Stack gap={2.25}><PageTitle title="공유 요청 관리" description="대기 요청을 확인하고 이용 가능 여부를 결정해요."/><LoadError message={error.message} onRetry={reload}/></Stack>
  if (!home) return <Loading/>
  return <RequestsView buildingId={home.building.id}/>
}

function RequestsView({ buildingId }: { buildingId: number }) {
  const [filter, setFilter] = useState<Filter>('all')
  const [input, setInput] = useState('')
  const [q, setQ] = useState('')
  const list = useApi(() => listAdminShareRequests(buildingId, { status: filter, ...(q ? { q } : {}) }), `share-requests-${buildingId}-${filter}-${q}`)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [rejectingId, setRejectingId] = useState<number | null>(null)
  const updating = busy || list.loading
  // 입력이 멈추면 검색한다
  useEffect(() => { const timer = setTimeout(() => setQ(input.trim()), 300); return () => clearTimeout(timer) }, [input])

  async function decide(id: number, decision: { status: 'APPROVED' } | { status: 'REJECTED'; reject_reason: string }) {
    if (updating) return
    setBusy(true)
    setNotice(null)
    try {
      await decideShareRequest(id, decision)
      setNotice({ severity: 'success', message: decision.status === 'APPROVED' ? '요청을 수락했어요. 요청자의 토큰이 정산돼요.' : '요청을 거절했어요.' })
      setRejectingId(null)
      list.reload()
    } catch (e) {
      if (isApiError(e) && DECIDE_CONFLICTS.includes(e.code)) {
        setNotice({ severity: 'warning', message: e.message })
        setRejectingId(null)
        list.reload()
      } else setNotice({ severity: 'error', message: errorMessage(e) })
    } finally {
      setBusy(false)
    }
  }

  const counts = list.data?.counts
  return <Stack gap={2.25}>
    <PageTitle title="공유 요청 관리" description="대기 요청을 확인하고 이용 가능 여부를 결정해요."/>
    <Box sx={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:1}}>{([['PENDING','대기 중'],['APPROVED','수락됨'],['REJECTED','거절됨']] as const).map(([status,label],index)=><Surface key={status} sx={{boxShadow:'none',bgcolor:index===0?'#FFF9E8':'#fff'}}><Typography variant="caption" color="text.secondary">{label}</Typography><Typography variant="h6" mt={0.25}>{counts ? `${counts[status]}건` : '-'}</Typography></Surface>)}</Box>
    <TextField placeholder="요청자 또는 차량번호 검색" value={input} onChange={(event) => setInput(event.target.value)} slotProps={{input:{startAdornment:<InputAdornment position="start"><SearchRoundedIcon/></InputAdornment>}}}/>
    <Stack direction="row" gap={0.75} flexWrap="wrap">{filters.map(([value,label])=><Chip key={value} label={label} clickable color={filter===value?'primary':'default'} variant={filter===value?'filled':'outlined'} onClick={() => setFilter(value)}/>)}</Stack>
    {notice && <Alert severity={notice.severity} onClose={() => setNotice(null)}>{notice.message}</Alert>}
    {list.error ? <LoadError message={list.error.message} onRetry={list.reload}/> : !list.data ? <Loading/> : list.data.items.length ? list.data.items.map((request)=><Surface key={request.id}><Stack gap={1.25}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}><Box minWidth={0}><Typography variant="subtitle2">{request.requester.name}</Typography><Typography variant="caption" color="text.secondary" display="block">{[request.plate, request.requester.unit].filter(Boolean).join(' · ')}</Typography><Typography variant="caption" color="text.secondary" display="block">요청 칸: {request.slot_label} · {requestTime(request.request_date, request.start_hour, request.end_hour)}</Typography></Box><StatusChip kind={statusKind[request.status]}/></Stack>
      {request.status==='PENDING' && <><Divider/><Stack direction="row" gap={1}><Button size="small" variant="outlined" color="error" fullWidth disabled={updating} onClick={() => setRejectingId(request.id)}>거절</Button><Button size="small" variant="contained" fullWidth disabled={updating} onClick={() => decide(request.id, { status: 'APPROVED' })}>수락</Button></Stack></>}
    </Stack></Surface>) : <Typography variant="caption" color="text.secondary">{q || filter !== 'all' ? '조건에 맞는 요청이 없어요.' : '받은 공유 요청이 없어요.'}</Typography>}
    <RejectDialog key={rejectingId ?? 'none'} open={rejectingId !== null} busy={updating} onClose={() => setRejectingId(null)} onReject={(reason) => rejectingId !== null && decide(rejectingId, { status: 'REJECTED', reject_reason: reason })}/>
  </Stack>
}
