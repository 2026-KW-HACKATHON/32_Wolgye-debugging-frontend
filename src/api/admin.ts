import { USE_MOCK, invalidInput, mockDelay, mockFail, notFound, request } from './client'
import { getMyRole } from './auth'
import { WEEKDAYS, type ErrorDetail } from '../types/api'
import type { AdminDashboard, AdminDashboardQuery, AdminShareRequestItem, AdminShareRequestPage, AdminShareRequestQuery, AdminSlot, AdminSlotUpdate, ShareOffer, ShareOfferCreate, ShareOfferFields, ShareOfferUpdate, ShareRequestDecided, ShareRequestDecision } from '../types/admin'
import { MOCK_NOW, MY_BUILDING_ID, allSlots, findSlot, labelOf, layout, parkedAt, slotStatuses } from '../mocks/parking'
import { ADMIN_USER_ID, congestion, shareOffers, shareRequests } from '../mocks/admin'

// 관리자 API. 함수 이름 = 명세 operationId. 지금은 목데이터를 돌려주고, 서버 연결 시 함수 안쪽만 바꾼다 (docs/api-layer.md)
// 목도 서버처럼 관리자가 아니면 403 NOT_BUILDING_ADMIN (관리자 체험 계정 admin@kw.ac.kr, 2026-10-06)

const notAdmin = () => mockFail(403, 'NOT_BUILDING_ADMIN', '이 빌라의 관리자만 이용할 수 있습니다.')
const isAdmin = () => getMyRole() === 'ADMIN'
const isHour = (value: unknown) => Number.isInteger(value) && (value as number) >= 0 && (value as number) <= 24
const plain = (value: string) => value.replace(/\s/g, '')
const toItem = ({ id, requester, plate, slot_label, request_date, start_hour, end_hour, total_price, status }: AdminShareRequestItem): AdminShareRequestItem => ({ id, requester, plate, slot_label, request_date, start_hour, end_hour, total_price, status })

function toAdminSlot(slotId: number): AdminSlot | null {
  const zone = layout.zones.find((item) => item.slots.some((slot) => slot.id === slotId))
  const slot = findSlot(slotId)
  if (!zone || !slot) return null
  const offers = shareOffers.filter((offer) => offer.slot_id === slotId)
  return { slot_id: slot.id, zone_id: zone.id, number: slot.number, label: slot.label, is_active: slot.is_active, occupied: !!parkedAt(slot.id), share_offer_id: (offers.find((offer) => offer.is_public) ?? offers[0])?.id ?? null }
}

/** 공유 조건 검증. 문제가 없으면 null */
function offerError(fields: ShareOfferFields): [string, ErrorDetail] | null {
  if (!isHour(fields.start_hour) || !isHour(fields.end_hour) || fields.start_hour >= fields.end_hour) return ['시작 시간은 종료 시간보다 빨라야 합니다.', { start_hour: fields.start_hour, end_hour: fields.end_hour }]
  if (fields.weekdays !== undefined && (fields.weekdays.length === 0 || fields.weekdays.some((day) => !WEEKDAYS.includes(day)))) return ['요일을 하나 이상 골라 주세요.', { field: 'weekdays' }]
  if (fields.hourly_price !== undefined && (!Number.isInteger(fields.hourly_price) || fields.hourly_price < 0)) return ['요금은 0 이상이어야 합니다.', { field: 'hourly_price' }]
  if (fields.max_hours != null && (!Number.isInteger(fields.max_hours) || fields.max_hours < 1)) return ['최대 이용 시간이 올바르지 않습니다.', { field: 'max_hours' }]
  return null
}

// ── 대시보드 ──

