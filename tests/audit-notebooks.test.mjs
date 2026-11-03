import test from 'node:test';import assert from 'node:assert/strict';
import {extractNotebook} from '../web/public/notebooks.js';
import {scanSource,makePrompt,collectGithub} from '../web/public/core.js';
test('notebook review extracts code and cell references without outputs or executing cells',()=>{
 const n={cells:[{cell_type:'markdown',source:['context']},{cell_type:'code',source:['rf.fit(X, y)\n','permutation_importance(rf, X, y)'],outputs:[{text:['PRIVATE OUTPUT MUST NOT APPEAR']}]}]};
 const value=extractNotebook(JSON.stringify(n));assert.match(value.content,/# Notebook cell 2/);assert.match(value.content,/rf.fit/);assert.doesNotMatch(value.content,/PRIVATE OUTPUT/);assert.equal(value.codeCells,1);
});
test('notebook review identifies reusable ML source signals with paths and preserves historical artifacts',()=>{
 const code=`# Notebook cell 1\nfor factor, features in feature_sets:\n    X = df[features]\n    y = df['stress_level']\n    model.fit(X, y)\n# Notebook cell 2\ncv_scores = cross_val_score(rf, X, y, cv=5)\n# Notebook cell 3\nrf.fit(X, y)\nperm_importance = permutation_importance(rf, X, y, n_repeats=10)\nplt.savefig('chart.png')\nplt.savefig('chart.png')`;
 const r=scanSource({target:'fixture',files:[{path:'experiment.ipynb',content:code,sha256:'hash',representation:'notebook code cells only'}],truncated:false},{goal:'Find problems',mode:'repair'});
 assert.ok(r.findings.some(f=>/permutation/i.test(f.title)&&f.status==='SUSPECTED'&&f.refs.includes('experiment.ipynb')));
 assert.ok(r.findings.some(f=>/cross-validation.*loop|loop.*cross-validation/i.test(f.title)));
 assert.ok(r.findings.some(f=>/output filename/i.test(f.title)));
 const prompt=makePrompt(r,r.findings.map(f=>f.id));assert.match(prompt,/historical|archived/i);assert.match(prompt,/experiment.ipynb/);
 assert.ok(r.findings.every(f=>f.refs.length>0),'Generic limitations must not masquerade as findings');
});
test('an empty source scan is inconclusive and cannot produce a generic repair prompt',()=>{
 const r=scanSource({target:'small',files:[{path:'main.py',content:'print("hello")',sha256:'h'}],truncated:false},{goal:'Find problems'});
 assert.equal(r.assessment,'INCONCLUSIVE');assert.deepEqual(r.findings,[]);assert.ok(r.limitations.length>0);assert.throws(()=>makePrompt(r,[]),/No source-backed/);
});
test('safe notebooks above normal text file limit are collected as bounded code rather than skipped',async()=>{
 const original=globalThis.fetch,sha='a'.repeat(40),blob='b'.repeat(40);
 const notebook=JSON.stringify({cells:[{cell_type:'code',source:['rf.fit(X,y)\npermutation_importance(rf,X,y)'],outputs:[{text:['output'.repeat(20000)]}]}]});
 globalThis.fetch=async url=>{const path=new URL(url).pathname;if(path.endsWith('/commits/HEAD'))return Response.json({sha});if(path.endsWith('/git/trees/'+sha))return Response.json({truncated:false,tree:[{type:'blob',mode:'100644',path:'experiment.ipynb',sha:blob,size:Buffer.byteLength(notebook)}]});return Response.json({encoding:'base64',content:Buffer.from(notebook).toString('base64')});};
 try{const s=await collectGithub('owner/repo');assert.equal(s.files.length,1);assert.match(s.files[0].content,/permutation_importance/);assert.doesNotMatch(s.files[0].content,/outputoutput/);assert.equal(s.files[0].representation,'notebook code cells only');assert.equal(s.truncated,false);}finally{globalThis.fetch=original;}
});
test('notebook byte budget includes cell separators',()=>{
 const cell=n=>({cell_type:'code',source:[n]});const n=JSON.stringify({cells:[cell('a'),cell('b')]});
 const limit=new TextEncoder().encode('# Notebook cell 1\na\n# Notebook cell 2\nb\n').length;
 const value=extractNotebook(n,limit);assert.ok(new TextEncoder().encode(value.content).length<=limit);assert.equal(value.truncated,true);
});
test('held-out permutation importance is not flagged as reused fit inputs',()=>{
 const snapshot={target:'heldout',files:[{path:'evaluation.py',content:'rf.fit(X_train, y_train)\npermutation_importance(rf, X_test, y_test)',sha256:'h'}],truncated:false};
 assert.equal(scanSource(snapshot,{goal:'Review'}).findings.some(f=>/Permutation/.test(f.title)),false);
});
test('mixed-case notebook extensions cannot expose outputs through audit context',async()=>{
 const original=globalThis.fetch,sha='c'.repeat(40),blob='d'.repeat(40),notebook=JSON.stringify({cells:[{cell_type:'code',source:['print(1)'],outputs:[{text:['OUTPUT_SENTINEL']}]}]});
 globalThis.fetch=async url=>{const path=new URL(url).pathname;if(path.endsWith('/commits/HEAD'))return Response.json({sha});if(path.endsWith('/git/trees/'+sha))return Response.json({truncated:false,tree:[{type:'blob',mode:'100644',path:'Review.IPyNb',sha:blob,size:notebook.length}]});return Response.json({encoding:'base64',content:Buffer.from(notebook).toString('base64')});};
 try{const s=await collectGithub('owner/repo');assert.equal(s.files[0].representation,'notebook code cells only');assert.doesNotMatch(s.files[0].content,/OUTPUT_SENTINEL|outputs/);}finally{globalThis.fetch=original;}
});
test('inert commented notebook patterns are never presented as verified execution',()=>{
 const r=scanSource({target:'comments',files:[{path:'example.ipynb',content:'# plt.savefig("a.png")\n# plt.savefig("a.png")\n# pd.read_csv("/kaggle/input/demo.csv")',sha256:'h'}]},{goal:'Review'});
 assert.ok(r.findings.every(f=>f.status!=='VERIFIED'));
});
