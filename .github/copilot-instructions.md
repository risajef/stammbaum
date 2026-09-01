# GitHub Copilot Instructions

Read `WORKFLOW.md` before every task.

Do not implement an ambiguous request. Ask focused questions until the outcome, scope, acceptance criteria, constraints, edge cases, and test command are explicit; wait for answers before writing code, tests, or configuration.

Use OpenSpec for behavior changes: explore uncertainty, propose the change, review its artifacts, implement with TDD, verify, and archive. Use the OpenSpec command spelling generated for Copilot.

TDD means an executable failing test first, the smallest passing implementation second, and refactoring only while tests are green. Keep code simple and cohesive. Use SOLID only for a real design problem; reject speculative abstractions with YAGNI and KISS.

Run focused tests and the relevant full suite before finishing, and report what actually ran.