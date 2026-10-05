export const hourLabel = (hour: number) => `${String(hour).padStart(2, '0')}:00`
export { kstDate as todayKst } from '../parking/kstTime'
import { kstDate } from '../parking/kstTime'
export function isValidRequestDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0,10) === value && value >= kstDate()
}
