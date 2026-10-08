const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

// An isolated module graph models account switching without reloading mock data.
function runtime(mock = true,fetchImpl, initialStorage = new Map(), windowImpl) {
  const cache = new Map(), storage = initialStorage
  const localStorage = {getItem:(key)=>storage.get(key) ?? null,setItem:(key,value)=>storage.set(key,value),removeItem:(key)=>storage.delete(key)}
  function load(file) {
    file = path.resolve(file)
    if (cache.has(file)) return cache.get(file).exports
    const mod = {exports:{}};cache.set(file,mod)
    const source = fs.readFileSync(file,'utf8').replaceAll('import.meta.env.VITE_USE_MOCK',JSON.stringify(mock ? 'true' : 'false')).replaceAll('import.meta.env.VITE_API_BASE_URL',JSON.stringify('https://backend.example/api/v1'))
    const code = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText
    vm.runInNewContext(code,{module:mod,exports:mod.exports,require:(id)=>load(path.resolve(path.dirname(file),id+'.ts')),localStorage,window:windowImpl,structuredClone,crypto:globalThis.crypto,File,Blob,FormData,Response,URLSearchParams,fetch:fetchImpl,setTimeout:(cb)=>setTimeout(cb,0),Intl,Date,console})
    return mod.exports
  }
  return {load,storage}
}

module.exports = { runtime }
