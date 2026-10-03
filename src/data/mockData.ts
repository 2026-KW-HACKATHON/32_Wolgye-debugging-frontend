// TODO(logic): #16 GET /garages의 응답으로 교체한다. 한 항목은 공유 가능한 칸 하나다.
export const garages = [
  { garageId: 2, offerId: 21, label: 'P2', name: '햇살빌라', address: '서울 노원구 월계로 40', hourlyPrice: 2, maxHours: 4, startHour: 7, endHour: 23, note: '지금 이용 가능 · 07:00–23:00', status: 'available' as const },
  { garageId: 3, offerId: 31, label: 'P1', name: '초록빌라', address: '서울 노원구 월계로 42', hourlyPrice: 2, maxHours: 4, startHour: 7, endHour: 23, note: 'AI 추정 출차 15:30', status: 'soon' as const },
  { garageId: 4, offerId: 41, label: 'P5', name: '미래빌라', address: '서울 노원구 월계로 44', hourlyPrice: 1, maxHours: 4, startHour: 9, endHour: 23, note: '예약 가능 · 09:00–23:00', status: 'reserve' as const },
  { garageId: 5, offerId: 51, label: 'P3', name: '하늘빌라', address: '서울 노원구 월계로 46', hourlyPrice: 0, maxHours: 2, startHour: 7, endHour: 23, note: '최대 2시간 · 평일만', status: 'available' as const },
  { garageId: 6, offerId: 61, label: 'P1', name: '푸른빌라', address: '서울 노원구 월계로 48', hourlyPrice: 1, maxHours: 4, startHour: 7, endHour: 23, note: '현재 이용 불가', status: 'disabled' as const },
]

export const requesters = [
  ['홍길동', '12가 3456', 'A-3', '대기 중'],
  ['이수진', '34나 7890', 'B-1', '대기 중'],
  ['박민준', '56다 1234', 'A-1', '대기 중'],
  ['김지영', '78라 5678', 'C-2', '대기 중'],
  ['최성우', '90마 2345', 'B-2', '수락됨'],
  ['정다은', '23바 6789', 'A-2', '거절됨'],
] as const
