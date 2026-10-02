import type { ReactNode } from 'react'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import LocalParkingRoundedIcon from '@mui/icons-material/LocalParkingRounded'
import MapRoundedIcon from '@mui/icons-material/MapRounded'
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import { AppBar, BottomNavigation, BottomNavigationAction, Box, FormControl, IconButton, MenuItem, Paper, Select, Stack, Toolbar, Typography } from '@mui/material'
import type { PageId, PageMeta, TabId } from '../types/navigation'
import { pages, toHash } from '../types/navigation'

const tabItems: { label: TabId; id: PageId; icon: ReactNode }[] = [
  { label: '배치도', id: 'home', icon: <MapRoundedIcon /> },
  { label: '알림', id: 'notifications', icon: <NotificationsRoundedIcon /> },
  { label: '공유 주차', id: 'share', icon: <LocalParkingRoundedIcon /> },
  { label: '관리', id: 'admin', icon: <DashboardRoundedIcon /> },
  { label: '프로필', id: 'profile', icon: <PersonRoundedIcon /> },
]

export default function AppShell({ current, children }: { current: PageMeta; children: ReactNode }) {
  const go = (id: PageId) => { window.location.hash = id }
  const selectedTab = tabItems.findIndex((item) => item.label === current.tab)
  return <Box className="app-shell">
    <Paper component="aside" className="page-index" elevation={0}>
      <Stack direction="row" alignItems="center" gap={1.25} px={1} pb={2}><Box sx={{width:38,height:38,borderRadius:2.5,display:'grid',placeItems:'center',bgcolor:'primary.main',color:'#fff'}}><LocalParkingRoundedIcon/></Box><Box><Typography variant="subtitle2">월계 디버깅</Typography><Typography variant="caption" color="text.secondary">UI 화면 미리보기</Typography></Box></Stack>
      {[...new Set(pages.map((page) => page.group))].map((group) => <Box key={group} mb={1.5}><Typography variant="caption" color="text.secondary" fontWeight={800} px={1.25}>{group}</Typography><Stack mt={0.5}>{pages.filter((page) => page.group === group).map((page) => <Box component="a" key={page.id} href={toHash(page.id)} sx={{px:1.25,py:.8,borderRadius:2,fontSize:13,fontWeight:current.id===page.id?800:500,color:current.id===page.id?'primary.main':'text.primary',bgcolor:current.id===page.id?'#E8F0FF':'transparent','&:hover':{bgcolor:'#F3F6FA'}}}>{page.title}</Box>)}</Stack></Box>)}
    </Paper>
    <Box className="mobile-picker"><Typography variant="subtitle2">월계 디버깅</Typography><FormControl size="small"><Select value={current.id} onChange={(event)=>go(event.target.value as PageId)} aria-label="미리 볼 화면 선택">{pages.map((page)=><MenuItem key={page.id} value={page.id}>{page.title}</MenuItem>)}</Select></FormControl></Box>
    <Paper className="phone" elevation={0}>
      <AppBar position="static" color="inherit" elevation={0} className="app-bar"><Toolbar disableGutters sx={{minHeight:'58px!important',px:1.5}}>{current.backTo?<IconButton component="a" href={toHash(current.backTo)} aria-label="뒤로가기"><ArrowBackRoundedIcon/></IconButton>:<Box sx={{width:48}}/>}<Typography variant="subtitle1" sx={{flex:1,textAlign:'center'}}>{current.title}</Typography><Box sx={{width:48}}/></Toolbar></AppBar>
      <Box component="main" className="page-content">{children}</Box>
      {current.tab && <BottomNavigation value={selectedTab} showLabels onChange={(_,value)=>go(tabItems[value]?.id ?? 'home')} className="bottom-navigation">{tabItems.map((item)=><BottomNavigationAction key={item.label} label={item.label} icon={item.icon}/>)}</BottomNavigation>}
    </Paper>
  </Box>
}
