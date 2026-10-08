export type MapInstance = { destroy: () => void; setSize: (size: unknown) => void; setCenter: (center: unknown) => void; setZoom: (zoom: number) => void }
type MapsSdk = {
  Map: new (element: HTMLElement, options: Record<string, unknown>) => MapInstance
  Marker: new (options: Record<string, unknown>) => { setMap: (map: MapInstance | null) => void }
  Point: new (x: number, y: number) => unknown
  LatLng: new (lat: number, lng: number) => unknown
  LatLngBounds: new (southwest: unknown, northeast: unknown) => unknown
  Size: new (width: number, height: number) => unknown
  MapTypeId: { HYBRID: string }
  ZoomControlStyle: { SMALL: number }
  Position: { RIGHT_CENTER: number }
}

declare global {
  interface Window {
    naver?: { maps?: MapsSdk }
    __chagokMapsReady?: () => void
    navermap_authFailure?: () => void
  }
}

let pending: Promise<MapsSdk> | null = null

export function loadNaverMaps(): Promise<MapsSdk> {
  if (window.naver?.maps?.Map) return Promise.resolve(window.naver.maps)
  if (pending) return pending
  const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID
  if (!clientId) return Promise.reject(new Error('지도 설정이 필요해요.'))
  pending = new Promise<MapsSdk>((resolve, reject) => {
    const script = document.createElement('script')
    const previousAuthFailure = window.navermap_authFailure
    const cleanup = () => {
      window.clearTimeout(timer)
      delete window.__chagokMapsReady
      window.navermap_authFailure = previousAuthFailure
    }
    const fail = (message: string) => { cleanup();script.remove();pending = null;reject(new Error(message)) }
    const timer = window.setTimeout(() => fail('네이버 지도 응답 시간이 초과됐어요.'), 12000)
    window.__chagokMapsReady = () => queueMicrotask(() => {
      const maps = window.naver?.maps
      if (!maps?.Map) { fail('네이버 지도 SDK 초기화에 실패했어요.');return }
      cleanup();resolve(maps)
    })
    window.navermap_authFailure = () => fail('네이버 지도 인증에 실패했어요. Web 서비스 URL을 확인해 주세요.')
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}&callback=__chagokMapsReady`
    script.async = true
    script.onerror = () => fail('네이버 지도 스크립트를 불러오지 못했어요.')
    document.head.appendChild(script)
  })
  return pending
}
