# Native delivery correction plan

Goal: make the skill library the primary product and remove the mandatory Python engine from its activation path.

1. Reproduce the existing engine dependency with a no-install baseline scenario.
2. Update each canonical personal skill in turn; validate and forward-test its native workflow; save each independently. Add repository-to-prompt as a fourth skill through the canonical initializer.
3. Assemble a clean distribution containing only the four skills, documentation, license and installer smoke test. Keep the advanced Python toolkit separate.
4. Run the real skills CLI in a fresh project, verify four skill installations for both agents, preserve a canary, and repeat the install.
5. Review the resulting library and record measured coverage, missing native-host validation and publication prerequisites. Persist a reviewable distribution before requesting approval for a browser fallback to GitHub repository creation.

Implementation choice: reference workflows use the coding host's existing tools. They do not claim deterministic scanner coverage where only agent inspection is available. No Python/Node code engine is installed by the skill pack itself; Node/npm is required only by the standard npx installation mechanism.
