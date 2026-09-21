## 1. Tests zuerst

- [x] 1.1 Add executable Node tests for person ages, marriage ages grouped by common children, remarriage gaps, incomplete dates, and HTML headings; verify the initial test fails because the statistics module is missing with `node --test scripts/generate-family-statistics.test.mjs`.

## 2. Statistics and HTML generation

- [x] 2.1 Implement partial-date parsing, age calculations, common-child counting, and consecutive-marriage gap calculations; verify with `node scripts/generate-family-statistics.test.mjs`.
- [x] 2.2 Implement the CLI input/output handling and self-contained inline-SVG HTML with the three histograms; verify the test suite and the requested Weber-Graf invocation create `familien-statistik.html`.
- [x] 2.3 Rotate dense x-axis class labels in the generated SVGs and verify the HTML contains the rotated labels with `node scripts/generate-family-statistics.test.mjs`.
- [x] 2.4 Calculate remarriage gaps from the previous partner's death date to the next marriage start date and verify the regression test with `node scripts/generate-family-statistics.test.mjs`.

## 3. Verification

- [x] 3.1 Generate the real report from `../../Documents/Stammbaum/Weber-Graf.yaml` and verify that the output contains all three chart headings and inline `<svg>` elements.
- [x] 3.2 Run `openspec validate generate-family-statistics --type change --strict` and `git diff --check`.
