Path note: recorded workspace and personal skill paths are normalized for distribution. Commands/results below describe the evaluation session; adjust paths before replay.

# Exact checks and observed results

Target working directory for commands below unless noted: `tests/fixtures/node-app`.

## Inventory and file inspection
Run from `<execution-workspace>`:
```bash
pwd; rg --files evidencekit-skills/tests/fixtures/node-app; test -e router-retained-output && ls -la router-retained-output || true
```
Exit 0. Observed cwd `<execution-workspace>`; file inventory: `package.json`, `README.md`, `test/app.test.js`, `src/app.js`. No output directory listing was printed (directory did not exist at inspection time).

```bash
for f in README.md package.json src/app.js test/app.test.js; do echo "$f"; nl -ba "evidencekit-skills/tests/fixtures/node-app/$f"; done
```
Exit 0. README: Mini Lab API; routing core; run `node --test`; no deployment/database configured. Manifest: private ESM package, test script `node --test`. Source: synchronous exported `route(method,path)`, GET health success and unconditional 404 fallback. Test: single exact health-response assertion. These observed lines support report F1–F5.

## Existing interpreter
```bash
node --version
```
Exit 0; output `v24.22.1`. VERIFIED PASS (tool available).

## Existing suite
```bash
node --test
```
Exit 0. Observed output:
```text
✔ health route (1.570086ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 96.527928
```
VERIFIED PASS for the existing health test, not task API completion.

## Direct module behavior (no service started)
```bash
node --input-type=module -e 'import {route} from "./src/app.js"; for (const [method,path] of [["GET","/health"],["GET","/tasks"],["POST","/tasks"],["GET","/tasks/1"],["PATCH","/tasks/1"],["DELETE","/tasks/1"],["GET","/missing"],["POST","/health"]]) console.log(JSON.stringify({method,path,response:route(method,path)}));'
```
Exit 0. Exact output:
```jsonl
{"method":"GET","path":"/health","response":{"status":200,"body":{"ok":true}}}
{"method":"GET","path":"/tasks","response":{"status":404,"body":{"error":"not found"}}}
{"method":"POST","path":"/tasks","response":{"status":404,"body":{"error":"not found"}}}
{"method":"GET","path":"/tasks/1","response":{"status":404,"body":{"error":"not found"}}}
{"method":"PATCH","path":"/tasks/1","response":{"status":404,"body":{"error":"not found"}}}
{"method":"DELETE","path":"/tasks/1","response":{"status":404,"body":{"error":"not found"}}}
{"method":"GET","path":"/missing","response":{"status":404,"body":{"error":"not found"}}}
{"method":"POST","path":"/health","response":{"status":404,"body":{"error":"not found"}}}
```
Health/fallback examples VERIFIED PASS; absent task capability VERIFIED FAIL relative to the user goal. Command success alone is not functional success. Proposed paths have no preexisting documented contract.

## File identity and observation time
```bash
sha256sum README.md package.json src/app.js test/app.test.js; date -u +%Y-%m-%dT%H:%M:%SZ
```
Exit 0. Exact output:
```text
f314cd95b4dcb7683284847f8b819ac5f7b1dcabfbbf2bc4ff213e2692c40910  README.md
4b8c263ef8f62bad901cd79dd771c44d9584a352740e507d0d1740f5716efa0d  package.json
6e303b5e3cf0b7805be42d6e2df74140b4a21f36c846c44a259d8d2052672f9e  src/app.js
3e45525a02a55375b6619ebe8b8c3fe144148e5f2d0350905068420bb52d35e2  test/app.test.js
2026-10-30T12:35:49Z
```
VERIFIED PASS for fingerprint capture; hashes identify inspected files, not deployed/running artifacts.

## Limits
No dependency installation, service start, source changes, network HTTP checks, database checks, deployment checks, or coverage instrumentation. No unavailable tooling blocked the selected checks. Only the three requested new audit artifacts were written outside the target project.

## Post-write verification
An additional Python standard-library check recomputed SHA-256 for all four target files against the fingerprints above, then asserted that each requested output file existed and was nonempty. Observed exit 0 and output:
```text
PASS: all four inspected target files retain their original SHA-256 fingerprints
PASS: report.md exists and is nonempty
PASS: repair-prompt.md exists and is nonempty
PASS: checks.md exists and is nonempty
```
This confirms the audited target files were unchanged when artifact writing completed.
