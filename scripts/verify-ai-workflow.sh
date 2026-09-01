#!/usr/bin/env bash
set -Eeuo pipefail

root_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"

required_paths=(
    AGENTS.md
    CLAUDE.md
    WORKFLOW.md
    .github/copilot-instructions.md
    openspec/config.yaml
    openspec/project.md
    openspec/specs
    openspec/changes
    openspec/changes/archive
)

for required_path in "${required_paths[@]}"; do
    if [[ ! -e "$root_dir/$required_path" ]]; then
        printf 'Missing required workflow path: %s\n' "$required_path" >&2
        exit 1
    fi
done

grep -Fq 'Clarification gate' "$root_dir/WORKFLOW.md"
grep -Fq 'Red, Green, Refactor' "$root_dir/WORKFLOW.md"
grep -Fq 'schema: spec-driven' "$root_dir/openspec/config.yaml"

printf 'AI workflow contract is present.\n'