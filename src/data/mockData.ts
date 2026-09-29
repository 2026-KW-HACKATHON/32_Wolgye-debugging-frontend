export const garages = [
  { name: '햇살빌라 101동 B-2', price: '월 55,000원', note: '지금 바로 이용 가능', status: 'available' as const },
  { name: '초록빌라 B동 주차 1', price: '월 48,000원', note: '오후 3:30 출차 예정', status: 'soon' as const },
  { name: '미래빌라 지하 A-5', price: '월 42,000원', note: '10월 1일부터 이용', status: 'reserve' as const },
  { name: '하늘빌라 외부 P-3', price: '월 38,000원', note: '월정액 장기 할인', status: 'available' as const },
  { name: '푸른빌라 101호 앞', price: '월 35,000원', note: '현재 이용 불가', status: 'disabled' as const },
]

export const requesters = [
  ['홍길동', '12가 3456', 'A-3', '대기 중'],
  ['이수진', '34나 7890', 'B-1', '대기 중'],
  ['박민준', '56다 1234', 'A-1', '대기 중'],
  ['김지영', '78라 5678', 'C-2', '대기 중'],
  ['최성우', '90마 2345', 'B-2', '수락됨'],
  ['정다은', '23바 6789', 'A-2', '거절됨'],
] as const
