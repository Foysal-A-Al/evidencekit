# Hosted no-CLI workbench validation

The user changed the requirement during implementation: inspect arbitrary public GitHub repositories without a local coding CLI. The shipped primary flow is a hosted static browser app with bounded deterministic source checks and a copyable prompt. Native agent skills remain available separately. Automatic local CLI execution and filesystem collection were removed from the shipped app.

Real unrelated repository check: https://github.com/expressjs/express at commit 1c6f1b0fe4000977b9a7b4f34097e4d527dd9824. Fetched 32 files with limited coverage. No matching code warnings were found by the narrow built-in rules; three unknown/coverage findings were emitted rather than invented defects. The complete report and prompt are retained in examples/live-express/. This is not a passing comprehensive audit of Express.

Node core/static tests cover rule results, evidence reference downgrade, selection-based prompts, URL rejection, exact slash refs and remaining-byte truncation, static serving and absence of command/filesystem endpoints. Existing four-skill installer test is included in npm test.

Initial independent review found unsafe local filesystem races, incomplete subprocess cancellation, branch ambiguity, stale prompt exports and context-limit reporting gaps. The user-directed static architecture removes the filesystem/process primitives entirely. Exact refs are required for tree URLs; omissions are marked limited; prompt text/exports clear during selection changes and generation IDs invalidate late replies.

Hosting deployment was verified through the native service. A cloud browser could not reach the executor loopback preview; the deployed owner-private Site shows a ChatGPT sign-in gate in the unsigned browser. Full interactive browser QA, clipboard/download behavior and native Windows launcher execution remain unverified. Modern browsers with Web Crypto, module scripts, streaming fetch, AbortSignal.any and AbortSignal.timeout are required. No all-PC compatibility guarantee.

A generated interface preview is conceptual and not screenshot evidence. Deep AI feature completeness and live runtime diagnosis require additional authorized evidence/workflow; the hosted source checks do not claim either.

## v0.2.1 — user-reported inconclusive Stress-analysis result

Reproduced root cause: .ipynb was excluded and the 48 KB reader skipped the 932,941-byte notebook; the narrow web rules returned three generic limitations as selected repair findings.

Notebook code cells are now parsed from JSON under a 2 MB raw input bound, 5,000-cell bound and 48 KB code-context bound. Outputs/metadata are excluded, code is not executed, and both source-representation and original-notebook hashes are retained. Extension checks are case-insensitive. Code-cell separators count toward the byte limit.

Live rescan of Foysal-A-Al/Stress-analysis at 9c0b3b4facff87deb7c15f64ec67bb161d6940c4 collected README, requirements, analysis.py and 17,903 characters of notebook code. Five lexical source signals were found in the notebook: same fit/permutation inputs, cross-validation after a feature-loop binding, repeated figure path, Kaggle-specific read path, and raw-score percentage formulas. All are SUSPECTED pending contextual verification; README identifies the notebook as historical and the maintained audit remains separate. No dataset rows, training, dependency install or Stress-analysis source changes were used. See examples/stress-analysis/ for the actual report/prompt.

Generic limits are displayed separately. An empty scan is INCONCLUSIVE and cannot generate a generic repair prompt. Suspected findings require source references. Lexical matches can occur in comments/strings, so they are not promoted to verified execution. Regression tests cover output omission, mixed-case extensions, byte limits, held-out negative cases, inconclusive reports and serving the notebook module. Independent review found and verified the mixed-case output exposure and inert-text claim issues; both received failing regression tests before fixes.

This remains a bounded rule-based source checker. These corrections do not make it a general AI project auditor or prove all bugs/missing features have been identified.

## v0.2.2 — simple repository-to-prompt interface

User supplied the GitReverse screenshot/library page as the layout reference and explicitly rejected the dashboard. Replaced navigation rail, marketing headline, step indicators and two-column cards with a narrow cream page: repository input + Find problems, then one prompt box with Copy prompt. Goal/ref/mode settings, source scope, findings, downloads and optional agent import remain under collapsed details. The primary action now collects source and runs checks sequentially in one submission. Existing inconclusive/selection/source-only safeguards remain. The example includes an explicitly synthetic dynamic-evaluation signal so its prompt flow is demonstrable.

Core behavior is unchanged; syntax checks and the existing suite are run. Live interactive browser QA remains limited by the owner-private sign-in gate in the cloud browser. Deployment screenshot validates layout only.
