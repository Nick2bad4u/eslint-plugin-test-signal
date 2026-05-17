# Presets

`eslint-plugin-test-signal` ships flat-config presets for progressive adoption.

| Preset | Intent |
| --- | --- |
| [`testSignal.configs.minimal`](./minimal.md) | Lowest-noise async correctness checks. |
| [`testSignal.configs.recommended`](./recommended.md) | Default weak-test signal coverage. |
| [`testSignal.configs["recommended-type-checked"]`](./recommended-type-checked.md) | Compatibility preset for future typed rules. |
| [`testSignal.configs.strict`](./strict.md) | Recommended plus negative-path coverage enforcement. |
| [`testSignal.configs.all`](./all.md) | Every stable rule. |
| [`testSignal.configs.experimental`](./experimental.md) | Every stable rule plus future candidates. |

## Rule matrix

- `Fix` legend:
  - `fix` = autofixable
  - `suggest` = suggestions available
  - `-` = report only
- `Preset key` legend:
  - [M](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/minimal) - [`testSignal.configs.minimal`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/minimal)
  - [R](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended) - [`testSignal.configs.recommended`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended)
  - [T](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended-type-checked) - [`testSignal.configs["recommended-type-checked"]`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended-type-checked)
  - [S](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) - [`testSignal.configs.strict`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict)
  - [A](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all) - [`testSignal.configs.all`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all)
  - [E](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/experimental) - [`testSignal.configs.experimental`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/experimental)

| Rule | Fix | Preset key |
| --- | :-: | :-- |
| [`no-conditional-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-conditional-assertions) | - | [R](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended) [S](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [A](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all) |
| [`no-disabled-tests`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-disabled-tests) | - | [R](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended) [S](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [A](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all) |
| [`no-empty-async-tests`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-empty-async-tests) | - | [M](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/minimal) [R](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended) [S](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [A](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all) |
| [`no-focused-tests`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-focused-tests) | - | [M](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/minimal) [R](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended) [S](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [A](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all) |
| [`no-mock-call-only-tests`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-mock-call-only-tests) | - | [R](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended) [S](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [A](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all) |
| [`no-snapshot-only-tests`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-snapshot-only-tests) | - | [R](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended) [S](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [A](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all) |
| [`no-try-catch-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-try-catch-assertions) | - | [S](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [A](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all) |
| [`no-weak-truthy-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-weak-truthy-assertions) | - | [R](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended) [S](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [A](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all) |
| [`require-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/require-assertions) | - | [R](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended) [S](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [A](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all) |
| [`require-awaited-async-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/require-awaited-async-assertions) | - | [M](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/minimal) [R](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended) [S](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [A](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all) |
| [`require-error-message-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/require-error-message-assertions) | - | [S](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [A](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all) |
| [`require-negative-path`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/require-negative-path) | - | [S](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [A](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all) |
