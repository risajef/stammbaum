# OpenSpec

This directory is the durable record of product behavior and planned changes.

- `config.yaml` sets the default schema and project rules.
- `project.md` holds the short project context that agents need.
- `specs/` contains the current behavior specifications.
- `changes/` contains active proposals and their artifacts.
- `changes/archive/` contains completed changes.

Install the official CLI when needed, then refresh tool integrations with:

```bash
openspec init --tools claude,codex,github-copilot --profile core
openspec update
```

Do not replace a behavior decision with a chat-only note. Keep the relevant proposal and specs close to the code.