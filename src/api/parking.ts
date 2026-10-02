import { invalidInput, mockDelay, mockFail, notFound } from './client'
import type { Page, PageQuery } from '../types/api'
import type { BuildingLayout, BuildingStatus, Home, LayoutSlot, MoveRequestBox, MoveRequestCreate, MoveRequestCreated, MoveRequestDetail, MoveRequestDone, MoveRequestListItem, NotificationItem, ParkingCreate, ParkingCreated, ParkingExited, ParkingScheduleUpdate, ParkingScheduleUpdated, RecurringSchedule, SlotRecommendation, SlotRecommendationQuery, SlotRecommendations, VehicleDetail } from '../types/parking'
import { MOCK_NOW, MY_BUILDING_ID, MY_VEHICLE_ID, WEEKDAYS_MON_FRI, allSlots, blocks, findSlot, labelOf, layout, me, minutesSince, moveRequests, myParking, myVehicle, notifications, parkedAt, parkings, recurring, slotStatuses } from '../mocks/parking'
import { shareRequests } from '../mocks/admin'

// 입주민 API. 함수 이름 = 명세 operationId. 지금은 목데이터를 돌려주고, 서버 연결 시 함수 안쪽만 바꾼다 (docs/api-layer.md)

const notMember = () => mockFail(403, 'NOT_BUILDING_MEMBER', '이 빌라의 입주민만 이용할 수 있습니다.')
const UNAVAILABLE_REASON = '관리자가 사용 중지한 칸'
const isTime = (value: string) => /^\d{2}:\d{2}$/.test(value)
const isDateTime = (value: unknown): value is string => typeof value === 'string' && !Number.isNaN(Date.parse(value))
const byNewest = <T extends { created_at: string }>(items: T[]) => [...items].sort((a, b) => b.created_at.localeCompare(a.created_at))

/** 내 차를 이 칸에 두면: 앞 칸 차에 막히는지, 뒤 칸 차를 막는지 (명세 getBuildingStatus 막힘 규칙. 출차 시간 null = 가장 늦게) */
function evaluate(slot: LayoutSlot, myExit: string | null) {
  const exitsLater = (a: string | null, b: string | null) => a === null ? b !== null : b !== null && Date.parse(a) > Date.parse(b)
  const front = slot.front_slot_id === null ? undefined : parkedAt(slot.front_slot_id)
  const blocked = !!front && front.vehicle_id !== MY_VEHICLE_ID && myExit !== null && exitsLater(front.expected_exit_at, myExit)
  const will_block = allSlots().filter((behind) => behind.front_slot_id === slot.id).filter((behind) => { const parking = parkedAt(behind.id); return !!parking && parking.vehicle_id !== MY_VEHICLE_ID && parking.expected_exit_at !== null && exitsLater(myExit, parking.expected_exit_at) }).map((behind) => behind.id)
  return { blocked, will_block }
}

// ── 홈·배치도 ──

export async function getHome(): Promise<Home> {
  // TODO(api): GET /me/home
  const statuses = slotStatuses()
  const count = (state: string) => statuses.filter((slot) => slot.state === state).length
  const mine = myParking()
  const mineStatus = mine && statuses.find((slot) => slot.slot_id === mine.slot_id)
  const blocker = mineStatus?.blocked_by[0]
  const blockerParking = blocker === undefined ? undefined : parkedAt(blocker)
  return mockDelay({
    building: { id: MY_BUILDING_ID, name: layout.name, role: me.role },
    unread_notification_count: notifications.filter((item) => !item.is_read).length,
    summary: { available: count('EMPTY') + count('SOON_EXIT'), soon_exit: count('SOON_EXIT'), blocked: statuses.filter((slot) => slot.parking?.occupant_type === 'RESIDENT' && slot.blocked_by.length > 0).length, empty: count('EMPTY') },
    my_parking: mine ? { parking_id: mine.id, vehicle: { ...myVehicle }, slot_label: labelOf(mine.slot_id), state: mine.state, expected_exit_at: mine.expected_exit_at } : null,
    block_alert: blockerParking ? { blocking_parking_id: blockerParking.id, message: `내 차량이 ${labelOf(blockerParking.slot_id)} 차량에 의해 막혀 있습니다.` } : null,
    admin: me.role === 'ADMIN' ? { pending_share_requests: shareRequests.filter((request) => request.status === 'PENDING').length } : null,
    recent_notifications: byNewest(notifications).slice(0, 2),
  })
}

