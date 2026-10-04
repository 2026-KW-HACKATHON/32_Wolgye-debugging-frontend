import { completeVehicleOnboarding, getMockUserId, requireMockSession } from './auth'
import { ApiError, mockDelay } from './client'
import { parkings } from '../mocks/parking'
import { nextVehicleId, vehiclesByUser } from '../mocks/vehicles'
import type { VehicleCreate, VehicleListItem, VehicleUpdate } from '../types/vehicles'

export const normalizePlate = (plate: string) => plate.replace(/\s/g, '')
export const isValidPlate = (plate: string) => /^\d{2,3}[가-힣]\d{4}$/.test(normalizePlate(plate))
const formatPlate = (plate: string) => normalizePlate(plate).replace(/(\d{2,3}[가-힣])(\d{4})/, '$1 $2')
function myVehicles() {
  requireMockSession()
  const id = getMockUserId()
  if (id == null) throw new ApiError(401, 'UNAUTHORIZED', '로그인이 필요합니다.')
  if (!vehiclesByUser.has(id)) vehiclesByUser.set(id, [])
  return vehiclesByUser.get(id)!
}
function withStatus(vehicle: VehicleListItem): VehicleListItem {
  const parked = parkings.some(item => item.vehicle_id === vehicle.id && item.state === 'PARKED')
  return { ...vehicle, status: parked ? 'PARKED' : 'OUT', status_text: parked ? '현재 주차 중' : '외부 출차' }
}
function validate(body: VehicleUpdate, exceptId?: number) {
  if (body.plate !== undefined) {
    if (!isValidPlate(body.plate)) throw new ApiError(400, 'INVALID_INPUT', '차량 번호를 확인해 주세요. 예: 12가 3456')
    const duplicate = [...vehiclesByUser.values()].flat().some(item => item.id !== exceptId && normalizePlate(item.plate) === normalizePlate(body.plate!))
    if (duplicate) throw new ApiError(409, 'PLATE_EXISTS', '이미 등록된 차량 번호입니다.')
  }
}
export async function listMyVehicles(): Promise<{ items: VehicleListItem[] }> {
  // TODO(api): GET /me/vehicles
  return mockDelay({ items: myVehicles().map(withStatus) })
}
export async function createMyVehicle(body: VehicleCreate): Promise<VehicleListItem> {
  // TODO(api): POST /me/vehicles
  const items = myVehicles()
  validate(body)
  if (!body.plate || (body.color !== undefined && !['검정', '흰색', '은색', '회색', '파랑', '빨강', '기타'].includes(body.color))) throw new ApiError(400, 'INVALID_INPUT', '차량 정보를 확인해 주세요.')
  const item: VehicleListItem = { id: nextVehicleId(), plate: formatPlate(body.plate), alias: body.alias?.trim() || null, color: body.color ?? null, is_default: body.is_default ?? false, status: 'OUT', status_text: '외부 출차' }
  if (item.is_default) items.forEach(vehicle => { vehicle.is_default = false })
  items.push(item)
  completeVehicleOnboarding()
  return mockDelay(item)
}
export async function updateMyVehicle(id: number, body: VehicleUpdate): Promise<VehicleListItem> {
  // TODO(api): PATCH /me/vehicles/{vehicle_id}
  const items = myVehicles()
  const item = items.find(vehicle => vehicle.id === id)
  if (!item) throw new ApiError(404, 'NOT_FOUND', '차량을 찾을 수 없습니다.')
  validate(body, id)
  if (body.is_default) items.forEach(vehicle => { vehicle.is_default = false })
  if (body.plate !== undefined) item.plate = formatPlate(body.plate)
  if (body.alias !== undefined) item.alias = body.alias.trim() || null
  if (body.is_default !== undefined) item.is_default = body.is_default
  return mockDelay(withStatus(item))
}
export async function deleteMyVehicle(id: number): Promise<void> {
  // TODO(api): DELETE /me/vehicles/{vehicle_id}
  const items = myVehicles()
  const index = items.findIndex(vehicle => vehicle.id === id)
  if (index < 0) throw new ApiError(404, 'NOT_FOUND', '차량을 찾을 수 없습니다.')
  const parking = parkings.find(item => item.vehicle_id === id && item.state === 'PARKED')
  if (parking) throw new ApiError(409, 'VEHICLE_ALREADY_PARKED', '주차 중인 차량은 삭제할 수 없습니다.', { parking_id: parking.id })
  items.splice(index, 1)
  return mockDelay(undefined)
}
