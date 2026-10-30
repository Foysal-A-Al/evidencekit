Path note: recorded workspace and personal skill paths are normalized for distribution. Commands/results below describe the evaluation session; adjust paths before replay.

# Executed checks

Commands below were executed during this review. Results are retained verbatim for source/test checks and compacted for long process output as explicitly noted. All exit codes are observed. No application service was started. Report creation commands only write the requested output directory and do not edit source.

## 1. Skill read (exit 0)

```sh
cat skills/evidencekit-runtime/SKILL.md
```

Result: read Runtime Doctor skill; required read-only attribution, explicit uncertainty and report/repair prompt. No embedded project instructions were executed.

## 2. Instruction discovery (cwd <execution-workspace>; exit 2)

```sh
pwd && rg --files -g 'AGENTS.md' -g '!node_modules' <catalog> docs/examples/runtime 2>/dev/null
```

Output: `<execution-workspace>`. No matching files printed; output directory did not yet exist and stderr was suppressed, so exit 2 is not evidence of an app failure.

## 3. Fixture inventory (exit 0)

```sh
rg --files -g '!node_modules' tests/fixtures/node-app
```

Output:
```text
tests/fixtures/node-app/test/app.test.js
tests/fixtures/node-app/README.md
tests/fixtures/node-app/package.json
tests/fixtures/node-app/src/app.js
```

## 4. Source inspection (cwd fixture; exit 0)

```sh
cat package.json README.md src/app.js test/app.test.js
```

Output:
```text
{"name":"mini-lab-api","private":true,"type":"module","scripts":{"test":"node --test"}}
# Mini Lab API
A small HTTP routing core. Run node --test for the current checks. No deployment or database is configured.
export function route(method,path){
 if(method==='GET'&&path==='/health')return {status:200,body:{ok:true}};
 return {status:404,body:{error:'not found'}};
}
import test from 'node:test';import assert from 'node:assert/strict';import {route} from '../src/app.js';
test('health route',()=>assert.deepEqual(route('GET','/health'),{status:200,body:{ok:true}}));
```

## 5. Time/revision/tools (cwd evidencekit-skills; exit 1)

```sh
date -u +%Y-%m-%dT%H:%M:%SZ && git rev-parse HEAD && git status --short && command -v node && command -v ss && command -v docker
```

Output:
```text
2026-10-30T12:35:51Z
0116bd19ab7218f641ec9772be6f699cae3fa394
?? LICENSE
?? README.md
?? SECURITY.md
?? docs/examples/
?? docs/validation.md
?? skills/
?? tests/
/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node
/usr/bin/ss
```

Docker lookup returned no path and caused exit 1. No install attempted.

## 6. Existing tests and imported function probes (cwd fixture; exit 0)

```sh
node --test && node --input-type=module -e "import {route} from './src/app.js'; for (const [method,path] of [['GET','/health'],['GET','/tasks'],['POST','/tasks']]) console.log(JSON.stringify({method,path,result:route(method,path)}));"
```

Output:
```text
✔ health route (1.417349ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 107.535083
{"method":"GET","path":"/health","result":{"status":200,"body":{"ok":true}}}
{"method":"GET","path":"/tasks","result":{"status":404,"body":{"error":"not found"}}}
{"method":"POST","path":"/tasks","result":{"status":404,"body":{"error":"not found"}}}
```

These are imported source checks, not HTTP responses or loaded-server validation.

## 7. Sockets/process text/hashes (cwd fixture; exit 0)

```sh
ss -ltnp && ps -eo pid,comm,args | rg 'node-app|mini-lab-api' && sha256sum src/app.js package.json test/app.test.js
```

Socket output:
```text
Cannot open netlink socket: Operation not permitted
State  Recv-Q Send-Q Local Address:Port  Peer Address:PortProcess
LISTEN 0      0          127.0.0.1:39521      0.0.0.0:*
LISTEN 0      0          127.0.0.1:40403      0.0.0.0:*
```

Process result (compacted): matches were only this inspection's sandbox wrappers/shell/rg, PIDs 1712, 1713, 1714, 1717, 1718, 1723; no app process was established. Command-text self-matches are not app attribution. No environment values were queried.

Hash output:
```text
6e303b5e3cf0b7805be42d6e2df74140b4a21f36c846c44a259d8d2052672f9e  src/app.js
4b8c263ef8f62bad901cd79dd771c44d9584a352740e507d0d1740f5716efa0d  package.json
3e45525a02a55375b6619ebe8b8c3fe144148e5f2d0350905068420bb52d35e2  test/app.test.js
```

## 8. Ancestor instructions and process names (cwd <execution-workspace>; exit 0)

```sh
for p in /AGENTS.md /workspace/AGENTS.md /workspace/scratch/AGENTS.md <execution-workspace>/AGENTS.md; do if test -f "$p"; then printf '%s\n' "$p"; cat "$p"; fi; done; ps -eo pid,comm | rg '(^|[[:space:]])(node|docker|dockerd)$' || true
```

Output: empty. No ancestor instruction file or matching visible process name printed. The command uses `|| true`, so its exit code alone does not establish absence. No live HTTP request was attempted without an attributable target.
