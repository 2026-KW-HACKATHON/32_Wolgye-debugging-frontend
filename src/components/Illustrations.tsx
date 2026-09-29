import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded'
import LocalParkingRoundedIcon from '@mui/icons-material/LocalParkingRounded'
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded'
import { Box, Stack, Typography } from '@mui/material'

export function AreaMap() {
  return <Box sx={{ height: 190, position: 'relative', overflow: 'hidden', borderRadius: 4, background: 'linear-gradient(145deg,#E7F4EE 0%,#F4F8F6 100%)', border: '1px solid #DCE8E2' }}><Box sx={{ position: 'absolute', width: '140%', height: 34, bgcolor: '#fff', top: 78, left: '-20%', transform: 'rotate(-14deg)', border: '1px solid #E5E9E7' }} /><Box sx={{ position: 'absolute', width: 34, height: '140%', bgcolor: '#fff', top: '-20%', left: '52%', transform: 'rotate(22deg)', border: '1px solid #E5E9E7' }} />{[[34,24],[285,24],[62,132],[280,126]].map(([left,top],index)=><Box key={index} sx={{ position:'absolute',left,top,width:58,height:46,borderRadius:2,bgcolor:'#D9E8DD',border:'2px solid #C8DDCE',transform:'rotate(-14deg)' }} />)}{[[92,74],[242,50],[270,130]].map(([left,top],index)=><LocationOnRoundedIcon key={index} color="primary" sx={{ position:'absolute',left,top,fontSize:34,filter:'drop-shadow(0 4px 5px rgba(22,84,209,.2))' }} />)}<Typography variant="caption" sx={{ position:'absolute',left:12,bottom:10,bgcolor:'rgba(255,255,255,.9)',px:1,py:.5,borderRadius:1.5,color:'text.secondary' }}>월계 햇빛빌라 주변</Typography></Box>
}

export function GarageVisual({ large = false }: { large?: boolean }) {
  return <Box sx={{ width: large ? '100%' : 112, minWidth: large ? 0 : 112, height: large ? 190 : 94, borderRadius: large ? 4 : 3, bgcolor: '#EDF5FC', position: 'relative', overflow: 'hidden', display: 'grid', placeItems: 'center' }}><ApartmentRoundedIcon sx={{ fontSize: large ? 104 : 62, color: '#8DAAC8' }} /><Stack direction="row" alignItems="center" gap={0.4} sx={{ position:'absolute',right:large?24:8,bottom:large?20:8,bgcolor:'primary.main',color:'#fff',px:large?1.2:.7,py:large?.7:.35,borderRadius:2 }}><LocalParkingRoundedIcon sx={{fontSize:large?20:14}}/><Typography variant="caption" fontWeight={800}>P</Typography></Stack></Box>
}
