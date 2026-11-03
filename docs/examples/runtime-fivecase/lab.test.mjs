import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {prepareLab, applyProposal, verifyRepair, referenceProposal} from './lab.mjs';

test('five live reproductions fail before repair and pass reference repair without breaking controls', async () => {
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'evidencekit-lab-'));
  const lab=await prepareLab(root);
  try {
    assert.equal(lab.cases.length,5);
    for(const c of lab.cases){
      assert.equal(c.observed.target_pass,false,c.id+' must reproduce a failure');
      assert.equal(c.observed.source_control_pass,true,c.id+' source control');
      const work=path.join(root,'reference',c.id);
      await fs.cp(c.dir,work,{recursive:true});
      const applied=await applyProposal(c,work,referenceProposal(c));
      assert.equal(applied.ok,true,JSON.stringify(applied));
      const result=await verifyRepair(c,work);
      assert.equal(result.target_pass,true,JSON.stringify({case:c.id,...result}));
      assert.equal(result.source_control_pass,true,c.id+' preserved source control');
      assert.equal(result.runtime_control_pass,true,c.id+' preserved runtime control');
    }
    const c=lab.cases[0];const work=path.join(root,'unsafe');await fs.cp(c.dir,work,{recursive:true});
    assert.equal((await applyProposal(c,work,{changes:[{path:'../outside',old:'x',new:'y'}],actions:[]})).ok,false);
    assert.equal((await applyProposal(c,work,{changes:[],actions:['run arbitrary command']})).ok,false);
  } finally {await lab.stop();}
});
