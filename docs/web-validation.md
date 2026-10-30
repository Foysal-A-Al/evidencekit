# Hosted no-CLI workbench validation

The user changed the requirement during implementation: inspect arbitrary public GitHub repositories without a local coding CLI. The shipped primary flow is a hosted static browser app with bounded deterministic source checks and a copyable prompt. Native agent skills remain available separately. Automatic local CLI execution and filesystem collection were removed from the shipped app.

Real unrelated repository check: https://github.com/expressjs/express at commit 1c6f1b0fe4000977b9a7b4f34097e4d527dd9824. Fetched 32 files with limited coverage. No matching code warnings were found by the narrow built-in rules; three unknown/coverage findings were emitted rather than invented defects. The complete report and prompt are retained in examples/live-express/. This is not a passing comprehensive audit of Express.

Node core/static tests cover rule results, evidence reference downgrade, selection-based prompts, URL rejection, exact slash refs and remaining-byte truncation, static serving and absence of command/filesystem endpoints. Existing four-skill installer test is included in npm test.

Initial independent review found unsafe local filesystem races, incomplete subprocess cancellation, branch ambiguity, stale prompt exports and context-limit reporting gaps. The user-directed static architecture removes the filesystem/process primitives entirely. Exact refs are required for tree URLs; omissions are marked limited; prompt text/exports clear during selection changes and generation IDs invalidate late replies.

Hosting deployment was verified through the native service. A cloud browser could not reach the executor loopback preview; the deployed owner-private Site shows a ChatGPT sign-in gate in the unsigned browser. Full interactive browser QA, clipboard/download behavior and native Windows launcher execution remain unverified. Modern browsers with Web Crypto, module scripts, streaming fetch, AbortSignal.any and AbortSignal.timeout are required. No all-PC compatibility guarantee.

A generated interface preview is conceptual and not screenshot evidence. Deep AI feature completeness and live runtime diagnosis require additional authorized evidence/workflow; the hosted source checks do not claim either.
