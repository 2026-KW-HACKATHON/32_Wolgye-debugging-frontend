import MuiButton, { type ButtonProps as MuiButtonProps } from '@mui/material/Button'
import type { SxProps, Theme } from '@mui/material/styles'
import { colors } from '../../theme'

export type ButtonVariant =
  | 'default'
  | 'default-active'
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'chip'
  | 'chip-active'

export type ButtonProps = Omit<MuiButtonProps, 'variant' | 'color'> & {
  variant?: ButtonVariant
}

const filled = {
  minWidth: 60,
  px: 2,
  py: 1,
  borderRadius: '6px',
  fontWeight: 500,
}

const chip = {
  minWidth: 40,
  px: 1.5,
  py: 0.75,
  borderRadius: '999px',
  fontWeight: 500,
}

const variantStyles: Record<ButtonVariant, SxProps<Theme>> = {
  // 텍스트 링크형 버튼
  default: {
    minWidth: 0,
    p: 0,
    color: colors.gray500,
    fontWeight: 400,
    textDecoration: 'underline',
    '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
  },
  'default-active': {
    minWidth: 0,
    p: 0,
    color: colors.gray900,
    fontWeight: 700,
    '&:hover': { bgcolor: 'transparent' },
  },
  primary: {
    ...filled,
    bgcolor: colors.gray900,
    color: colors.white,
    '&:hover': { bgcolor: '#111827' },
  },
  secondary: {
    ...filled,
    bgcolor: colors.white,
    color: colors.gray900,
    border: `1px solid ${colors.gray900}`,
    '&:hover': { bgcolor: colors.gray50 },
  },
  danger: {
    ...filled,
    bgcolor: colors.dangerBg,
    color: colors.dangerText,
    '&:hover': { bgcolor: '#f87171' },
  },
  chip: {
    ...chip,
    bgcolor: colors.gray100,
    color: colors.gray900,
    border: `1px solid ${colors.gray200}`,
    '&:hover': { bgcolor: colors.gray200 },
  },
  'chip-active': {
    ...chip,
    bgcolor: colors.gray900,
    color: colors.white,
    '&:hover': { bgcolor: '#111827' },
  },
}

export default function Button({ variant = 'default', sx, ...props }: ButtonProps) {
  return (
    <MuiButton
      disableElevation
      sx={[
        { lineHeight: 'normal' },
        variantStyles[variant],
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    />
  )
}
