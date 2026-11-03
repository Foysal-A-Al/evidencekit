import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {prepareLab,applyProposal,verifyRepair} from './lab.mjs';
const home=path.dirname(fileURLToPath(import.meta.url));
const root=path.join(home,'run');await fs.mkdir(path.join(root,'inbox'),{recursive:true});
const lab=await prepareLab(root);const results=[];
await fs.writeFile(path.join(root,'manifest.json'),JSON.stringify(lab.cases.map(c=>({id:c.id,packet_hash:c.packet_hash,observed:c.observed})),null,2));
console.log('PACKETS_READY '+root);
try{
 const until=Date.now()+3600000,seen=new Set();
 while(seen.size<10&&Date.now()<until){
  for(const file of await fs.readdir(path.join(root,'inbox'))){
   if(!file.endsWith('.json')||seen.has(file))continue;
   const row=JSON.parse(await fs.readFile(path.join(root,'inbox',file),'utf8'));const c=lab.cases.find(x=>x.id===row.case_id);
   if(!c||!['baseline','evidencekit'].includes(row.condition))throw Error('Unexpected result identity');
   const work=path.join(root,'repairs',row.condition,c.id);await fs.cp(c.dir,work,{recursive:true});
   const t=performance.now();const applied=await applyProposal(c,work,row.response);const verified=applied.ok?await verifyRepair(c,work):null;
   const result={...row,packet_hash:c.packet_hash,applied,verified,verification_ms:Math.round(performance.now()-t)};results.push(result);seen.add(file);
   await fs.writeFile(path.join(root,'results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({case:c.id,condition:row.condition,repair_pass:verified?.target_pass??false,controls_pass:verified?.source_control_pass&&verified?.runtime_control_pass,error:applied.error}));
  }
  await new Promise(r=>setTimeout(r,500));
 }
 if(seen.size!==10)throw Error('Comparison incomplete: '+seen.size+'/10 results');
 console.log('ALL_TEN_REPAIRS_CHECKED');
}finally{await lab.stop();}
