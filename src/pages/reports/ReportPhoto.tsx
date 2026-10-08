import { usePhotoUrl } from './usePhotoUrl'
import { Alert, Box, Button, CircularProgress } from '@mui/material'
import { getVehicleReportPhoto } from '../../api/vehicleReports'
import { useApi } from '../../api/useApi'
export default function ReportPhoto({id,thumbnail=false}:{id:number;thumbnail?:boolean}) {
  const state = useApi(()=>getVehicleReportPhoto(id),String(id))
  const url = usePhotoUrl(state.data)
  if (state.error) return thumbnail ? null : <Alert severity="error" action={<Button onClick={state.reload}>재시도</Button>}>사진을 불러오지 못했어요.</Alert>
  if (!url) return <CircularProgress size={thumbnail ? 16 : 24} aria-label="제보 사진 불러오는 중"/>
  return <Box component="img" src={url} alt="제보된 미등록 차량" sx={thumbnail ? {width:56,height:56,objectFit:'cover',borderRadius:2,flexShrink:0} : {display:'block',width:'100%',maxHeight:400,objectFit:'contain',borderRadius:3,bgcolor:'#F1F4F8'}}/>
}
