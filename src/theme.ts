import { createTheme } from '@mui/material/styles'

// Figma 와이어프레임 컬러 토큰
export const colors = {
  gray900: '#1f2937',
  gray500: '#6b7280',
  gray400: '#9ca3af',
  gray300: '#d1d5db',
  gray200: '#e5e7eb',
  gray100: '#f3f4f6',
  gray50: '#f9fafb',
  divider: '#d0d0d0',
  footerBg: '#f5f5f5',
  dangerBg: '#fca5a5',
  dangerText: '#7f1d1d',
  white: '#ffffff',
} as const

export const theme = createTheme({
  palette: {
    primary: { main: colors.gray900, contrastText: colors.white },
    error: { main: colors.dangerBg, contrastText: colors.dangerText },
    text: {
      primary: colors.gray900,
      secondary: colors.gray500,
      disabled: colors.gray400,
    },
    divider: colors.divider,
    background: { default: colors.white, paper: colors.white },
  },
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    fontSize: 14,
    button: { textTransform: 'none', fontSize: 14, lineHeight: 'normal' },
  },
  shape: { borderRadius: 4 },
  components: {
    MuiButtonBase: { defaultProps: { disableRipple: true } },
  },
})
