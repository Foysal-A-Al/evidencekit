import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import crypto from 'node:crypto';

const json=x=>JSON.stringify(x,null,2)+'\n';
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
async function put(root,file,text){await fs.mkdir(path.dirname(path.join(root,file)),{recursive:true});await fs.writeFile(path.join(root,file),text);}
async function read(root,file){return fs.readFile(path.join(root,file),'utf8');}
const runtime=`import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const cfg=JSON.parse(fs.readFileSync(path.join(root,'run.json'),'utf8'));
const entry=process.argv[2]||cfg.entry;
const app=await import(pathToFileURL(path.resolve(root,entry)).href);
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');
 let result;
 if(url.pathname==='/health')result={status:200,body:{app:app.BUILD_ID,control:app.control('A B')}};
 else if(url.pathname==='/identity')result={status:200,body:{app:app.BUILD_ID,pid:process.pid,entry}};
 else {try{result=await app.handle(url);}catch(e){result={status:500,body:{error:e.message}};}}
 res.writeHead(result.status,{'Content-Type':'application/json'});res.end(JSON.stringify(result.body));
});
server.listen(0,'127.0.0.1',()=>console.log(JSON.stringify({port:server.address().port,pid:process.pid,entry,build:app.BUILD_ID})));
`;
const app=(build,multiplier)=>`export const BUILD_ID=${JSON.stringify(build)};
export function control(s){return s.toLowerCase().replaceAll(' ','-');}
export async function handle(url){return {status:200,body:{total:Number(url.searchParams.get('amount')||100)*${multiplier}}};}
`;
const clientParallel=`export async function run(base){
 return Promise.all([1,2,3,4].map(async id=>{const r=await fetch(base+'/job?id='+id);return {id,status:r.status,body:await r.json()};}));
}
`;
const clientSerial=`export async function run(base){
 const results=[];
 for(const id of [1,2,3,4]){const r=await fetch(base+'/job?id='+id);results.push({id,status:r.status,body:await r.json()});}
 return results;
}
`;

