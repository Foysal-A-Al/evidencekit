import {redact} from './privacy.js?v=0.3.0';
export function analyzeRuntime(input,snapshot){
 if(typeof input!=='string'||input.length>24000)throw Error('Runtime evidence must be text under 24000 characters.');
 const text=redact(input),events=[];
 const rules=[[/SyntaxError|IndentationError|Unexpected token/i,'syntax'],[/ERR_MODULE_NOT_FOUND|ModuleNotFoundError|Cannot find module/i,'dependency'],[/out of memory|ENOMEM|heap limit|OOMKilled/i,'resource exhaustion'],[/ECONNREFUSED|EADDRINUSE|ENOTFOUND|connection refused/i,'configuration'],[/TypeError|ReferenceError|AssertionError|ZeroDivisionError|KeyError/i,'logic']];
 const refs=snapshot.files.filter(f=>text.includes(f.path)).map(f=>f.path).slice(0,20);
 for(const [pattern,category]of rules){const match=pattern.exec(text);if(match)events.push({category,signal:match[0],refs,status:'SUSPECTED',detail:'Pattern in user-supplied logs; source-path mentions are correlations, not proof of root cause or execution.'});}
 return {text,events,provenance:'user-supplied runtime text; not independently executed',limitations:['Logs can be incomplete, stale or fabricated. Confirm process/build identity and reproduce before repair.','Classification is a lexical hypothesis; it does not establish the root cause.']};
}
