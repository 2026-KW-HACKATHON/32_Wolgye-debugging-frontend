export type VehicleReportCreate = {photo:File;plate:string;slot_id:number}
export type VehicleReportCreated = {report_id:number;vehicle_id:number;parking_id:number;slot_label:string;occupant_type:'UNKNOWN';reward_tokens:number;token_balance:number}
export type VehicleReportDetail = {id:number;building_id:number;plate:string;slot_label:string;photo_url:string;reporter:{id:number;name:string};status:'SUBMITTED' | 'DISMISSED';created_at:string}
