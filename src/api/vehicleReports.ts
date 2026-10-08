import { ApiError, USE_MOCK, request, mockDelay } from './client'
import { creditMockReportReward, getMe, getMockUserId, requireMockSession } from './auth'
import { isValidPlate, normalizePlate } from './vehicles'
import { vehicleReports } from '../mocks/vehicleReports'
import { accounts } from '../mocks/auth'
import { MY_BUILDING_ID, findSlot, parkedAt, parkings, notifications } from '../mocks/parking'
import { vehiclesByUser } from '../mocks/vehicles'
import type { VehicleReportCreate, VehicleReportCreated, VehicleReportDetail } from '../types/vehicleReports'

const fail = (status:number,code:ConstructorParameters<typeof ApiError>[1],message:string):never=>{throw new ApiError(status,code,message)}
const day = (at = new Date())=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(at)
export async function createVehicleReport(buildingId:number,body:VehicleReportCreate):Promise<VehicleReportCreated> {
  if (!USE_MOCK) {
    const form = new FormData()
    form.append('photo',body.photo);form.append('plate',normalizePlate(body.plate));form.append('slot_id',String(body.slot_id))
    return request('POST',`/buildings/${buildingId}/vehicle-reports`,{body:form})
  }
  const bytes = new Uint8Array(await body.photo.slice(0,8).arrayBuffer())
  const imageHeader = (bytes[0] === 0xff && bytes[1] === 0xd8) || (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47)
  if (!imageHeader) return fail(400,'INVALID_INPUT','사진을 다시 찍어 주세요.')
  const user = await getMe()
  await mockDelay(undefined)
  requireMockSession()
  if (getMockUserId() !== user.id) return fail(401,'UNAUTHORIZED','로그인이 변경되었습니다. 다시 시도해 주세요.')
  if (user.building?.building_id !== buildingId || buildingId !== MY_BUILDING_ID) return fail(403,'NOT_BUILDING_MEMBER','우리 빌라에서만 제보할 수 있어요.')
  if (!['image/jpeg','image/png'].includes(body.photo.type) || body.photo.size === 0 || body.photo.size > 10*1024*1024) return fail(400,'INVALID_INPUT','사진을 다시 찍어 주세요.')
  if (!isValidPlate(body.plate)) return fail(400,'INVALID_INPUT','차량 번호를 확인해 주세요. 예: 12가 3456')
  const slot = findSlot(body.slot_id)
  if (!slot) return fail(404,'NOT_FOUND','주차 칸을 찾을 수 없어요.')
  if (!slot.is_active) return fail(409,'SLOT_UNAVAILABLE','사용할 수 없는 칸이에요.')
  if (parkedAt(slot.id)) return fail(409,'SLOT_OCCUPIED','이미 차가 있는 칸이에요.')
  const plate = normalizePlate(body.plate)
  if ([...vehiclesByUser.values()].flat().some((vehicle)=>normalizePlate(vehicle.plate) === plate) || parkings.some((parking)=>parking.occupant_type !== 'UNKNOWN' && normalizePlate(parking.plate) === plate)) return fail(409,'PLATE_EXISTS','앱에 등록된 차량이에요. 이동 요청을 보내 보세요.')
  if (parkings.some((parking)=>parking.state === 'PARKED' && normalizePlate(parking.plate) === plate)) return fail(409,'VEHICLE_ALREADY_PARKED','이미 다른 칸에 등록된 차량이에요.')
  // 일일 3회는 BE #52의 임시 안. 서버 정책 확정 시 목도 맞춘다.
  if ([...vehicleReports.values()].filter((report)=>report.reporter.id === user.id && day(new Date(report.created_at)) === day()).length >= 3) return fail(409,'REPORT_LIMIT_EXCEEDED','오늘은 더 제보할 수 없어요.')
  const id = Math.max(0,...vehicleReports.keys())+1
  const parkingId = Math.max(0,...parkings.map((parking)=>parking.id))+1
  const vehicleId = 100000+id
  const createdAt = new Date().toISOString()
  const formattedPlate = plate.replace(/(\d{2,3}[가-힣])(\d{4})/,'$1 $2')
  vehicleReports.set(id,{id,building_id:buildingId,plate:formattedPlate,slot_label:slot.label,photo_url:`/vehicle-reports/${id}/photo`,reporter:{id:user.id,name:user.name ?? user.nickname},status:'SUBMITTED',created_at:createdAt,photo:body.photo})
  parkings.push({id:parkingId,slot_id:slot.id,vehicle_id:vehicleId,plate:formattedPlate,occupant_type:'UNKNOWN',state:'PARKED',entered_at:createdAt,expected_exit_at:null,exit_source:'NONE',memo:null})
  for (const account of accounts.values()) if (account.user.building?.building_id === buildingId && account.user.building.role === 'ADMIN') {
    notifications.unshift({id:Math.max(0,...notifications.map((notice)=>notice.id))+1,type:'VEHICLE_REPORT',title:'미등록 차량 제보',body:`${slot.label} · ${formattedPlate}`,link:{screen:'VEHICLE_REPORT',id},photo_url:`/vehicle-reports/${id}/photo`,created_at:createdAt,is_read:false,recipient_id:account.user.id})
  }
  const tokenBalance = creditMockReportReward(500)
  return {report_id:id,vehicle_id:vehicleId,parking_id:parkingId,slot_label:slot.label,occupant_type:'UNKNOWN',reward_tokens:500,token_balance:tokenBalance}
}
async function mockReport(id:number) {
  const user = await getMe()
  const report = vehicleReports.get(id)
  if (!report) return fail(404,'NOT_FOUND','제보를 찾을 수 없어요.')
  if (report.reporter.id !== user.id && !(user.building?.role === 'ADMIN' && user.building.building_id === report.building_id)) return fail(403,'NOT_BUILDING_ADMIN','관리인 또는 제보자만 확인할 수 있어요.')
  return report
}
export async function getVehicleReport(id:number):Promise<VehicleReportDetail> {
  if (!USE_MOCK) return request('GET',`/vehicle-reports/${id}`)
  const {photo,...report} = await mockReport(id)
  void photo
  return report
}
export async function getVehicleReportPhoto(id:number):Promise<Blob> {
  if (!USE_MOCK) return request('GET',`/vehicle-reports/${id}/photo`,{responseType:'blob'})
  return (await mockReport(id)).photo
}
