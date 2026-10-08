export const REPORT_PHOTO_MAX_BYTES = 10*1024*1024
export async function prepareReportPhoto(file:File):Promise<File> {
  if (!file.type.startsWith('image/') && !/\.(heic|heif)$/i.test(file.name)) throw new Error('차량 사진 파일을 선택해 주세요.')
  let bitmap:ImageBitmap
  try { bitmap = await createImageBitmap(file) } catch { throw new Error('사진을 읽을 수 없어요. JPEG 또는 PNG로 다시 찍어 주세요.') }
  try {
    const scale = Math.min(1,1600/Math.max(bitmap.width,bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('사진을 처리하지 못했어요. 다시 시도해 주세요.')
    context.fillStyle='white';context.fillRect(0,0,canvas.width,canvas.height)
    context.drawImage(bitmap,0,0,canvas.width,canvas.height)
    const blob = await new Promise<Blob | null>((resolve)=>canvas.toBlob(resolve,'image/jpeg',0.8))
    if (!blob || blob.size === 0 || blob.size > REPORT_PHOTO_MAX_BYTES) throw new Error('사진은 10MB 이하로 다시 찍어 주세요.')
    return new File([blob],'vehicle-report.jpg',{type:'image/jpeg'})
  } finally { bitmap.close() }
}