export async function getBuildingLayout(buildingId: number): Promise<BuildingLayout> {
  // TODO(api): GET /buildings/{building_id}/layout (정적이라 화면에서 캐싱)
  if (buildingId !== MY_BUILDING_ID) return notMember()
  return mockDelay(layout)
}

export async function getBuildingStatus(buildingId: number): Promise<BuildingStatus> {
  // TODO(api): GET /buildings/{building_id}/status
  if (buildingId !== MY_BUILDING_ID) return notMember()
  return mockDelay({ updated_at: MOCK_NOW, slots: slotStatuses() })
}

// ── 주차 배치·출차 ──

export async function getSlotRecommendations(buildingId: number, query: SlotRecommendationQuery): Promise<SlotRecommendations> {
  // TODO(api): GET /buildings/{building_id}/slots/recommendations?vehicle_id&expected_exit_at ('+'는 %2B 로 인코딩)
  if (buildingId !== MY_BUILDING_ID) return notMember()
  if (query.vehicle_id !== MY_VEHICLE_ID) return notFound()
  if (query.expected_exit_at !== undefined && !isDateTime(query.expected_exit_at)) return invalidInput('출차 시간이 올바르지 않습니다.', { field: 'expected_exit_at' })
  const myExit = query.expected_exit_at ?? null
  // 다른 차가 있는 칸은 넣지 않는다 (명세 SlotTag 에 사용 중이 없음). 내 차가 지금 있는 칸은 빈 칸으로 본다
  // TODO(logic): 그 시간에 수락된 공유 요청이 있는 칸('예약된 상태')은 목에서 따지지 않는다
  const candidates = allSlots().filter((slot) => !slot.is_active || !parkedAt(slot.id) || parkedAt(slot.id)?.vehicle_id === MY_VEHICLE_ID)
  const evaluated = candidates.map((slot) => ({ slot, ...evaluate(slot, myExit) }))
  const best = [...evaluated].filter((item) => item.slot.is_active && !item.blocked && item.will_block.length === 0).sort((a, b) => Number(b.slot.front_slot_id !== null) - Number(a.slot.front_slot_id !== null))[0]
  const slots: SlotRecommendation[] = evaluated.map(({ slot, will_block }) => !slot.is_active ? { slot_id: slot.id, tag: 'UNAVAILABLE', label: slot.label, unavailable_reason: UNAVAILABLE_REASON }
    : slot === best?.slot ? { slot_id: slot.id, tag: 'RECOMMENDED', label: slot.label, reason: slot.front_slot_id !== null ? '지금 선 차들보다 늦게 나가서 안쪽이 좋아요' : '여기 두면 막게 되는 이웃 차가 없어요', will_block }
    : { slot_id: slot.id, tag: 'EMPTY', label: slot.label, will_block })
  return mockDelay({ slots })
}

export async function createParking(body: ParkingCreate): Promise<ParkingCreated> {
  // TODO(api): POST /parkings
  const slot = findSlot(body.slot_id)
  if (!slot || body.vehicle_id !== MY_VEHICLE_ID) return notFound()
  const longTerm = body.is_long_term ?? false
  if (!longTerm && !isDateTime(body.expected_exit_at)) return invalidInput('출차 시간을 입력해 주세요.', { field: 'expected_exit_at' })
  if (!slot.is_active) return mockFail(409, 'SLOT_UNAVAILABLE', '해당 칸을 사용할 수 없습니다.', { reason: UNAVAILABLE_REASON })
  if (parkedAt(slot.id)) return mockFail(409, 'SLOT_OCCUPIED', '이미 다른 차량이 주차 중인 칸입니다.')
  const current = myParking()
  if (current) return mockFail(409, 'VEHICLE_ALREADY_PARKED', '이미 주차 중인 차량입니다.', { parking_id: current.id })
  const expected = longTerm ? null : body.expected_exit_at ?? null
  const { blocked, will_block } = evaluate(slot, expected)
  const id = Math.max(...parkings.map((parking) => parking.id)) + 1
  parkings.push({ id, slot_id: slot.id, vehicle_id: MY_VEHICLE_ID, plate: myVehicle.plate, occupant_type: 'RESIDENT', state: 'PARKED', entered_at: MOCK_NOW, expected_exit_at: expected, exit_source: longTerm ? 'NONE' : 'MANUAL', memo: body.memo ?? null })
  if (blocked && slot.front_slot_id !== null) blocks.push([slot.front_slot_id, slot.id])
  will_block.forEach((behind) => blocks.push([slot.id, behind]))
  if (body.repeat_weekdays && expected) recurring.schedule = { days: WEEKDAYS_MON_FRI, time: expected.slice(11, 16), memo: body.memo ?? null }
  return mockDelay({ id, slot_id: slot.id, state: 'PARKED', expected_exit_at: expected, exit_source: longTerm ? 'NONE' : 'MANUAL', blocking: will_block })
}

