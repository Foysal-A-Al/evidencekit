import test from 'node:test';import assert from 'node:assert/strict';import * as core from '../web/public/core.js';
const file=(path,text)=>({name:path.split('/').at(-1),webkitRelativePath:'project/'+path,size:Buffer.byteLength(text),arrayBuffer:async()=>new TextEncoder().encode(text).buffer});
test('local folder review completes without network and excludes unquoted credentials',async()=>{
 assert.equal(typeof core.collectLocalFiles,'function');const old=globalThis.fetch;globalThis.fetch=()=>{throw Error('GitHub exhausted');};try{const s=await core.collectLocalFiles([file('app.js','eval(input)'),file('config.yaml','api_key: AUDIT_SYNTHETIC_VALUE_ONLY'),file('.env','KEY=x')]);assert.deepEqual(s.files.map(f=>f.path),['app.js']);assert.ok(s.snapshotId);assert.equal(s.excluded,2);}finally{globalThis.fetch=old;}
});
test('actionable imports require exact snapshot identity and complete target metadata',async()=>{
 assert.equal(typeof core.collectLocalFiles,'function');const s=await core.collectLocalFiles([file('app.js','eval(input)')]);
 const value={version:2,snapshotId:s.snapshotId,target:s.target,revision:s.revision,scope:s.scope,summary:'Imported',findings:[{id:'F1',title:'Claim',kind:'problem',status:'VERIFIED',detail:'Not executed here',refs:['app.js'],acceptance:[]}]};
 assert.equal(core.validateReport(value,s).findings[0].status,'SUSPECTED');
 assert.throws(()=>core.validateReport({...value,snapshotId:'stale'},s),/snapshot/);
 const unbound=core.validateReport({...value,snapshotId:undefined},s);assert.equal(unbound.findings[0].status,'BLOCKED');assert.throws(()=>core.makePrompt(unbound,['F1']));
});
test('rebuild brief works for source with no warning and states unknown runtime behavior',async()=>{
 assert.equal(typeof core.makeRebuildPrompt,'function');const s=await core.collectLocalFiles([file('app.js','export const add=(a,b)=>a+b;')]);const prompt=core.makeRebuildPrompt(s,{goal:'Rebuild'});assert.match(prompt,/app.js/);assert.match(prompt,/export const add/);assert.match(prompt,/not executed/);
});
test('runtime evidence classifies imported exceptions and redacts sensitive values',()=>{
 assert.equal(typeof core.analyzeRuntime,'function');const s={files:[{path:'app.js'}]};const r=core.analyzeRuntime('api_key: AUDIT_VALUE\nTypeError: missing property\n at app.js:8:2',s);assert.equal(r.events[0].category,'logic');assert.deepEqual(r.events[0].refs,['app.js']);assert.doesNotMatch(r.text,/AUDIT_VALUE/);assert.equal(r.events[0].status,'SUSPECTED');
});
test('body timeouts are translated and malformed responses have a bounded useful error',async()=>{
 const old=globalThis.fetch;try{globalThis.fetch=async()=>new Response(new ReadableStream({start(c){c.error(new DOMException('body timeout','TimeoutError'));}}));await assert.rejects(core.collectGithub('a/b'),/timed out.*visibility/);globalThis.fetch=async()=>new Response('{');await assert.rejects(core.collectGithub('a/b'),/invalid JSON/);}finally{globalThis.fetch=old;}
});
