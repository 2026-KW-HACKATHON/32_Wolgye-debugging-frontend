import KeyRoundedIcon from '@mui/icons-material/KeyRounded'
import { Alert, Button, InputAdornment, Stack, TextField } from '@mui/material'
import { PageTitle } from '../../components/Ui'

// TODO(logic): POST /buildings/join { invite_code } 성공 후 차량 등록으로 이동. 공백 제거·대소문자 정규화, 404/409 처리.
export default function JoinBuildingPage() {
  return <Stack component="form" gap={2.25} onSubmit={(event) => event.preventDefault()}>
    <PageTitle eyebrow="2단계 중 1단계" title="건물 합류" description="건물 관리자에게 받은 초대코드를 입력해 주세요." />
    <TextField label="초대코드" placeholder="예: HANBIT01" autoComplete="off" slotProps={{input:{startAdornment:<InputAdornment position="start"><KeyRoundedIcon color="primary"/></InputAdornment>}}} />
    <Alert severity="info" sx={{borderRadius:3}}>초대코드는 건물 관리자가 알려줍니다. 건물·구역·칸은 운영팀이 미리 등록해 둡니다. 합류하면 건물 이름과 주소가 자동으로 표시됩니다.</Alert>
    <Button component="a" href="#vehicle-register" variant="contained" fullWidth>차량 등록으로 계속</Button>
  </Stack>
}
