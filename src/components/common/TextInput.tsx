import Stack from '@mui/material/Stack'
import InputBase, { type InputBaseProps } from '@mui/material/InputBase'
import Typography from '@mui/material/Typography'
import { useId } from 'react'
import { colors } from '../../theme'
import { inputBoxSx } from './styles'

export type TextInputProps = Omit<InputBaseProps, 'type' | 'multiline'> & {
  label?: string
  type?: 'text' | 'password' | 'area'
}

export default function TextInput({ label, type = 'text', id, sx, ...props }: TextInputProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const isArea = type === 'area'

  return (
    <Stack spacing={0.75} sx={{ width: '100%' }}>
      {label && (
        <Typography component="label" htmlFor={inputId} sx={{ fontSize: 14, color: colors.gray900 }}>
          {label}
        </Typography>
      )}
      <InputBase
        id={inputId}
        type={isArea ? undefined : type}
        multiline={isArea}
        minRows={isArea ? 3 : undefined}
        sx={[
          inputBoxSx,
          isArea ? { minHeight: 80, py: 1, alignItems: 'flex-start' } : { height: 38 },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...props}
      />
    </Stack>
  )
}
