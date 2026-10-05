// parking·admin 화면이 함께 쓰는 KST 날짜·시각 헬퍼. 기준은 실제 현재 시각 (목 MOCK_NOW 아님)
// 효재 화면은 src/pages/shared-parking/requestPreview.ts 의 todayKst·hourLabel 을 쓴다

const KST_OFFSET = 9 * 3600000

export const pad = (value: number) => String(value).padStart(2, '0')
/** 오늘(+offsetDays) KST 날짜 "YYYY-MM-DD" */
export const kstDate = (offsetDays = 0) => new Date(Date.now() + KST_OFFSET + offsetDays * 86400000).toISOString().slice(0, 10)
/** 지금 KST 시각 "HH:mm" */
export const kstClock = () => new Date(Date.now() + KST_OFFSET).toISOString().slice(11, 16)
/** 지금 + minutes 분의 KST 일시 "YYYY-MM-DDTHH:mm:ss+09:00" (API 전송용) */
export const kstAfter = (minutes: number) => `${new Date(Date.now() + KST_OFFSET + minutes * 60000).toISOString().slice(0, 19)}+09:00`
export const kstNow = () => kstAfter(0)
/** API 일시 → "오후 2:40" */
export const timeOf = (at: string) => new Date(at).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Seoul' })
/** API 일시 → "9월 30일 오후 2:40" */
export const dateTimeOf = (at: string) => new Date(at).toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Seoul' })
