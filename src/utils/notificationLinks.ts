import type { NotificationItem } from '../types/parking'
import { toHash } from '../types/navigation'

export function notificationHref(item: NotificationItem): string | null {
  if (!item.link) return null
  if (item.link.screen === 'MOVE_REQUEST' && item.link.id !== null) return toHash('move', { id: item.link.id })
  if (item.link.screen === 'SHARE_REQUEST' && item.link.id !== null) return toHash('request-result', { id: item.link.id })
  return item.link.screen === 'HOME' ? toHash('home') : null
}

export const notificationTitle = (item: NotificationItem) => item.type === 'MOVE_REQUEST' ? '차량 이동 요청이 도착했어요' : item.title
