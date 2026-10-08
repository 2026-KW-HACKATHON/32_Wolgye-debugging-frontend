import { tones } from '../../theme'

// 기존 두 시연 위치를 한빛·햇살빌라 데이터에 연결한다. 실제 빌라 주소가 아니다.
export const demoVillaPins = [
  { number:1,garageId:3,name:'월계 한빛빌라',lat:37.6242694,lng:127.0595474,color:tones.blue },
  // 네이버 지도 주소 검색(광운로19가길 24)과 제공된 사진으로 위치를 대조했다.
  { number:2,garageId:4,name:'햇살빌라',lat:37.6245753,lng:127.0597335,color:tones.orange },
] as const
