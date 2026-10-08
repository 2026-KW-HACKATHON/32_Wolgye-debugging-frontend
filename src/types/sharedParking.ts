import type { DateOnly, DateTime, Hour, PageQuery, Weekday } from './api'
import type { ExitSource } from './parking'

export type GarageAvailability = 'AVAILABLE' | 'SOON_EXIT' | 'RESERVABLE' | 'UNAVAILABLE'
export type GarageFilter = 'all' | 'now' | 'reservable' | 'free'
export type GarageListQuery = PageQuery & { q?: string; filter?: GarageFilter; lat?: number; lng?: number }
export type GarageListItem = { garage_id: number; building_name: string; slot_id: number; slot_label: string; title: string; availability: GarageAvailability; hourly_price: number; info: string | null; estimated_free_at: DateTime | null; estimate_source: ExitSource | null; available_from: DateTime | null; max_hours: number | null; weekdays_only: boolean }
export type ShareOfferSummary = { id: number; weekdays: Weekday[]; start_hour: Hour; end_hour: Hour; hourly_price: number; max_hours: number | null; memo: string | null }
export type GarageSlot = { slot_id: number; zone: {id: number; name: string}; number: number; label: string; state: 'AVAILABLE' | 'SOON_EXIT' | 'IN_USE'; estimated_free_at: DateTime | null; in_use_until: DateTime | null; offer: ShareOfferSummary }
export type GarageDetail = { id: number; name: string; address: string; /** 배치도 사이트 파일 키 (BuildingLayout.site_key 와 같다) */ site_key?: string | null; alley: {id: number; name: string}; /** 공유 조건이 걸린 칸이 하나도 없으면 시간·요금이 null (서버 GarageSummaryOut) */ summary: {start_hour: Hour | null; end_hour: Hour | null; min_hourly_price: number | null; max_hours: number | null}; slots: GarageSlot[] }
export type ShareRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type ShareRequestCreate = { offer_id: number; vehicle_id?: number | null; request_date: DateOnly; start_hour: Hour; end_hour: Hour }
export type ShareRequestCreated = { id: number; status: ShareRequestStatus; total_price: number }
export type ShareRequestDetail = { id: number; status: ShareRequestStatus; reject_reason: string | null; garage: {id: number; name: string}; slot_id: number; slot_label: string; request_date: DateOnly; start_hour: Hour; end_hour: Hour; total_price: number }
