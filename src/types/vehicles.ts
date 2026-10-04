import type { VehicleColor } from './api'

export type VehicleListItem = { id: number; plate: string; alias: string | null; color: VehicleColor | null; is_default: boolean; status: 'PARKED' | 'OUT'; status_text: string }
export type VehicleCreate = { plate: string; color?: VehicleColor; alias?: string; is_default?: boolean }
export type VehicleUpdate = { plate?: string; alias?: string; is_default?: boolean }
