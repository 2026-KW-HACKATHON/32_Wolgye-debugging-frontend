// 화면들이 함께 쓰는 KST 날짜·시각 헬퍼. 기준은 실제 현재 시각 (목 MOCK_NOW 아님)
// 공유 주차 화면은 src/pages/shared-parking/requestPreview.ts 가 todayKst(= kstDate)·hourLabel 을 다시 내보낸다

const KST_OFFSET = 9 * 3600000

export const pad = (value: number) => String(value).padStart(2, '0')
/** 오늘(+offsetDays) KST 날짜 "YYYY-MM-DD" */
export const kstDate = (offsetDays = 0) => new Date(Date.now() + KST_OFFSET + offsetDays * 86400000).toISOString().slice(0, 10)
/** 지금 KST 시각 "HH:mm" */
export const kstClock = () => new Date(Date.now() + KST_OFFSET).toISOString().slice(11, 16)
/** 지금 + minutes 분의 KST 일시 "YYYY-MM-DDTHH:mm:ss+09:00" (API 전송용) */
export const kstAfter = (minutes: number) => `${new Date(Date.now() + KST_OFFSET + minutes * 60000).toISOString().slice(0, 19)}+09:00`
export const kstNow = () => kstAfter(0)
/** 정시 → "09:00" (공유 운영 시간·요청 시간) */
export const hourLabel = (hour: number) => `${pad(hour)}:00`
/** API 일시 → "오후 2:40" */
export const timeOf = (at: string) => new Date(at).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Seoul' })
/** API 일시 → "9월 30일 오후 2:40" */
export const dateTimeOf = (at: string) => new Date(at).toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Seoul' })
/** API 일시 → KST 날짜 "YYYY-MM-DD"·시각 "HH:mm" (오프셋이 +09:00 이 아니어도 맞게 바꾼다) */
export function kstPartsOf(at: string) {
  const local = new Date(Date.parse(at) + KST_OFFSET).toISOString()
  return { date: local.slice(0, 10), clock: local.slice(11, 16) }
}
/** 출차 일정 표시: 오늘/내일/날짜 + KST 시각 */
export function dayTimeOf(at: string) {
  const local = new Date(Date.parse(at) + KST_OFFSET).toISOString()
  const date = local.slice(0, 10)
  const day = date === kstDate() ? '오늘' : date === kstDate(1) ? '내일' : date === kstDate(-1) ? '어제' : `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}`
  return `${day} ${local.slice(11, 16)}`
}
