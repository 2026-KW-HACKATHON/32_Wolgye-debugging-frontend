const {test} = require('node:test')
const assert = require('node:assert/strict')
const {runtime} = require('./helpers/runtime.cjs')
const {pageFromHash} = runtime().load('src/types/navigation.ts')
test('new visits and invalid routes open the service introduction',()=>{
 for (const hash of ['', '#', '#unknown']) assert.equal(pageFromHash(hash),'welcome')
})
test('explicit routes survive reload including guest request details',()=>{
 assert.equal(pageFromHash('#home'),'home')
 assert.equal(pageFromHash('#welcome'),'welcome')
 assert.equal(pageFromHash('#request-result?id=704'),'request-result')
 assert.equal(pageFromHash('#share'),'share')
})
