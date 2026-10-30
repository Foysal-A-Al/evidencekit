# Task API completion handoff

Work in `evidencekit-skills/tests/fixtures/node-app` (all file references below are relative to that directory).

## Desired outcome and constraints
Complete task lifecycle behavior in the existing routing core while preserving `route('GET','/health')` exactly as `{status:200,body:{ok:true}}`. Preserve unknown-route fallback `{status:404,body:{error:'not found'}}`. Use existing tools/dependencies and the Node built-in test runner. Keep scope small; do not install packages, start services, or assume deployment access. This is an implementation handoff, not evidence that implementation already occurred.

## Confirmed evidence versus assumptions
Selected findings: F1 confirms the existing health contract; F2 confirms no task functionality; F3 confirms only one health test; F4 confirms a routing-core scope with no configured database or deployment; F5 confirms fallback examples. See report.md and checks.md next to this prompt for evidence and its limits.

Confirmed files: `README.md`, `package.json`, `src/app.js`, `test/app.test.js`. The exported route currently takes only method/path; no request-body or persistence API exists. No blocker was observed for source completion using Node. No server behavior has been verified.

The task schema, route names, payload rules, statuses, and in-memory storage below are PROPOSED requirements. They were not requested in detail by the user or found in project documentation. Treat them as a minimal implementation proposal; surface conflicts or material scope decisions rather than attributing these choices to the existing app.

## Scoped work and proposed contract
1. Preserve the current exported `route` and its two-argument health/fallback behavior. Add a third body parameter for task payloads. Provide a factory (for example `createRouter()`) so tests and consumers can obtain independent stores; the existing `route` may delegate to a default instance.
2. Use isolated in-memory task storage with unique opaque string IDs. Return objects that cannot mutate the stored record through consumer references. Do not imply restart durability.
3. Implement tasks shaped `{id, title, completed}`. Trim title; require a nonempty string. Creation accepts required `title` and optional boolean `completed` (default false). PATCH accepts one or both of these fields and rejects an empty object. Reject null, arrays, non-object bodies, incorrect field types, and unsupported fields, including caller-provided IDs, with 400 and a consistent documented error object.
4. POST `/tasks` returns 201 and the created task; GET `/tasks` returns 200 and an array (initially empty, in insertion order); GET `/tasks/:id` returns 200 and the task; PATCH returns 200 and the updated task; DELETE returns 204 with no body property. A syntactically matching task route with an unknown ID returns 404 `{error:'not found'}`. Unsupported methods/paths retain the existing fallback.
5. Keep scope at the routing function: no new HTTP listener, database, auth, pagination, timestamps, or deployment work. Document that callers supply parsed JavaScript payloads and receive response descriptors. If network service delivery is required, report that separately before enlarging scope.
6. Extend `test/app.test.js` (or add focused built-in Node test files) and update `README.md` with the task contract, examples, test command, storage lifetime, and lack of network transport.

## Concrete acceptance checks
Execute `node --test` from the project directory and report its actual output. Tests must cover:
- Exact existing GET `/health` contract, including after task mutations, plus preserved unknown-route and POST `/health` fallbacks.
- Empty list; creation defaults; unique IDs across two creations; list/read agreement; title trimming; updating title and completion; deletion and subsequent missing reads/updates/deletes.
- Rejection of invalid creation/update payloads, empty PATCH, unknown fields, and attempted ID changes; rejected updates leave stored state unchanged.
- Independent router instances do not share tasks, and modifying returned task/list objects cannot modify storage.

Do not call the task API complete just because the old health test passes. Report changed files, the proposed contract implemented, exact checks actually executed, failures and unresolved gaps. Explicitly distinguish module-level validation from any untested HTTP/deployment behavior.
