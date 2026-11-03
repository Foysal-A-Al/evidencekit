import test from 'node:test';
import assert from 'node:assert/strict';
import {collectGithub} from '../web/public/core.js';
async function failingFetch(response,pattern){const previous=globalThis.fetch;globalThis.fetch=async()=>response();try{await assert.rejects(collectGithub('666ghj/DeepSearchAgent-Demo'),pattern);}finally{globalThis.fetch=previous;}}
test('exhausted GitHub quota explains that public visibility is not the problem and gives reset time',async()=>{
 await failingFetch(()=>Response.json({message:'API rate limit exceeded'},{status:403,headers:{'x-ratelimit-remaining':'0','x-ratelimit-reset':'1793700000'}}),/rate limit.*public.*Retry after/i);
});
test('429 identifies throttling with Retry-After',async()=>{
 await failingFetch(()=>Response.json({message:'Too many requests'},{status:429,headers:{'retry-after':'30'}}),/rate limit.*30 seconds/i);
});
test('403 without rate-limit evidence is not mislabeled as an exhausted quota',async()=>{
 await failingFetch(()=>Response.json({message:'Forbidden'},{status:403}),/denied.*does not establish.*private/i);
});
test('404 identifies a failed lookup instead of claiming the repository is private',async()=>{
 await failingFetch(()=>Response.json({message:'Not found'},{status:404}),/repository or requested revision.*not found/i);
});
test('browser fetch failure reports network access rather than repository visibility',async()=>{
 await failingFetch(()=>{throw new TypeError('Failed to fetch');},/browser or network.*not.*private/i);
});
test('timeouts are distinguished from private repositories',async()=>{
 await failingFetch(()=>{throw new DOMException('timed out','TimeoutError');},/timed out.*visibility/i);
});
test('identical file blobs use one API request while retaining both paths',async()=>{
 const previous=globalThis.fetch,sha='e'.repeat(40),blob='f'.repeat(40);let blobRequests=0;
 globalThis.fetch=async url=>{const path=new URL(url).pathname;if(path.endsWith('/commits/HEAD'))return Response.json({sha});if(path.endsWith('/git/trees/'+sha))return Response.json({tree:['one.js','two.js'].map(path=>({path,type:'blob',mode:'100644',sha:blob,size:8}))});blobRequests++;return Response.json({encoding:'base64',content:Buffer.from('print(1)').toString('base64')});};
 try{const result=await collectGithub('owner/repo');assert.equal(result.files.length,2);assert.equal(blobRequests,1);}finally{globalThis.fetch=previous;}
});
