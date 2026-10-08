import type { ShareOfferSummary } from '../../types/sharedParking'
import { kstPartsOf } from '../parking/kstTime'

type OfferTime = Pick<ShareOfferSummary, 'start_hour' | 'end_hour' | 'weekdays' | 'max_hours'>
const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const
const currentKst = (now: Date) => {
  const { date, clock } = kstPartsOf(now.toISOString())
  return { date, hour: Number(clock.slice(0, 2)) }
}

export function initialRequestTime(offer: OfferTime, now = new Date()) {
  if (offer.max_hours !== null && offer.max_hours < 1) return null
  const current = currentKst(now)
  for (let offset = 0; offset < 8; offset++) {
    const day = new Date(Date.parse(`${current.date}T12:00:00Z`) + offset * 86400000)
    const start = offset === 0 ? Math.max(offer.start_hour, current.hour) : offer.start_hour
    if (offer.weekdays.includes(weekdays[day.getUTCDay()]) && start < offer.end_hour) {
      return { date: day.toISOString().slice(0, 10), start, end: start + 1 }
    }
  }
  return null
}

export function isElapsedStartHour(date: string, hour: number, now = new Date()) {
  const current = currentKst(now)
  return date < current.date || (date === current.date && hour < current.hour)
}

export function requestTimeError(offer: OfferTime, date: string, start: number, end: number, now = new Date()) {
  if (!Number.isInteger(start) || !Number.isInteger(end) || end <= start || start < offer.start_hour || end > offer.end_hour || (offer.max_hours !== null && end - start > offer.max_hours)) {
    return '운영 시간과 최대 이용 시간에 맞춰 선택해 주세요.'
  }
  return isElapsedStartHour(date, start, now) ? '이미 지난 시간대예요. 현재 시간대나 이후 시간을 선택해 주세요.' : ''
}

export function isOngoingRequest(date: string, start: number, end: number, now = new Date()) {
  const current = currentKst(now)
  return date === current.date && start === current.hour && end > current.hour
}
