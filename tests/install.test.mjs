import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,lstat,rm,readdir,realpath} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,dirname,delimiter} from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const run=promisify(execFile),source=resolve('.');
async function npxCli(){
 const directories=[dirname(process.execPath),...(process.env.PATH??'').split(delimiter)];
 for(const directory of directories){
  for(const candidate of [join(directory,'node_modules','npm','bin','npx-cli.js'),join(directory,'npx')]){
   try{const path=await realpath(candidate);if(path.endsWith('.js'))return path;}catch{}
  }
 }
 throw new Error('Cannot locate npm npx-cli.js; install Node/npm using the official installer.');
}
async function files(directory,prefix=''){
 const result=[];
 for(const entry of await readdir(directory,{withFileTypes:true})){
  const relative=join(prefix,entry.name);
  if(entry.isDirectory())result.push(...await files(join(directory,entry.name),relative));
  else result.push(relative);
 }
 return result.sort();
}
const names=['evidencekit','evidencekit-runtime','evidencekit-experiment','evidencekit-reverse'];
test('real skills installer discovers four skills, copies both hosts, preserves unrelated files, and repeats safely',{timeout:180000},async()=>{
 const target=await mkdtemp(join(tmpdir(),'evidencekit-native-install-'));
 try{
  await mkdir(join(target,'.claude'),{recursive:true});
  await writeFile(join(target,'.claude','settings.json'),'{"existingConfig":true}\n');
  await mkdir(join(target,'.agents','skills','keep-me'),{recursive:true});
  await writeFile(join(target,'.agents','skills','keep-me','SKILL.md'),'---\nname: keep-me\ndescription: Existing unrelated skill.\n---\nKeep this file.\n');
  const opts={cwd:target,env:{...process.env,CI:'1',DO_NOT_TRACK:'1'},timeout:90000,maxBuffer:2*1024*1024};
  const cli=await npxCli();
  const list=await run(process.execPath,[cli,'-y','skills@1.7.4','add',source,'--list'],opts);
  for(const name of names)assert.ok(list.stdout.includes(name),`Missing discovered skill ${name}`);
  const args=[cli,'-y','skills@1.7.4','add',source,'--skill','*','--agent','claude-code','codex','--copy','-y'];
  await run(process.execPath,args,opts);
  await run(process.execPath,args,opts);
  for(const host of ['.claude','.agents']){
   const installed=(await readdir(join(target,host,'skills'))).filter(name=>name!=='keep-me').sort();
   assert.deepEqual(installed,[...names].sort(),`Unexpected ${host} skill set`);
  }
  for(const host of ['.claude','.agents'])for(const name of names){
   const directory=join(target,host,'skills',name);
   assert.equal((await lstat(directory)).isSymbolicLink(),false,'Copy mode must not need symlink privilege');
   const body=await readFile(join(directory,'SKILL.md'),'utf8');
   assert.match(body,new RegExp(`^name: ${name}$`,'m'));
   const original=join(source,'skills',name),expectedFiles=await files(original);
   assert.deepEqual(await files(directory),expectedFiles,'All skill resources must be copied');
   for(const file of expectedFiles)assert.deepEqual(await readFile(join(directory,file)),await readFile(join(original,file)),`Changed resource ${name}/${file}`);
  }
  assert.equal(await readFile(join(target,'.claude','settings.json'),'utf8'),'{"existingConfig":true}\n');
  assert.ok((await readFile(join(target,'.agents','skills','keep-me','SKILL.md'),'utf8')).endsWith('Keep this file.\n'));
 }finally{await rm(target,{recursive:true,force:true});}
});
