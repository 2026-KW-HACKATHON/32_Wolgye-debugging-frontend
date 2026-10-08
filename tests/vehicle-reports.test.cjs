const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

// An isolated module graph models account switching without reloading mock data.
function runtime(mock = true,fetchImpl) {
  const cache = new Map(), storage = new Map()
  const localStorage = {getItem:(key)=>storage.get(key) ?? null,setItem:(key,value)=>storage.set(key,value),removeItem:(key)=>storage.delete(key)}
  function load(file) {
    file = path.resolve(file)
    if (cache.has(file)) return cache.get(file).exports
    const mod = {exports:{}};cache.set(file,mod)
    const source = fs.readFileSync(file,'utf8').replaceAll('import.meta.env.VITE_USE_MOCK',JSON.stringify(mock ? 'true' : 'false')).replaceAll('import.meta.env.VITE_API_BASE_URL',JSON.stringify('https://backend.example/api/v1'))
    const code = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText
    vm.runInNewContext(code,{module:mod,exports:mod.exports,require:(id)=>load(path.resolve(path.dirname(file),id+'.ts')),localStorage,structuredClone,crypto:globalThis.crypto,File,Blob,FormData,Response,URLSearchParams,fetch:fetchImpl,setTimeout:(cb)=>setTimeout(cb,0),Intl,Date,console})
    return mod.exports
  }
  return {load,storage}
}
const photo = ()=>new File([new Uint8Array([255,216,255,224,0,0,0,0])],'car.jpg',{type:'image/jpeg'})

test('mock report: atomic reward/parking/admin notification; errors grant nothing; photo authorization',async()=> {
  const rt=runtime(), auth=rt.load('src/api/auth.ts'), api=rt.load('src/api/vehicleReports.ts'), parking=rt.load('src/api/parking.ts'), state=rt.load('src/mocks/parking.ts')
  await auth.login({email:'kim@kw.ac.kr',password:'chagok1234'})
  const reports=rt.load('src/mocks/vehicleReports.ts').vehicleReports
  const initial=(await auth.getMe()).token_balance, initialNotices=state.notifications.length
  const submit=(slot,plate='98가 1234',file=photo())=>api.createVehicleReport(3,{slot_id:slot,plate,photo:file})
  const rejected=async(promise,code)=>{await assert.rejects(promise,(e)=>e.code===code);assert.equal((await auth.getMe()).token_balance,initial);assert.equal(reports.size,0);assert.equal(state.notifications.length,initialNotices)}
  await rejected(submit(1001),'SLOT_OCCUPIED')
  await rejected(submit(1002,'12가 3456'),'PLATE_EXISTS')
  await rejected(submit(1002,'bad'),'INVALID_INPUT')
  await rejected(submit(1002,'45다 6789'),'VEHICLE_ALREADY_PARKED')
  await rejected(submit(1002,'98가 1234',new File(['not an image'],'fake.jpg',{type:'image/jpeg'})),'INVALID_INPUT')
  await rejected(api.createVehicleReport(999,{photo:photo(),plate:'98가 1234',slot_id:1002}),'NOT_BUILDING_MEMBER')
  const slot=state.findSlot(1002);slot.is_active=false;await rejected(submit(1002),'SLOT_UNAVAILABLE');slot.is_active=true
  // Parallel identical submissions cannot pay twice.
  const attempts=await Promise.allSettled([submit(1002),submit(1002)])
  assert.equal(attempts.filter((result)=>result.status==='fulfilled').length,1)
  const result=attempts.find((result)=>result.status==='fulfilled').value
  assert.equal(result.reward_tokens,500);assert.equal(result.token_balance,initial+500)
  assert.equal((await parking.getBuildingStatus(3)).slots.find((slot)=>slot.slot_id===1002).parking.occupant_type,'UNKNOWN')
  assert.equal((await parking.listNotifications()).items.filter((item)=>item.type==='VEHICLE_REPORT').length,0)
  assert.equal((await api.getVehicleReportPhoto(result.report_id)).type,'image/jpeg')
  // Manager sees one thumbnail notification and can read the photo.
  await auth.login({email:'admin@kw.ac.kr',password:'chagok1234'})
  const notices=(await parking.listNotifications()).items.filter((item)=>item.type==='VEHICLE_REPORT')
  assert.equal(notices.length,1);assert.equal(notices[0].link.id,result.report_id)
  assert.ok((await api.getVehicleReportPhoto(result.report_id)).size>0)
  assert.equal((await auth.getMe()).token_balance,500000)
  await auth.signup({email:'another@test.test',password:'test12345',nickname:'another',agree_terms:true})
  await assert.rejects(api.getVehicleReportPhoto(result.report_id),(e)=>e.status===403)
  await auth.login({email:'kim@kw.ac.kr',password:'chagok1234'})
  state.parkings.find((parking)=>parking.id===result.parking_id).state='EXITED'
  await submit(1002,'98가 1235');state.parkings.find((parking)=>parking.slot_id===1002 && parking.state==='PARKED').state='EXITED'
  await submit(1002,'98가 1236');state.parkings.find((parking)=>parking.slot_id===1002 && parking.state==='PARKED').state='EXITED'
  await assert.rejects(submit(1002,'98가 1237'),(e)=>e.code==='REPORT_LIMIT_EXCEEDED')
  assert.equal((await auth.getMe()).token_balance,initial+1500)
})

test('server transport: multipart boundary, auth header, authenticated photo blob',async()=> {
  const sent=[]
  const rt=runtime(false,async(url,options)=>{sent.push({url,options});return url.endsWith('/photo') ? new Response(new Blob(['photo'],{type:'image/jpeg'})) : new Response(JSON.stringify({report_id:1}),{headers:{'Content-Type':'application/json'}})})
  rt.storage.set('chagok.auth',JSON.stringify({mode:'server',tokens:{access_token:'test-access',refresh_token:'test-refresh',user:{id:1}},profile:null}))
  const api=rt.load('src/api/vehicleReports.ts')
  await api.createVehicleReport(3,{photo:photo(),plate:'98가 1234',slot_id:1002})
  assert.ok(sent[0].options.body instanceof FormData)
  assert.equal(sent[0].options.headers['Content-Type'],undefined)
  assert.equal(sent[0].options.headers.Authorization,'Bearer test-access')
  assert.equal(sent[0].options.body.get('plate'),'98가1234')
  assert.equal(sent[0].options.body.get('slot_id'),'1002')
  const blob=await api.getVehicleReportPhoto(1)
  assert.equal(blob.type,'image/jpeg');assert.equal(sent[1].options.headers.Authorization,'Bearer test-access')
})
