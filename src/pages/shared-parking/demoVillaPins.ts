import { tones } from '../../theme'

// 사용자가 지정한 임시 시연 위치. 백엔드 한빛·햇살빌라의 주소·좌표는 변경하지 않는다.
export const demoVillaPins = [
  { number:1,name:'비타민하우스',lat:37.6242694,lng:127.0595474,color:tones.blue },
  // 네이버 지도 주소 검색(광운로19가길 24)과 제공된 사진으로 위치를 대조했다.
  { number:2,name:'제이하임',lat:37.6245753,lng:127.0597335,color:tones.orange },
] as const
