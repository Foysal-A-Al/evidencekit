import {readFile,mkdir,writeFile} from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),names=['index.html','app.js','core.js','notebooks.js','privacy.js','runtime.js','style.css'];
const assets=Object.fromEntries(await Promise.all(names.map(async name=>[name,await readFile(path.join(root,'web/public',name),'utf8')])));
const worker=await readFile(path.join(root,'web/security-worker.mjs'),'utf8'),manifest=JSON.parse(await readFile(path.join(root,'.openai/hosting.json'),'utf8'));
if(manifest.static)throw Error('Worker build must not declare static hosting.');
await mkdir(path.join(root,'dist/server'),{recursive:true});await mkdir(path.join(root,'dist/.openai'),{recursive:true});
await writeFile(path.join(root,'dist/server/index.js'),worker+'\nconst assets='+JSON.stringify(assets)+';\nexport default createWorker(assets);\n');await writeFile(path.join(root,'dist/.openai/hosting.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('Built fixed-asset ESM Worker with enforced response headers.');
