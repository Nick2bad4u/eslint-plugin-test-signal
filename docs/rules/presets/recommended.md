# Recommended

`testSignal.configs.recommended` is the default preset for most projects.

It includes `minimal` plus:

- `test-signal/no-snapshot-only-tests`
- `test-signal/no-mock-call-only-tests`

Use this preset when you want tests to contain at least one explicit behavioral
signal beyond snapshots or mock call counters.

## Rules in this preset

- `Fix` legend:
  - `fix` = autofixable
  - `suggest` = suggestions available
  - `-` = report only

| Rule                                                                                                                                       | Fix |
| ------------------------------------------------------------------------------------------------------------------------------------------ | :-: |
| [`no-async-foreach-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-async-foreach-assertions)             |  -  |
| [`no-conditional-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-conditional-assertions)                 |  -  |
| [`no-constant-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-constant-assertions)                       |  -  |
| [`no-disabled-tests`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-disabled-tests)                                 |  -  |
| [`no-empty-async-tests`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-empty-async-tests)                           |  -  |
| [`no-focused-tests`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-focused-tests)                                   |  -  |
| [`no-identical-expected-actual`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-identical-expected-actual)           |  -  |
| [`no-mock-call-only-tests`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-mock-call-only-tests)                     |  -  |
| [`no-snapshot-only-tests`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-snapshot-only-tests)                       |  -  |
| [`no-synthetic-promise-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-synthetic-promise-assertions)     |  -  |
| [`no-tautological-length-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-tautological-length-assertions) |  -  |
| [`no-vacuous-numeric-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-vacuous-numeric-assertions)         |  -  |
| [`no-vacuous-string-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-vacuous-string-assertions)           |  -  |
| [`no-weak-asymmetric-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-weak-asymmetric-assertions)         |  -  |
| [`no-weak-existence-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-weak-existence-assertions)           |  -  |
| [`no-weak-truthy-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-weak-truthy-assertions)                 |  -  |
| [`require-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/require-assertions)                               |  -  |
| [`require-awaited-async-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/require-awaited-async-assertions)   |  -  |
