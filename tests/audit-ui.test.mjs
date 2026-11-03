import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import * as core from '../web/public/core.js';
class Element {
 constructor(tag='div'){this.tag=tag;this.children=[];this.handlers={};this.value='';this.dataset={};this.classList={toggle(){}};}
 addEventListener(name,fn){this.handlers[name]=fn;}
 setAttribute(name,value){this[name]=value;}
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this.children=nodes;}
 focus(){} select(){} showModal(){} close(){} click(){}
}
async function setup(){
 const elements=new Map();const get=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);};
 const source=(await readFile(new URL('../web/public/app.js',import.meta.url),'utf8')).replace(/^import .*?;\n/,'');
 const context={...core,document:{getElementById:get,createElement:tag=>new Element(tag),querySelectorAll:()=>[]},crypto:webcrypto,location:{origin:'https://example.test',search:''},URLSearchParams,AbortController,AbortSignal,Blob,URL,navigator:{clipboard:{writeText:async()=>{}}},setTimeout:()=>0};
 vm.runInNewContext(source,context);
 return {context,get,fire:async(id,event)=>{await get(id).handlers[event]?.({preventDefault(){}});for(let i=0;i<20;i++)await new Promise(resolve=>setImmediate(resolve));}};
}
test('example, finding selection, prompt content and clear complete through UI handlers',async()=>{
 const {get,fire}=await setup();await fire('example','click');get('export-reviewed').checked=true;await fire('export-reviewed','change');
 assert.match(get('notice').textContent,/SYNTHETIC EXAMPLE/);
 assert.match(get('prompt').value,/Reproduce/);assert.equal(get('copy-prompt').disabled,false);
 assert.equal(get('findings').children.length,1);
 const checkbox=get('findings').children[0].children[0];checkbox.checked=false;checkbox.handlers.change();
 await new Promise(resolve=>setImmediate(resolve));assert.equal(get('copy-prompt').disabled,true);
 await fire('cancel','click');assert.equal(get('result').hidden,true);assert.equal(get('prompt').value,'');
});
test('imported HTML stays text, verification is downgraded and acceptance checks are shown',async()=>{
 const {get,fire}=await setup();await fire('example','click');
 const hostile='<img src=x onerror=alert(1)>';
 get('import').files=[{size:100,text:async()=>JSON.stringify({version:2,snapshotId:'synthetic-example-v1',target:'Synthetic task-api example',revision:null,scope:'',summary:hostile,findings:[{id:'F1',title:hostile,kind:'problem',status:'VERIFIED',detail:hostile,refs:['src/app.js'],acceptance:[hostile]}]})}];
 await fire('import','change');assert.equal(get('summary').textContent,hostile);
 const content=get('findings').children[0].children[1];
 assert.equal(content.children[0].children[0].textContent,hostile);
 assert.equal(content.children[0].children[1].textContent,'SUSPECTED');
 assert.equal(content.children[3].children[0].textContent,hostile);
 assert.equal(content.innerHTML,undefined);
});
test('invalid and oversized report files fail without replacing the existing report',async()=>{
 const {get,fire}=await setup();await fire('example','click');const old=get('summary').textContent;
 for(const file of [{size:1400001,text:async()=>{throw Error('must not read')}},{size:1,text:async()=>'{'}]){
 get('import').files=[file];await fire('import','change');assert.equal(get('summary').textContent,old);assert.equal(get('notice').className,'notice error');assert.equal(get('import').value,'');
 }
});

test('Clear removes manual-copy text and local/runtime inputs',async()=>{const {context,get,fire}=await setup();await fire('example','click');context.navigator.clipboard.writeText=async()=>{throw Error('denied');};get('export-reviewed').checked=true;await fire('copy-request','click');assert.ok(get('fallback-text').value.length);get('runtime-log').value='old log';await fire('cancel','click');assert.equal(get('fallback-text').value,'');assert.equal(get('runtime-log').value,'');assert.equal(get('folder').value,'');assert.equal(get('export-reviewed').checked,false);});

test('local folder UI reviews source under GitHub outage and builds a warning-free reconstruction',async()=>{
 const {context,get,fire}=await setup();get('goal').value='Rebuild the addition function';get('mode').value='reverse';get('runtime-log').value='';
 get('folder').files=[{name:'app.js',webkitRelativePath:'project/app.js',size:26,arrayBuffer:async()=>new TextEncoder().encode('export const add=(a,b)=>a+b;').buffer}];
 const old=globalThis.fetch;globalThis.fetch=()=>{throw Error('GitHub API exhausted');};try{await fire('review-folder','click');assert.equal(get('result').hidden,false);assert.match(get('prompt').value,/export const add/);assert.match(get('scope-summary').textContent,/Local/);assert.equal(get('copy-prompt').disabled,true);get('export-reviewed').checked=true;await fire('export-reviewed','change');assert.equal(get('copy-prompt').disabled,false);}finally{globalThis.fetch=old;}
});
test('runtime log UI adds only suspected correlated evidence and exports redacted text',async()=>{
 const {get,fire}=await setup();get('goal').value='Diagnose';get('mode').value='repair';get('runtime-log').value='api_key: AUDIT_ONLY_VALUE\nTypeError: undefined price\n at app.js:8:2';get('folder').files=[{name:'app.js',webkitRelativePath:'project/app.js',size:18,arrayBuffer:async()=>new TextEncoder().encode('export const x=1;').buffer}];await fire('review-folder','click');assert.match(get('prompt').value,/Runtime signal: logic/);assert.doesNotMatch(get('prompt').value,/AUDIT_ONLY_VALUE/);assert.match(get('prompt').value,/SUSPECTED/);
});
test('pending clipboard rejection after Clear cannot restore the previous request',async()=>{const {context,get,fire}=await setup();await fire('example','click');let rejectCopy;context.navigator.clipboard.writeText=()=>new Promise((resolve,reject)=>{rejectCopy=reject;});get('export-reviewed').checked=true;await fire('copy-request','click');await fire('cancel','click');rejectCopy(Error('denied'));await new Promise(resolve=>setImmediate(resolve));assert.equal(get('fallback-text').value,'');});
test('Clear removes report DOM content rather than only hiding its container',async()=>{const {get,fire}=await setup();await fire('example','click');assert.ok(get('findings').children.length);await fire('cancel','click');assert.equal(get('findings').children.length,0);assert.equal(get('file-list').children.length,0);assert.equal(get('summary').textContent,'');});
test('editing a cached target disables reuse and a cache miss cannot fetch another repository',async()=>{const {context,get,fire}=await setup();get('goal').value='Audit';get('source').value='a/one';get('mode').value='repair';context.collectGithub=async()=>({target:'https://github.com/a/one',revision:'a'.repeat(40),scope:'',snapshotId:'one',files:[{path:'a.js',content:'eval(x)',sha256:'x'}],bytes:7,excluded:0,truncated:false});await fire('project-form','submit');assert.equal(get('reuse-source').disabled,false);get('source').value='a/two';await fire('source','input');assert.equal(get('reuse-source').disabled,true);let calls=0;context.collectGithub=async()=>{calls++;throw Error('must not fetch');};await fire('reuse-source','click');assert.equal(calls,0);assert.match(get('notice').textContent,/No matching cached snapshot/);});
