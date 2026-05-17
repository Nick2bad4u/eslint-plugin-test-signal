# Recommended Type Checked

`testSignal.configs["recommended-type-checked"]` currently matches
`testSignal.configs.recommended`.

No shipped rule requires TypeScript parser services yet. The preset is kept as a
stable adoption target so future typed test-signal rules can be added without
changing consumer config shape.

## Rules in this preset

- `Fix` legend:
  - `fix` = autofixable
  - `suggest` = suggestions available
  - `-` = report only

| Rule | Fix |
| --- | :-: |
| [`no-async-foreach-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-async-foreach-assertions) | - |
| [`no-conditional-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-conditional-assertions) | - |
| [`no-constant-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-constant-assertions) | - |
| [`no-disabled-tests`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-disabled-tests) | - |
| [`no-empty-async-tests`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-empty-async-tests) | - |
| [`no-focused-tests`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-focused-tests) | - |
| [`no-identical-expected-actual`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-identical-expected-actual) | - |
| [`no-mock-call-only-tests`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-mock-call-only-tests) | - |
| [`no-snapshot-only-tests`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-snapshot-only-tests) | - |
| [`no-synthetic-promise-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-synthetic-promise-assertions) | - |
| [`no-tautological-length-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-tautological-length-assertions) | - |
| [`no-vacuous-numeric-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-vacuous-numeric-assertions) | - |
| [`no-vacuous-string-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-vacuous-string-assertions) | - |
| [`no-weak-asymmetric-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-weak-asymmetric-assertions) | - |
| [`no-weak-existence-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-weak-existence-assertions) | - |
| [`no-weak-truthy-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-weak-truthy-assertions) | - |
| [`require-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/require-assertions) | - |
| [`require-awaited-async-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/require-awaited-async-assertions) | - |
