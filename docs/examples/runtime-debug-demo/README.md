# Reproduce, classify, repair, verify

This is an AI-authored controlled fixture with a deliberately seeded defect, not a customer incident or market validation. It uses Node built-ins, no model/API key and no third-party repository execution.

Run `node docs/examples/runtime-debug-demo/verify.mjs` from the repository root. The verifier starts isolated loopback servers and closes them. It executes exactly the checked-in fixture/checker, never a command supplied through the web app.

1. Input: one item, price 100 and quantity 1. Expected total including the fixture's 20% tax: 120.
2. Before: `/health` passes, `/quote` returns 500. TypeError stack points at `broken-app.mjs` reading `item.unitPrice.amount`.
3. Classify the imported stack in EvidenceKit's runtime-evidence field. A TypeError pattern suggests a logic/data-shape issue; classification alone is not proof of root cause.
4. Trace the explicit item input: its property is `price`, a number. The nonexistent `unitPrice` object causes the observed exception. Compare broken-app.mjs with fixed-app.mjs: only the supported property access changes.
5. After: the same HTTP regression passes, total is 120, and health still passes. Exact stdout/stderr and process exit codes are retained in evidence.json.

Use the native coding-agent workflow for authorized real-project reproduction and repair. The browser workbench never executes this code. The example does not establish arbitrary bug detection or superiority to a plain assistant.
