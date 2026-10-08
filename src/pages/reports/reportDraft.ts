import type { VehicleReportCreated } from '../../types/vehicleReports'
// 사진과 성공 결과는 URL/localStorage에 넣지 않는다. 새로고침하면 다시 촬영한다.
let draft: {photo:File;ownerId:number} | null = null
let result: {value:VehicleReportCreated;ownerId:number} | null = null
export const getReportDraft = ()=>draft
export const setReportDraft = (photo:File,ownerId:number)=>{draft={photo,ownerId};result=null}
export const clearReportDraft = ()=>{draft=null}
export const finishReport = (value:VehicleReportCreated,ownerId:number)=>{draft=null;result={value,ownerId}}
export const getReportResult = ()=>result
export const clearReportResult = ()=>{result=null}
