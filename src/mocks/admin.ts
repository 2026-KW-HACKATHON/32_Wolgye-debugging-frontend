import { registerGuestArray } from '../api/guestMode'
import type { DateTime } from '../types/api'
import type { AdminShareRequestItem, CongestionDay, ShareOffer } from '../types/admin'

// 관리자 목데이터 (월계 한빛빌라 관리자 박○○, user id 2). 쓰기 함수(api/admin.ts)가 직접 바꾼다

export const ADMIN_USER_ID = 2

const everyDay: ShareOffer['weekdays'] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

// 403(P1)은 명세에 없다. P1 외부 차량(공유 이용자) 시나리오에 맞추려고 추가
export const shareOffers: ShareOffer[] = [
  { id: 401, slot_id: 1003, slot_label: 'P3', host_id: ADMIN_USER_ID, weekdays: everyDay, start_hour: 7, end_hour: 23, hourly_price: 5000, max_hours: 4, memo: '이용 후 칸 비워주세요', is_public: true },
  { id: 402, slot_id: 1007, slot_label: 'P7', host_id: ADMIN_USER_ID, weekdays: everyDay, start_hour: 7, end_hour: 23, hourly_price: 5000, max_hours: 4, memo: '이용 후 칸 비워주세요', is_public: true },
  { id: 403, slot_id: 1001, slot_label: 'P1', host_id: ADMIN_USER_ID, weekdays: everyDay, start_hour: 7, end_hour: 23, hourly_price: 5000, max_hours: 4, memo: '이용 후 칸 비워주세요', is_public: true },
]

/** 서버의 공유 요청. 대시보드용 마스킹 이름·매너 온도·생성 시각을 같이 둔다 */
export type MockShareRequest = AdminShareRequestItem & { offer_id: number; temperature: number; created_at: DateTime; reject_reason: string | null; responded_at: DateTime | null }

export const shareRequests: MockShareRequest[] = [
  { id: 303, offer_id: 402, requester: { name: '박민준', unit: '103동 101호' }, temperature: 38.5, plate: '56다 1234', slot_label: 'P7', request_date: '2026-10-03', start_hour: 7, end_hour: 11, total_price: 20000, status: 'PENDING', created_at: '2026-09-30T14:39:00+09:00', reject_reason: null, responded_at: null },
  { id: 301, offer_id: 402, requester: { name: '홍길동', unit: '101동 201호' }, temperature: 36.5, plate: '21가 3456', slot_label: 'P7', request_date: '2026-10-02', start_hour: 13, end_hour: 17, total_price: 20000, status: 'PENDING', created_at: '2026-09-30T14:10:00+09:00', reject_reason: null, responded_at: null },
  { id: 302, offer_id: 401, requester: { name: '이수진', unit: '102동 302호' }, temperature: 36.9, plate: '34나 7890', slot_label: 'P3', request_date: '2026-10-02', start_hour: 15, end_hour: 19, total_price: 20000, status: 'PENDING', created_at: '2026-09-30T13:50:00+09:00', reject_reason: null, responded_at: null },
  { id: 304, offer_id: 401, requester: { name: '김지영', unit: '101동 403호' }, temperature: 35.4, plate: '78라 5678', slot_label: 'P3', request_date: '2026-10-03', start_hour: 14, end_hour: 17, total_price: 15000, status: 'PENDING', created_at: '2026-09-30T13:20:00+09:00', reject_reason: null, responded_at: null },
  { id: 305, offer_id: 403, requester: { name: '최성우', unit: '102동 202호' }, temperature: 39.0, plate: '123가 4634', slot_label: 'P1', request_date: '2026-09-30', start_hour: 16, end_hour: 20, total_price: 20000, status: 'APPROVED', created_at: '2026-09-30T09:00:00+09:00', reject_reason: null, responded_at: '2026-09-30T09:30:00+09:00' },
  { id: 306, offer_id: 402, requester: { name: '정다은', unit: '103동 304호' }, temperature: 33.1, plate: '23바 6789', slot_label: 'P7', request_date: '2026-09-29', start_hour: 16, end_hour: 20, total_price: 20000, status: 'REJECTED', created_at: '2026-09-29T10:00:00+09:00', reject_reason: '시간 불가', responded_at: '2026-09-29T11:00:00+09:00' },
]

// 2026년 9월 일별 '가장 붐빈 시간의 점유 칸 수' (AdminPage 임시 값과 같음). 이번 달이라 오늘(30일)까지
const septemberPeak = [6, 4, 7, 8, 6, 5, 3, 7, 4, 8, 7, 6, 5, 3, 7, 4, 8, 6, 7, 5, 3, 7, 4, 8, 7, 6, 5, 3, 7, 4]
export const congestion: Record<string, CongestionDay[]> = {
  '2026-09': septemberPeak.map((peak_occupied, index) => ({ date: `2026-09-${String(index + 1).padStart(2, '0')}`, peak_occupied })),
}

registerGuestArray('shareOffers', shareOffers)
registerGuestArray('shareRequests', shareRequests)

// Bring existing guest fixtures forward without deleting their progress.
for (const offer of shareOffers) if (offer.hourly_price === 2 && [401, 402, 403].includes(offer.id)) offer.hourly_price = 5000
