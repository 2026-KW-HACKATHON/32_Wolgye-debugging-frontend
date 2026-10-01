import { colors } from '../../theme'

// 입력 박스 공통 스타일 (text/password/area/select/search)
export const inputBoxSx = {
  minWidth: 140,
  width: '100%',
  bgcolor: colors.white,
  border: `1px solid ${colors.gray300}`,
  borderRadius: '4px',
  px: 1.5,
  fontSize: 14,
  color: colors.gray900,
  '& input::placeholder, & textarea::placeholder': { color: colors.gray400, opacity: 1 },
  '&.Mui-focused': { borderColor: colors.gray900 },
}
