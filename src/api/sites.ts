import type { LotRect, LotShape } from '../types/parking'

// 빌라 배치도 사이트 파일 (FE #56, backend #47). 백엔드는 키(site_key)만 주고 모양은 src/sites/{site_key}.json 에 둔다.
// 빌드에 넣어 두어 따로 불러오지 않는다. 형식이 틀린 파일은 없는 것으로 보고, 화면은 서버 칸 rect 로 그린다

const isNum = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const isObj = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)
const isRect = (value: unknown): value is LotRect & Record<string, unknown> => isObj(value) && isNum(value.x) && isNum(value.y) && isNum(value.w) && isNum(value.h) && value.w > 0 && value.h > 0
const optional = (value: unknown, check: (v: unknown) => boolean) => value === undefined || value === null || check(value)

const isCount = (value: unknown) => isNum(value) && value >= 0
const isBlock = (value: unknown) => isRect(value) && optional(value.floors, isCount)
const listOf = (check: (v: unknown) => boolean) => (value: unknown) => Array.isArray(value) && value.every(check)

export function isLotShape(value: unknown): value is LotShape {
  if (!isObj(value) || typeof value.name !== 'string' || !isObj(value.site) || !isNum(value.site.w) || !isNum(value.site.h)) return false
  if (!isObj(value.slots) || !Object.values(value.slots).every(isRect)) return false
  const aisle = (v: unknown) => isObj(v) && isNum(v.x) && isNum(v.top) && isNum(v.bottom)
  const roof = (v: unknown) => isRect(v) && optional(v.elevation, isCount) && optional(v.floors, isCount)
  return optional(value.floorHeight, (v) => isNum(v) && v > 0) && optional(value.building, isBlock) && optional(value.buildingExtra, listOf(isBlock))
    && optional(value.roof, roof) && optional(value.pillars, listOf(isRect))
    && optional(value.buildingDoor, isRect) && optional(value.boundary, isRect) && optional(value.entrance, isRect)
    && optional(value.aisle, aisle) && optional(value.walls, listOf(isRect))
}

const files = import.meta.glob<unknown>('../sites/*.json', { eager: true, import: 'default' })
export const SITES: Record<string, LotShape> = Object.fromEntries(Object.entries(files).flatMap(([path, value]) => {
  const key = path.slice(path.lastIndexOf('/') + 1, -'.json'.length)
  if (isLotShape(value)) return [[key, value]]
  console.warn(`배치도 사이트 파일 형식이 맞지 않아 쓰지 않아요: ${path}`)
  return []
}))

// TODO(api): 백엔드 #47 의 site_key 가 test 서버에 배포되면 지운다. 그 전에는 site_key 가 응답에 없어 빌라 이름으로 찾는다
const SITE_KEY_BY_NAME: Record<string, string> = { '월계 한빛빌라': 'hanbit', '햇살빌라': 'sunny' }

/** layout·차고지 상세 응답 → 사이트 모양. site_key 가 null(사이트 파일 없는 빌라)이거나 파일이 없으면 null */
export function siteFor({ site_key, name }: { site_key?: string | null; name: string }): LotShape | null {
  const key = site_key === undefined ? SITE_KEY_BY_NAME[name] : site_key
  return key && Object.hasOwn(SITES, key) ? SITES[key] : null
}
