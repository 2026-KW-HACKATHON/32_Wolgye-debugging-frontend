// 화면을 오가며 작성 중인 입력만 유지한다. 새로고침·로그아웃하면 비운다.
const drafts = new Map<string, unknown>()

export function readDraft<T>(key: string): T | undefined { return drafts.get(key) as T | undefined }
export function writeDraft<T>(key: string, value: T) { drafts.set(key, value) }
export function removeDraft(key: string) { drafts.delete(key) }
export function clearDrafts() { drafts.clear() }
