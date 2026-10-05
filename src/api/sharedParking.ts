import { getMe, getMockUserId, requireMockSession } from './auth'
import { listMyVehicles } from './vehicles'
import { invalidInput, mockDelay, mockFail, notFound, request, USE_MOCK } from './client'
import type { Page } from '../types/api'
import type { GarageDetail, GarageListItem, GarageListQuery, ShareRequestCreate, ShareRequestCreated, ShareRequestDetail } from '../types/sharedParking'
import { offerOwnerId, sharedGarages, sharedGarageItems, userShareRequests, type StoredShareRequest } from '../mocks/sharedParking'

const today = () => new Intl.DateTimeFormat('sv-SE', {timeZone:'Asia/Seoul'}).format(new Date())
const validDate = (value: string) => { if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false; const time = new Date(`${value}T00:00:00Z`); return Number.isFinite(time.getTime()) && time.toISOString().slice(0,10) === value && value >= today() }
const publicRequest = (item: StoredShareRequest): ShareRequestDetail => ({id:item.id,status:item.status,reject_reason:item.reject_reason,garage:item.garage,slot_id:item.slot_id,slot_label:item.slot_label,request_date:item.request_date,start_hour:item.start_hour,end_hour:item.end_hour,total_price:item.total_price})

export async function listGarages(query: GarageListQuery = {}): Promise<Page<GarageListItem>> {
  if (!USE_MOCK) return request('GET', '/garages', { query })
  // TODO(api): GET /garages?q&filter&cursor&limit
  requireMockSession()
  const filter = query.filter ?? 'all'
  const cursor = Number(query.cursor ?? 0)
  const limit = query.limit ?? 20
  if (!['all','now','reservable','free'].includes(filter) || !Number.isSafeInteger(cursor) || cursor < 0 || !Number.isInteger(limit) || limit < 1 || limit > 50) return invalidInput('목록 조회 조건이 올바르지 않습니다.')
  const q = query.q?.trim().toLocaleLowerCase() ?? ''
  const items = sharedGarageItems.filter((item) => {
    const garage = sharedGarages.find((value) => value.id === item.garage_id)!
    return `${item.building_name} ${garage.address}`.toLocaleLowerCase().includes(q) && (filter === 'all' || (filter === 'now' && item.availability === 'AVAILABLE') || (filter === 'reservable' && item.availability === 'RESERVABLE') || (filter === 'free' && item.hourly_price === 0))
  })
  return mockDelay({items:items.slice(cursor,cursor+limit),next_cursor:cursor+limit < items.length ? String(cursor+limit) : null})
}
export async function getGarage(garageId: number): Promise<GarageDetail> {
  if (!USE_MOCK) return request('GET', `/garages/${garageId}`)
  // TODO(api): GET /garages/{garage_id}
  requireMockSession()
  const garage = sharedGarages.find((item) => item.id === garageId)
  return garage ? mockDelay(garage) : notFound()
}
export async function createShareRequest(body: ShareRequestCreate): Promise<ShareRequestCreated> {
  if (!USE_MOCK) return request('POST', '/share-requests', { body })
  // TODO(api): POST /share-requests (요청 시 잔액 확인만, 수락 시 차감)
  requireMockSession()
  const userId = getMockUserId()!
  const garage = sharedGarages.find((item) => item.slots.some((slot) => slot.offer.id === body.offer_id))
  const slot = garage?.slots.find((item) => item.offer.id === body.offer_id)
  if (!garage || !slot) return notFound()
  const offer = slot.offer
  if (userId === offerOwnerId) return invalidInput('내가 등록한 공유 조건에는 요청할 수 없습니다.')
  if (!validDate(body.request_date)) return invalidInput('오늘 이후의 올바른 날짜를 선택해 주세요.',{field:'request_date'})
  const day = (['SUN','MON','TUE','WED','THU','FRI','SAT'] as const)[new Date(`${body.request_date}T12:00:00+09:00`).getUTCDay()]
  if (!offer.weekdays.includes(day)) return invalidInput('공유하지 않는 요일입니다.',{field:'request_date'})
  if (!Number.isInteger(body.start_hour) || !Number.isInteger(body.end_hour) || body.start_hour < offer.start_hour || body.end_hour > offer.end_hour || body.start_hour >= body.end_hour) return invalidInput('운영 시간 안에서 정시로 선택해 주세요.',{field:'start_hour'})
  if (offer.max_hours !== null && body.end_hour-body.start_hour > offer.max_hours) return invalidInput('최대 이용 시간을 초과했습니다.',{max_hours:offer.max_hours})
  if (body.vehicle_id != null) {
    const vehicles = await listMyVehicles()
    if (!vehicles.items.some((vehicle) => vehicle.id === body.vehicle_id)) return invalidInput('내 차량을 선택해 주세요.',{field:'vehicle_id'})
  }
  const user = await getMe()
  requireMockSession()
  if (getMockUserId() !== userId) return mockFail(401,'UNAUTHORIZED','로그인이 변경되었습니다. 다시 시도해 주세요.')
  const total_price = (body.end_hour-body.start_hour)*offer.hourly_price
  if (user.token_balance < total_price) return mockFail(409,'INSUFFICIENT_TOKENS','토큰이 부족합니다.',{required:total_price,balance:user.token_balance})
  if (userShareRequests.some((item) => item.offer_id === offer.id && item.status === 'APPROVED' && item.request_date === body.request_date && item.start_hour < body.end_hour && body.start_hour < item.end_hour)) return mockFail(409,'GARAGE_TIME_CONFLICT','요청한 시간에 이미 다른 예약이 있습니다.')
  const id = Math.max(700,...userShareRequests.map((item)=>item.id))+1
  userShareRequests.push({id,status:'PENDING',reject_reason:null,garage:{id:garage.id,name:garage.name},slot_id:slot.slot_id,slot_label:slot.label,request_date:body.request_date,start_hour:body.start_hour,end_hour:body.end_hour,total_price,user_id:userId,offer_id:offer.id,vehicle_id:body.vehicle_id ?? null})
  return mockDelay({id,status:'PENDING',total_price})
}
export async function getShareRequest(shareRequestId: number): Promise<ShareRequestDetail> {
  if (!USE_MOCK) return request('GET', `/share-requests/${shareRequestId}`)
  // TODO(api): GET /share-requests/{share_request_id}
  requireMockSession()
  const item = userShareRequests.find((request) => request.id === shareRequestId && request.user_id === getMockUserId())
  return item ? mockDelay(publicRequest(item)) : notFound()
}
export async function listMyShareRequests(): Promise<{items:ShareRequestDetail[]}> {
  if (!USE_MOCK) return request('GET', '/me/share-requests')
  // TODO(api): GET /me/share-requests (명세에 페이지네이션 없음)
  requireMockSession()
  return mockDelay({items:userShareRequests.filter((item)=>item.user_id === getMockUserId()).sort((a,b)=>b.id-a.id).map(publicRequest)})
}