export async function updateParkingSchedule(parkingId: number, body: ParkingScheduleUpdate): Promise<ParkingScheduleUpdated> {
  // TODO(api): PUT /parkings/{parking_id}/schedule
  const parking = parkings.find((item) => item.id === parkingId && item.state === 'PARKED' && item.vehicle_id === MY_VEHICLE_ID)
  if (!parking) return notFound()
  if (!isDateTime(body.expected_exit_at)) return invalidInput('출차 시간이 올바르지 않습니다.', { field: 'expected_exit_at' })
  // TODO(logic): 시간이 바뀌어도 목에서는 막힘 관계를 다시 계산하지 않는다 (서버가 판정)
  parking.expected_exit_at = body.expected_exit_at
  parking.exit_source = 'MANUAL'
  parking.memo = body.memo ?? null
  return mockDelay({ parking_id: parking.id, expected_exit_at: body.expected_exit_at, exit_source: 'MANUAL', memo: parking.memo })
}

export async function exitParking(parkingId: number): Promise<ParkingExited> {
  // TODO(api): POST /parkings/{parking_id}/exit
  const parking = parkings.find((item) => item.id === parkingId && item.state === 'PARKED' && item.vehicle_id === MY_VEHICLE_ID)
  if (!parking) return notFound()
  parking.state = 'EXITED'
  for (let index = blocks.length - 1; index >= 0; index -= 1) if (blocks[index].includes(parking.slot_id)) blocks.splice(index, 1)
  const on_time = parking.expected_exit_at === null || Date.parse(MOCK_NOW) <= Date.parse(parking.expected_exit_at)
  return mockDelay({ id: parking.id, state: 'EXITED', actual_exit_at: MOCK_NOW, on_time })
}

// ── 차량·반복 일정 ──

export async function getMyVehicle(vehicleId: number): Promise<VehicleDetail> {
  // TODO(api): GET /me/vehicles/{vehicle_id}
  if (vehicleId !== MY_VEHICLE_ID) return notFound()
  const parking = myParking()
  return mockDelay({
    id: myVehicle.id, plate: myVehicle.plate, color: myVehicle.color,
    owner: { name: me.name, unit: me.unit },
    parking: parking ? { parking_id: parking.id, slot_id: parking.slot_id, slot_label: labelOf(parking.slot_id), entered_at: parking.entered_at, state: parking.state } : null,
    schedule: parking ? { expected_exit_at: parking.expected_exit_at, exit_source: parking.exit_source, elapsed_minutes: minutesSince(parking.entered_at) } : null,
  })
}

export async function getRecurringSchedule(vehicleId: number): Promise<RecurringSchedule> {
  // TODO(api): GET /me/vehicles/{vehicle_id}/recurring-schedule
  // TODO(logic): 반복 일정이 없을 때 응답이 명세에 없다. 목은 404 NOT_FOUND 로 둔다
  if (vehicleId !== MY_VEHICLE_ID || !recurring.schedule) return notFound()
  return mockDelay(recurring.schedule)
}

export async function putRecurringSchedule(vehicleId: number, body: RecurringSchedule): Promise<RecurringSchedule> {
  // TODO(api): PUT /me/vehicles/{vehicle_id}/recurring-schedule
  if (vehicleId !== MY_VEHICLE_ID) return notFound()
  if (body.days.length === 0) return invalidInput('요일을 하나 이상 골라 주세요.', { field: 'days' })
  if (!isTime(body.time)) return invalidInput('시각이 올바르지 않습니다.', { field: 'time' })
  recurring.schedule = { days: [...new Set(body.days)], time: body.time, memo: body.memo ?? null }
  return mockDelay(recurring.schedule)
}

export async function deleteRecurringSchedule(vehicleId: number): Promise<void> {
  // TODO(api): DELETE /me/vehicles/{vehicle_id}/recurring-schedule
  if (vehicleId !== MY_VEHICLE_ID) return notFound()
  recurring.schedule = null
  return mockDelay(undefined)
}

