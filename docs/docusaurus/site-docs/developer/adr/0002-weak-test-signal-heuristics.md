# ADR 0002: Weak Test Signal Heuristics

## Status

Accepted.

## Context

The plugin targets tests that can pass while providing little behavioral proof:
snapshot-only assertions, mock-call-only checks, missing assertions, empty async
tests, assertions hidden in hooks, and suites without negative-path coverage.

These patterns need reliable syntax-level detection. The rules should avoid
pretending they can prove semantic test quality perfectly.

## Decision

Prefer explicit AST heuristics over broad type-heavy analysis. Shared helpers in
`src/_internal/test-ast.ts` identify test calls, assertion chains, negative-path
signals, and common Jest/Vitest modifiers. Rules should report only patterns
with clear evidence and should offer fixes or suggestions only when they preserve
test intent.

## Consequences

- Rules stay fast enough for editor-time linting.
- False positives are constrained to clear weak-signal shapes.
- Test cases must cover aliases, skipped/focused tests, nested suites, and mixed
  assertion chains.
- Type-aware analysis remains available for future rules, but it is not the
  default for weak-test signal checks.
