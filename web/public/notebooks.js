// JSON parsing and source inspection only. Notebook outputs and metadata never enter context.
export function extractNotebook(text,maxBytes=48000){
 const notebook=JSON.parse(text);if(!Array.isArray(notebook.cells)||notebook.cells.length>5000)throw Error('Unsupported or oversized notebook cell list.');
 const parts=[];let bytes=0,codeCells=0,truncated=false;
 for(let i=0;i<notebook.cells.length;i++){
  const cell=notebook.cells[i];if(cell.cell_type!=='code')continue;
  if(!(typeof cell.source==='string'||Array.isArray(cell.source)&&cell.source.every(s=>typeof s==='string')))throw Error('Invalid notebook code source.');
  const source=typeof cell.source==='string'?cell.source:cell.source.join(''),part=`# Notebook cell ${i+1}\n${source}\n`,size=new TextEncoder().encode(part).length+(parts.length?1:0);
  if(bytes+size>maxBytes){truncated=true;continue;}parts.push(part);bytes+=size;codeCells++;
 }
 return {content:parts.join('\n'),codeCells,truncated};
}
const escape=text=>text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function location(text,index){const before=text.slice(0,index),matches=[...before.matchAll(/^# Notebook cell (\d+)$/gm)];return matches.length?`Notebook cell ${matches.at(-1)[1]}`:`Source line ${before.split('\n').length}`;}
export function experimentSignals(file){
 if(!/\.(?:py|ipynb)$/i.test(file.path))return [];
 const text=file.content,findings=[];
 const add=(title,status,index,detail,acceptance)=>findings.push({title,status,detail:`${location(text,index)}. ${detail} Source review only; confirm data flow and whether this is an archived artifact before changing it.`,acceptance});
 for(const fit of text.matchAll(/\b([A-Za-z_]\w*)\.fit\(\s*([A-Za-z_]\w*)\s*,\s*([A-Za-z_]\w*)\s*\)/g)){
  const pattern=new RegExp(`\\bpermutation_importance\\(\\s*${escape(fit[1])}\\s*,\\s*${escape(fit[2])}\\s*,\\s*${escape(fit[3])}(?:\\s*,|\\s*\\))`),match=pattern.exec(text.slice(fit.index+fit[0].length));
  if(match){add('Permutation importance reuses fit inputs','SUSPECTED',fit.index,`The same identifiers (${fit[1]}, ${fit[2]}, ${fit[3]}) appear in fit and later permutation importance. This can describe training-set importance rather than held-out generalization; reassignment and exploratory intent must be checked.`,['Trace the model and dataset identities between fit and importance.','If generalization importance is intended, evaluate on untouched validation data; label training-set exploratory results accurately.']);break;}
 }
 const lines=text.split('\n');let offset=0;
 for(let i=0;i<lines.length;i++){
  const loop=/^(\s*)for\b.*\bfeatures\b.*:\s*$/.exec(lines[i]);
  if(loop){let bound=null;for(let j=i+1;j<lines.length;j++){
   const line=lines[j],binding=/^\s*(\w+)\s*=\s*\w+\[features\]\s*$/.exec(line);if(binding)bound={name:binding[1],at:j};
   if(bound&&j>bound.at){const expression=new RegExp(`cross_val(?:_score|idate)\\([^\\n]*,\\s*${escape(bound.name)}\\s*,`);if(expression.test(line)&&line.length-line.trimStart().length<=loop[1].length){add('Cross-validation inherits a feature-loop binding','SUSPECTED',offset,`A feature loop assigns ${bound.name} from df[features], and a later out-of-loop cross-validation call reuses it. If it was not reassigned, the final loop's feature group is evaluated rather than every predictor.`,['Make the intended validation feature matrix explicit.','Compare its column names with the documented predictor set and label subset results separately.']);i=lines.length;break;}if(new RegExp(`^\\s*${escape(bound.name)}\\s*=`).test(line)&&!binding)break;}
  }}offset+=lines[i]?.length+1||0;
 }
 const outputs=new Map();for(const match of text.matchAll(/\b(?:plt|fig)\.savefig\(\s*['"]([^'"\n]{1,200})['"]/g)){const value=outputs.get(match[1])??{count:0,index:match.index};value.count++;outputs.set(match[1],value);}
 const duplicates=[...outputs].filter(([,v])=>v.count>1);
 if(duplicates.length)add('Repeated plot output filename','SUSPECTED',duplicates[0][1].index,`Multiple savefig-like patterns reference the same literal output path: ${duplicates.map(([path,v])=>`${path} (${v.count} calls)`).join(', ')}. If these are executable calls, sequential execution can replace earlier figures. Comments/strings can also match; no file writes were run.`,['Assign distinct figure filenames in the working analysis.','Preserve historical notebook/results; verify that intended figure exports coexist.']);
 const kaggle=/\bread_(?:csv|parquet|excel)\(\s*['"]\/kaggle\/input\//.exec(text);
 if(kaggle)add('Kaggle-specific dataset path needs review','SUSPECTED',kaggle.index,'A read-data pattern refers to /kaggle/input; confirm it is executable rather than a comment/string. A different environment needs that path or an explicit local-data entry point; check whether the project already documents a maintained alternative.',['Use the documented local audit entry point when available.','Keep archived notebooks intact; parameterize paths only in an authorized working copy.']);
 const raw=[];for(const match of text.matchAll(/df\[['"](\w+)['"]\]\.sum\(\)\s*\/\s*\w+\)\s*\*\s*100/g)){
  const declaredBinary=new RegExp(`df\\[['"]${escape(match[1])}['"]\\]\\s*=.*\\.astype\\(\\s*(?:int|['"](?:int|int64)['"])\\s*\\)`);
  if(!declaredBinary.test(text))raw.push(match);
 }
 if(raw.length)add('Percentage formula sums an unverified raw score','SUSPECTED',raw[0].index,`The code computes sum(score)/number_of_students*100 for ${[...new Set(raw.map(m=>m[1]))].join(', ')}. That is a prevalence percentage only for a correctly defined binary indicator. Later corrected cells or an external codebook may resolve this; do not call all recorded outputs wrong without tracing use.`,['Verify each variable encoding and the intended denominator.','Use a documented indicator/count for prevalence, and distinguish archived calculations from corrected outputs.']);
 return findings;
}
