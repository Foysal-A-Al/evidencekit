import {createServer} from 'node:http';import {readFile} from 'node:fs/promises';
export async function startServer({port=0}={}){
 let origin;const server=createServer(async(req,res)=>{
  const finish=(status,data,type='text/plain')=>{res.writeHead(status,{'Content-Type':type,'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self' https://api.github.com; base-uri 'none'; frame-ancestors 'none'"});res.end(data);};
  if(req.headers.host!==new URL(origin).host||req.headers.origin&&req.headers.origin!==origin)return finish(403,'Foreign Host or Origin rejected.');
  if(req.method!=='GET')return finish(405,'This is a static source-review app. No local command or filesystem API exists.');
  const path=new URL(req.url,origin).pathname;const files={'/':'index.html','/app.js':'app.js','/core.js':'core.js','/style.css':'style.css'};
  if(!files[path])return finish(404,'Not found. Use /?repo=owner/repo for a repository shortcut.');
  try{finish(200,await readFile(new URL('./public/'+files[path],import.meta.url)),path.endsWith('.js')?'text/javascript':path.endsWith('.css')?'text/css':'text/html');}catch{finish(500,'Asset unavailable.');}
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});origin=`http://127.0.0.1:${server.address().port}`;
 return {server,url:origin,close:()=>new Promise(resolve=>{server.close(resolve);server.closeAllConnections();})};
}
