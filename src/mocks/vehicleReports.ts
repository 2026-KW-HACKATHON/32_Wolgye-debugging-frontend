import type { VehicleReportDetail } from '../types/vehicleReports'
export const vehicleReports = new Map<number, VehicleReportDetail & {photo:Blob}>()
