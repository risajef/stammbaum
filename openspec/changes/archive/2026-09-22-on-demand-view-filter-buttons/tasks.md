## 1. Graph-View-Filter-Seam

- [x] 1.1 Add a failing `graph-view` test proving that a bloodline filter can use a separate explicit bloodline anchor while the local anchor changes; verify the intended failure with `npx vitest run src/graph/graph-view.test.ts`.
- [x] 1.2 Implement the separate bloodline-anchor option with the existing anchor fallback and verify the focused `graph-view` test passes with `npx vitest run src/graph/graph-view.test.ts`.
- [x] 1.3 Add a failing `graph-view` test proving that newly created person IDs remain visible despite local, bloodline, and leaf filters until the exception is removed; verify the intended failure with `npx vitest run src/graph/graph-view.test.ts`.
- [x] 1.4 Implement the filter-exception IDs in the pure view projection and verify all focused `graph-view` tests pass with `npx vitest run src/graph/graph-view.test.ts`.

## 2. Filter-Button Interaction

- [x] 2.1 Replace the existing radio-oriented App test with failing user-facing scenarios for button roles without Checked state, a stable filter after selecting another visible person, and reapplying the same filter to the new person; verify the red tests with `npx vitest run src/App.test.tsx`.
- [x] 2.2 Implement the applied bloodline mode/anchor state and render the four bloodline actions as ordinary buttons; verify the focused App scenarios pass with `npx vitest run src/App.test.tsx`.
- [x] 2.3 Add a failing App integration test that creates a person while an active filter would hide it, confirms the new node is visible, then stubs a successful YAML save and confirms the active filter is applied; verify the intended failure with `npx vitest run src/App.test.tsx`.
- [x] 2.4 Track newly created person IDs through normal and OCR-assisted creation, pass them to the view projection, and clear them only after successful YAML save or document replacement; verify the focused App integration test passes with `npx vitest run src/App.test.tsx`.

## 3. Regression and Validation

- [x] 3.1 Verify existing local-view, ancestor-mode, leaf-filter, selection-synchronization, and YAML-persistence scenarios remain green with `npm test`.
- [x] 3.2 Verify the production TypeScript/Vite build with `npm run build`.
- [x] 3.3 Validate the completed OpenSpec change with `openspec validate on-demand-view-filter-buttons --type change --strict`.
