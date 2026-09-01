# AI Development Workflow

This file is the shared source of truth for every coding agent in this repository. The vendor-specific entry points point here and repeat the non-negotiable rules so each tool can discover them.

## 1. Clarification gate: grill before building

Do not implement a request while a material ambiguity remains. Ask concise, concrete questions and wait for answers. Reading the repository and inspecting existing behavior is allowed; writing production code, tests, or configuration waits until the request is clear.

At minimum, make these explicit:

- Who needs the change and what observable outcome should they get?
- What is in scope, and what is deliberately out of scope?
- What are the acceptance criteria and failure behavior?
- Which constraints matter: compatibility, performance, security, privacy, cost, or rollout?
- Which edge cases and existing behaviors must remain unchanged?
- What is the project test command and what level of test is appropriate?

Do not ask questions that the repository or an existing OpenSpec artifact already answers. State remaining assumptions and get confirmation before proceeding. If the user says to proceed with an assumption, record it in the active change proposal.

## 2. OpenSpec before behavior changes

Use the project-local `openspec/` directory as the durable record of intent. For a non-trivial change:

1. Use `/opsx:explore` when the idea or tradeoffs need investigation.
2. Create a proposal with `/opsx:propose` after the request is clear.
3. Review the proposal, scenarios, design, and tasks with the user.
4. Keep those artifacts current when implementation changes the understanding.
5. Apply the work, verify it, and archive it with `/opsx:archive`.

The exact command spelling depends on the agent. Use the generated OpenSpec instructions rather than guessing. Never treat a chat message as the only record of a behavior change.

## 3. TDD is the default

For every behavior change, follow Red, Green, Refactor:

1. Translate an acceptance scenario into an executable test.
2. Run the test and confirm that it fails for the intended reason.
3. Write the smallest implementation that makes it pass.
4. Run the focused test, then the relevant full suite.
5. Refactor only with a green test suite.

Tests are not an afterthought or a final sign-off step. A bug fix starts with a regression test. If a test cannot be written yet, stop and clarify the interface or test seam instead of silently skipping TDD. Any exception must be explicit, justified, and recorded in the change artifacts.

## 4. Design rules

- **KISS:** prefer the simplest design that satisfies the verified requirement.
- **YAGNI:** do not add speculative options, abstractions, dependencies, or extension points.
- **SOLID:** use boundaries and abstractions when they reduce coupling or make tested behavior clearer, not as ceremony.
- Keep modules cohesive, names concrete, and control flow easy to follow.
- Prefer existing project patterns and standard library capabilities before adding dependencies.
- Keep public APIs small and changes reversible.
- Explain a non-obvious decision in the relevant OpenSpec design, not in a wall of comments.

## 5. Definition of done

Before calling work complete:

- The agreed scope and acceptance criteria are met.
- The relevant OpenSpec artifacts match the implementation.
- A failing test was observed first for new or changed behavior.
- Focused tests and the relevant full test suite pass.
- Failure paths, validation, and security-sensitive inputs were considered.
- The diff contains no unrelated cleanup or generated noise.
- The final response names what changed, what was tested, and any remaining risk.