import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import Box from '@mui/material/Box'
import { colors } from '../../theme'

export type FooterTab = 'layout' | 'notifications' | 'sharing' | 'admin' | 'profile'

const tabs: { value: FooterTab; label: string }[] = [
  { value: 'layout', label: '배치도' },
  { value: 'notifications', label: '알림' },
  { value: 'sharing', label: '공유 주차' },
  { value: 'admin', label: '관리' },
  { value: 'profile', label: '프로필' },
]

export type AppFooterProps = {
  value: FooterTab
  onChange: (tab: FooterTab) => void
}

// 아이콘 자리 플레이스홀더 (와이어프레임)
const iconPlaceholder = <Box sx={{ width: 20, height: 20, borderRadius: '6px', bgcolor: colors.gray300 }} />

export default function AppFooter({ value, onChange }: AppFooterProps) {
  return (
    <BottomNavigation
      component="nav"
      showLabels
      value={value}
      onChange={(_, v: FooterTab) => onChange(v)}
      sx={{
        height: 'auto',
        gap: 2,
        bgcolor: colors.footerBg,
        borderTop: `1px solid ${colors.divider}`,
      }}
    >
      {tabs.map((t) => (
        <BottomNavigationAction
          key={t.value}
          value={t.value}
          label={t.label}
          icon={iconPlaceholder}
          sx={{
            minWidth: 0,
            py: 1,
            px: 0,
            gap: 0.5,
            color: colors.gray500,
            '& .MuiBottomNavigationAction-label': {
              fontSize: 14,
              lineHeight: 'normal',
              textDecoration: 'underline',
            },
            '&.Mui-selected': { color: colors.gray900 },
            '&.Mui-selected .MuiBottomNavigationAction-label': {
              fontSize: 14,
              fontWeight: 700,
              textDecoration: 'none',
            },
          }}
        />
      ))}
    </BottomNavigation>
  )
}
