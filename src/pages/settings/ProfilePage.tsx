import { IS_GUEST, exitGuestDemo } from '../../api/guestMode'
import { isApiError } from '../../api/client'
import { useEffect, useState } from 'react'
import { clearSession, getMe, updateMe } from '../../api/auth'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import { clearDrafts } from '../../utils/formDrafts'
import type { UserMe } from '../../types/auth'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded'
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded'
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded'
import { Alert, Avatar, Button, ButtonBase, Drawer, Stack, TextField, Typography } from '@mui/material'
import { SectionTitle, Surface } from '../../components/Ui'

export default function ProfilePage() {
  const [user, setUser] = useState<UserMe | null>(null)
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [needsLogin, setNeedsLogin] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editing, setEditing] = useState(false)
  function openEditor() {
    if (!user || pending) return
    setName(user.name ?? '')
    setUnit(user.building?.unit ?? '')
    setPhone('')
    setError('')
    setNeedsLogin(false)
    setSaved(false)
    setEditing(true)
  }
  async function load() {
    setLoading(true)
    setError('')
    setNeedsLogin(false)
    try { const me = await getMe(); setUser(me); setName(me.name ?? ''); setUnit(me.building?.unit ?? '') }
    catch (e) { setNeedsLogin(isApiError(e) && e.status === 401); setError(e instanceof Error ? e.message : '프로필을 불러오지 못했어요.') }
    finally { setLoading(false) }
  }
  useEffect(() => {
    let active = true
    getMe().then(me => { if (active) { setUser(me); setName(me.name ?? ''); setUnit(me.building?.unit ?? '') } }).catch(e => { if (active) { setNeedsLogin(isApiError(e) && e.status === 401); setError(e instanceof Error ? e.message : '프로필을 불러오지 못했어요.') } }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  const validPhone = !phone || /^01[016789]-?\d{3,4}-?\d{4}$/.test(phone)
  const nameChanged = name.trim() !== (user?.name ?? '')
  const validName = !nameChanged || !!name.trim()
  async function save() {
    if (pending || !user || !validName || !validPhone) return
    setPending(true); setError(''); setNeedsLogin(false); setSaved(false)
    try { const me = await updateMe({ ...(nameChanged ? { name: name.trim() } : {}), ...(user.building && unit.trim() !== (user.building.unit ?? '') ? { unit: unit.trim() } : {}), ...(phone ? { phone } : {}) }); setUser(me); setPhone(''); setSaved(true); setEditing(false) }
    catch (e) { setNeedsLogin(isApiError(e) && e.status === 401); setError(e instanceof Error ? e.message : '프로필을 저장하지 못했어요.') }
    finally { setPending(false) }
  }
  const menuItems = [
    { icon: DirectionsCarRoundedIcon, title: '차량 관리', description: '등록 차량 확인 및 수정', href: '#vehicles' },
    { icon: NotificationsRoundedIcon, title: '알림 센터', description: '막힘·이동 요청과 공유 결과 확인', href: '#notifications' },
    { icon: SecurityRoundedIcon, title: '역할 및 권한 안내', description: '입주민·관리자 역할 확인', href: '#role-guide' },
  ]

  return <Stack gap={2.25}>
    {loading && <Typography role="status">프로필을 불러오는 중이에요.</Typography>}
    {error && !editing && <Alert severity="error" action={needsLogin ? <Button component="a" href="#login">로그인</Button> : !user && <Button onClick={() => void load()}>재시도</Button>}>{error}</Alert>}
    {saved && <Alert severity="success">변경사항을 저장했어요.</Alert>}
    <Surface sx={{background:'linear-gradient(135deg,#F1F6FF,#FFFFFF)', '& .MuiCardContent-root': {p:0, '&:last-child': {pb:0}}}}>
      <ButtonBase onClick={openEditor} disabled={loading || pending || !user} aria-label="계정 정보 수정" aria-haspopup="dialog" sx={{width:'100%',p:'18px',textAlign:'left',borderRadius:'inherit','&.Mui-focusVisible':{outline:'3px solid',outlineColor:'primary.main',outlineOffset:-3}}}>
        <Stack direction="row" gap={1.5} alignItems="center" width="100%">
          <Avatar sx={{width:58,height:58,bgcolor:'primary.main',fontWeight:800}}>{(user?.name || user?.nickname || '?').slice(0, 1)}</Avatar>
          <Stack flex={1} minWidth={0}>
            <Typography variant="h6" sx={{overflowWrap:'anywhere'}}>{user?.name || user?.nickname || '프로필'}</Typography>
            <Typography variant="body2" color="text.secondary">{user?.building ? `${user.building.unit || user.building.name} · ${user.building.role === 'ADMIN' ? '관리자' : '입주민'}` : '소속 건물 없음'}</Typography>
          </Stack>
          <ArrowForwardRoundedIcon color="action" fontSize="small"/>
        </Stack>
      </ButtonBase>
    </Surface>
    <Surface><Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="body2" color="text.secondary">보유 토큰</Typography><Typography variant="h6">{(user?.token_balance ?? 0).toLocaleString()}토큰</Typography></Stack></Surface>
    <SectionTitle>설정</SectionTitle>
    {menuItems.map(({ icon: Icon, title, description, href })=><Surface key={title}><Stack component="a" href={href} direction="row" alignItems="center" gap={1.25} color="inherit"><Icon/><Stack flex={1}><Typography variant="subtitle2">{title}</Typography><Typography variant="caption" color="text.secondary">{description}</Typography></Stack><ArrowForwardRoundedIcon color="action"/></Stack></Surface>)}
    {user && <Button variant="outlined" color="inherit" startIcon={<LogoutRoundedIcon/>} disabled={pending} onClick={()=>{if (IS_GUEST) {exitGuestDemo();return} clearDrafts();clearSession();window.location.hash='#login'}}>{IS_GUEST ? '체험 종료' : '로그아웃'}</Button>}
    <Drawer anchor="bottom" open={editing} onClose={()=>{if (!pending) setEditing(false)}} slotProps={{paper:{role:'dialog','aria-modal':true,'aria-labelledby':'profile-edit-title',sx:{maxWidth:440,mx:'auto',borderRadius:'20px 20px 0 0',maxHeight:'90dvh'}}}}>
      <Stack component="form" gap={2.25} p={3} pb="calc(24px + env(safe-area-inset-bottom))" onSubmit={(event)=>{event.preventDefault();void save()}}>
        <Typography id="profile-edit-title" variant="h6">계정 정보 수정</Typography>
        {error && <Alert severity="error" action={needsLogin ? <Button component="a" href="#login">로그인</Button> : undefined}>{error}</Alert>}
        <TextField autoFocus disabled={pending || !user} label="이름" value={name} onChange={e=>setName(e.target.value)} error={!validName} helperText={!validName ? '이름을 입력해 주세요.' : undefined}/>
        <TextField disabled={pending || !user?.building} label="동·호수" value={unit} onChange={e=>setUnit(e.target.value)}/>
        <TextField disabled={pending || !user} label="연락처" type="tel" value={phone} placeholder={user?.phone ?? '010-1234-5678'} onChange={e=>setPhone(e.target.value)} error={!validPhone} helperText={!validPhone ? '연락처 형식을 확인해 주세요.' : '변경할 때만 새 연락처를 입력해 주세요.'}/>
        <Button type="submit" variant="contained" fullWidth disabled={pending || !user || !validName || !validPhone}>{pending ? '저장 중…' : '변경사항 저장'}</Button>
        <Button variant="outlined" fullWidth disabled={pending} onClick={()=>setEditing(false)}>취소</Button>
      </Stack>
    </Drawer>
  </Stack>
}
