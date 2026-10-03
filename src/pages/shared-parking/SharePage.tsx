import { useState } from 'react'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { Alert, Box, InputAdornment, Stack, Tab, Tabs, TextField, Typography } from '@mui/material'
import { AreaMap, GarageVisual } from '../../components/Illustrations'
import { PageTitle, StatusChip, Surface } from '../../components/Ui'
import { garages } from '../../data/mockData'
import { toHash } from '../../types/navigation'

type Filter = 'all' | 'now' | 'reservable' | 'free'

export default function SharePage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  // TODO(logic): #16 GET /garages?q&filter에 검색어와 필터를 전달한다.
  const items = garages.filter((garage) => `${garage.name} ${garage.address} ${garage.label}`.includes(query.trim()) && (filter === 'all' || (filter === 'now' && garage.status === 'available') || (filter === 'reservable' && garage.status !== 'disabled') || (filter === 'free' && garage.hourlyPrice === 0)))
  return <Stack gap={2.25}><PageTitle title="공유 주차 탐색" description="내 주변에서 이용할 수 있는 자리를 찾아보세요."/><AreaMap/><TextField label="주소, 빌라명으로 검색" value={query} onChange={(event)=>setQuery(event.target.value)} slotProps={{input:{startAdornment:<InputAdornment position="start"><SearchRoundedIcon/></InputAdornment>}}}/><Tabs value={filter} onChange={(_,value: Filter)=>setFilter(value)} variant="scrollable" scrollButtons={false} aria-label="공유 주차 필터" sx={{minHeight:38,'.MuiTab-root':{minHeight:38,minWidth:'auto',px:1.5,borderRadius:3}}}><Tab value="all" label="전체"/><Tab value="now" label="즉시 가능"/><Tab value="reservable" label="예약 가능"/><Tab value="free" label="무료"/></Tabs><Typography variant="subtitle1">내 주변 차고지 · {items.length}칸</Typography>{items.length === 0 && <Alert severity="info">조건에 맞는 자리가 없어요. 검색어나 필터를 바꿔보세요.</Alert>}{items.map((garage)=><Surface key={garage.offerId}><Box component="a" href={toHash('garage-detail', {id: garage.garageId, offer_id: garage.offerId})} sx={{display:'flex',gap:1.5,color:'inherit'}}><GarageVisual/><Stack minWidth={0} flex={1} justifyContent="center" alignItems="flex-start" gap={0.5}><Typography variant="subtitle2">{garage.name} · {garage.label}</Typography><StatusChip kind={garage.status==='available'?'available':garage.status==='soon'?'soon':garage.status==='disabled'?'disabled':'pending'} label={garage.status==='reserve'?'예약 가능':garage.status==='available'?'이용 가능':undefined}/><Typography variant="body2" fontWeight={800}>{garage.hourlyPrice === 0 ? '무료' : `시간당 ${garage.hourlyPrice.toLocaleString()}토큰`}</Typography><Typography variant="caption" color="text.secondary">{garage.note}</Typography></Stack></Box></Surface>)}</Stack>
}
