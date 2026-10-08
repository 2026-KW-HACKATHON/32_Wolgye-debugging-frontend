import { WEEKDAYS } from '../types/api'
import type { GarageDetail, GarageListItem, ShareRequestDetail } from '../types/sharedParking'

const kst = (date: Date) => new Intl.DateTimeFormat('sv-SE', {timeZone:'Asia/Seoul'}).format(date)
const kstHour = (date: Date) => Number(new Intl.DateTimeFormat('en-GB', {timeZone:'Asia/Seoul',hour:'2-digit',hour12:false}).format(date))
const KST_HOUR = kstHour(new Date())
export const SHARED_MOCK_DATE = new Intl.DateTimeFormat('sv-SE', {timeZone:'Asia/Seoul'}).format(new Date(Date.now() + 86400000))
const names = ['햇살빌라','초록빌라','미래빌라','하늘빌라','푸른빌라']
export const sharedGarages: GarageDetail[] = names.map((name,index) => {
  const id = index + 4
  const hourly_price = index === 3 ? 0 : index === 2 || index === 4 ? 1 : 2
  const max_hours = index === 3 ? 2 : index === 2 ? null : 4
  return { id, name, site_key:name === '햇살빌라' ? 'sunny' : null, address:`서울특별시 노원구 광운로19가길 ${20 + index * 2}`, alley:{id:1,name:'광운로19가길'}, summary:{start_hour:index === 2 ? 9 : 7,end_hour:index === 2 ? 24 : 23,min_hourly_price:hourly_price,max_hours}, slots:Array.from({length:index === 0 ? 5 : 1},(_,slotIndex) => {
    const number = index === 2 ? 5 : index === 3 ? 3 : slotIndex+1
    return {slot_id:2100+index*100+number,zone:{id:21+index,name:'공유 주차'},number,label:`P${number}`,state:index === 4 || (index === 0 && [2,3].includes(slotIndex)) ? 'IN_USE' : index === 1 || (index === 0 && slotIndex === 1) ? 'SOON_EXIT' : 'AVAILABLE',estimated_free_at:index === 1 || slotIndex === 1 ? `${SHARED_MOCK_DATE}T15:30:00+09:00` : null,in_use_until:index === 4 || [2,3].includes(slotIndex) ? `${SHARED_MOCK_DATE}T21:00:00+09:00` : null,offer:{id:501+index*100+slotIndex,weekdays:index === 3 ? WEEKDAYS.slice(0,5) : [...WEEKDAYS],start_hour:index === 2 ? 9 : 7,end_hour:index === 2 ? 24 : 23,hourly_price,max_hours,memo:'이용 후 칸을 비워 주세요.'}}
  })}
})
export const sharedGarageItems: GarageListItem[] = sharedGarages.flatMap((garage) => garage.slots.map((slot) => ({garage_id:garage.id,building_name:garage.name,slot_id:slot.slot_id,slot_label:slot.label,title:`${garage.name} · ${slot.label}`,availability:garage.id === 6 ? 'RESERVABLE' : slot.state === 'IN_USE' ? 'UNAVAILABLE' : slot.state,hourly_price:slot.offer.hourly_price,info:garage.id === 7 ? '무료 · 최대 2시간 · 평일만' : garage.id === 6 ? '예약 가능 · 최대 시간 제한 없음' : slot.state === 'IN_USE' ? '현재 이용 중' : slot.state === 'SOON_EXIT' ? '곧 출차 · AI 추정' : '지금 이용 가능 · 07:00–23:00',estimated_free_at:slot.estimated_free_at,estimate_source:slot.estimated_free_at ? 'AI_ESTIMATED' : null,available_from:garage.id === 6 ? `${SHARED_MOCK_DATE}T09:00:00+09:00` : null,max_hours:slot.offer.max_hours,weekdays_only:garage.id === 7})))
export type StoredShareRequest = ShareRequestDetail & { user_id: number; offer_id: number; vehicle_id: number | null }
// 사용자 1의 상태별 시연 요청. 새 요청은 PENDING에 머무른다.
export const userShareRequests: StoredShareRequest[] = (['PENDING','APPROVED','REJECTED'] as const).map((status,index) => ({id:701+index,status,reject_reason:status === 'REJECTED' ? '주차 구역 용량 초과' : null,garage:{id:4,name:'햇살빌라'},slot_id:2101,slot_label:'P1',request_date:SHARED_MOCK_DATE,start_hour:15,end_hour:18,total_price:6,user_id:1,offer_id:501,vehicle_id:7}))
// 지금 이용 시간인 승인된 공유 (햇살빌라 P1, 지금 시각부터 2시간). 요청 결과 화면에서 '여기에 주차했어요'를 시험한다 (#61)
userShareRequests.push({id:704,status:'APPROVED',reject_reason:null,garage:{id:4,name:'햇살빌라'},slot_id:2101,slot_label:'P1',request_date:kst(new Date()),start_hour:KST_HOUR,end_hour:Math.min(KST_HOUR + 2, 24),total_price:4,user_id:1,offer_id:501,vehicle_id:7})
export const offerOwnerId = 999
/** 지금(KST) 이용 시간인 승인된 공유 */
export const sharingNow = (item: StoredShareRequest) => { const now = new Date(); return item.status === 'APPROVED' && item.request_date === kst(now) && item.start_hour <= kstHour(now) && kstHour(now) < item.end_hour }
