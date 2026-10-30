Review and repair the synthetic classifier experiment while preserving all original data, existing working functionality, and any genuine untouched holdout. Work from the existing project; do not replace it with a guessed rebuild. The audit target paths are relative to `tests/fixtures/experiment/`.

Confirmed findings:
- EXP-01: `train.csv` / `test.csv` share 1 exact ID despite the distinct-ID policy.
- EXP-02: they share 1 exact subject despite the distinct-subject policy.
- EXP-03: chronology violates strict training-before-test; 1 test row is not later than all training rows.
- EXP-04: `predictions.csv` gives 1/2 accuracy (0.50), while `README.md` declares 0.90. The 0.50 value is only supplied-prediction arithmetic, not a valid holdout score.
- EXP-08: implementation, independent label provenance, model and evaluation manifest are missing.

Required work:
1. Preserve originals and any true untouched holdout. Document intended ID, subject and temporal policies explicitly. Investigate available original data and timestamps, then construct versioned derived splits with zero exact ID/subject overlap and strict max(training time) < min(test time). If the available data cannot support a scientifically useful split, state the blocker and required additional data. Do not delete/alter observations or weaken the policy to pass checks.
2. Locate the existing training/evaluation implementation and trace data flow before alleging or repairing preprocessing leakage. Fit normalization, imputation and feature selection on training data only; fit them independently within each tuning fold. Keep evaluation data untouched during model/tuning decisions. Missing code is a prerequisite to request, not permission to invent it.
3. Establish trusted label provenance and unambiguous prediction-to-sample alignment, including exact identifiers, one prediction per held-out sample, explicit labels/positive class, evaluation dataset identity, source revision, configuration, seed, model identity and prediction origin. Hash the bytes actually used; hash agreement alone does not prove loaded model or inference identity. Do not deserialize untrusted pickle/joblib files.
4. Resolve the README accuracy discrepancy with truthful provenance and a properly generated evaluation. Preserve the historical claim as historical if retained. Do not merely lower a reported metric to make the audit pass. If retraining or a valid untouched holdout is unavailable, report evaluation as blocked and the original supplied-score arithmetic separately.

Acceptance checks, executed against actual resulting artifacts:
- First validate checker behavior on small hand-checked fixture cases, preserving ID strings exactly (including whitespace/leading zeros).
- Check expected schemas, nonempty split sizes, unique IDs as required, zero train/test ID intersection and zero subject intersection, and parsed timezone-aware timestamps satisfying max(train.time) < min(test.time). Report counts and methods without raw private values.
- Audit preprocessing/tuning training-only fit scope from actual code/data flow and test the implemented split policy.
- Require exact one-to-one held-out prediction key coverage and independent truth alignment; recompute declared accuracy from trusted labels/predictions. For any additional binary metric validate positive-label membership and explicit zero-division behavior; require suitable declared metrics for probabilities.
- Record byte-snapshot hashes and detect changing inputs; document source/model/configuration/evaluation provenance and actual runtime checks.
- Explain that lack of exact duplicate rows cannot exclude transformed duplicates or target leakage.

Finish with a finding-by-finding completion report distinguishing VERIFIED PASS/FAIL, SUSPECTED, BLOCKED and NOT_APPLICABLE. List exact changes, commands actually executed, numerical outcomes actually calculated, prerequisites still missing, and holdout preservation status. Do not claim scientific reproduction or success solely from declarations, hashes, copied files or unexecuted scripts. No package installation, training run or source/data mutation is authorized by this review prompt itself; obtain appropriate authorization for execution beyond review.
