import type { BuildingRole } from '../types/api'
// Guest mode is fixed for the lifetime of a page; entry/exit reloads the app.
const MODE_KEY = 'chagok.guest.v1'
const ROLE_KEY = 'chagok.guest.role.v1'
export const GUEST_ROLE: BuildingRole = (() => {
  try { return localStorage.getItem(ROLE_KEY) === 'ADMIN' ? 'ADMIN' : 'RESIDENT' } catch { return 'RESIDENT' }
})()
// Keep the resident's existing keys for backwards compatibility.
export const GUEST_SESSION_KEY = GUEST_ROLE === 'ADMIN' ? 'chagok.guest.admin.session.v1' : 'chagok.guest.session.v1'
const STATE_KEY = GUEST_ROLE === 'ADMIN' ? 'chagok.guest.admin.state.v1' : 'chagok.guest.state.v1'
export const IS_GUEST = (() => {
  try { return localStorage.getItem(MODE_KEY) === 'true' } catch { return false }
})()
const stores = new Map<string, { save: () => unknown }>()
let saved: Record<string, unknown> = {}
try {
  const value = JSON.parse(localStorage.getItem(STATE_KEY) ?? 'null')
  if (IS_GUEST && value?.version === 1 && value.data && typeof value.data === 'object') saved = value.data
} catch { /* Invalid saved data starts a fresh demo. */ }

export function registerGuestArray<T>(name: string, items: T[]) {
  if (!IS_GUEST) return
  if (Array.isArray(saved[name])) items.splice(0, items.length, ...(saved[name] as T[]))
  stores.set(name, { save: () => items })
}
export function registerGuestMap<K, V>(name: string, items: Map<K, V>) {
  if (!IS_GUEST) return
  const value = saved[name]
  if (Array.isArray(value) && value.every(item => Array.isArray(item) && item.length === 2)) {
    items.clear()
    for (const [key, entry] of value as [K, V][]) items.set(key, entry)
  }
  stores.set(name, { save: () => [...items] })
}
export function persistGuestState() {
  if (!IS_GUEST) return
  for (const [name, store] of stores) saved[name] = store.save()
  try { localStorage.setItem(STATE_KEY, JSON.stringify({ version: 1, data: saved })) }
  catch { throw new Error('체험 상태를 저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요.') }
}
export function startGuestDemo(role: BuildingRole = 'RESIDENT') {
  if (role !== 'RESIDENT' && role !== 'ADMIN') throw new Error('체험할 역할을 선택해 주세요.')
  // Verify storage before navigation so a blocked browser can show an error.
  localStorage.setItem(ROLE_KEY, role)
  localStorage.setItem(MODE_KEY, 'true')
  window.location.hash = role === 'ADMIN' ? '#admin' : '#home'
  window.location.reload()
}
export function exitGuestDemo() {
  localStorage.removeItem(MODE_KEY)
  window.location.hash = '#welcome'
  window.location.reload()
}
export function resetGuestDemo() {
  localStorage.removeItem(STATE_KEY)
  localStorage.removeItem(GUEST_SESSION_KEY)
  window.location.hash = GUEST_ROLE === 'ADMIN' ? '#admin' : '#home'
  window.location.reload()
}
