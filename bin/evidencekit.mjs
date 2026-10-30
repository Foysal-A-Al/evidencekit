#!/usr/bin/env node
import {startServer} from '../web/server.mjs';
const [command='dashboard',...args]=process.argv.slice(2);
if(command==='--help'||command==='help'){console.log('EvidenceKit\n  evidencekit dashboard [--port 4318]\nOpens a loopback-only source review workbench. Node >=22. Built-in browser checks; no coding CLI required. Optional agent request/result import.');process.exit(0);}
if(command!=='dashboard'){console.error('Unknown command. Use evidencekit --help.');process.exit(1);}
let port=4318;
if(args.length){if(args.length!==2||args[0]!=='--port'||!/^\d+$/.test(args[1])||+args[1]>65535){console.error('Use dashboard [--port 0..65535].');process.exit(1);}port=+args[1];}
try{const app=await startServer({port});console.log(`\nEvidenceKit — local source workbench\n\nOpen this URL in your browser: ${app.url}\nPaste a public GitHub URL. No project code is executed.\nPress Ctrl+C to stop.\n`);for(const signal of ['SIGINT','SIGTERM'])process.once(signal,async()=>{await app.close();process.exit(0);});}catch(e){console.error(e.code==='EADDRINUSE'?'Port is busy. Use evidencekit dashboard --port 0.':e.message);process.exit(1);}
