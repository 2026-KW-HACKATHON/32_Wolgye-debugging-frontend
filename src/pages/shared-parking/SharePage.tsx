import { useState } from 'react'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { Box, InputAdornment, Stack, Tab, Tabs, TextField, Typography } from '@mui/material'
import { AreaMap, GarageVisual } from '../../components/Illustrations'
import { PageTitle, StatusChip, Surface } from '../../components/Ui'
import { garages } from '../../data/mockData'

export default function SharePage() {
  const [filter, setFilter] = useState(0)
  return <Stack gap={2.25}><PageTitle title="공유 주차 탐색" description="내 주변에서 지금 이용할 수 있는 자리를 찾아보세요."/><AreaMap/><TextField placeholder="주소, 빌라명으로 검색" slotProps={{input:{startAdornment:<InputAdornment position="start"><SearchRoundedIcon/></InputAdornment>}}}/><Tabs value={filter} onChange={(_,value)=>setFilter(value)} variant="scrollable" scrollButtons={false} sx={{minHeight:38,'.MuiTab-root':{minHeight:38,minWidth:'auto',px:1.5,borderRadius:3},'.Mui-selected':{bgcolor:'#E8F0FF'}}}><Tab label="전체"/><Tab label="즉시 가능"/><Tab label="예약 가능"/><Tab label="월정액"/></Tabs><Typography variant="subtitle1">내 주변 차고지</Typography>{garages.map((garage)=><Surface key={garage.name}><Box component="a" href="#garage-detail" sx={{display:'flex',gap:1.5,color:'inherit'}}><GarageVisual/><Stack minWidth={0} flex={1} justifyContent="center"><Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}><Typography variant="subtitle2">{garage.name}</Typography><StatusChip kind={garage.status==='available'?'available':garage.status==='soon'?'soon':garage.status==='disabled'?'disabled':'pending'} label={garage.status==='soon'?'곧 출차':undefined}/></Stack><Typography variant="body2" fontWeight={800} mt={0.75}>{garage.price}</Typography><Typography variant="caption" color="text.secondary">{garage.note}</Typography></Stack></Box></Surface>)}</Stack>
}