// ── 이동 요청 ──

export async function createMoveRequest(body: MoveRequestCreate): Promise<MoveRequestCreated> {
  // TODO(api): POST /move-requests
  const target = parkings.find((item) => item.id === body.target_parking_id && item.state === 'PARKED')
  if (!target) return notFound()
  if (!isDateTime(body.needed_at)) return invalidInput('출차 필요 시각이 올바르지 않습니다.', { field: 'needed_at' })
  if (target.occupant_type === 'UNKNOWN') return invalidInput('앱으로 연락할 수 없는 차량입니다.', { reason: 'UNKNOWN_VEHICLE' })
  const pending = moveRequests.find((request) => request.target_parking_id === target.id && request.status === 'PENDING')
  if (pending) return mockFail(409, 'MOVE_REQUEST_ALREADY_PENDING', '이 차량에 대기 중인 이동 요청이 이미 있습니다.', { move_request_id: pending.id })
  const mine = myParking()
  const id = Math.max(...moveRequests.map((request) => request.id)) + 1
  moveRequests.push({ id, box: 'sent', target_parking_id: target.id, status: 'PENDING', requested_at: MOCK_NOW, requester: { label: me.label }, my_vehicle: { plate: target.plate, slot_label: labelOf(target.slot_id), parked_at: target.entered_at }, blocked_vehicle: { plate: myVehicle.plate, slot_label: mine ? labelOf(mine.slot_id) : '', needed_at: body.needed_at }, reason: body.reason ?? null, responded_at: null })
  return mockDelay({ id, status: 'PENDING' })
}

export async function getMoveRequest(moveRequestId: number): Promise<MoveRequestDetail> {
  // TODO(api): GET /move-requests/{move_request_id}
  const request = moveRequests.find((item) => item.id === moveRequestId)
  if (!request) return notFound()
  const { id, status, requested_at, requester, my_vehicle, blocked_vehicle, reason } = request
  return mockDelay({ id, status, requested_at, requester, my_vehicle, blocked_vehicle, reason })
}

export async function doneMoveRequest(moveRequestId: number): Promise<MoveRequestDone> {
  // TODO(api): POST /move-requests/{move_request_id}/done (요청자에게 알림 없음)
  const request = moveRequests.find((item) => item.id === moveRequestId && item.box === 'received')
  if (!request) return notFound()
  if (request.status !== 'PENDING') return mockFail(409, 'ALREADY_DECIDED', '이미 처리된 요청입니다.', { status: request.status })
  request.status = 'MOVED'
  request.responded_at = MOCK_NOW
  return mockDelay({ id: request.id, status: 'MOVED', responded_at: MOCK_NOW })
}

export async function listMyMoveRequests(query: { box: MoveRequestBox }): Promise<{ items: MoveRequestListItem[] }> {
  // TODO(api): GET /me/move-requests?box=received|sent
  // 보낸 요청의 상대는 칸 이름으로 표시 ("P1 차량")
  const items = moveRequests.filter((request) => request.box === query.box).sort((a, b) => b.requested_at.localeCompare(a.requested_at))
    .map((request) => ({ id: request.id, status: request.status, requested_at: request.requested_at, counterpart_label: request.box === 'received' ? request.requester.label : `${request.my_vehicle.slot_label} 차량`, needed_at: request.blocked_vehicle.needed_at }))
  return mockDelay({ items })
}

// ── 알림 ──

export async function listNotifications(query: PageQuery = {}): Promise<Page<NotificationItem>> {
  // TODO(api): GET /notifications?cursor&limit (목 커서는 시작 위치 숫자)
  const limit = Math.min(Math.max(query.limit ?? 20, 1), 50)
  const start = Number(query.cursor ?? 0) || 0
  const sorted = byNewest(notifications)
  const end = start + limit
  return mockDelay({ items: sorted.slice(start, end), next_cursor: end < sorted.length ? String(end) : null })
}

export async function readNotification(notificationId: number): Promise<void> {
  // TODO(api): POST /notifications/{notification_id}/read
  const item = notifications.find((notification) => notification.id === notificationId)
  if (!item) return notFound()
  item.is_read = true
  return mockDelay(undefined)
}

export async function readAllNotifications(): Promise<void> {
  // TODO(api): POST /notifications/read-all
  notifications.forEach((notification) => { notification.is_read = true })
  return mockDelay(undefined)
}
