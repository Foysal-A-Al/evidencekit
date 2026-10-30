# Repair handoff

Developer goal: add the requested `/tasks` endpoints to `../evidencekit-skills/tests/fixtures/node-app` while preserving `GET /health` and working code. Review `report.md` findings F1–F6 and `checks.md` first. The current authorized review applied no source changes; obtain implementation authorization if this handoff is used in a separate session.

Confirmed work (F1/F2/F3): the routing core in `src/app.js` has health and a generic 404 only. Extend this architecture after establishing the task contract. Retain the exact health result `{status:200,body:{ok:true}}` and the current passing test in `test/app.test.js`. Do not replace the application with a guessed rebuild. Preserve existing data and any subsequently discovered Docker volumes; do not prune, use `down -v`, broadly kill processes, rebuild or restart automatically.

Missing prerequisites: required task methods/paths, payload schema, ID behavior, persistence and response/error contract. Agree these explicitly; record assumptions if the developer authorizes conventional defaults. No live origin/port/process/container has been supplied, and no server entrypoint is configured here. Do not invent a live target or server requirement.

Investigate the stale-runtime hypothesis separately (F4–F6). Once the actual origin is identified, trace URL/proxy to process/container, executable/image/build, source and mounts using available read-only tools. Socket attribution was permission-limited; Docker was unavailable. Missing utilities block those checks only. Do not install tools or expose secret values. Existing repository HEAD does not identify untracked fixture content; capture working-tree hashes and any declared build identity, without calling hashes memory attestation.

Acceptance checks:

1. Run `node --test` in the fixture; retain the health assertion and add meaningful task contract tests, including state transitions, invalid input and missing IDs as applicable.
2. Directly verify `route('GET','/health')` returns `{status:200,body:{ok:true}}` and every agreed task method/path returns its specified status and body. Assert unrelated-route fallback as agreed. Run these against the final source.
3. Only when an actual HTTP server and origin are established, request `/health` and each agreed task operation there with an explicit total timeout and response-size limit (for example curl `--max-time 10 --max-filesize 65536` where available). A truncated/partial response is a failure, not success. Retain origin, collection time, instance identity and complete validated response status/body.
4. Link the tested origin to the process/container, build/source and mounts. Observe post-change instance/reload stability before claiming live deployment correctness; absent evidence stays unknown.
5. Report exact changes and commands/results, preserved functionality, remaining blockers and assumptions. Distinguish source success from live runtime validation. Do not claim stale code fixed solely from a passing local test or a disk hash.
