import { useEffect, useState } from 'react'
export function usePhotoUrl(photo:Blob | undefined) {
  const [value,setValue] = useState<{photo:Blob;url:string}>()
  useEffect(()=> {
    if (!photo) return
    const url = URL.createObjectURL(photo)
    // Object URL은 브라우저 자원이라 effect에서 생성/해제한다.
    // oxlint-disable-next-line react/set-state-in-effect
    setValue({photo,url})
    return ()=>URL.revokeObjectURL(url)
  },[photo])
  return value?.photo === photo ? value?.url : undefined
}
