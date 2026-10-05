import { listMyVehicles } from '../../api/vehicles'
import type { VehicleListItem } from '../../types/vehicles'

// 주차 화면이 쓰는 내 차량: 대표 차량, 없으면 첫 차. 차량이 없으면 null
// 로그인 세션이 없으면 listMyVehicles 가 401 을 던진다 (효재 #16 목)
export async function getDefaultVehicle(): Promise<VehicleListItem | null> {
  const { items } = await listMyVehicles()
  return items.find((item) => item.is_default) ?? items[0] ?? null
}
