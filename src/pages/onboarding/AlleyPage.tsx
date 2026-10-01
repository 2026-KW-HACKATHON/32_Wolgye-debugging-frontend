import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded'
import { Alert, Button, InputAdornment, Stack, TextField } from '@mui/material'
import { PageTitle } from '../../components/Ui'

export default function AlleyPage() {
  return <Stack component="form" gap={2.25}><PageTitle eyebrow="2 / 3" title="우리 골목 등록" description="주차 배치도를 함께 볼 이웃 공간을 등록해 주세요."/><TextField label="골목 이름" defaultValue="월계 햇빛빌라"/><TextField label="도로명 주소" placeholder="주소를 검색해 주세요" slotProps={{input:{startAdornment:<InputAdornment position="start"><PlaceRoundedIcon color="primary"/></InputAdornment>}}}/><TextField label="상세 주소" placeholder="동·호수 또는 위치 설명"/><Alert severity="info" sx={{borderRadius:3}}>주소는 같은 골목 입주민에게만 표시됩니다.</Alert><Button component="a" href="#vehicle-register" variant="contained" fullWidth>차량 등록으로 계속</Button></Stack>
}
