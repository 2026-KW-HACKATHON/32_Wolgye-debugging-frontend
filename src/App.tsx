import { useState } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  AppFooter,
  AppHeader,
  Button,
  CheckboxInput,
  ImageBox,
  RadioInput,
  SearchInput,
  SelectInput,
  TextInput,
  ToggleInput,
  type ButtonVariant,
  type FooterTab,
} from './components/common'

const buttonVariants: ButtonVariant[] = [
  'default',
  'default-active',
  'primary',
  'secondary',
  'danger',
  'chip',
  'chip-active',
]

// 공통 컴포넌트 확인용 페이지
function App() {
  const [tab, setTab] = useState<FooterTab>('layout')
  const [car, setCar] = useState('')
  const [checked, setChecked] = useState(true)
  const [radio, setRadio] = useState('a')
  const [toggle, setToggle] = useState(true)

  return (
    <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader title="공통 컴포넌트" onBack={() => {}} />
      <Stack spacing={3} sx={{ flex: 1, p: 3 }}>
        <Typography sx={{ fontWeight: 600 }}>Button</Typography>
        <Stack direction="row" useFlexGap spacing={1.5} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
          {buttonVariants.map((v) => (
            <Button key={v} variant={v}>
              Button
            </Button>
          ))}
        </Stack>

        <Typography sx={{ fontWeight: 600 }}>Input</Typography>
        <TextInput label="차량 번호" placeholder="12가 3456" />
        <TextInput label="비밀번호" type="password" />
        <TextInput label="메모" type="area" />
        <SelectInput
          label="차량 선택"
          value={car}
          onChange={(e) => setCar(e.target.value)}
          options={[
            { value: 'a', label: '12가 3456' },
            { value: 'b', label: '34나 5678' },
          ]}
        />
        <Stack direction="row" spacing={3}>
          <CheckboxInput label="체크" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
          <RadioInput label="A" checked={radio === 'a'} onChange={() => setRadio('a')} />
          <RadioInput label="B" checked={radio === 'b'} onChange={() => setRadio('b')} />
        </Stack>
        <ToggleInput label="알림 받기" checked={toggle} onChange={(e) => setToggle(e.target.checked)} />
        <SearchInput placeholder="검색" />

        <Typography sx={{ fontWeight: 600 }}>Image</Typography>
        <Stack direction="row" spacing={3}>
          <ImageBox />
          <ImageBox shape="round" />
        </Stack>
      </Stack>
      <AppFooter value={tab} onChange={setTab} />
    </Box>
  )
}

export default App
