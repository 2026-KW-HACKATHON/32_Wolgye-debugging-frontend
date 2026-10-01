import Box, { type BoxProps } from '@mui/material/Box'
import { colors } from '../../theme'

export type ImageBoxProps = BoxProps & {
  shape?: 'square' | 'round'
  src?: string
  alt?: string
  size?: number
}

// src가 없으면 와이어프레임 플레이스홀더를 그림
export default function ImageBox({ shape = 'square', src, alt = '', size = 64, sx, ...props }: ImageBoxProps) {
  const isRound = shape === 'round'

  return (
    <Box
      sx={[
        {
          width: size,
          height: size,
          minWidth: 48,
          minHeight: 48,
          flexShrink: 0,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
        },
        isRound
          ? { borderRadius: '999px', bgcolor: colors.gray300, color: colors.white }
          : {
              borderRadius: '6px',
              bgcolor: colors.gray50,
              border: `1px dashed ${colors.gray300}`,
              color: colors.gray400,
            },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : isRound ? (
        'Aa'
      ) : (
        'Image'
      )}
    </Box>
  )
}
