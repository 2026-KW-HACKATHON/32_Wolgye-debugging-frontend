import { garages } from '../../data/mockData'
import { hashParams } from '../../types/navigation'

export const hourLabel = (hour: number) => `${String(hour).padStart(2, '0')}:00`
export const todayKst = () => new Intl.DateTimeFormat('sv-SE', {timeZone:'Asia/Seoul'}).format(new Date())

export function isValidRequestDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value && value >= todayKst()
}

// TODO(logic): #16 요청 id로 GET /share-requests/{id}를 조회하여 교체한다.
export function requestPreview() {
  const params = hashParams()
  const offer = garages.find((item) => item.offerId === Number(params.get('offer_id'))) ?? garages[0]
  const requestedDate = params.get('request_date') ?? ''
  const date = isValidRequestDate(requestedDate) ? requestedDate : todayKst()
  const vehicleValue = Number(params.get('vehicle_id') ?? 7)
  const vehicleId = Number.isSafeInteger(vehicleValue) && vehicleValue > 0 ? vehicleValue : 7
  const startValue = Number(params.get('start_hour') ?? 13)
  const start = Number.isInteger(startValue) && startValue >= offer.startHour && startValue < offer.endHour ? startValue : offer.startHour
  const endValue = Number(params.get('end_hour') ?? start + 1)
  const end = Number.isInteger(endValue) && endValue > start && endValue <= Math.min(offer.endHour,start+offer.maxHours) ? endValue : start+1
  return {offer, date, time:`${hourLabel(start)} – ${hourLabel(end)}`, params:{offer_id:offer.offerId, vehicle_id:vehicleId, request_date:date, start_hour:start, end_hour:end}}
}
