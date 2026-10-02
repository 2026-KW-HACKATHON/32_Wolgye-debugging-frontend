import { useEffect, useEffectEvent, useState } from 'react'
import { ApiError, isApiError } from './client'

export type ApiState<T> = { data: T | undefined; error: ApiError | undefined; loading: boolean; reload: () => void }

const toApiError = (err: unknown) => isApiError(err) ? err : new ApiError(0, 'CONFLICT', '알 수 없는 오류가 발생했어요.')

// 화면에서 조회 API를 부를 때 쓴다. key가 바뀌면 다시 부른다.
// const { data, error, loading, reload } = useApi(() => getMoveRequest(id), `move-${id}`)
export function useApi<T>(load: () => Promise<T>, key = ''): ApiState<T> {
  const [tick, setTick] = useState(0)
  const [result, setResult] = useState<{ at: string; data?: T; error?: ApiError }>()
  const at = `${key}#${tick}`
  const fetchData = useEffectEvent(() => load())
  useEffect(() => {
    let alive = true
    fetchData().then((data) => { if (alive) setResult({ at, data }) }, (err: unknown) => { if (alive) setResult({ at, error: toApiError(err) }) })
    return () => { alive = false }
  }, [at])
  return { data: result?.data, error: result?.error, loading: result?.at !== at, reload: () => setTick((value) => value + 1) }
}
