# Native experiment review

Establish explicit datasets/splits, ID/group/time columns, evaluation policy, reported metric semantics, source and artifacts. Read relevant training/evaluation code and existing environment/test commands. Reuse the project's existing runtime; do not install EvidenceKit, pandas, scikit-learn or a replacement environment merely to audit it.

Execute supported checks using existing project tests or a small standard-library script with hand-checked fixture cases first. If no suitable runtime exists, provide source-level review and mark numerical checks BLOCKED. Never calculate precise results from an unexecuted script.

Check exact row/ID overlap, group boundaries, chronology, preprocessing/feature selection fit scope, metric label/prediction alignment and sample provenance. Preserve exact identifiers; do not silently trim/coerce values. Group/time overlap is adverse only when it violates the intended policy. For binary metrics, validate positive-label membership and zero-division semantics; probabilities require an appropriate declared metric.

A lexical fit-before-split pattern is SUSPECTED until data flow is traced. Feature selection, normalization, imputation and tuning can leak across folds. An absence of exact duplicates cannot exclude transformed/near duplicates or target leakage.

When computing hashes, hash the bytes consumed by analysis or explicitly detect changing inputs. An artifact hash match does not prove scientific validity, inference equality, prediction origin or loaded model identity. Reproducibility declarations do not prove successful reproduction. Never deserialize untrusted pickle/joblib files or execute arbitrary training code.

Preserve original data and genuine holdouts. Report counts and methods rather than subject rows or sensitive values. Do not lower reported metrics or weaken split criteria to hide a failed check. A repair prompt must require valid derived splits, training-only fitting, explicit evaluation provenance and an untouched holdout or an honest blocker.
