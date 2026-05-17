---
name: "Codex-Instructions-ESLint-Docs"
description: "Instructions for writing ESLint rule documentation."
applyTo: "docs/**"
---

<instructions>

## Goal

Rule documentation files in `docs/rules/<rule-id>.md` must be self-contained:
readers should understand what the rule reports, why the pattern is weak, and
how to fix the test without reading source code.

## Structure

Use this structure for rule docs:

1. H1 with the bare rule ID.
2. One-sentence description.
3. `## Rule details`
4. `## Incorrect`
5. `## Correct`
6. `## What this rule reports`
7. `## Options`
8. `## When not to use it`
9. Rule catalog ID line.

## Style

- Assume Flat Config.
- Keep examples realistic and ensure they match the implemented AST selector.
- Prefer TypeScript code fences.
- Explain the weak-test risk, not just the syntax pattern.
- Do not add generated or placeholder rule docs.

</instructions>
