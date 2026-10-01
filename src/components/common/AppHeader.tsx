import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'
import { colors } from '../../theme'

export type AppHeaderProps = {
  title: string
  // 넘기면 왼쪽에 뒤로가기(<) 버튼 표시
  onBack?: () => void
}

export default function AppHeader({ title, onBack }: AppHeaderProps) {
  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 3,
        py: 1.5,
        bgcolor: colors.white,
        borderBottom: `1px solid ${colors.divider}`,
      }}
    >
      {onBack && (
        <ButtonBase onClick={onBack} aria-label="뒤로가기" sx={{ width: 20, fontSize: 20, color: colors.gray900 }}>
          {'<'}
        </ButtonBase>
      )}
      <Typography
        component="h1"
        sx={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 500, color: colors.gray900 }}
      >
        {title}
      </Typography>
      {/* 제목 가운데 정렬용 여백 */}
      {onBack && <Box sx={{ width: 20 }} />}
    </Box>
  )
}
