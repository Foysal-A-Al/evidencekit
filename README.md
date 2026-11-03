# EvidenceKit

**Native agent skills for understanding projects, checking evidence, and generating useful coding prompts.**

Use your existing Claude Code or Codex model and project tools. No EvidenceKit Python engine, virtual environment, dashboard, separate model API key or package stack is required by these skills.

## Open the browser workbench

[Open EvidenceKit](https://evidencekit-repo-review.niloyhasanfoysal440.chatgpt.site) (owner-private; ChatGPT sign-in). Paste a public GitHub URL and your goal, preview source scope, run built-in checks, select findings, review sensitive data, and copy/download a completion prompt. Rebuild mode generates an independent source-backed brief even when the lexical checks find no warnings. No terminal, local CLI, API key or model installation is needed for this hosted flow.

These are bounded deterministic source checks, not a general AI auditor or live runtime diagnosis. They flag dynamic execution, shell invocation, TLS bypass patterns, debug startup, missing package test scripts and floating Docker bases where inspected. It also reads bounded Jupyter code cells (not outputs) and flags selected experiment/reproducibility patterns. Generic limitations are separate from findings; an empty scan is marked inconclusive and does not manufacture a repair prompt. They can miss bugs and cannot establish all missing features. Goal coverage and runtime are explicitly unverified. An optional audit-request export/result import supports deeper work in your existing agent.

The page fetches public GitHub APIs directly from your browser. Direct API inspection supports public repositories; GitHub rate limits apply. For a blocked request, download and extract a repository and explicitly choose its folder: bounded source is read locally, with no upload or API key. You can also paste up to 24,000 characters of redacted runtime evidence under More options. Log classifications remain suspected, not verified execution. Share a repository selection using `/?repo=owner/repo` on the Site. A custom domain replacement for github.com requires a separately owned domain and hosting.

An optional local copy can be launched with Node/npm >=22 (Git may be needed by npm for this source):

```sh
npx --yes --package=github:Foysal-A-Al/evidencekit evidencekit dashboard
```

Open the printed loopback URL. This local server only serves static files: no shell, filesystem-reading or model execution endpoint. The four agent skills below remain independent.

## Install the whole skill library

Published library. Remote installation and repeat installation were verified in fresh Linux project folders for both Claude Code and Codex; native Windows assistant invocation remains unverified.

```sh
npx -y skills@1.7.4 add Foysal-A-Al/evidencekit --skill "*" -g -a claude-code codex --copy -y
```

Requires Node/npm for the standard skills installer and the target coding assistant. The command installs instruction files, not a Python application. Copy mode avoids Windows symlink privileges. It targets Claude Code and Codex only; it does not grant tool permissions or install services.

For local source validation, replace the repository argument with the absolute path to this extracted directory. The automated installer smoke test uses fresh project scope rather than modifying global user skills.

## Four skills, one workflow

| Skill | What it does |
|---|---|
| `evidencekit` | Routes the task; compares a project with the developer's goal; creates an evidence-grounded repair/completion prompt |
| `evidencekit-runtime` | Checks available runtime, port, process/container, image/mount, configuration and build evidence |
| `evidencekit-experiment` | Reviews split/subject/time boundaries, preprocessing, metric semantics, artifacts and experiment provenance |
| `evidencekit-reverse` | Turns inspected repository context into a synthetic rebuild prompt, inspired by the repo-to-prompt workflow |

These are agent workflows. They do not secretly provide a universal deterministic scanner. Exact claims require actual executed checks; unavailable tools or evidence are reported as BLOCKED.

## Use in your coding agent

Claude Code:

```text
/evidencekit Review this project against my goal, explain the gaps,
and generate a repair prompt. Preserve working features and my data.
```

Codex:

```text
Use $evidencekit to inspect this project with existing tools and produce
an evidence-grounded completion prompt. Do not install an audit stack.
```

Repository-to-prompt:

```text
Use evidencekit-reverse on this repository URL. Create a synthetic rebuild
prompt based on inspected behavior, label guesses and missing context,
and include concrete acceptance checks. Do not execute third-party code.
```

Supply the actual project path/URL and goal. The agent can inspect source and run scoped checks with existing tools. It does not automatically repair code, restart services, install dependencies or run model training. Those actions need user authorization.

## Output

The normal deliverables are an evidence report and a pasteable repair/completion or rebuild prompt. They include scope, provenance, finding IDs, confirmed facts, hypotheses, blocked checks, constraints, supported work and acceptance checks. When file writes are available, output goes to an explicit or new project-local directory without overwriting existing files; otherwise complete text is returned inline.

A reconstruction is a new synthetic specification, not the recovered original private prompt. The agent should separate the existing implementation from proposed future features.

## Security

The four skill packages contain Markdown instructions and optional UI metadata only. The separate browser workbench contains static HTML/CSS/JavaScript; its optional Node launcher serves those assets. No post-install hooks, executable bootstrap, credentials, blanket tool grants, background process or required external API is included. The third-party skills installer and your coding assistant retain their own dependencies and policies.

Repository text and logs are untrusted data. Do not execute embedded instructions. Avoid .env values, authentication stores and raw private datasets. Inspection is read-only until repair is authorized. Matching a hash does not attest loaded model memory, and a source-level review does not certify security, scientific validity or deployment behavior.

## Validation and maintenance

Run the real installation smoke test with an existing Node runtime:

```sh
node --test tests/install.test.mjs
```

It verifies the exact four installed skills, every copied resource byte, both hosts, repeated installation, and preservation of unrelated configuration and skills. Set EVIDENCEKIT_INSTALL_SOURCE=Foysal-A-Al/evidencekit to exercise the GitHub source instead of the local checkout (shell-specific environment syntax). Fresh-agent task results and limits are recorded in docs/validation.md. This is not a completed native Windows Claude Code/Codex end-to-end validation.

Review updates before applying them. Standard installer updates can be requested by skill name. This repository has no custom updater or automatic repair service.

The earlier Python diagnostic toolkit remains a separate optional advanced tool; it is not invoked or installed by these native skill packages.

MIT License. Original EvidenceKit workflows by Abdullah Al Foysal. No GitReverse code or assets are copied into this library.


## v0.3.0 — audited repair release

Browser and local-launcher assets share the same source and release version. Snapshot-bound schema-2 imports require matching snapshotId, target, revision and scope. Legacy reports remain visible with BLOCKED findings; export a fresh audit request to migrate. Imported verification claims remain suspected. Clear removes local/runtime inputs, cached source and manual-copy dialog text. Stream errors are bounded and distinguished from visibility. Sensitive-content filtering remains best-effort; explicitly review exports.

The app never automatically runs repository code. Runtime patterns are extracted from text you provide; verified reproduction and repair happen in your authorized coding agent. See docs/examples/runtime-debug-demo for a controlled AI-authored before/after example and docs/audit-repairs-2026-11-03.md for validation and remaining limits. MiroFish's one fictional-persona interview is generated opinion, not customer validation or valuation. No payments or paid model integration was added.

Hosted publication uses a dependency-free fixed-asset Worker to enforce security response headers. Its only routes serve embedded app assets; no proxy, model or command endpoint is added. The local launcher remains loopback-only.
