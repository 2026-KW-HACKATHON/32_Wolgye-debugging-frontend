import MenuItem from '@mui/material/MenuItem'
import Select, { type SelectProps } from '@mui/material/Select'
import InputBase from '@mui/material/InputBase'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useId } from 'react'
import chevronIcon from '../../assets/icons/chevron.svg'
import { colors } from '../../theme'
import { inputBoxSx } from './styles'

export type SelectOption = { value: string; label: string }

export type SelectInputProps = Omit<SelectProps<string>, 'input' | 'label'> & {
  label?: string
  options: SelectOption[]
  placeholder?: string
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <img
      src={chevronIcon}
      width={12}
      height={12}
      alt=""
      className={className}
      style={{ right: 12, top: 'calc(50% - 6px)', position: 'absolute', pointerEvents: 'none' }}
    />
  )
}

export default function SelectInput({
  label,
  options,
  placeholder = 'Select…',
  id,
  value = '',
  ...props
}: SelectInputProps) {
  const autoId = useId()
  const selectId = id ?? autoId

  return (
    <Stack spacing={0.75} sx={{ width: '100%' }}>
      {label && (
        <Typography id={`${selectId}-label`} sx={{ fontSize: 14, color: colors.gray900 }}>
          {label}
        </Typography>
      )}
      <Select<string>
        id={selectId}
        labelId={label ? `${selectId}-label` : undefined}
        value={value}
        displayEmpty
        IconComponent={ChevronIcon}
        input={<InputBase sx={{ ...inputBoxSx, height: 38 }} />}
        renderValue={(selected) =>
          selected ? (
            options.find((o) => o.value === selected)?.label
          ) : (
            <span style={{ color: colors.gray400 }}>{placeholder}</span>
          )
        }
        {...props}
      >
        {options.map((o) => (
          <MenuItem key={o.value} value={o.value} sx={{ fontSize: 14 }}>
            {o.label}
          </MenuItem>
        ))}
      </Select>
    </Stack>
  )
}
