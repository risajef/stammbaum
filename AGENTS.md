# Agent Contract

Read `WORKFLOW.md` before acting. It is mandatory for every request and applies to every agent, including Codex.

The first step is always a clarification gate. Grill the user until the outcome, scope, acceptance criteria, constraints, edge cases, and test command are clear. Do not write code, tests, or configuration while a material question is unanswered. State assumptions and get confirmation before implementation.

Use OpenSpec for behavior changes. Start with `/opsx:explore` when the idea is uncertain, then `/opsx:propose`; keep the proposal, specs, design, and tasks current through implementation.

Use TDD: write an executable failing test, observe the intended failure, implement the smallest passing change, then refactor with tests green. Apply SOLID only when it improves a real boundary, and use YAGNI and KISS to reject speculative complexity.

Keep code structured but concise. Prefer local conventions, existing dependencies, small public APIs, and explicit control flow. Before finishing, run the relevant tests and report the exact commands and any residual risk.