# Native library validation

Release candidate, 30 October 2026.

The old Python engine dependency was reproduced in a fresh-agent baseline: the previous skill stopped when the EvidenceKit module was absent. The new skills explicitly use existing project tools.

## Task evaluations

- Router: inspected a four-file Node app and generated repair and synthetic rebuild prompts without installation. Existing Node test passed; missing task routes were distinguished from observed health behavior. Retained rerun report, prompt and exact checks: examples/router/.
- Runtime: inspected the same fixture, ran its Node test and synthetic route probes, and separated source behavior from unavailable live process/HTTP attribution. No service start, install or source mutation. Retained rerun report, prompt and exact checks: examples/runtime/.
- Experiment: inspected four synthetic fixture files and executed standard-library calculations after hand-checked cases. Found one shared ID, one shared subject, failed temporal separation, and supplied accuracy 0.50 versus declared 0.90. No training or package installation. Retained report, prompt, numeric results and optional replay checker: examples/experiment/. The replay uses Python only as an existing developer tool; it is not installed with or required by the skills. These results are fixture arithmetic, not a reproduced model evaluation.
- Repository-to-prompt: read all four files without execution; produced a scoped reconstruction of the exact health-route/fallback contract, distinguished declarations from source observations, and recorded unknown license/runtime/consumer context. Retained report and prompt: examples/reverse/.

## Installer

PASS: real skills CLI 1.7.4, Node 24.22.1, Linux. Initial install/reinstall test passed; final reconciled metadata and strengthened full-resource assertions passed in 12.90 seconds (one test, zero failures). It installs to a fresh temporary project for both Claude Code and Codex in copy mode, repeats the operation, and checks unrelated configuration/skill preservation. It verifies exactly four installed directories for each host and byte equality of every source file, including router references and UI metadata. It launches npm through its JavaScript entrypoint to avoid invoking a Windows .cmd file directly. That code path is still untested on native Windows.

## Limits

Cloud Linux testing does not establish working native Windows invocation in either assistant. The user's PC remote-control allowance was exhausted; the replacement library has not been installed or invoked there. Public GitHub installation and repeat installation passed against Foysal-A-Al/evidencekit (28.67 seconds, one test, zero failures), with exact installed skill set and all skill-resource bytes matching the reviewed local source. This used temporary project scope; the documented global command adds the standard global flag. No dashboard is delivered by this library; the older Python toolkit is separate and optional.

Skill frontmatter validation is structural only. Fresh-agent evaluations cover small synthetic tasks, not arbitrary repositories or comprehensive prompt-injection resistance.

Private vulnerability reporting was enabled in repository settings. Secret scanning and push protection were observed enabled.

## Independent review

Static review found no critical/high defects in the instruction pack. It identified Windows launcher handling and incomplete resource-copy assertions in the first smoke test; both were corrected and reviewed again. The final test invokes npm through Node, verifies the exact installed set and every copied file byte, and keeps native Windows validation explicitly open. Fresh-agent evaluations remain synthetic and do not establish broad real-project coverage.
