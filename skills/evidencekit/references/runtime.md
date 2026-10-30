# Native runtime inspection

Identify the exact intended URL, process/container, project directory and expected outcome. Read run scripts and configuration, then use already available platform tools: PowerShell Get-NetTCPConnection/Get-Process, Unix process/socket tools, read-only Docker inspection, HTTP requests and existing app health/build endpoints. Use equivalent tools actually available; do not prescribe a missing utility as a prerequisite.

Trace URL/port to candidate process/container, image or build, mounts and source. Record unresolved links. A proxy, remote Docker context, several port candidates or absent build metadata can block attribution. Treat image age and revision labels as clues, never proof of stale code. Inspect only variable names/presence, not secret values.

A response must be complete and bounded; use explicit total timeout and response limits supported by the chosen tool. Do not count partial responses as successful behavior. Identity endpoints should share the app's origin or have an explicit established binding; retain endpoint, collection time and process/model instance. Missing reload/stability evidence is unknown. Hashes describe observed files or declared load instrumentation, not independent memory attestation.

Confirm a failure before proposing repair. Missing Docker does not block source/run-config inspection, but live Docker claims remain BLOCKED. Existing tests passing do not prove that the running artifact contains the change.

Deliver a report and repair prompt with concrete endpoint/build/behavior acceptance checks. Keep inspection read-only; preserve data and Docker volumes. No down -v, pruning, broad process killing, automatic rebuilds or restarts.
