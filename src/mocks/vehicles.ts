import { registerGuestMap } from '../api/guestMode'
import type { VehicleListItem } from '../types/vehicles'

// 사용자별 목 상태. 새 계정은 빈 목록으로 시작하며 새로고침하면 초기화된다.
export const vehiclesByUser = new Map<number, VehicleListItem[]>([[1, [
  { id: 7, plate: '12가 3456', alias: '내 차량', color: '흰색', is_default: true, status: 'PARKED', status_text: '현재 주차 중' },
  { id: 8, plate: '78나 9012', alias: '가족 차량', color: null, is_default: false, status: 'OUT', status_text: '외부 출차' },
]]])
let nextId = 100
export const nextVehicleId = () => {
  nextId = Math.max(nextId, ...[...vehiclesByUser.values()].flat().map(item => item.id + 1))
  return nextId++
}

registerGuestMap('vehiclesByUser', vehiclesByUser)
