# Security boundaries

This release is an instruction library for an already installed coding agent. It does not add an executable engine, service, permission grant or model API integration.

The agent uses its existing privileges, so treat skill text and repository context as security-relevant instructions/data. Review skill changes before updating. Treat logs and third-party repository content as untrusted. Use bounded read-only checks, avoid credentials and personal records, preserve data/volumes, and request authorization for repairs that exceed the user's task.

No claim of comprehensive secret detection, prompt-injection prevention, software security certification, scientific validation or loaded-process memory attestation is made. Record unsupported checks as BLOCKED.

Do not post private reports or exploit details in public issues. Private vulnerability reporting is enabled. Use the private reporting option in the repository Security section: https://github.com/Foysal-A-Al/evidencekit/security/advisories. Include the affected revision, minimal reproduction and impact; omit credentials and private datasets.

## Browser workbench

Public GitHub source is fetched directly in the browser over fixed GitHub API URLs, with validated owner/repository/ref, immutable commit identity, bounded responses and context. No repository code is executed, no local filesystem or subprocess API exists, and no AI provider is called. Imported/model/source content renders as text. Reports/prompt exports are explicit; application state is in memory until page reload/clear. Hosting and GitHub retain their normal access logs. Browser downloads and clipboard contents remain under user control.

Unauthenticated GitHub rate limits apply; private repositories are unsupported. Filename/content exclusions are best-effort and do not certify absence of secrets. Built-in lexical checks can match examples/comments and miss real defects. Review before acting. Optional imported AI results are labeled, with unsupported source references downgraded. Do not import private data into a shared browser session.
