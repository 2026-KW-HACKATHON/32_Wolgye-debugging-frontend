import Box from '@mui/material/Box'
import Checkbox, { type CheckboxProps } from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio, { type RadioProps } from '@mui/material/Radio'
import checkIcon from '../../assets/icons/check.svg'
import radioOnIcon from '../../assets/icons/radio-on.svg'
import toggleIcon from '../../assets/icons/toggle.svg'
import toggleOnIcon from '../../assets/icons/toggle-on.svg'
import { colors } from '../../theme'

const labelSx = {
  m: 0,
  gap: 1,
  '& .MuiFormControlLabel-label': { fontSize: 14, color: colors.gray900 },
}

const controlSx = { p: 0 }

const boxBase = {
  width: 16,
  height: 16,
  boxSizing: 'border-box',
  borderStyle: 'solid',
  borderWidth: '1.5px',
} as const

const checkOff = (
  <Box sx={{ ...boxBase, borderRadius: '3px', bgcolor: colors.white, borderColor: colors.gray300 }} />
)
const checkOn = (
  <Box
    sx={{
      ...boxBase,
      borderRadius: '3px',
      bgcolor: colors.gray900,
      borderColor: colors.gray900,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <img src={checkIcon} width={10} height={10} alt="" />
  </Box>
)
const radioOff = (
  <Box sx={{ ...boxBase, borderRadius: '999px', bgcolor: colors.white, borderColor: colors.gray300 }} />
)
const radioOn = <img src={radioOnIcon} width={16} height={16} alt="" />

type WithLabel = { label?: string }

export function CheckboxInput({ label, ...props }: CheckboxProps & WithLabel) {
  const control = <Checkbox icon={checkOff} checkedIcon={checkOn} sx={controlSx} {...props} />
  return label ? <FormControlLabel control={control} label={label} sx={labelSx} /> : control
}

export function RadioInput({ label, ...props }: RadioProps & WithLabel) {
  const control = <Radio icon={radioOff} checkedIcon={radioOn} sx={controlSx} {...props} />
  return label ? <FormControlLabel control={control} label={label} sx={labelSx} /> : control
}

export function ToggleInput({ label, slotProps, ...props }: CheckboxProps & WithLabel) {
  const control = (
    <Checkbox
      icon={<img src={toggleIcon} width={36} height={20} alt="" />}
      checkedIcon={<img src={toggleOnIcon} width={36} height={20} alt="" />}
      sx={controlSx}
      slotProps={{ ...slotProps, input: { role: 'switch', ...slotProps?.input } }}
      {...props}
    />
  )
  if (!label) return control
  // 라벨 왼쪽, 토글 오른쪽 (justify-between)
  return (
    <FormControlLabel
      control={control}
      label={label}
      labelPlacement="start"
      sx={{ ...labelSx, width: '100%', justifyContent: 'space-between' }}
    />
  )
}
