import { useRef, useState } from 'react'
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded'
import { Alert, Button, Stack } from '@mui/material'
import { getMe } from '../../api/auth'
import { prepareReportPhoto } from './photoProcessing'
import { setReportDraft } from './reportDraft'
import { toHash } from '../../types/navigation'

export default function PhotoCaptureButton({label='제보',onPhoto,disabled=false,onProcessingChange}:{label?:string;onPhoto?:()=>void;disabled?:boolean;onProcessingChange?:(busy:boolean)=>void}) {
  const input = useRef<HTMLInputElement>(null)
  const [busy,setBusy] = useState(false)
  const [error,setError] = useState('')
  return <Stack gap={1}>
    <input ref={input} type="file" accept="image/*" capture="environment" aria-label="차량 사진 촬영 또는 선택" hidden disabled={disabled || busy} onChange={async(event)=> {
      const file = event.currentTarget.files?.[0]
      event.currentTarget.value = ''
      if (!file) return
      setBusy(true);onProcessingChange?.(true);setError('')
      try {
        const user = await getMe()
        const photo = await prepareReportPhoto(file)
        const current = await getMe()
        if (!user.building || current.id !== user.id) throw new Error('로그인과 소속 빌라를 확인해 주세요.')
        setReportDraft(photo,user.id)
        if (onPhoto) onPhoto()
        else window.location.hash = toHash('report-new')
      } catch(error) { setError(error instanceof Error ? error.message : '사진을 다시 찍어 주세요.') }
      finally { setBusy(false);onProcessingChange?.(false) }
    }}/>
    <Button variant="outlined" size="small" disabled={disabled || busy} startIcon={<PhotoCameraRoundedIcon/>} onClick={()=>input.current?.click()}>{busy ? '사진 준비 중…' : label}</Button>
    {error && <Alert severity="error" onClose={()=>setError('')}>{error}</Alert>}
  </Stack>
}