export async function getAdminDashboard(buildingId: number, query: AdminDashboardQuery = {}): Promise<AdminDashboard> {
  if (!USE_MOCK) return request('GET', `/admin/buildings/${buildingId}/dashboard`, { query })
  // TODO(api): GET /admin/buildings/{building_id}/dashboard?month=YYYY-MM
  if (!isAdmin()) return notAdmin()
  if (buildingId !== MY_BUILDING_ID) return notAdmin()
  const month = query.month ?? MOCK_NOW.slice(0, 7)
  if (!/^\d{4}-\d{2}$/.test(month)) return invalidInput('월 형식이 올바르지 않습니다.', { field: 'month' })
  const statuses = slotStatuses()
  return mockDelay({
    building: { id: layout.building_id, name: layout.name },
    pending_requests: shareRequests.filter((request) => request.status === 'PENDING').sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((request) => ({ id: request.id, requester: { name: request.masked_name, temperature: request.temperature }, slot_label: request.slot_label, request_date: request.request_date, start_hour: request.start_hour, end_hour: request.end_hour, total_price: request.total_price, created_at: request.created_at })),
    realtime: {
      available_count: statuses.filter((slot) => slot.state === 'EMPTY' || slot.state === 'SOON_EXIT').length,
      vehicles: statuses.flatMap((slot) => slot.parking && slot.parking.occupant_type !== 'RESIDENT' ? [{ slot_id: slot.slot_id, slot_label: labelOf(slot.slot_id), plate: slot.parking.plate, occupant_type: slot.parking.occupant_type, can_request_move: slot.parking.occupant_type === 'EXTERNAL' }] : []),
    },
    congestion: { month, total_slots: allSlots().length, days: congestion[month] ?? [] },
    ai_insight: null,
  })
}

// ── 공유 요청 ──

export async function decideShareRequest(shareRequestId: number, body: ShareRequestDecision): Promise<ShareRequestDecided> {
  if (!USE_MOCK) return request('PATCH', `/admin/share-requests/${shareRequestId}`, { body })
  // TODO(api): PATCH /admin/share-requests/{share_request_id} (수락 시 토큰이 요청자 → 관리자로 이동)
  if (!isAdmin()) return notAdmin()
  if (body.status !== 'APPROVED' && body.status !== 'REJECTED') return invalidInput('상태가 올바르지 않습니다.', { field: 'status' })
  const shareRequest = shareRequests.find((item) => item.id === shareRequestId)
  if (!shareRequest) return notFound()
  if (shareRequest.status !== 'PENDING') return mockFail(409, 'ALREADY_DECIDED', '이미 처리된 요청입니다.', { status: shareRequest.status })
  // 목에는 토큰 잔액이 없어 INSUFFICIENT_TOKENS 는 흉내 내지 않는다
  const overlap = body.status === 'APPROVED' && shareRequests.some((other) => other.status === 'APPROVED' && other.slot_label === shareRequest.slot_label && other.request_date === shareRequest.request_date && other.start_hour < shareRequest.end_hour && shareRequest.start_hour < other.end_hour)
  if (overlap) return mockFail(409, 'GARAGE_TIME_CONFLICT', '이미 수락된 다른 예약과 시간이 겹칩니다.')
  shareRequest.status = body.status
  shareRequest.reject_reason = body.status === 'REJECTED' ? body.reject_reason ?? null : null
  shareRequest.responded_at = MOCK_NOW
  return mockDelay({ id: shareRequest.id, status: shareRequest.status, reject_reason: shareRequest.reject_reason, responded_at: MOCK_NOW })
}

export async function listAdminShareRequests(buildingId: number, query: AdminShareRequestQuery = {}): Promise<AdminShareRequestPage> {
  if (!USE_MOCK) return request('GET', `/admin/buildings/${buildingId}/share-requests`, { query })
  // TODO(api): GET /admin/buildings/{building_id}/share-requests?status&q&cursor
  if (!isAdmin()) return notAdmin()
  if (buildingId !== MY_BUILDING_ID) return notAdmin()
  const status = query.status ?? 'all'
  const q = plain(query.q ?? '')
  const counts = { PENDING: 0, APPROVED: 0, REJECTED: 0 }
  shareRequests.forEach((request) => { counts[request.status] += 1 })
  const items = shareRequests.filter((request) => (status === 'all' || request.status === status) && (!q || plain(request.requester.name).includes(q) || plain(request.plate ?? '').includes(q)))
    .sort((a, b) => b.created_at.localeCompare(a.created_at)).map(toItem)
  return mockDelay({ counts, items, next_cursor: null })
}

// ── 주차 구역 설정 ──

export async function listAdminSlots(buildingId: number): Promise<{ items: AdminSlot[] }> {
  if (!USE_MOCK) return request('GET', `/admin/buildings/${buildingId}/slots`)
  // TODO(api): GET /admin/buildings/{building_id}/slots
  if (!isAdmin()) return notAdmin()
  if (buildingId !== MY_BUILDING_ID) return notAdmin()
  return mockDelay({ items: allSlots().flatMap((slot) => toAdminSlot(slot.id) ?? []) })
}

