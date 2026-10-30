# Runtime review

Goal: support `/tasks` endpoints while preserving `/health`.
Target: `../evidencekit-skills/tests/fixtures/node-app`; no live URL, port, process or container supplied.
Collection time: 2026-10-30T12:35:51Z (UTC). Repository HEAD: `0116bd19ab7218f641ec9772be6f699cae3fa394`.
Scope: read-only source/configuration inspection, existing local test, imported routing-function probes, and local process/socket inventory. No package installation, service startup, source edit, restart or container mutation occurred. Evidence is directly observed source and imported behavior; no historical or synthetic runtime evidence was used.

## Findings

- **F1 — VERIFIED FAIL:** `src/app.js` only handles `GET /health`. Imported function probes for both `GET /tasks` and `POST /tasks` return status 404 with `{error:"not found"}`. This confirms missing task behavior in the inspected source; the precise desired task contract remains unspecified.
- **F2 — VERIFIED PASS:** `GET /health` returns `{status:200,body:{ok:true}}`. The existing `node --test` run passes 1/1 test, covering only this route.
- **F3 — VERIFIED PASS (inspection):** `package.json` has only a test script (`node --test`). README declares a routing core with no deployment or database configured. The fixture contains README, package.json, src/app.js and test/app.test.js. No listener, start script, Docker file or build configuration is present in this fixture.
- **F4 — BLOCKED:** Stale running code is unproven. No intended live URL/port is available. `ss -ltnp` reports two loopback listeners but emits “Cannot open netlink socket: Operation not permitted” and supplies no owners. They cannot be attributed to this app. No node/docker/dockerd command appears in the scoped process-name inventory. Sandbox visibility cannot establish host-wide absence. No HTTP request was sent to unidentified services.
- **F5 — BLOCKED:** Docker executable is unavailable; live container/image/mount checks cannot run. No Docker deployment is declared in the fixture, so Docker repair is NOT_APPLICABLE unless later evidence establishes such deployment.
- **F6 — VERIFIED PASS (provenance captured):** HEAD was captured, but fixture files appear within untracked `tests/`; HEAD alone does not identify these files. `src/app.js` SHA-256 is `6e303b5e3cf0b7805be42d6e2df74140b4a21f36c846c44a259d8d2052672f9e`. This identifies observed disk content, not loaded memory.

## Diagnosis and next work

The confirmed problem is absent task routing in the inspected source. Old-code serving is a SUSPECTED user hypothesis, not a verified runtime fault. Preserve the existing health route and current routing architecture. Define the required task methods, payloads, identifiers, status codes, persistence and error handling before implementing unspecified behavior.

Source acceptance: existing health test remains green; task tests exercise each agreed endpoint and state transition, invalid input and unknown IDs; unrelated routes retain agreed fallback behavior. Live acceptance requires the intended origin and its process/container binding. Verify complete bounded HTTP responses at that origin for health and agreed task operations, with explicit expected statuses/bodies, and record origin, collection time and instance/build identity. Establish source/build/mount linkage and reload stability before asserting the running artifact contains a change. Missing identity/reload evidence remains unknown.

See `checks.md` for executed commands/results and `repair-prompt.md` for a bounded handoff. No repair was applied.
