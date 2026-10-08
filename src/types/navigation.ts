export type PageId =
  | 'report-new'
  | 'report-success'
  | 'report-detail'
  | 'welcome'
  | 'signup'
  | 'login'
  | 'join-building'
  | 'vehicle-register'
  | 'home'
  | 'parking-register'
  | 'departure'
  | 'repeat'
  | 'vehicle-detail'
  | 'unavailable'
  | 'notifications'
  | 'move'
  | 'move-done'
  | 'share'
  | 'garage-detail'
  | 'request-result'
  | 'request-accepted'
  | 'request-rejected'
  | 'admin'
  | 'slots'
  | 'garage-register'
  | 'requests'
  | 'vehicles'
  | 'profile'
  | 'role-guide'

export type TabId = '홈' | '알림' | '공유 주차' | '관리' | '프로필'

export type PageMeta = {
  id: PageId
  title: string
  group: '시작하기' | '주차' | '공유 주차' | '관리' | '설정'
  tab?: TabId
  backTo?: PageId
}

export const pages: PageMeta[] = [
  { id:'report-new',title:'미등록 차량 제보',group:'주차',tab:'홈',backTo:'home' },
  { id:'report-success',title:'제보 완료',group:'주차',tab:'홈' },
  { id:'report-detail',title:'제보 상세',group:'주차',tab:'알림',backTo:'notifications' },
  { id: 'welcome', title: '서비스 소개', group: '시작하기' },
  { id: 'signup', title: '회원가입', group: '시작하기', backTo: 'welcome' },
  { id: 'login', title: '로그인', group: '시작하기', backTo: 'welcome' },
  { id: 'join-building', title: '건물 합류', group: '시작하기', backTo: 'signup' },
  { id: 'vehicle-register', title: '차량 등록', group: '시작하기', backTo: 'join-building' },
  { id: 'home', title: '홈', group: '주차', tab: '홈' },
  { id: 'parking-register', title: '주차하기', group: '주차', tab: '홈', backTo: 'home' },
  { id: 'departure', title: '출차 일정 수정', group: '주차', tab: '홈', backTo: 'vehicle-detail' },
  { id: 'repeat', title: '반복 일정 설정', group: '주차', tab: '홈', backTo: 'parking-register' },
  { id: 'vehicle-detail', title: '차량 상세', group: '주차', tab: '홈', backTo: 'home' },
  { id: 'unavailable', title: '사용 불가 안내', group: '주차', tab: '홈', backTo: 'parking-register' },
  { id: 'notifications', title: '알림 센터', group: '주차', tab: '알림' },
  { id: 'move', title: '이동 요청', group: '주차', tab: '알림', backTo: 'notifications' },
  { id: 'move-done', title: '요청 처리 완료', group: '주차', tab: '알림', backTo: 'notifications' },
  { id: 'share', title: '공유 주차 탐색', group: '공유 주차', tab: '공유 주차' },
  { id: 'garage-detail', title: '차고지 상세', group: '공유 주차', tab: '공유 주차', backTo: 'share' },
  { id: 'request-result', title: '요청 결과', group: '공유 주차', tab: '공유 주차', backTo: 'garage-detail' },
  { id: 'request-accepted', title: '요청 수락', group: '공유 주차', tab: '알림', backTo: 'home' },
  { id: 'request-rejected', title: '요청 거절', group: '공유 주차', tab: '알림', backTo: 'share' },
  { id: 'admin', title: '관리자 대시보드', group: '관리', tab: '관리' },
  { id: 'slots', title: '주차 구역 설정', group: '관리', tab: '관리', backTo: 'admin' },
  { id: 'garage-register', title: '차고지 등록', group: '관리', tab: '관리', backTo: 'admin' },
  { id: 'requests', title: '공유 요청 관리', group: '관리', tab: '관리', backTo: 'admin' },
  { id: 'vehicles', title: '차량 관리', group: '설정', tab: '프로필', backTo: 'profile' },
  { id: 'profile', title: '프로필·설정', group: '설정', tab: '프로필' },
  { id: 'role-guide', title: '역할 및 권한', group: '설정', tab: '프로필', backTo: 'profile' },
]

// 화면 간 값 전달은 해시 쿼리로 한다: #move?id=44 (docs/decisions.md D5)
export const toHash = (id: PageId, params?: Record<string, string | number>) => `#${id}${params ? `?${new URLSearchParams(Object.entries(params).map(([key, value]) => [key, String(value)]))}` : ''}`

export const hashParams = (hash = window.location.hash) => new URLSearchParams(hash.split('?')[1] ?? '')

export function pageFromHash(hash = window.location.hash): PageId {
  const id = hash.replace('#', '').split('?')[0]
  return pages.some((page) => page.id === id) ? (id as PageId) : 'home'
}
