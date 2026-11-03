import test from 'node:test';
import assert from 'node:assert/strict';
import {parseRepo, validateReport, scanSource, makePrompt} from '../web/public/core.js';
const snapshot={target:'https://github.com/a/b',revision:'a'.repeat(40),scope:'',snapshotId:'test-snapshot',files:[{path:'app.js',content:'eval(input)',sha256:'hash'}]};
const imported=()=>({version:2,snapshotId:snapshot.snapshotId,scope:'',target:snapshot.target,revision:snapshot.revision,summary:'Claim',findings:[{id:'F1',title:'Claim',kind:'problem',status:'VERIFIED',detail:'Not independently checked',refs:['app.js'],acceptance:['Reproduce the failure']}]});
test('imported verification claims remain suspected even with an existing path',()=>{
 const report=validateReport(imported(),snapshot,{provenance:'imported; not independently executed'});
 assert.equal(report.findings[0].status,'SUSPECTED');
 assert.match(report.findings[0].note,/not independently/);
});
test('reject report metadata from another repository or revision',()=>{
 for(const override of [{target:'https://github.com/a/other'},{revision:'b'.repeat(40)}])assert.throws(()=>validateReport({...imported(),...override},snapshot),/snapshot/);
});
test('repository suffix cannot produce an empty repository name',()=>{for(const value of ['owner/.git','owner/..git','owner/...git'])assert.throws(()=>parseRepo(value));});
test('blocked or unsupported claims cannot enter a repair prompt',()=>{
 const report=validateReport({...imported(),findings:[{...imported().findings[0],refs:['other.js']}]},snapshot);
 assert.throws(()=>makePrompt(report,['F1']),/No source-backed/);
});
test('repair prompt requires reproduction, failure classification and actual verification',()=>{
 const report=scanSource(snapshot,{goal:'Fix the app'});
 assert.match(makePrompt(report,['F1']),/Reproduce/);
 assert.match(makePrompt(report,['F1']),/failure mode/);
});
