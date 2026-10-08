import type { GarageListItem } from '../../types/sharedParking'

const priority = {AVAILABLE:0,SOON_EXIT:1,RESERVABLE:2,UNAVAILABLE:3}
export function garageCards(items: GarageListItem[]) {
  const groups = new Map<number, GarageListItem[]>()
  const seen = new Set<number>()
  for (const item of items) {
    if (seen.has(item.slot_id)) continue
    seen.add(item.slot_id)
    const slots = groups.get(item.garage_id) ?? []
    slots.push(item)
    groups.set(item.garage_id,slots)
  }
  return [...groups.entries()].map(([id,slots])=> {
    const representative = [...slots].sort((a,b)=>priority[a.availability]-priority[b.availability])[0]
    const prices = slots.map((slot)=>slot.hourly_price)
    return {id,name:representative.building_name,availability:representative.availability,info:representative.info,available:slots.filter((slot)=>slot.availability === 'AVAILABLE').length,minPrice:Math.min(...prices),maxPrice:Math.max(...prices)}
  })
}