export async function updateAdminSlot(slotId: number, body: AdminSlotUpdate): Promise<AdminSlot> {
  if (!USE_MOCK) return request('PATCH', `/admin/slots/${slotId}`, { body })
  // TODO(api): PATCH /admin/slots/{slot_id} (공유 여부는 여기서 못 바꾼다)
  if (!isAdmin()) return notAdmin()
  const slot = findSlot(slotId)
  if (!slot) return notFound()
  if (typeof body.is_active !== 'boolean') return invalidInput('사용 여부가 올바르지 않습니다.', { field: 'is_active' })
  slot.is_active = body.is_active
  return mockDelay(toAdminSlot(slotId)!)
}

// ── 공유 조건(차고지 등록) ──

export async function listAdminShareOffers(buildingId: number): Promise<{ items: ShareOffer[] }> {
  if (!USE_MOCK) return request('GET', `/admin/buildings/${buildingId}/share-offers`)
  // TODO(api): GET /admin/buildings/{building_id}/share-offers
  if (!isAdmin()) return notAdmin()
  if (buildingId !== MY_BUILDING_ID) return notAdmin()
  return mockDelay({ items: shareOffers })
}

export async function createAdminShareOffer(buildingId: number, body: ShareOfferCreate): Promise<{ items: ShareOffer[] }> {
  if (!USE_MOCK) return request('POST', `/admin/buildings/${buildingId}/share-offers`, { body })
  // TODO(api): POST /admin/buildings/{building_id}/share-offers (칸마다 공유 조건 하나. 하나라도 실패하면 전부 취소)
  if (!isAdmin()) return notAdmin()
  if (buildingId !== MY_BUILDING_ID) return notAdmin()
  if (body.slot_ids.length === 0) return invalidInput('공유할 칸을 하나 이상 골라 주세요.', { field: 'slot_ids' })
  const wrong = body.slot_ids.find((slotId) => !findSlot(slotId))
  if (wrong !== undefined) return invalidInput('이 빌라의 칸이 아닙니다.', { slot_id: wrong })
  const inactive = body.slot_ids.find((slotId) => !findSlot(slotId)?.is_active)
  if (inactive !== undefined) return invalidInput('사용 중지된 칸은 공유할 수 없습니다.', { slot_id: inactive })
  const error = offerError(body)
  if (error) return invalidInput(...error)
  let id = Math.max(400, ...shareOffers.map((offer) => offer.id))
  const created: ShareOffer[] = [...new Set(body.slot_ids)].map((slotId) => ({ id: (id += 1), slot_id: slotId, slot_label: labelOf(slotId), host_id: ADMIN_USER_ID, weekdays: body.weekdays ?? [...WEEKDAYS], start_hour: body.start_hour, end_hour: body.end_hour, hourly_price: body.hourly_price ?? 0, max_hours: body.max_hours ?? null, memo: body.memo ?? null, is_public: body.is_public ?? true }))
  shareOffers.push(...created)
  return mockDelay({ items: created })
}

export async function updateAdminShareOffer(offerId: number, body: ShareOfferUpdate): Promise<ShareOffer> {
  if (!USE_MOCK) return request('PATCH', `/admin/share-offers/${offerId}`, { body })
  // TODO(api): PATCH /admin/share-offers/{offer_id} (is_public:false = 공유 중단)
  if (!isAdmin()) return notAdmin()
  const offer = shareOffers.find((item) => item.id === offerId)
  if (!offer) return notFound()
  const next: ShareOffer = { ...offer, ...Object.fromEntries(Object.entries(body).filter(([, value]) => value !== undefined)) }
  const error = offerError(next)
  if (error) return invalidInput(...error)
  Object.assign(offer, next)
  return mockDelay(offer)
}

export async function deleteAdminShareOffer(offerId: number): Promise<void> {
  if (!USE_MOCK) return request<void>('DELETE', `/admin/share-offers/${offerId}`)
  // TODO(api): DELETE /admin/share-offers/{offer_id} (딸린 공유 요청도 함께 지워진다)
  if (!isAdmin()) return notAdmin()
  const index = shareOffers.findIndex((item) => item.id === offerId)
  if (index < 0) return notFound()
  shareOffers.splice(index, 1)
  for (let at = shareRequests.length - 1; at >= 0; at -= 1) if (shareRequests[at].offer_id === offerId) shareRequests.splice(at, 1)
  return mockDelay(undefined)
}
