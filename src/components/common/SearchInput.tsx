import InputBase, { type InputBaseProps } from '@mui/material/InputBase'
import searchIcon from '../../assets/icons/search.svg'
import { inputBoxSx } from './styles'

export default function SearchInput({ sx, ...props }: InputBaseProps) {
  return (
    <InputBase
      type="search"
      startAdornment={<img src={searchIcon} width={16} height={16} alt="" />}
      sx={[inputBoxSx, { height: 38, gap: 1 }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...props}
    />
  )
}
