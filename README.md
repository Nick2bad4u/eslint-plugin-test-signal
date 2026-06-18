# eslint-plugin-test-signal

[![npm license.](https://flat.badgen.net/npm/license/eslint-plugin-test-signal?color=purple)](https://github.com/Nick2bad4u/eslint-plugin-test-signal/blob/main/LICENSE) [![npm total downloads.](https://flat.badgen.net/npm/dt/eslint-plugin-test-signal?color=pink)](https://www.npmjs.com/package/eslint-plugin-test-signal) [![latest GitHub release.](https://flat.badgen.net/github/release/Nick2bad4u/eslint-plugin-test-signal?color=cyan)](https://github.com/Nick2bad4u/eslint-plugin-test-signal/releases) [![GitHub stars.](https://flat.badgen.net/github/stars/Nick2bad4u/eslint-plugin-test-signal?color=yellow)](https://github.com/Nick2bad4u/eslint-plugin-test-signal/stargazers) [![GitHub forks.](https://flat.badgen.net/github/forks/Nick2bad4u/eslint-plugin-test-signal?color=green)](https://github.com/Nick2bad4u/eslint-plugin-test-signal/forks) [![GitHub open issues.](https://flat.badgen.net/github/open-issues/Nick2bad4u/eslint-plugin-test-signal?color=red)](https://github.com/Nick2bad4u/eslint-plugin-test-signal/issues) [![codecov.](https://codecov.io/gh/Nick2bad4u/eslint-plugin-test-signal/branch/main/graph/badge.svg)](https://codecov.io/gh/Nick2bad4u/eslint-plugin-test-signal)

ESLint plugin for flagging weak tests before they become false confidence.

The first rule set focuses on:

- snapshot-only coverage;
- mock-call-only tests;
- unawaited Promise assertions;
- async tests without assertions;
- suites that never exercise a negative path.

## Table of contents

1. [Installation](#installation)
2. [Quick start](#quick-start)
3. [Presets](#presets)
4. [Rules](#rules)
5. [Compatibility](#compatibility)

## Installation

```sh
npm install --save-dev eslint-plugin-test-signal eslint typescript
```

## Quick start

```ts
import testSignal from "eslint-plugin-test-signal";

export default [testSignal.configs.recommended];
```

The bundled presets target common test file globs and register
`@typescript-eslint/parser` automatically.

## Presets

```ts
import testSignal from "eslint-plugin-test-signal";

export default [
 testSignal.configs.minimal,
 // testSignal.configs.recommended,
 // testSignal.configs["recommended-type-checked"],
 // testSignal.configs.strict,
 // testSignal.configs.all,
 // testSignal.configs.experimental,
];
```

| Preset                                                                                                                                                 | Intent                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| [`testSignal.configs.minimal`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/minimal)                                      | Lowest-noise async correctness checks.               |
| [`testSignal.configs.recommended`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended)                              | Default weak-test signal coverage.                   |
| [`testSignal.configs["recommended-type-checked"]`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended-type-checked) | Compatibility preset for future typed rules.         |
| [`testSignal.configs.strict`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict)                                        | Recommended plus negative-path coverage enforcement. |
| [`testSignal.configs.all`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all)                                              | Every stable rule.                                   |
| [`testSignal.configs.experimental`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/experimental)                            | Stable rules plus future candidates.                 |

## Rules

- `Fix` legend:
  - `fix` = autofixable
  - `suggest` = suggestions available
  - `-` = report only
- `Preset key` legend:
  - [🟢](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/minimal) - [`testSignal.configs.minimal`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/minimal)
  - [🟡](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended) - [`testSignal.configs.recommended`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended)
  - [🟠](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended-type-checked) - [`testSignal.configs["recommended-type-checked"]`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended-type-checked)
  - [🔴](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) - [`testSignal.configs.strict`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict)
  - [🟣](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all) - [`testSignal.configs.all`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all)
  - [🧪](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/experimental) - [`testSignal.configs.experimental`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/experimental)

| Rule                                                                                                                                             | Fix | Preset key                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | :-: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`no-assertions-in-hooks`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-assertions-in-hooks)                             |  -  | [🔴](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all)                                                                                                                                                                                     |
| [`no-async-foreach-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-async-foreach-assertions)                   |  -  | [🟡](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended) [🔴](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all)                                                                                         |
| [`no-broad-object-key-count-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-broad-object-key-count-assertions) |  -  | [🔴](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all)                                                                                                                                                                                     |
| [`no-conditional-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-conditional-assertions)                       |  -  | [🟡](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended) [🔴](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all)                                                                                         |
| [`no-constant-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-constant-assertions)                             |  -  | [🟡](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended) [🔴](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all)                                                                                         |
| [`no-disabled-tests`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-disabled-tests)                                       |  -  | [🟡](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended) [🔴](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all)                                                                                         |
| [`no-duplicate-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-duplicate-assertions)                           |  -  | [🔴](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all)                                                                                                                                                                                     |
| [`no-empty-async-tests`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-empty-async-tests)                                 |  -  | [🟢](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/minimal) [🟡](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended) [🔴](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all) |
| [`no-fixed-delay-tests`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-fixed-delay-tests)                                 |  -  | [🔴](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all)                                                                                                                                                                                     |
| [`no-focused-tests`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-focused-tests)                                         |  -  | [🟢](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/minimal) [🟡](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended) [🔴](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all) |
| [`no-identical-expected-actual`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-identical-expected-actual)                 |  -  | [🟡](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended) [🔴](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all)                                                                                         |
| [`no-mock-call-only-tests`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-mock-call-only-tests)                           |  -  | [🟡](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended) [🔴](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all)                                                                                         |
| [`no-snapshot-only-tests`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-snapshot-only-tests)                             |  -  | [🟡](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended) [🔴](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all)                                                                                         |
| [`no-synthetic-promise-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-synthetic-promise-assertions)           |  -  | [🟡](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended) [🔴](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all)                                                                                         |
| [`no-tautological-length-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-tautological-length-assertions)       |  -  | [🟡](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended) [🔴](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all)                                                                                         |
| [`no-try-catch-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-try-catch-assertions)                           |  -  | [🔴](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all)                                                                                                                                                                                     |
| [`no-vacuous-numeric-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-vacuous-numeric-assertions)               |  -  | [🟡](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended) [🔴](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all)                                                                                         |
| [`no-vacuous-string-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-vacuous-string-assertions)                 |  -  | [🟡](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended) [🔴](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all)                                                                                         |
| [`no-weak-asymmetric-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-weak-asymmetric-assertions)               |  -  | [🟡](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended) [🔴](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all)                                                                                         |
| [`no-weak-existence-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-weak-existence-assertions)                 |  -  | [🟡](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended) [🔴](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all)                                                                                         |
| [`no-weak-truthy-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/no-weak-truthy-assertions)                       |  -  | [🟡](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended) [🔴](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all)                                                                                         |
| [`require-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/require-assertions)                                     |  -  | [🟡](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended) [🔴](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all)                                                                                         |
| [`require-awaited-async-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/require-awaited-async-assertions)         |  -  | [🟢](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/minimal) [🟡](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/recommended) [🔴](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all) |
| [`require-error-message-assertions`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/require-error-message-assertions)         |  -  | [🔴](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all)                                                                                                                                                                                     |
| [`require-negative-path`](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/require-negative-path)                               |  -  | [🔴](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-test-signal/docs/rules/presets/all)                                                                                                                                                                                     |

## Compatibility

- Supported ESLint versions: `9.x` and `10.x`
- Config system: Flat Config
- Node.js runtime: `>=22.0.0`
