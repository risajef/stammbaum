## 1. Tests zuerst

- [x] 1.1 Add a red graph-view regression test for Schelling/Schilling, Weber/Wäber, Jacob/Jakob, Elisabeth/Eisabetha, Rahel/Rachel, compound-first-name subset matching, and the unchanged Müller/Mueller exclusion; verify the initial failure with `npm test -- src/graph/graph-view.test.ts`.

## 2. Configuration and matching

- [x] 2.1 Add the root `duplicate-name-variants.yaml` with separate first-name and last-name variant groups and validate it at bundle load.
- [x] 2.2 Implement symmetric/transitive variant lookup and order-independent token-subset matching for compound first names; verify with `npm test -- src/graph/graph-view.test.ts`.
- [x] 2.3 Apply the matcher to all candidate pairs while preserving direct parent-child exclusion, date compatibility, priorities, and stable document order; verify the focused graph-view suite and `npm run build`.

## 3. Verification

- [x] 3.1 Run `npm test`, `npm run build`, `openspec validate configure-duplicate-name-variants --type change --strict`, and `git diff --check`.
