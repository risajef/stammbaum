## 1. Failing projection tests

- [x] 1.1 Add a red `graph-view` test for the direct-ancestor mode covering the anchor, ancestors across multiple generations, ancestor partners, and excluded ancestor siblings; verify first with `npx vitest run src/graph/graph-view.test.ts` and observe the missing mode behavior.
- [x] 1.2 Add a red `graph-view` test for the extended mode covering full- and half-siblings of direct ancestors, their partners, excluded sibling children and partner families, plus relationship endpoint filtering; verify with `npx vitest run src/graph/graph-view.test.ts`.
- [x] 1.3 Add a red `App` test for the alternative filter controls, anchor-dependent visibility, and switching away from „Nur Blutsverwandte“; verify with `npx vitest run src/App.test.tsx`.

## 2. View projection implementation

- [x] 2.1 Replace the single blood-only option with an explicit alternative bloodline mode while preserving the existing „Nur Blutsverwandte“ behavior; verify the existing blood-relative tests and the new projection tests with `npx vitest run src/graph/graph-view.test.ts`.
- [x] 2.2 Implement iterative direct-ancestor traversal, partner inclusion, and the extended sibling expansion without following sibling children or partner families; verify all direct and extended projection scenarios with `npx vitest run src/graph/graph-view.test.ts`.
- [x] 2.3 Preserve intersection with local and Leaf filters, selection visibility synchronization, and relationship endpoint filtering; verify the relevant existing graph-view tests with `npx vitest run src/graph/graph-view.test.ts`.

## 3. User interface integration

- [x] 3.1 Add the three mutually exclusive bloodline choices to the existing view toolbar and keep the local and Leaf controls independently combinable; verify the new App interaction test with `npx vitest run src/App.test.tsx`.
- [x] 3.2 Keep the selected person as the anchor for ancestor modes, leave the full view unchanged without an anchor, and reset incompatible view state during existing person navigation; verify with `npx vitest run src/App.test.tsx`.

## 4. Verification

- [x] 4.1 Run `npm test` and confirm the complete test suite passes.
- [x] 4.2 Run `npm run build` and confirm the production TypeScript/Vite build succeeds.
- [x] 4.3 Run `openspec validate add-ancestor-view-filters --type change --strict` and confirm the change artifacts match the implementation contract.
