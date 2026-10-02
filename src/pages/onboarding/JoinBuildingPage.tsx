import KeyRoundedIcon from '@mui/icons-material/KeyRounded'
import { Alert, Button, InputAdornment, Stack, TextField } from '@mui/material'
import { PageTitle } from '../../components/Ui'

// 건물 합류: 운영팀이 등록한 빌라에 초대코드로 들어간다 (onboarding_step JOIN_BUILDING)
// TODO(logic): POST /buildings/join { invite_code } — 404 INVALID_INVITE_CODE, 409 ALREADY_IN_BUILDING 처리
export default function JoinBuildingPage() {
  return <Stack component="form" gap={2.25}><PageTitle eyebrow="2 / 3" title="우리 빌라 합류" description="관리자에게 받은 초대코드를 입력해 주세요. 한 빌라에만 합류할 수 있어요."/><TextField label="초대코드" placeholder="예: HANBIT01" slotProps={{input:{startAdornment:<InputAdornment position="start"><KeyRoundedIcon color="primary"/></InputAdornment>}}}/><TextField label="동·호수" placeholder="예: 101동 202호"/><Alert severity="info" sx={{borderRadius:3}}>이웃에게는 호수 없이 "101동 입주민"으로만 보여요.</Alert><Button component="a" href="#vehicle-register" variant="contained" fullWidth>차량 등록으로 계속</Button></Stack>
}
