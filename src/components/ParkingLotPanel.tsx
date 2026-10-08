import { useState, type ComponentProps, type ReactNode } from 'react'
import { Box, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import ParkingLotMap, { LotLegend, type LotView } from './ParkingLotMap'
import { StatusChip } from './Ui'
import { tones } from '../theme'

type Props = Omit<ComponentProps<typeof ParkingLotMap>, 'view'> & {
  view?: LotView
  onViewChange?: (view: LotView) => void
  title?: string
  description?: string
  footer?: ReactNode
  legendMode?: 'status' | 'selection'
}

/** Shared full-size parking display for every page. Page-specific interactions stay in the caller. */
export default function ParkingLotPanel({ view, onViewChange, title, description, footer, legendMode = 'status', ...map }: Props) {
  const [localView, setLocalView] = useState<LotView>('iso')
  const currentView = view ?? localView
  function changeView(next: LotView | null) {
    if (!next) return
    setLocalView(next)
    onViewChange?.(next)
  }
  return <Box sx={{mx:-1.5,borderRadius:'24px',bgcolor:'#F8FAFC',border:'1px solid',borderColor:'divider',px:0.5,pt:2,pb:2,minWidth:0}}>
    <Stack direction="row" alignItems="center" justifyContent={title ? 'space-between' : 'flex-end'} gap={1} sx={{px:1.5,pb:0.5}}>
      {title && <Typography variant="subtitle2" sx={{minWidth:0}}>{title}</Typography>}
      <ToggleButtonGroup exclusive size="small" value={currentView} onChange={(_, next) => changeView(next)} aria-label="배치도 시점" color="primary" sx={{display:'flex',width:'fit-content',flexShrink:0,bgcolor:'#fff'}}>
        <ToggleButton value="iso" sx={{px:1.25,py:0.25}}>입체</ToggleButton>
        <ToggleButton value="top" sx={{px:1.25,py:0.25}}>평면</ToggleButton>
      </ToggleButtonGroup>
    </Stack>
    <ParkingLotMap {...map} view={currentView}/>
    <Box sx={{px:1.5,pt:1.5}}>
      {map.variant === 'admin' ? <Stack direction="row" justifyContent="center" gap={1.5} flexWrap="wrap" useFlexGap>
        {([['입주민 차량','#6E9BFF'],['외부 차량',tones.orange],['미확인 차량',tones.red]] as const).map(([label,color]) => <Stack key={label} direction="row" alignItems="center" gap={0.5}><Box sx={{width:10,height:10,borderRadius:'50%',bgcolor:color}}/><Typography variant="caption" sx={{fontSize:11}} color="text.secondary">{label}</Typography></Stack>)}
        <StatusChip kind="available" label="빈 칸"/>
      </Stack> : legendMode === 'selection' ? <Stack direction="row" justifyContent="center" gap={0.75} flexWrap="wrap"><StatusChip kind="recommended" label="★ 추천"/><StatusChip kind="available" label="빈 칸"/><StatusChip kind="disabled" label="× 사용 불가"/></Stack> : <LotLegend/>}
      {description && <Typography variant="caption" display="block" color="text.secondary" mt={1.5}>{description}</Typography>}
      {footer && <Box mt={1}>{footer}</Box>}
    </Box>
  </Box>
}
