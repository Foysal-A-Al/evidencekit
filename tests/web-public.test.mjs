import test from 'node:test';import assert from 'node:assert/strict';
import {scanSource,collectGithub,makePrompt,validateReport,parseRepo} from '../web/public/core.js';
test('public scan detects source flags without claiming runtime or inventing goal completion',()=>{
 const snapshot={target:'fixture',revision:'abc',files:[{path:'package.json',content:'{"scripts":{"start":"node app.js"}}',sha256:'a'},{path:'app.js',content:'const x=eval(input);\nprocess.env.NODE_TLS_REJECT_UNAUTHORIZED="0";',sha256:'b'}],bytes:100,excluded:0,truncated:false,treeFiles:['package.json','app.js']};
 const report=scanSource(snapshot,{goal:'Add authentication',mode:'repair'});assert.ok(report.findings.some(f=>/dynamic/i.test(f.title)));assert.ok(report.findings.some(f=>/TLS/i.test(f.title)));assert.ok(report.findings.some(f=>f.kind==='missing'&&f.status==='BLOCKED'));assert.match(report.method,/No runtime/);
 const chosen=report.findings.filter(f=>/TLS/i.test(f.title)).map(f=>f.id);const prompt=makePrompt(report,chosen);assert.match(prompt,/TLS/);assert.doesNotMatch(prompt,/Dynamic code/);
});
test('unknown report references are removed and not promoted to verified',()=>{
 const r=validateReport({version:1,summary:'Imported',findings:[{id:'F1',title:'Unknown',kind:'problem',status:'VERIFIED',detail:'Claim',refs:['private.env'],acceptance:[]}]},{target:'x',files:[]},{goal:'Goal'});assert.equal(r.findings[0].status,'BLOCKED');assert.deepEqual(r.findings[0].refs,[]);
});
test('GitHub URLs reject secrets and arbitrary network destinations',()=>{for(const s of ['https://evil.test/a/b','https://github.com@localhost/a/b','https://github.com/a/b?token=abc','../repo'])assert.throws(()=>parseRepo(s));});
test('tree links require explicit exact ref instead of guessing slash branches',async()=>{await assert.rejects(collectGithub('https://github.com/owner/repo/tree/feature/login'),/exact branch/);});
test('remaining context budget is reported as limited and explicit slash refs retain scope',async()=>{
 const original=globalThis.fetch,sha='a'.repeat(40),blob='b'.repeat(40),text='x'.repeat(47000);
 globalThis.fetch=async url=>{
  const path=new URL(url).pathname;
  if(path.endsWith('/commits/feature%2Flogin'))return Response.json({sha});
  if(path.endsWith('/git/trees/'+sha))return Response.json({truncated:false,tree:Array.from({length:6},(_,i)=>({type:'blob',mode:'100644',path:`src/file${i}.js`,sha:blob,size:47000}))});
  if(path.endsWith('/git/blobs/'+blob))return Response.json({encoding:'base64',content:Buffer.from(text).toString('base64')});
  return Response.json({message:'not found'},{status:404});
 };
 try{const s=await collectGithub('https://github.com/owner/repo/tree/feature/login/src',undefined,{ref:'feature/login'});assert.equal(s.files.length,5);assert.equal(s.bytes,235000);assert.equal(s.truncated,true);assert.equal(s.scope,'src');assert.equal(s.revision,sha);}finally{globalThis.fetch=original;}
});
