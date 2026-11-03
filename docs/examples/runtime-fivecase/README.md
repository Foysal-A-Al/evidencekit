# Five controlled runtime cases — completed 3 November 2026

Five synthetic, dependency-free Node apps reproduce stale build output, wrong client port, runtime configuration precedence, a missing production dependency and client concurrency overload. Each original target check fails; each reference repair passes while preserving source/runtime controls. These are controlled fixtures, not five customer projects.

Run `node --test docs/examples/runtime-fivecase/lab.test.mjs` from the repository root to replay the owned fixtures and reference repairs. No package installation or model/API call is needed for that verifier. It creates temporary loopback services and closes them.

## Actual assistant comparison

Pinned model: **gpt-6.1-sol**, discovered through the existing Codex CLI's model/list and explicitly selected for every run. Authentication used the existing ChatGPT subscription; API-key environment variables were removed and no paid fallback was used. Both conditions received the same captured evidence packet, output schema and bounded patch/action budget. EvidenceKit guidance was pinned to native-skill revision fc7670ea8aadd92abeb4b5c33842f13c519f09e4 (unchanged native skills in this release). Order alternated by case. Each result had zero tool events. Proposed patches were inspected before trusted isolated verification.

| Condition | Repairs passing | Controls preserved | Mean model time | Model output tokens |
|---|---:|---:|---:|---:|
| Plain assistant | 5/5 | 5/5 | 18.10 seconds | 2,843 |
| EvidenceKit-guided | 5/5 | 5/5 | 21.71 seconds | 3,302 |

**No advantage was demonstrated on these cases.** Guidance took approximately 20% longer on average in this single run. The sample is too small for general performance, cost, demand or valuation conclusions. This is packet-only evidence interpretation and proposed repair, not autonomous discovery/collection or an end-to-end browser benchmark. The host assistant context was not independently audited for complete blinding to skill descriptions, so this is a practical comparison, not a rigorously isolated research experiment.

The checked-in `results.json` contains all ten exact responses, usage/timing, packet hashes and actual verification results. `packets/` contains the identical captured evidence each condition saw; guidance.md and response.schema.json record the added instructions and output contract. The original event logs/prompts remain in the separately dated PC run directory; no private auth material is included here.

Source parameters include ephemeral ports from the captured run. Do not treat those old ports as live evidence. For new assistant trials, run coordinator.mjs to generate fresh packets and keep those fixture services alive. Transfer fresh packets to the runner's packets directory and use the runner only with an existing authorized CLI login; it stops on failure. Inspect proposed edits before placing result rows in the coordinator inbox. The verifier runs only allowlisted edits and owned fixture build/restart actions. Never pipe arbitrary external model commands to a shell.