async function start(dir,entry){
 const cfg=JSON.parse(await read(dir,'run.json'));
 const p=spawn(process.execPath,[path.join(dir,'runtime.mjs'),...(entry?[entry]:[])],{cwd:path.resolve(dir,cfg.cwd||'.'),env:{...process.env,...cfg.env},stdio:['ignore','pipe','pipe']});
 let stdout='',stderr='';p.stdout.on('data',d=>stdout+=d);p.stderr.on('data',d=>stderr+=d);
 const identity=await new Promise(resolve=>{
  let done=false;const finish=x=>{if(!done){done=true;clearTimeout(timer);resolve(x);}};
  const timer=setTimeout(()=>finish(null),2000);
  p.stdout.on('data',()=>{try{finish(JSON.parse(stdout.trim().split('\n')[0]));}catch{}});
  p.on('exit',()=>finish(null));p.on('error',()=>finish(null));
 });
 return {p,identity,url:identity?'http://127.0.0.1:'+identity.port:null,get stderr(){return stderr.slice(0,6000);},async stop(){if(p.exitCode===null){p.kill();await new Promise(r=>{p.once('exit',r);setTimeout(r,300);});}}};
}
async function get(url){try{const r=await fetch(url,{signal:AbortSignal.timeout(2000)});return {status:r.status,body:await r.json()};}catch(e){return {status:null,error:e.message};}}
async function sourceControl(c,dir){try{const m=await import(pathToFileURL(path.join(dir,c.source)).href+'?probe='+crypto.randomUUID());return m.control('A B')==='a-b';}catch{return false;}}
async function build(c,dir){
 if(!['case01','case04'].includes(c.id))return;
 await new Promise((resolve,reject)=>{const p=spawn(process.execPath,['build.mjs'],{cwd:dir,stdio:['ignore','pipe','pipe']});let stderr='';p.stderr.on('data',d=>stderr+=d);p.on('error',reject);p.on('exit',code=>code===0?resolve():reject(Error('Trusted project build failed: '+stderr.slice(0,1000))));});
}
async function observe(c,dir,service){
 const h=service.url?await get(service.url+'/health'):{status:null};
 let observations;
 if(c.id==='case02'){
  const cfg=JSON.parse(await read(dir,'client.json'));observations=[await get(cfg.base_url+'/quote?amount=100'),await get(cfg.base_url+'/quote?amount=50')];
 }else if(c.id==='case05'&&service.url){
  const m=await import(pathToFileURL(path.join(dir,'src/client.mjs')).href+'?probe='+crypto.randomUUID());observations=await m.run(service.url);
 }else observations=service.url?[await get(service.url+'/quote?amount=100'),await get(service.url+'/quote?amount=50')]:[];
 const target=c.id==='case05'?observations.length===4&&observations.every(x=>x.status===200):observations.length===2&&observations.every((x,i)=>x.status===200&&x.body?.total===[120,60][i]);
 const source=await sourceControl(c,dir);
 return {target_pass:target,source_control_pass:source,runtime_control_pass:h.status===200&&h.body?.control==='a-b',http_health:h,observations,startup_stderr:service.stderr,process_binding:service.identity};
}
export async function prepareLab(root){
 const servers=[],cases=[];await fs.mkdir(root,{recursive:true});
 const goals=[
  'The quote endpoint still returns untaxed totals after the source fix. Return 120 for amount=100 and 60 for amount=50; preserve the health/control behavior.',
  'The client reaches a healthy service but returns the wrong application response. Route the client to the intended quote app; preserve both running services.',
  'File configuration looks correct, but requests fail at runtime. Restore successful quote responses without changing the calculation or health behavior.',
  'Development source checks pass but the production artifact fails to start. Ship the existing fixture-price runtime dependency in production without replacing its implementation.',
  'Four client jobs fail intermittently with 503. Complete all four while preserving the server worker limit of one; implement client backpressure, not a larger server resource limit.'
 ];
 for(let n=1;n<=5;n++){
  const id='case0'+n,dir=path.join(root,'projects',id);await fs.mkdir(path.join(dir,'src'),{recursive:true});
  const c={id,dir,goal:goals[n-1],source:'src/app.mjs',allowed:['package.json','run.json','client.json','dist/app.mjs','src/client.mjs']};
  await put(dir,'runtime.mjs',runtime);await put(dir,'src/app.mjs',app('quote-v2',1.2));
  await put(dir,'package.json',json({name:id,private:true,type:'module',scripts:{start:'node runtime.mjs'}}));
  const run={entry:'src/app.mjs',cwd:'.',env:{}};
  if(n===1){run.entry='dist/app.mjs';await put(dir,'dist/app.mjs',app('quote-v1',1));await put(dir,'build.mjs',"import fs from 'node:fs';fs.copyFileSync('src/app.mjs','dist/app.mjs');\n");}
  if(n===2)await put(dir,'other/app.mjs',app('inventory-v0',9.99));
  if(n===3){run.env.APP_TIMEOUT_MS='10';await put(dir,'config.json',json({timeout_ms:1000}));await put(dir,'src/app.mjs',`import fs from 'node:fs';
export const BUILD_ID='quote-v2';
export function control(s){return s.toLowerCase().replaceAll(' ','-');}
const cfg=JSON.parse(fs.readFileSync(new URL('../config.json',import.meta.url),'utf8'));
export async function handle(url){const timeout=Number(process.env.APP_TIMEOUT_MS??cfg.timeout_ms);if(timeout<200)return {status:503,body:{error:'timeout budget below required work',effective_timeout_ms:timeout,required_ms:200}};return {status:200,body:{total:Number(url.searchParams.get('amount')||100)*1.2}};}
`);}
  if(n===4){
   c.source='development/src/app.mjs';run.entry='artifact/app.mjs';
   const dep={name:'fixture-price',version:'1.0.0',type:'module',exports:'./index.mjs'};
   await put(dir,'vendor/fixture-price/package.json',json(dep));await put(dir,'vendor/fixture-price/index.mjs','export function taxed(amount){return amount*1.2;}\n');
   await fs.cp(path.join(dir,'vendor/fixture-price'),path.join(dir,'development/node_modules/fixture-price'),{recursive:true});
   await put(dir,c.source,`import {taxed} from 'fixture-price';
export const BUILD_ID='quote-v2';
export function control(s){return s.toLowerCase().replaceAll(' ','-');}
export async function handle(url){return {status:200,body:{total:taxed(Number(url.searchParams.get('amount')||100))}};}
`);
   await put(dir,'package.json',json({name:id,private:true,type:'module',scripts:{build:'node build.mjs',start:'node runtime.mjs'},dependencies:{},devDependencies:{'fixture-price':'1.0.0'}}));
   await put(dir,'build.mjs',`import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
fs.rmSync(path.join(root,'artifact'),{recursive:true,force:true});
fs.mkdirSync(path.join(root,'artifact/node_modules'),{recursive:true});
fs.copyFileSync(path.join(root,'development/src/app.mjs'),path.join(root,'artifact/app.mjs'));
for(const name of Object.keys(manifest.dependencies||{})){
 if(name!=='fixture-price')throw Error('Only the fixture-owned dependency is allowed');
 fs.cpSync(path.join(root,'vendor',name),path.join(root,'artifact/node_modules',name),{recursive:true});
}
`);
  }
  if(n===5){await put(dir,'src/client.mjs',clientParallel);await put(dir,'src/app.mjs',`export const BUILD_ID='quote-v2';
export function control(s){return s.toLowerCase().replaceAll(' ','-');}
const MAX_WORKERS=1;let active=0;
export async function handle(url){if(url.pathname!=='/job')return {status:200,body:{total:Number(url.searchParams.get('amount')||100)*1.2}};if(active>=MAX_WORKERS)return {status:503,body:{error:'maximum pending requests exceeded',worker_limit:MAX_WORKERS}};active++;try{await new Promise(r=>setTimeout(r,40));return {status:200,body:{job:url.searchParams.get('id')}};}finally{active--;}}
`);}
  await put(dir,'run.json',json(run));if(n===4)await build(c,dir);
  const service=await start(dir);servers.push(service);c.service=service;
  let extra={};
  if(n===2){const decoy=await start(dir,'other/app.mjs');servers.push(decoy);await put(dir,'client.json',json({base_url:decoy.url}));c.expected_url=service.url;extra={intended_service:{url:service.url,identity:await get(service.url+'/identity')},client_target:{url:decoy.url,identity:await get(decoy.url+'/identity')}};}
  c.observed=await observe(c,dir,service);
  const files={};for(const file of ['package.json','run.json',c.source,...(n===1?['dist/app.mjs','build.mjs']:[]),...(n===2?['client.json','other/app.mjs']:[]),...(n===3?['config.json']:[]),...(n===4?['build.mjs','vendor/fixture-price/package.json','vendor/fixture-price/index.mjs']:[]),...(n===5?['src/client.mjs']:[])])files[file]=await read(dir,file);
  c.packet={case_id:id,goal:c.goal,provenance:{kind:'synthetic isolated reproduction; imported observations',captured_at:new Date().toISOString(),platform:process.platform,node:process.version,limits:'You did not collect these observations. This is an evidence-interpretation and proposed-repair test, not an autonomous investigation.'},files,observed:c.observed,...extra,allowed_changes:c.allowed,allowed_actions:['rebuild','restart'],constraints:['Preserve existing source control behavior control("A B")==="a-b".','Do not change runtime.mjs, trusted packaging or verification infrastructure.','Do not raise resource limits, install packages, use external APIs or invent executed checks.']};
  await put(root,'packets/'+id+'.json',json(c.packet));c.packet_hash=hash(json(c.packet));cases.push(c);
 }
 return {cases,async stop(){await Promise.all(servers.map(s=>s.stop()));}};
}
export function referenceProposal(c){
 if(c.id==='case01')return {changes:[],actions:['rebuild','restart']};
 if(c.id==='case02')return {changes:[{path:'client.json',old:c.packet.files['client.json'],new:json({base_url:c.expected_url})}],actions:[]};
 if(c.id==='case03')return {changes:[{path:'run.json',old:c.packet.files['run.json'],new:json({...JSON.parse(c.packet.files['run.json']),env:{APP_TIMEOUT_MS:'1000'}})}],actions:['restart']};
 if(c.id==='case04')return {changes:[{path:'package.json',old:c.packet.files['package.json'],new:json({...JSON.parse(c.packet.files['package.json']),dependencies:{'fixture-price':'1.0.0'},devDependencies:{}})}],actions:['rebuild','restart']};
 return {changes:[{path:'src/client.mjs',old:clientParallel,new:clientSerial}],actions:[]};
}
export async function applyProposal(c,dir,proposal){
 try{
  for(const edit of proposal.changes||[]){
   if(!c.allowed.includes(edit.path)||path.isAbsolute(edit.path)||edit.path.split(/[\\/]/).includes('..'))throw Error('Out-of-scope edit: '+edit.path);
   const old=await read(dir,edit.path);if(typeof edit.old!=='string'||!edit.old||old.split(edit.old).length!==2)throw Error('Edit must match exactly once: '+edit.path);
   await put(dir,edit.path,old.replace(edit.old,()=>edit.new));
  }
  for(const action of proposal.actions||[]){if(!['rebuild','restart'].includes(action))throw Error('Unknown action');if(action==='rebuild')await build(c,dir);}
  return {ok:true};
 }catch(e){return {ok:false,error:e.message};}
}
export async function verifyRepair(c,dir){const s=await start(dir);try{return await observe(c,dir,s);}finally{await s.stop();}}
