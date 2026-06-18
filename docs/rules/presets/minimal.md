# Minimal

`testSignal.configs.minimal` enables the lowest-noise correctness checks:

- `test-signal/no-empty-async-tests`
- `test-signal/require-awaited-async-assertions`

Use this preset when first introducing the plugin to a large existing test
suite.

## Rules in this preset

- `Fix` legend:
  - `fix` = autofixable
  - `suggest` = suggestions available
  - `-` = report only

| Rule                                                                                                                                     | Fix |
| ---------------------------------------------------------------------------------------------------------------------------------------- | :-: |
| [`no-empty-async-tests`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-empty-async-tests)                         |  -  |
| [`no-focused-tests`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-focused-tests)                                 |  -  |
| [`require-awaited-async-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/require-awaited-async-assertions) |  -  |
