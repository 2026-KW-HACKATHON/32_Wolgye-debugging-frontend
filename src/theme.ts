import { alpha, createTheme } from '@mui/material/styles'

export const tones = {
  blue: '#246BFD',
  blueDark: '#1654D1',
  mint: '#33B99A',
  mintSoft: '#E4F7F1',
  orange: '#F18A3D',
  orangeSoft: '#FFF0E4',
  red: '#E34D59',
  redSoft: '#FDECEF',
  ink: '#17233C',
  muted: '#667085',
  border: '#E5E9F0',
  canvas: '#F4F6F9',
}

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: tones.blue, dark: tones.blueDark, contrastText: '#FFFFFF' },
    secondary: { main: tones.mint },
    warning: { main: tones.orange },
    error: { main: tones.red },
    background: { default: tones.canvas, paper: '#FFFFFF' },
    text: { primary: tones.ink, secondary: tones.muted },
    divider: tones.border,
  },
  shape: { borderRadius: 16 },
  spacing: 8,
  typography: {
    fontFamily: 'Pretendard, Inter, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif',
    h4: { fontSize: 26, lineHeight: 1.3, fontWeight: 800, letterSpacing: '-0.04em' },
    h5: { fontSize: 22, lineHeight: 1.35, fontWeight: 800, letterSpacing: '-0.035em' },
    h6: { fontSize: 18, lineHeight: 1.4, fontWeight: 750, letterSpacing: '-0.025em' },
    subtitle1: { fontSize: 16, lineHeight: 1.5, fontWeight: 700 },
    subtitle2: { fontSize: 14, lineHeight: 1.5, fontWeight: 700 },
    body1: { fontSize: 15, lineHeight: 1.6 },
    body2: { fontSize: 13, lineHeight: 1.55 },
    caption: { fontSize: 12, lineHeight: 1.45 },
    button: { fontSize: 14, fontWeight: 700, textTransform: 'none' },
  },
  components: {
    MuiCssBaseline: { styleOverrides: { body: { backgroundColor: tones.canvas } } },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { minHeight: 46, borderRadius: 12, paddingInline: 18 },
        sizeSmall: { minHeight: 36, borderRadius: 10, paddingInline: 12 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${tones.border}`,
          borderRadius: 18,
          boxShadow: '0 8px 28px rgba(23, 35, 60, 0.06)',
          backgroundImage: 'none',
        },
      },
    },
    MuiCardContent: { styleOverrides: { root: { padding: 18, '&:last-child': { paddingBottom: 18 } } } },
    MuiChip: {
      styleOverrides: {
        root: { height: 32, borderRadius: 999, fontWeight: 700 },
        filled: { backgroundColor: '#EEF1F5', color: '#475467' },
      },
    },
    MuiTextField: { defaultProps: { fullWidth: true, size: 'medium', variant: 'outlined' } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 13,
          backgroundColor: '#FFFFFF',
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(tones.blue, 0.55) },
        },
        notchedOutline: { borderColor: '#D9DFE8' },
      },
    },
    MuiBottomNavigation: { styleOverrides: { root: { height: 70, backgroundColor: '#FFFFFF' } } },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: { minWidth: 0, color: '#98A2B3', padding: '8px 2px 7px' },
        label: { fontSize: 10, fontWeight: 700, '&.Mui-selected': { fontSize: 10 } },
      },
    },
    MuiPaper: { styleOverrides: { rounded: { borderRadius: 18 } } },
  },
})
