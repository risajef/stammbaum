# Claude Code Instructions

Read and follow `WORKFLOW.md` for every task. The clarification gate is mandatory: ask focused questions until the outcome, scope, acceptance criteria, constraints, edge cases, and test command are clear, then wait for answers before writing code, tests, or configuration.

Use OpenSpec for behavior changes. Use `/opsx:explore` for uncertainty and `/opsx:propose` before implementation. Keep its artifacts aligned with the code.

Use TDD in this order: failing test, observed failure, smallest passing implementation, green refactor. Apply SOLID only where it removes real coupling; prefer YAGNI, KISS, concrete names, small modules, and existing project patterns.

Before finishing, run focused and relevant full tests, inspect the diff, and report commands and residual risk.