# Experiment audit

Goal: assess the synthetic classifier evaluation against its declared split and accuracy policy. Target: `tests/fixtures/experiment`. Collected: 2026-10-30T12:32:52.594147+00:00. Revision: not established. Evidence: synthetic fixture files; README statements are declarations, CSV checks are executed observations. Scope: four files; no training code, model, environment specification or independent label source supplied. No packages installed, training run, source/data edits or model deserialization.

## VERIFIED — FAIL

- **EXP-01 — ID separation:** `train.csv` and `test.csv` share 1 exact ID. This violates the explicit distinct-ID policy.
- **EXP-02 — Subject separation:** train and test share 1 exact subject. This violates the explicit distinct-subject policy.
- **EXP-03 — Chronology:** strict `max(train.time) < min(test.time)` is false. 1 of 2 test rows is not later than all training rows. Timestamps parse as UTC. This violates the declared training-before-test policy.
- **EXP-04 — Accuracy discrepancy:** `predictions.csv` contains 1 correct prediction among 2, giving accuracy **0.50**, versus README's declared **0.90**. This is arithmetic on supplied predictions, not a reproduced model evaluation or evidence of a valid holdout score.

## VERIFIED — PASS

- **EXP-05 — Exact full-row overlap:** 0 identical full train/test rows using all columns and exact CSV string values. This does not exclude transformed/near duplicates or target leakage; the overlapping ID/subject failures remain.
- **EXP-06 — Prediction key coverage:** exactly 2 unique prediction IDs match the 2 unique test IDs; no duplicate prediction IDs. Positive label `yes` is present in both truth and predictions. Accuracy has a nonzero sample denominator and does not require a zero-division convention. These checks establish key coverage, not trusted label alignment or prediction origin.
- **EXP-07 — Input snapshot integrity:** all four files were parsed/read from recorded byte snapshots and reread unchanged after checks. SHA-256 values are in `checks.json`. Hashes establish snapshot identity only.

## BLOCKED

- **EXP-08 — Fit scope and scientific provenance:** no training/evaluation code, fold/tuning implementation, training labels, independent ground-truth source, model artifact or prediction-generation manifest. Cannot trace normalization, imputation, feature selection or tuning fit scope; verify supplied truths against original labels; reproduce predictions; establish loaded model identity; or validate reproducibility. No inference that preprocessing leaks is made from missing code.

## SUSPECTED

None beyond confirmed policy failures. Shared IDs/subjects indicate forbidden contamination under this declared policy, without proving their causal effect on performance.

## NOT_APPLICABLE

Probability-metric validation: supplied predictions are categorical and the declared metric is accuracy. No probability metric was evaluated. Precision/recall/F1 and their zero-division semantics were not claimed or assessed.

## Executed checks and limits

Inventoried files with `rg --files` and read the README/CSV fixtures. Ran one Python standard-library audit with hand-checked ID-preservation, overlap, accuracy and chronology fixtures before analyzing the provided bytes; all assertions passed. Parsed 2 training rows, 2 test rows and 2 prediction rows; checked full rows, exact IDs, subjects, strict timestamp separation, prediction-key coverage and duplicates, positive-label membership, and accuracy. Computed SHA-256 on consumed bytes and verified unchanged rereads. No private subject rows or identifiers are reproduced here. Existing project tests were not available in this fixture.

The supplied holdout is invalid under its own policy. A valid replacement evaluation requires preserved original data plus a justified derived split or new untouched data; a metadata or metric edit cannot repair this evaluation.
