import { Stack } from '@mui/material'
import { InfoRow, NavButton, ResultHero, Surface } from '../../components/Ui'

// 요청 처리 완료(n31). 와이어프레임이 없어 공유 주차 결과 화면과 같은 ResultHero 형식으로 구성했다.
// TODO(logic): 방금 응답한 이동 요청 정보로 아래 하드코딩 값 교체
export default function MoveDonePage() {
  return <Stack gap={2.25}>
    <ResultHero state="success" title="이동 완료를 알렸어요" description="요청한 이웃에게 '옮겼어요' 알림을 보냈어요. 전화번호는 공유되지 않아요."/>
    <Surface><InfoRow label="내 차량" value="12가 3456"/><InfoRow label="요청자" value="301동 입주민"/><InfoRow label="응답 시각" value="오후 2:41"/></Surface>
    <Stack gap={1}><NavButton to="home" fullWidth>배치도로 돌아가기</NavButton><NavButton to="notifications" variant="outlined" fullWidth>알림 센터</NavButton></Stack>
  </Stack>
}
