# EvidenceKit local browser interface

## Intent and selected approach
The user wants the GitReverse-style experience as well as native agent skills: select a repository/project and goal, see problems and missing features, and copy a grounded completion prompt. The user selected a browser interface running on their own PC, using installed Claude Code or Codex without a separate model API key.

Recommend a small Node local server and browser UI in this repository. A hosted site would require its own AI connection or imported results; an Electron app would add packaging and updates. Those alternatives conflict with the selected local approach or the requested simple installation. The implementation choice of a Node server is the builder's recommendation, not a user-specified language.

## Product flow
1. Start with one documented command using Node/npm; open a loopback browser URL. Preserve existing skill-only installation.
2. Select public GitHub URL or an explicitly entered local project directory, provide a goal, and select installed Claude Code/Codex.
3. Preview included source paths, excluded counts and context limits; require explicit start before AI analysis. Changing source, ref or exclusions invalidates the preview. Show that selected source context is sent through the selected assistant/provider and subject to its access and usage limits.
4. Collect bounded repository evidence and run an inspection-only analysis. Show progress, cancellation, authentication/tool errors and partial coverage honestly.
5. Render Problems, Missing features and Unverified areas. Each finding has an ID, evidence references, provenance and status. Validate a versioned JSON result schema, match references against the snapshot, and mark unsupported references unverified. Build the copyable prompt deterministically from selected validated findings. Source review must not claim live runtime verification.
6. Select findings for the handoff. Generate a pasteable repair/completion prompt preserving working functionality and constraints. Offer Copy prompt plus downloadable report and prompt; copy failures get a selectable-text fallback.
7. Repository-to-rebuild is a separate mode, clearly labeled synthetic reconstruction. Missing features require an explicit goal; suggestions remain proposals.

## Interface
A clean responsive developer workbench: project/goal input above the results, evidence cards on the left and prompt preview on the right. Light neutral workspace with navy text and restrained blue accents. A clearly labeled example mode may demonstrate the flow, but never masquerades as a real scan. No invented numeric security score or claim of exhaustive coverage.

## AI connection and limits
Reuse installed authenticated assistant CLIs through fixed adapters, never shell commands supplied by a browser. Run adapters from a neutral temporary working directory containing only an allowlisted snapshot; never use the selected repository as CLI cwd or load its hooks, settings, instructions or MCP configuration. Verify adapter support for disabling tools and repository/plugin hooks without mutating global user settings; do not equate a prompt instruction or tool-disable flag with an OS sandbox. Detect supported capabilities/version and fail closed when unavailable. Verify current vendor invocation/security controls before implementing an adapter. Run tool-disabled analysis on a bounded source snapshot. If a CLI cannot provide the needed restrictions, use export/import of the audit request/result rather than silently weakening safeguards. Imported output is labeled imported. No automatic API key requests or provider fallback.

The core UI must support copying an audit request into an existing agent and importing its structured result even when an automatic adapter is unsupported. This is a visible fallback, not equivalent to verified direct integration. Do not call the whole workflow complete until at least one real authenticated supported adapter has been invoked successfully, with tool restrictions, schema validation and cancellation verified, or explicitly report that blocker. Mocked invocations are insufficient.

## Security boundaries
- Bind only to loopback; validate Host and Origin, require a per-launch session token for local API writes, apply body/response limits and no permissive CORS. No public tunnel or listening on all interfaces.
- Treat repository text and model output as untrusted. Render with textContent or an equivalently safe renderer; no raw model HTML or embedded scripts.
- Resolve real paths under the explicitly selected project; reject symlink escapes, special files and unrelated file access. Do not expose a general filesystem or command-execution endpoint.
- Exclude credential stores, .env files, keys/certificates, dependencies, VCS internals and binaries; bound file count, per-file bytes and total context. Exclusions reduce exposure but are not comprehensive secret detection. Never include credentials in URLs, logs or reports.
- Public GitHub retrieval only over fixed GitHub API/raw hosts, with validated repository/ref/path, timeouts and download limits; reject credentials, arbitrary redirects and private/internal network destinations. No execution of downloaded code or repository instructions.
- Fixed subprocess executable/argument arrays with shell disabled and stdin context, bounded output, timeout, cancellation and single-job concurrency. No permission bypass flags, automatic dependency installs, repairs, training, service restarts or repository writes.
- Keep application source context and results in memory or scoped temporary state by default; exports are explicit. Assistant CLIs/providers can keep their own logs/history and consume subscription usage; do not promise zero retention or free/unlimited execution. Prefer supported no-session-persistence controls and report unsupported retention settings. Preserve existing files and project data.

## Acceptance and maintenance
Test the real server plus UI: valid/invalid sources, missing goal/CLI, source exclusions and path escapes, malicious source/model strings, unauthorized cross-origin requests, cancellation/timeouts, report validation and selective prompt generation. Verify clipboard success/fallback and downloads in browser QA. Run the existing four-skill installer test after packaging changes. Record OS and actual native CLI coverage; do not claim every-PC compatibility. Native Windows verification requires device access, currently unavailable.

Deliver updated GitHub source, a documented one-command local launcher, usage and security notes, and retained verification. Keep the earlier Python toolkit optional and separate. No paid services or background updates.
