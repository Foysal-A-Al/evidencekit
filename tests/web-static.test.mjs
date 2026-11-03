import test from 'node:test';import assert from 'node:assert/strict';import http from 'node:http';import {startServer} from '../web/server.mjs';
test('optional local static launcher has no command/filesystem API and rejects foreign hosts',async()=>{const app=await startServer();try{
 assert.equal((await fetch(app.url+'/')).status,200);assert.equal((await fetch(app.url+'/core.js')).status,200);assert.equal((await fetch(app.url+'/privacy.js')).status,200);assert.equal((await fetch(app.url+'/runtime.js')).status,200);assert.equal((await fetch(app.url+'/notebooks.js?v=0.2.1')).status,200);assert.equal((await fetch(app.url+'/api/analyze',{method:'POST',body:'{}'})).status,405);
 const host=await new Promise(resolve=>{http.get(app.url,{headers:{Host:'evil.test'}},r=>{r.resume();r.on('end',()=>resolve(r.statusCode));});});assert.equal(host,403);
 assert.equal((await fetch(app.url+'/?repo=owner/repo')).status,200);
}finally{await app.close();}});

