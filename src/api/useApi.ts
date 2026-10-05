import { useCallback, useEffect, useEffectEvent, useState } from 'react'
import { ApiError, isApiError } from './client'

export type ApiState<T> = { data: T | undefined; error: ApiError | undefined; loading: boolean; reload: () => void }

const toApiError = (err: unknown) => isApiError(err) ? err : new ApiError(0, 'CONFLICT', '알 수 없는 오류가 발생했어요.')

// 화면에서 조회 API를 부를 때 쓴다. key가 바뀌면 다시 부른다.
// const { data, error, loading, reload } = useApi(() => getMoveRequest(id), `move-${id}`)
export function useApi<T>(load: () => Promise<T>, key = ''): ApiState<T> {
  const [tick, setTick] = useState(0)
  const [result, setResult] = useState<{ key: string; at: string; data?: T; error?: ApiError }>()
  const at = `${key}#${tick}`
  const fetchData = useEffectEvent(() => load())
  useEffect(() => {
    let alive = true
    fetchData().then((data) => { if (alive) setResult({ key, at, data }) }, (err: unknown) => { if (alive) setResult({ key, at, error: toApiError(err) }) })
    return () => { alive = false }
  }, [at, key])
  // 다른 차량·검색 조건의 이전 응답을 새 조건의 결과로 사용하지 않는다.
  const current = result?.at === at ? result : undefined
  const reload = useCallback(() => setTick((value) => value + 1), [])
  return { data: result?.key === key ? result.data : undefined, error: current?.error, loading: !current, reload }
}
