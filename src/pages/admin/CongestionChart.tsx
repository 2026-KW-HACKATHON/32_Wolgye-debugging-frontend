import { Box, Stack, Tooltip, Typography } from '@mui/material'
import type { CongestionDay } from '../../types/admin'

export default function CongestionChart({ days, totalSlots }: { days: CongestionDay[]; totalSlots: number }) {
  const ordered = [...days].sort((a, b) => a.date.localeCompare(b.date))
  const peak = Math.max(0, ...ordered.map(day => day.peak_occupied))
  const busiest = ordered.filter(day => day.peak_occupied === peak)
  const dateLabel = busiest[0] ? `${Number(busiest[0].date.slice(5,7))}/${Number(busiest[0].date.slice(8,10))}` : '—'
  const capacity = Math.max(totalSlots, peak, 1)
  const ticks = [...new Set([capacity, Math.floor(capacity / 2), 0])]
  return <Stack gap={2} mt={2}>
    <Stack direction="row" gap={1}>
      <Box sx={{flex:1,minWidth:0,p:1.5,bgcolor:'#F0F5FF',borderRadius:'12px'}}>
        <Typography variant="caption" color="text.secondary">최대 점유</Typography>
        <Typography variant="h5" color="primary.main" mt={0.5}>{peak}<Typography component="span" variant="body2" color="text.secondary"> / {totalSlots}칸</Typography></Typography>
      </Box>
      <Box sx={{flex:1,minWidth:0,p:1.5,bgcolor:'#F7F8FA',borderRadius:'12px'}}>
        <Typography variant="caption" color="text.secondary">가장 붐빈 날</Typography>
        <Typography variant="h5" mt={0.5}>{peak > 0 ? dateLabel : '—'}{peak > 0 && busiest.length > 1 && <Typography component="span" variant="caption" color="text.secondary"> 외 {busiest.length - 1}일</Typography>}</Typography>
      </Box>
    </Stack>
    <Box sx={{display:'flex',gap:1}}>
      <Box aria-hidden="true" sx={{width:24,flexShrink:0,height:144,position:'relative'}}>
        {ticks.map(tick => <Typography key={tick} variant="caption" sx={{position:'absolute',right:0,top:18 + (1 - tick / capacity) * 112,transform:'translateY(-50%)',fontSize:10,color:'text.secondary'}}>{tick}</Typography>)}
      </Box>
      <Box sx={{flex:1,minWidth:0,overflowX:'auto',pb:0.5}}>
        <Box sx={{position:'relative',minWidth:ordered.length * 24,height:160}}>
          {ticks.map(tick => <Box key={tick} aria-hidden="true" sx={{position:'absolute',left:0,right:0,top:18 + (1 - tick / capacity) * 112,borderTop:'1px solid',borderColor:tick === 0 ? '#D0D5DD' : '#E9EDF4',pointerEvents:'none'}}/>)}
          <Box sx={{display:'flex',height:'100%',position:'relative'}}>
            {ordered.map(({date,peak_occupied:count}) => <Tooltip key={date} title={`${date} · 최대 ${count}칸 / 전체 ${totalSlots}칸`} arrow>
              <Box tabIndex={0} role="img" aria-label={`${date}, 최대 점유 ${count}칸, 전체 ${totalSlots}칸`} sx={{flex:1,minWidth:24,position:'relative',borderRadius:'4px','&:focus-visible':{outline:'2px solid #246BFD',outlineOffset:-2}}}>
                <Box sx={{position:'absolute',bottom:30,left:'50%',transform:'translateX(-50%)',width:'60%',maxWidth:20,height:Math.max(0,count) / capacity * 112,bgcolor:count === peak ? 'primary.main' : '#A9C4FF',borderRadius:'5px 5px 0 0'}}/>
                {count > 0 && <Typography variant="caption" sx={{position:'absolute',bottom:34 + count / capacity * 112,left:'50%',transform:'translateX(-50%)',fontSize:10,fontWeight:750,color:count === peak ? 'primary.main' : 'text.secondary'}}>{count}</Typography>}
                <Typography variant="caption" sx={{position:'absolute',bottom:5,left:'50%',transform:'translateX(-50%)',fontSize:10,color:'text.secondary'}}>{Number(date.slice(8,10))}</Typography>
              </Box>
            </Tooltip>)}
          </Box>
        </Box>
      </Box>
    </Box>
    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
      <Stack direction="row" alignItems="center" gap={0.75}><Box sx={{width:8,height:8,borderRadius:'50%',bgcolor:'primary.main'}}/><Typography variant="caption" color="text.secondary">일별 최대 점유 · 단위: 칸</Typography></Stack>
      <Typography variant="caption" color="text.secondary" sx={{fontSize:10}}>아래 숫자는 날짜</Typography>
    </Stack>
  </Stack>
}
