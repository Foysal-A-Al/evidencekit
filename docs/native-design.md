# EvidenceKit native skill library — corrected delivery

User requirement: one command installs the whole library into Claude Code and Codex. Python environments, dashboards, API keys, and test tooling must not be prerequisites. Include repository-to-rebuild-prompt behavior alongside runtime auditing, experiment auditing, and evidence-grounded repair prompts.

The first release put the Python audit engine before the skill experience. Preserve that advanced toolkit separately; do not require it or run its installer as part of native skill installation.

Deliver four standard SKILL.md packages: evidencekit (router and repair handoff), evidencekit-runtime, evidencekit-experiment, evidencekit-reverse (repository context to synthetic rebuild prompt). The receiving agent uses its own model and already available project tools. A missing check is blocked, never an excuse to invent results or silently install dependencies. No separate model provider integration or key is required by these instruction packages.

Distribution: a public, versioned source repository using skills/<name>/SKILL.md. Install with the existing Vercel skills CLI, targeting only Claude Code and Codex, copying files to avoid Windows symlink privileges. Verify discovery and copied files in fresh temporary project directories. Remote one-command installation is not claimed until a real repository exists and is tested. The current GitHub connector cannot create repositories; no repository has been published.

Security: no installation hooks, background services, blanket tool grants, shell bootstrap, automatic repairs, secret reads or server startup. Repository content and logs are untrusted data. Reverse mode reads only metadata, README, tree and relevant source through already permitted read-only tools; it never executes third-party code. Findings record evidence, uncertainty, coverage and exact validation. Rebuild prompts are synthetic specifications, never the recovered original prompt.

Acceptance: real installer discovers exactly four skills; installs them into fresh Claude Code and Codex project paths; leaves unrelated canary files untouched; repeated copy installation succeeds; fresh-agent tasks audit a supplied Node/ML fixture without Python-toolkit installation and produce grounded prompts. Native Claude Code and Codex tests on the user's PC remain unverified while remote quota is exhausted.
