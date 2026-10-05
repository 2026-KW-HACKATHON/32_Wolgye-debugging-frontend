/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 'false' 면 실제 서버, 그 밖에는 목 (#30) */
  readonly VITE_USE_MOCK?: string
  /** 예: http://localhost:8000/api/v1 */
  readonly VITE_API_BASE_URL?: string
}
